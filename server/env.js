import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const LOCAL_ENV_FILES = [
  ".vercel/.env.development.local",
  ".env.development.local",
  ".env.local",
  ".env.development",
  ".env",
];

function isLocalDevelopment() {
  return (
    process.env.VERCEL_ENV === "development" ||
    (process.env.NODE_ENV !== "production" &&
      process.env.VERCEL_ENV !== "production" &&
      process.env.VERCEL_ENV !== "preview")
  );
}

function parseDotEnvValue(rawValue) {
  const value = String(rawValue ?? "").trim();
  if (!value) return "";

  const first = value[0];
  const last = value[value.length - 1];

  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return value.slice(1, -1);
  }

  return value.replace(/\s+#.*$/, "").trim();
}

function readLocalValue(name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const linePattern = new RegExp(
    `^\\s*(?:export\\s+)?${escapedName}\\s*=\\s*(.*?)\\s*$`,
    "m",
  );

  for (const filename of LOCAL_ENV_FILES) {
    try {
      const contents = readFileSync(resolve(process.cwd(), filename), "utf8");

      const match = contents.match(linePattern);

      if (match) {
        const value = parseDotEnvValue(match[1]);
        if (value) return value;
      }
    } catch {
      // File cấu hình có thể không tồn tại.
    }
  }

  return "";
}

export function getServerEnv(name, { aliases = [], devAliases = [] } = {}) {
  const localDevelopment = isLocalDevelopment();
  const runtimeNames = [
    name,
    ...aliases,
    ...(localDevelopment ? devAliases : []),
  ];

  for (const candidate of runtimeNames) {
    const value = String(process.env[candidate] || "").trim();
    if (value) return value;
  }

  if (!localDevelopment) return "";

  for (const candidate of runtimeNames) {
    const value = readLocalValue(candidate);
    if (value) return value;
  }

  return "";
}
