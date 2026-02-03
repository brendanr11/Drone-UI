import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind-friendly className combiner used by shadcn/ui components
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}