/** Transactional email via Resend's REST API (no SDK needed). No-ops without a key. */
export async function notifyNewInquiry(i: { id?: string; name: string; email: string; summary: string }) {
  const key = process.env.RESEND_API_KEY, to = process.env.INQUIRY_NOTIFY_TO;
  if (!key || !to) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: process.env.INQUIRY_NOTIFY_FROM ?? "LOASH <onboarding@resend.dev>",
      to: [to],
      reply_to: i.email,
      subject: `New tattoo request — ${i.name}`,
      text: `${i.summary}\n\nInquiry id: ${i.id ?? "n/a"}`,
    }),
  }).catch((e) => console.error("[loash] resend failed", e));
}
