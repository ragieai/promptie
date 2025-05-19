import { z } from "zod";

export interface Citation {
  type: "char_location";
  document_index: number;
  document_title: string;
  start_char_index: number;
  end_char_index: number;
  cited_text: string;
}
export interface Chunk {
  text: string;
  score: number;
  id: string;
  index: number;
  metadata?: {
    end_time?: number;
    start_time?: number;
  };
  documentId: string;
  documentName: string;
  documentMetadata: {
    /** e.g. "/ragie/366580-svpr3y.mp3" */
    file_path: string;
    /** e.g. "2025-05-16T15:47:07.414000+00:00" */
    created_at: string;
    /** e.g. "https://ta-lectures.s3.us-east-005.backblazeb2.com/ragie/366580-svpr3y.mp3" */
    source_url: string;
    /** e.g. "ragie/366580-svpr3y.mp3" */
    external_id: string;
    /** e.g. "s3" */
    source_type: string;
    /** e.g. ["ragie", "366580-svpr3y.mp3"] */
    file_path_array: Array<string>;
    /** e.g. 1747410427 */
    _source_created_at: number;
    /** e.g. 1747410427 */
    _source_updated_at: number;
  };
  links: Record<
    | "self"
    | "self_text"
    | "document"
    | "document_text"
    | "self_audio_stream"
    | "self_audio_download"
    | "document_audio_stream"
    | "document_audio_download",
    RESTLink
  >;
}
export interface RESTLink {
  href: string;
  /** mimetype */
  type: string;
}
export const completionSchema = z.object({
  modelResponse: z.any(),
  retrievalResponse: z.any(),
});
