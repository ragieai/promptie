import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getProxyPath(partition: string, url: string) {
  const params = new URLSearchParams({ url, partition });
  return `/api/stream?${params.toString()}`;
}
