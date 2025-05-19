import { z } from "zod";
import { Chunk, completionSchema } from "../lib/types";
import Markdown from "react-markdown";
import { useState } from "react";
import { Citation } from "../lib/types";
import CitationDialog from "./citation-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GeneratedTextProps {
  completion: z.infer<typeof completionSchema>
  partition: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function GeneratedText({completion, partition}: GeneratedTextProps) {
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  const citations = completion.modelResponse.content.flatMap((content: any) => {
    if (content.type !== "text") { return [] }
    return content.citations || [];
  });
  const chunks = completion.retrievalResponse.scoredChunks;

  const handleCitationClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const url = new URL(e.currentTarget.href);
    if (!url.hash.startsWith("#citation-")) {
      return;
    }

    e.preventDefault();

    const index = url.hash.split("-").pop();
    if (!index) { throw new Error("No index found"); }

    setSelectedCitation(citations[index]);
  }

  let citationIndex = 0;

  const content = completion.modelResponse.content
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((content: any) => {
      if (content.type !== "text") { return null }

      if (content.citations) {
        return content.text + content.citations.map((citation: Citation) => {
          const ret = ` [[${citationIndex}](#citation-${citationIndex})]`
          citationIndex++;
          return ret;
        }).join("\n")
      } else {
        return content.text;
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((c: any) => c !== null)
    .join("");

  return (
    <div>
      <Markdown
        className="markdown"
        components={{
          a: ({href, children}) => {
            return <a href={href} onClick={handleCitationClick} target="_blank" rel="noopener noreferrer">{children}</a>
          }
        }}>
        {content}
      </Markdown>
      <Tabs defaultValue="citations" className="flex flex-col gap-2">
        <TabsList className="flex w-full justify-center rounded-md bg-muted p-1 text-muted-foreground">
          <TabsTrigger value="citations">Citations</TabsTrigger>
          <TabsTrigger value="chunks">Chunks</TabsTrigger>
        </TabsList>
        <TabsContent value="citations">
          <div className="text-xs text-gray-500">
            {citations.map((citation: Citation, i: number) => {
              return <div key={i}>[{i}] {citation.document_title}: {citation.cited_text}</div>
            })}
          </div>
        </TabsContent>
        <TabsContent value="chunks">
          <div className="text-xs text-gray-500">
            {chunks.map((chunk:Chunk) => {
              return (
                <div key={chunk.id}>
                  <span className="font-bold">
                  (score {chunk.score.toFixed(3)}){" "}
                    {chunk.documentName} 
                  </span>{" "}
                  ({chunk.metadata?.start_time}-
                    {chunk.metadata?.end_time}): {chunk.text}
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
      {selectedCitation && (
        <CitationDialog
          partition={partition}
          chunk={chunks[selectedCitation.document_index]}
          citation={selectedCitation}
          onClose={() => setSelectedCitation(null)}
        />
      )}
    </div>
  )

};
