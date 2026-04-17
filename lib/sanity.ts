import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || "portfolio";

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn:    false,
  token:     process.env.SANITY_API_TOKEN,
});

/** Write-capable client (always bypasses CDN, requires token) */
export const sanityWriteClient = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn:    false,
  token:     process.env.SANITY_API_TOKEN,
});

const builder = imageUrlBuilder(sanityClient);
export const urlFor = (source: SanityImageSource) => builder.image(source);
