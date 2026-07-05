import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

export const sendCvEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        to: z.string().email(),
        subject: z.string().min(1).max(300),
        message: z.string().min(1).max(5000),
        replyTo: z.string().email().optional(),
        senderName: z.string().max(120).optional(),
        filename: z.string().min(1).max(200),
        contentBase64: z.string().min(1),
        contentType: z.enum(["application/pdf", "image/jpeg", "image/png"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    if (!lovableKey) throw new Error("LOVABLE_API_KEY is not configured");
    if (!resendKey) throw new Error("RESEND_API_KEY is not configured");

    const fromName = (data.senderName || "CV").replace(/[<>"\r\n]/g, "").trim() || "CV";
    const from = `${fromName} <onboarding@resend.dev>`;

    const html = `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#111">${data.message
      .split(/\n+/)
      .map((p) => `<p style="margin:0 0 12px">${escapeHtml(p)}</p>`)
      .join("")}</div>`;

    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
      },
      body: JSON.stringify({
        from,
        to: [data.to],
        subject: data.subject,
        html,
        text: data.message,
        reply_to: data.replyTo,
        attachments: [
          {
            filename: data.filename,
            content: data.contentBase64,
            content_type: data.contentType,
          },
        ],
      }),
    });

    const bodyText = await res.text();
    if (!res.ok) {
      throw new Error(`Email send failed (${res.status}): ${bodyText.slice(0, 400)}`);
    }
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(bodyText);
    } catch {
      /* ignore */
    }
    return { ok: true, id: (parsed as { id?: string } | null)?.id ?? null };
  });

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
