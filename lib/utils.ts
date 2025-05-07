import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getProxyPath(partition: string, url: string) {
  const params = new URLSearchParams({ url, partition });
  return `/api/stream?${params.toString()}`;
}

export function formatSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (n: number): string => n.toString().padStart(2, "0");

  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

export function getStreamType(chunk: any) {
  if (chunk.links?.self_video_stream) {
    return "video";
  } else if (chunk.links?.self_audio_stream) {
    return "audio";
  }
  return null;
}
