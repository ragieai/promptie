import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Citation } from "../lib/types";
import { useEffect, useState } from "react";
import { z } from "zod";
import Markdown from "react-markdown";

import { getProxyPath } from "@/lib/utils";

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

function formatSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (n: number): string => n.toString().padStart(2, "0");

  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

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
      const json = await summary.json();
      const parsed = summarySchema.parse(json);
      setSummary(parsed.summary);
    })();
  }, [chunk]);

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogTitle>{citation.document_title}</DialogTitle>

        <h2 className="font-bold">Cited text</h2>
        <blockquote className="text-sm text-gray-500 border-l-2 border-gray-500 pl-4">
          {citation.cited_text}
        </blockquote>

        {chunk.links?.self_audio_stream && (
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

        <h2 className="font-bold">Summary</h2>
        <div className="text-sm text-gray-500 h-[500px] overflow-y-auto">
          <Markdown className="markdown">{summary}</Markdown>
        </div>
      </DialogContent>
    </Dialog>
  );
}
