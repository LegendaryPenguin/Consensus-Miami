import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const promptCandidates = [
  path.resolve(process.cwd(), "docs/demo-prompt.md"),
  path.resolve(process.cwd(), "../../docs/demo-prompt.md"),
];

export async function GET() {
  for (const candidate of promptCandidates) {
    try {
      const text = await fs.readFile(candidate, "utf8");
      return NextResponse.json({ prompt: text });
    } catch {
      // keep trying candidates
    }
  }

  return NextResponse.json(
    {
      prompt:
        "Use HandOff. List agents, choose Hackathon Research Agent, pay with x402 if required, and return answer + receipt + why x402 was necessary.",
    },
    { status: 200 },
  );
}
