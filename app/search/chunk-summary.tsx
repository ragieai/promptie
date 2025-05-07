import { useEffect, useState } from "react";
import Markdown from "react-markdown";

export default function ChunkSummary({ chunk }: { chunk: any }) {
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    (async function () {
      setIsLoading(true);
      const summary = await fetch(`/api/chunk-summary`, {
        method: "POST",
        body: JSON.stringify({
          text: chunk.text,
        }),
      });

      if (!summary.ok) {
        console.warn("Failed to fetch summary", summary);
        setSummary("Failed to fetch chunk summary");
        setIsLoading(false);
        return;
      }

      const json = await summary.json();
      setSummary(json.summary);
      setIsLoading(false);
    })();
  }, [chunk]);

  return (
    <div className="flex flex-col gap-2">
      {isLoading && <p>Loading...</p>}
      {!isLoading && <Markdown className="markdown">{summary}</Markdown>}
    </div>
  );
}
