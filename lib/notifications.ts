import { buildLeadSummary } from "@/lib/lead-summary";
import { logEvent } from "@/lib/logger";
import type { LeadContact, LeadEvaluation } from "@/lib/types";

type NotificationInput = LeadContact & {
  conversationId: string;
  evaluation: LeadEvaluation;
};

export async function notifySalesTeam(input: NotificationInput) {
  await Promise.allSettled([
    sendSalesEmail(input),
    sendWhatsAppAlert(input),
  ]);
}

async function sendSalesEmail({
  name,
  email,
  conversationId,
  evaluation,
}: NotificationInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.SALES_TEAM_EMAIL;
  const from = process.env.SALES_FROM_EMAIL;

  if (!apiKey || !to || !from) return;

  const html = `
    <h2>New Qualified Lead</h2>
    <p><strong>Conversation ID:</strong> ${conversationId}</p>
    <p><strong>Name:</strong> ${name || "Unknown"}</p>
    <p><strong>Email:</strong> ${email || "Unknown"}</p>
    <p><strong>Score:</strong> ${evaluation.score.toFixed(1)} / 10</p>
    <p><strong>Lead Type:</strong> ${evaluation.leadType}</p>
    <p><strong>Summary:</strong> ${buildLeadSummary(evaluation)}</p>
    <p><strong>Recommendation:</strong> ${evaluation.recommendation}</p>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `New ${evaluation.leadType} - ${evaluation.score.toFixed(1)}/10`,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logEvent("warn", "Sales email notification failed", { errorText });
  }
}

async function sendWhatsAppAlert({
  name,
  email,
  evaluation,
}: NotificationInput) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = process.env.SALES_WHATSAPP_TO;

  if (!sid || !token || !from || !to) return;

  const body = new URLSearchParams({
    From: from,
    To: to,
    Body: [
      "New qualified lead",
      `Name: ${name || "Unknown"}`,
      `Email: ${email || "Unknown"}`,
      `Score: ${evaluation.score.toFixed(1)} / 10`,
      `Type: ${evaluation.leadType}`,
      buildLeadSummary(evaluation),
      `Recommendation: ${evaluation.recommendation}`,
    ].join("\n"),
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    logEvent("warn", "WhatsApp notification failed", { errorText });
  }
}
