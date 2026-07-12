import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const here = path.dirname(fileURLToPath(import.meta.url));
export const root = path.resolve(here, "..", "..");
export const automationDir = path.resolve(here, "..");
dotenv.config({ path: path.join(automationDir, ".env") });

export const config = {
  textModel: process.env.OPENAI_TEXT_MODEL || "gpt-5.4-mini",
  imageModel: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
  publicBaseUrl: (process.env.PUBLIC_ASSET_BASE_URL || "https://www.phaminh.com/social-content").replace(/\/$/, ""),
  publishEnabled: process.env.PUBLISH_ENABLED === "true",
  graphVersion: process.env.INSTAGRAM_GRAPH_VERSION || "v25.0",
  timezone: process.env.TIMEZONE || "America/Los_Angeles",
};

export function requireEnv(names) {
  const missing = names.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(", ")}`);
}
