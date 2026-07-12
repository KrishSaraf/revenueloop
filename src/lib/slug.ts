import { customAlphabet } from "nanoid";

const suffix = customAlphabet("123456789abcdefghijkmnopqrstuvwxyz", 4);

export function createSlug(input: string, existing: string[] = []) {
  const base =
    input
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 56) || "site";

  if (!existing.includes(base)) {
    return base;
  }

  let candidate = `${base}-${suffix()}`;
  while (existing.includes(candidate)) {
    candidate = `${base}-${suffix()}`;
  }

  return candidate;
}
