// Supabase Edge Function: notify-subscriber
// Required Supabase secrets:
// RESEND_API_KEY, NOTIFY_EMAIL, FROM_EMAIL
// FROM_EMAIL must use a domain verified in Resend.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

async function sendEmail(apiKey: string, payload: Record<string, unknown>) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("Resend error:", result);
    throw new Error("No se pudo enviar uno de los correos.");
  }
  return result;
}

serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido." }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { email } = await request.json();
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return new Response(JSON.stringify({ error: "Correo no válido." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("RESEND_API_KEY");
    const notifyEmail = Deno.env.get("NOTIFY_EMAIL");
    const fromEmail = Deno.env.get("FROM_EMAIL");

    if (!apiKey || !notifyEmail || !fromEmail) {
      console.error("Faltan RESEND_API_KEY, NOTIFY_EMAIL o FROM_EMAIL.");
      return new Response(JSON.stringify({ error: "El servicio de correo no está configurado." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subscriberEmail = email.trim().toLowerCase();
    const safeEmail = escapeHtml(subscriberEmail);

    const confirmation = sendEmail(apiKey, {
      from: fromEmail,
      to: [subscriberEmail],
      subject: "Transmisión recibida | Cazadores de Kaijus",
      html: `
        <div style="margin:0;padding:32px 16px;background:#080d10;color:#e8f1f2;font-family:Arial,sans-serif">
          <div style="max-width:560px;margin:auto;padding:32px;border:1px solid #24505a;background:#101a1f">
            <p style="color:#55c5d2;letter-spacing:3px;font-size:12px">UNIDAD DE INVESTIGACIÓN · ALERTA</p>
            <h1 style="color:#ffffff">TRANSMISIÓN <span style="color:#55c5d2">RECIBIDA</span></h1>
            <p>Tu correo quedó registrado en el sistema de Cazadores de Kaijus.</p>
            <p>Te enviaremos avisos sobre nuevos Kaijus, actualizaciones, eventos y próximos encuentros.</p>
            <p style="color:#9fb2b7;font-size:12px">Registro asociado a: ${safeEmail}</p>
            <hr style="border:0;border-top:1px solid #24505a;margin:28px 0">
            <p style="color:#55c5d2;font-size:11px;letter-spacing:2px">INFORMACIÓN CLASIFICADA</p>
          </div>
        </div>`,
      text: "Tu correo quedó registrado en Cazadores de Kaijus. Te enviaremos avisos sobre nuevos Kaijus, actualizaciones, eventos y próximos encuentros.",
    });

    const notification = sendEmail(apiKey, {
      from: fromEmail,
      to: [notifyEmail],
      subject: "Nuevo suscriptor | Cazadores de Kaijus",
      html: `
        <div style="font-family:Arial,sans-serif;background:#080d10;color:#e8f1f2;padding:28px">
          <h2 style="color:#55c5d2">NUEVO REGISTRO DE SUSCRIPTOR</h2>
          <p>Se registró un nuevo correo en la landing page de Cazadores de Kaijus:</p>
          <p style="font-size:18px;font-weight:bold">${safeEmail}</p>
          <p style="color:#9fb2b7;font-size:12px">El registro ya fue guardado en la tabla suscriptores de Supabase.</p>
        </div>`,
      text: `Nuevo suscriptor en Cazadores de Kaijus: ${subscriberEmail}. El registro ya fue guardado en Supabase.`,
    });

    const results = await Promise.allSettled([confirmation, notification]);
    const failed = results.some((result) => result.status === "rejected");

    if (failed) {
      return new Response(JSON.stringify({
        error: "El registro se guardó, pero uno o más correos no pudieron enviarse.",
        confirmationSent: results[0].status === "fulfilled",
        notificationSent: results[1].status === "fulfilled",
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      confirmationSent: true,
      notificationSent: true,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("notify-subscriber:", error);
    return new Response(JSON.stringify({ error: "No se pudieron procesar los correos." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
