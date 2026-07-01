import { createFileRoute } from "@tanstack/react-router";
import { getStripe } from "@/lib/stripe.server";

export const Route = createFileRoute("/api/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const stripe = getStripe();
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
          return new Response("Missing STRIPE_WEBHOOK_SECRET", { status: 500 });
        }

        const body = await request.text();
        const signature = request.headers.get("stripe-signature");
        if (!signature) {
          return new Response("Missing signature", { status: 400 });
        }

        let event;
        try {
          event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
          console.error("[stripe webhook] signature failed", err);
          return new Response("Invalid signature", { status: 400 });
        }

        if (event.type === "checkout.session.completed") {
          const session = event.data.object;
          const userId = session.metadata?.userId ?? session.client_reference_id;
          if (!userId) {
            console.error("[stripe webhook] no userId on session", session.id);
            return new Response("OK", { status: 200 });
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin
            .from("profiles")
            .update({
              plan_status: "lifetime",
              paid_at: new Date().toISOString(),
              stripe_customer_id:
                typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
            })
            .eq("id", userId);

          if (error) {
            console.error("[stripe webhook] profile update failed", error);
            return new Response("Profile update failed", { status: 500 });
          }
        }

        return new Response("OK", { status: 200 });
      },
    },
  },
});
