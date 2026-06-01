import type { ChatMessage, LeadContact } from "@/lib/types";

type ConversationRecord = LeadContact & {
  id: string;
  messages: ChatMessage[];
  updatedAt: number;
  awaitingEmail?: boolean;
};

const conversations = new Map<string, ConversationRecord>();

export function getConversation(id: string) {
  return conversations.get(id) ?? null;
}

export function upsertConversation(
  id: string,
  messages: ChatMessage[],
  contact?: LeadContact & { awaitingEmail?: boolean }
) {
  const existing = conversations.get(id);
  const record: ConversationRecord = {
    id,
    messages,
    name: contact?.name ?? existing?.name,
    email: contact?.email ?? existing?.email,
    awaitingEmail: contact?.awaitingEmail ?? existing?.awaitingEmail ?? false,
    updatedAt: Date.now(),
  };

  conversations.set(id, record);
  pruneConversations();

  return record;
}

export function setConversationAwaitingEmail(id: string, awaitingEmail: boolean) {
  const existing = conversations.get(id);
  if (!existing) return null;

  const updated = {
    ...existing,
    awaitingEmail,
    updatedAt: Date.now(),
  };

  conversations.set(id, updated);
  return updated;
}

function pruneConversations() {
  if (conversations.size <= 200) return;

  const entries = [...conversations.entries()].sort(
    (left, right) => left[1].updatedAt - right[1].updatedAt
  );

  for (const [key] of entries.slice(0, conversations.size - 200)) {
    conversations.delete(key);
  }
}
