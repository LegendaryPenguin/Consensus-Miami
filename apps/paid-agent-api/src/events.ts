import { createEvent, listAgents, type TollGateEvent } from "@tollgate/shared";

const eventLog: TollGateEvent[] = [];

export function appendEvent(type: Parameters<typeof createEvent>[0]["type"], detail: string, source: "api" | "mcp" | "dashboard" = "api") {
  const evt = createEvent({ type, detail, source });
  eventLog.push(evt);
  if (eventLog.length > 200) {
    eventLog.shift();
  }
  return evt;
}

export function listEvents(): TollGateEvent[] {
  return [...eventLog];
}

export function clearEvents() {
  eventLog.length = 0;
}

export function bootstrapLookupEvent() {
  appendEvent("marketplace_listed", `Registry currently has ${listAgents().length} agents.`);
}
