import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { z } from "zod";
import { Citation } from "../lib/types";

import { formatSeconds, getProxyPath, getStreamType } from "@/lib/utils";

interface CitationDialogProps {
  citation: Citation;
  chunk: any;
  onClose?: () => void;
  partition: string;
}

const summarySchema = z.object({
  documentId: z.string(),
  summary: z.string(),
});

export default function CitationDialog({
  citation,
  chunk,
  partition,
  onClose = () => {},
}: CitationDialogProps) {
  const [summary, setSummary] = useState<any | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  useEffect(() => {
    (async () => {
      const summary = await fetch(`/api/documents/${chunk.documentId}`);

      if (!summary.ok) {
        console.warn("Failed to fetch summary", summary);
        return;
      }

      const json = await summary.json();
      const parsed = summarySchema.parse(json);
      setSummary(parsed.summary);
    })();
  }, [chunk]);

  const streamType = getStreamType(chunk);

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogTitle>{citation.document_title}</DialogTitle>

        <div className="max-h-[80vh] overflow-y-auto">
          <h2 className="font-bold">Cited text</h2>
          <blockquote className="text-sm text-gray-500 border-l-2 border-gray-500 pl-4">
            {citation.cited_text}
          </blockquote>

          {streamType === "video" && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <h2 className="font-bold">Video</h2>
                <div className="text-sm text-gray-500">
                  ({formatSeconds(chunk.metadata.start_time)} -{" "}
                  {formatSeconds(chunk.metadata.end_time)})
                </div>
              </div>
              <div className="flex justify-center">
                <video
                  src={getProxyPath(partition, chunk.links.self_video_stream.href)}
                  controls
                />
              </div>
            </div>
          )}

          {streamType === "audio" && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <h2 className="font-bold">Audio</h2>
                <div className="text-sm text-gray-500">
                  ({formatSeconds(chunk.metadata.start_time)} -{" "}
                  {formatSeconds(chunk.metadata.end_time)})
                </div>
              </div>
              <div className="flex justify-center">
                <audio
                  src={getProxyPath(
                    partition,
                    chunk.links.self_audio_stream.href
                  )}
                  controls
                />
              </div>
            </div>
          )}

          {summary && (
            <>
              <h2 className="font-bold">Summary</h2>
              <div className="text-sm text-gray-500">
                <Markdown className="markdown">{summary}</Markdown>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
