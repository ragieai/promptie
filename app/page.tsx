"use client";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "@radix-ui/react-icons";

import { z } from "zod";
import GeneratedText from "./generated-text";
import {
  DEFAULT_OPENROUTER_MODEL,
  DEFAULT_SYSTEM_PROMPT,
} from "../lib/prompts";
import { completionSchema } from "../lib/types";

export default function Home() {
  const [completion, setCompletion] = useState<null | z.infer<typeof completionSchema>>(null);
  const [systemPrompt, setSystemPrompt] = useState<string>(DEFAULT_SYSTEM_PROMPT);
  const [pendingSystemPrompt, setPendingSystemPrompt] = useState<string>(systemPrompt);
  const [openrouterModel, setOpenrouterModel] = useState<string>(
    DEFAULT_OPENROUTER_MODEL
  );
  const [pendingOpenrouterModel, setPendingOpenrouterModel] =
    useState<string>(openrouterModel);
  const [provider, setProvider] = useState<string>("anthropic");
  const [pendingProvider, setPendingProvider] = useState<string>(provider);
  const [partition, setPartition] = useState<string>("default");
  const [topK, setTopK] = useState<number>(6);
  const [rerank, setRerank] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);

    const response = await fetch("/api/completions", {
      method: "POST",
      body: JSON.stringify({ systemPrompt, message, partition, topK, rerank, provider, openrouterModel }),
    });

    try {
      const json = await response.json();
      const completion = completionSchema.parse(json);
      setCompletion(completion);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemPromptSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setSystemPrompt(pendingSystemPrompt);
    localStorage.setItem("systemPrompt", pendingSystemPrompt);
    setProvider(pendingProvider);
    localStorage.setItem("provider", pendingProvider);
    setOpenrouterModel(pendingOpenrouterModel);
    localStorage.setItem("openrouterModel", pendingOpenrouterModel);
    setOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (open) {
      setPendingSystemPrompt(systemPrompt);
    }
  };

  const handleMessageChange = (value: string) => {
    setMessage(value);
    localStorage.setItem("message", value);
  };

  const handlePartitionChange = (value: string) => {
    setPartition(value);
    localStorage.setItem("partition", value);
  };

  const handleTopKChange = (value: string) => {
    setTopK(parseInt(value));
    localStorage.setItem("topK", value);
  };

  const handleRerankChange = (value: boolean) => {
    setRerank(value);
    localStorage.setItem("rerank", value.toString());
  };

  const handleResetSystemPrompt = () => {
    setPendingSystemPrompt(DEFAULT_SYSTEM_PROMPT);
  };

  useEffect(() => {
    const savedProvider = localStorage.getItem("provider");
    if (savedProvider) {
      setProvider(savedProvider);
    }
    const savedOpenrouterModel = localStorage.getItem("openrouterModel");
    if (savedOpenrouterModel) {
      setOpenrouterModel(savedOpenrouterModel);
    }
    const savedSystemPrompt = localStorage.getItem("systemPrompt");
    if (savedSystemPrompt) {
      setSystemPrompt(savedSystemPrompt);
    }
    const savedMessage = localStorage.getItem("message");
    if (savedMessage) {
      setMessage(savedMessage);
    }
    const savedPartition = localStorage.getItem("partition");
    if (savedPartition) {
      setPartition(savedPartition);
    }
    const savedTopK = localStorage.getItem("topK");
    if (savedTopK) {
      setTopK(parseInt(savedTopK));
    }
    const savedRerank = localStorage.getItem("rerank");
    if (savedRerank) {
      setRerank(savedRerank === "true");
    }
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full flex gap-2 pb-4">
        <div className="flex-1 flex flex-col">
          <input
            type="text"
            placeholder="Enter message"
            className="border-1 border-gray-300 rounded-md p-2 w-full"
            name="message"
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
          />
          <div className="flex gap-10 pt-2 justify-between">
            <div className="text-sm flex items-center gap-2">
              <label htmlFor="partition">Partition:</label>
              <input
                type="text"
                name="partition"
                className="border-1 border-gray-300 rounded-md p-2"
                value={partition}
                onChange={(e) => handlePartitionChange(e.target.value)}
              />
            </div>
            <div className="text-sm flex items-center gap-2">
              <label htmlFor="topK">Top K:</label>
              <input
                type="number"
                name="topK"
                className="border-1 border-gray-300 rounded-md p-2"
                value={topK}
                onChange={(e) => handleTopKChange(e.target.value)}
              />
            </div>
            <div className="text-sm flex items-center gap-2">
              <label htmlFor="rerank">Rerank:</label>
              <input
                type="checkbox"
                name="rerank"
                className="border-1 border-gray-300 rounded-md p-2"
                checked={rerank}
                onChange={(e) => handleRerankChange(e.target.checked)}
              />
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger>Edit prompt</DialogTrigger>
                <DialogContent>
                  <DialogTitle>Edit system prompt</DialogTitle>
                  <DialogDescription className="flex items-center justify-between">
                    Edit the system prompt for the Promptie.
                    <button className="text-blue-500" onClick={handleResetSystemPrompt}>Reset</button>
                  </DialogDescription>
                  <form onSubmit={handleSystemPromptSubmit}>
                    <textarea
                      name="systemPrompt"
                      className="w-full h-[600px] p-2 border-1 border-gray-300 rounded-md mb-4"
                      value={pendingSystemPrompt}
                      onChange={(e) => setPendingSystemPrompt(e.target.value)}
                    />
                    <AccordionPrimitive.Root type="single" collapsible>
                      <AccordionPrimitive.Item
                        value="advanced"
                        className="border-1 border-gray-300 rounded-md p-2"
                      >
                        <AccordionPrimitive.Trigger className="group flex items-center justify-between gap-2">
                          <span>Advanced</span>
                          <ChevronDownIcon
                            className="group-data-[state=open]:rotate-180"
                            aria-hidden
                          />
                        </AccordionPrimitive.Trigger>
                        <AccordionPrimitive.Content>
                        <div>
                            <label htmlFor="openrouterModel" className="mr-3">
                              Provider:
                            </label>
                            <select
                              name="provider"
                              className="border-1 border-gray-300 rounded-md p-1"
                              value={pendingProvider}
                              onChange={(e) =>
                                setPendingProvider(e.target.value)
                              }
                            >
                              <option value="anthropic">Anthropic</option>
                              <option value="openrouter">OpenRouter</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="openrouterModel" className="mr-3">
                              OpenRouter Model:
                            </label>
                            <input
                              type="text"
                              name="openrouterModel"
                              className="border-1 border-gray-300 rounded-md p-1"
                              value={pendingOpenrouterModel}
                              onChange={(e) =>
                                setPendingOpenrouterModel(e.target.value)
                              }
                            />
                          </div>
                        </AccordionPrimitive.Content>
                      </AccordionPrimitive.Item>
                    </AccordionPrimitive.Root>
                    <DialogFooter>
                      <DialogClose asChild>
                        <button className="text-gray-500 rounded-md p-2">Cancel</button>
                      </DialogClose>
                      <button className="bg-blue-500 text-white rounded-md p-2 px-6" type="submit">Save</button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white rounded-md p-2 px-6 self-start"
        >
          Send
        </button>
      </form>
      {!completion && !isLoading && (
        <div className="flex flex-col h-full mt-8">
          <p>No completion yet. Send a message to get started.</p>
        </div>
      )}
      {isLoading && (
        <div className="flex flex-col h-full mt-8 items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
          </div>
        </div>
      )}
      {completion && !isLoading && (
        <Tabs defaultValue="message" className="flex flex-col h-full mt-8">
          <TabsList className="w-full justify-start bg-transparent gap-2">
            <TabsTrigger value="message">Message</TabsTrigger>
            <TabsTrigger value="chunks">Chunks</TabsTrigger>
          </TabsList>
          <TabsContent value="message" className="flex-1">
            <GeneratedText completion={completion} partition={partition} />
          </TabsContent>
          <TabsContent value="chunks" className="flex-1 whitespace-pre-wrap">
            <pre className="flex flex-col gap-2 whitespace-pre-wrap text-xs">
              {JSON.stringify(completion.retrievalResponse, null, 2)}
            </pre>
          </TabsContent>
        </Tabs>
      )}
    </>
  );
}
