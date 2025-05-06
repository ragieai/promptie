import { z } from "zod";

export interface Citation {
  type: "char_location";
  document_index: number;
  document_title: string;
  start_char_index: number;
  end_char_index: number;
  cited_text: string;
}
export const completionSchema = z.object({
  modelResponse: z.any(),
  retrievalResponse: z.any(),
});
