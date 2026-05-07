import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const SYSTEM_PROMPT =
  "You are the Hackathon Research Agent for TollGate Bazaar. Give a concise sponsor-aligned answer for the Coinbase x AWS x402 hackathon. Focus on x402, Cursor/MCP, paid specialist agents, and AWS integration.";

let bedrockClient: BedrockRuntimeClient | null = null;

function useBedrock(): boolean {
  return (process.env.USE_BEDROCK ?? "").toLowerCase() === "true";
}

function getModelId(): string {
  return (
    process.env.BEDROCK_MODEL_ID ??
    "arn:aws:bedrock:us-east-1:432780980220:inference-profile/global.amazon.nova-2-lite-v1:0"
  );
}

function getRegion(): string {
  return process.env.AWS_REGION ?? "us-east-1";
}

function getClient(): BedrockRuntimeClient {
  if (!bedrockClient) {
    bedrockClient = new BedrockRuntimeClient({ region: getRegion() });
  }
  return bedrockClient;
}

export async function getHackathonAnswerFromBedrock(question: string): Promise<string | null> {
  if (!useBedrock()) return null;
  const userPrompt = question.trim();
  if (!userPrompt) return null;

  try {
    const res = await getClient().send(
      new ConverseCommand({
        modelId: getModelId(),
        system: [{ text: SYSTEM_PROMPT }],
        messages: [
          {
            role: "user",
            content: [{ text: userPrompt }],
          },
        ],
        inferenceConfig: {
          maxTokens: 300,
          temperature: 0.35,
          topP: 0.9,
        },
      }),
    );

    const text = res.output?.message?.content
      ?.map((c) => ("text" in c && typeof c.text === "string" ? c.text : ""))
      .join(" ")
      .trim();

    return text || null;
  } catch (error) {
    console.warn("[paid-agent-api] Bedrock call failed, falling back to canned answer.", error);
    return null;
  }
}
