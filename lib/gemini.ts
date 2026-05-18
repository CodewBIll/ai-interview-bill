import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "@/types/interview";
import { buildSystemPrompt } from "@/lib/prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function callInterview(
  messages: Message[],
  role: string,
  level: string,
  name: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2-flash",
    systemInstruction: buildSystemPrompt(role, level, name),
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });

  // Separate history (all but last message) from the current user message
  const history = messages.slice(0, -1);
  const lastMessage = messages[messages.length - 1];

  if (!lastMessage) {
    throw new Error("No messages provided");
  }

  // Build chat history (exclude the last message which we'll send now)
  const chatHistory = history
    .filter((msg) => msg.content.trim())
    .map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

  const chat = model.startChat({
    history: chatHistory,
  });

  const result = await chat.sendMessage(lastMessage.content);
  const response = result.response;
  const text = response.text();

  // Clean up the response — remove markdown code blocks if present
  return cleanJsonResponse(text);
}

function cleanJsonResponse(text: string): string {
  // Remove markdown code fences if Gemini wraps the JSON in them
  let cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  if (!cleaned.startsWith("{")) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      cleaned = match[0];
    }
  }

  return cleaned;
}
