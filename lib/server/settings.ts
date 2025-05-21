export const RAGIE_API_BASE_URL =
  process.env.RAGIE_API_BASE_URL || "https://api.ragie.ai";

export const RAGIE_API_KEY = process.env.RAGIE_API_KEY;
export const LLM_PROVIDER = process.env.LLM_PROVIDER || "anthropic";

export let OPENROUTER_API_KEY: string | undefined;
export let OPENROUTER_MODEL: string | undefined;

if (!RAGIE_API_KEY) {
  throw new Error("RAGIE_API_KEY is not set");
}

if (LLM_PROVIDER === "openrouter") {
  OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  OPENROUTER_MODEL = process.env.OPENROUTER_MODEL;
  if (!OPENROUTER_API_KEY) {
    throw new Error(
      "LLM_PROVIDER is set to 'openrouter' but OPENROUTER_API_KEY is not set"
    );
  }
  if (!OPENROUTER_MODEL) {
    throw new Error(
      "LLM_PROVIDER is set to 'openrouter' but OPENROUTER_MODEL is not set"
    );
  }
}
