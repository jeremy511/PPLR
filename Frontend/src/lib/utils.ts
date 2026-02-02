import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDisplayName(firstName: string = "", lastName: string = "") {
  const f = firstName.trim().split(" ")[0] || "";
  const l = lastName.trim().split(" ")[0] || "";
  return `${f} ${l}`.trim();
}
