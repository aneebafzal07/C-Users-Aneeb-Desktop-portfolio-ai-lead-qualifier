import OpenAI from "openai";

const isUsingOpenAI = Boolean(process.env.OPENAI_API_KEY);

export const defaultChatModel = process.env.OPENAI_CHAT_MODEL
  ?? (isUsingOpenAI ? "gpt-4.1-mini" : "mistralai/mistral-small-3.1-24b-instruct");
export const defaultEvalModel = process.env.OPENAI_EVAL_MODEL
  ?? defaultChatModel;

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? process.env.OPENROUTER_API_KEY,
  ...(isUsingOpenAI
    ? {}
    : {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000",
          "X-Title": "AI Lead Qualifier",
        },
      }),
});
