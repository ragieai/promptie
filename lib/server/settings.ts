export const RAGIE_API_BASE_URL =
  process.env.RAGIE_API_BASE_URL || "https://api.ragie.ai";

export const RAGIE_API_KEY = process.env.RAGIE_API_KEY;

export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!RAGIE_API_KEY) {
  throw new Error("RAGIE_API_KEY is not set");
}
