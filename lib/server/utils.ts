import { Ragie } from "ragie";
import { RAGIE_API_KEY, RAGIE_API_BASE_URL } from "./settings";

export function getRagieClient() {
  return new Ragie({ auth: RAGIE_API_KEY, serverURL: RAGIE_API_BASE_URL });
}
