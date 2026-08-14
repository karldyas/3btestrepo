import { tool } from "ai";
import { z } from "zod";

const MAX_CHARS = 15000;

export default tool({
  description: "Fetch a public web page and return its readable text content.",
  inputSchema: z.object({
    url: z.string().url().describe("Absolute http(s) URL of the page to fetch."),
  }),
  execute: async ({ url }) => {
    const response = await fetch(url, {
      headers: { "user-agent": "3b-research-agent" },
      signal: AbortSignal.timeout(20000),
    });
    const body = await response.text();
    const text = body
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
    return {
      url: response.url,
      status: response.status,
      truncated: text.length > MAX_CHARS,
      text: text.slice(0, MAX_CHARS),
    };
  },
});
