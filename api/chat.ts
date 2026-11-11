/**
 * Proxy seguro para a API da Groq.
 * A chave (GROQ_API_KEY) existe apenas no servidor — nunca vai para o bundle do frontend.
 */
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const ALLOWED_MODELS = new Set([
  "llama-3.1-8b-instant",
  "llama-3.1-70b-versatile",
  "mixtral-8x7b-32768",
  "gemma-7b-it",
]);
const DEFAULT_MODEL = "llama-3.1-8b-instant";
const ALLOWED_ROLES = new Set(["system", "user", "assistant"]);

const MAX_MESSAGES = 30;
const MAX_CONTENT_LENGTH = 12000;
const MAX_TOKENS_CAP = 1000;

// Rate limit simples por IP (best effort: memória da instância serverless)
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    if (hits.size > 5000) {
      for (const [key, value] of hits) {
        if (value.resetAt < now) hits.delete(key);
      }
    }
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REQUESTS_PER_WINDOW;
}

function clientIp(req: any): string {
  const forwarded = req.headers?.["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return (first ? String(first).split(",")[0].trim() : req.socket?.remoteAddress) || "unknown";
}

export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");

  const apiKey = process.env.GROQ_API_KEY;

  if (req.method === "GET") {
    return res.status(200).json({ configured: !!apiKey });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Método não permitido" });
  }

  if (!apiKey) {
    return res.status(503).json({ error: "Chatbot não configurado no servidor." });
  }

  if (isRateLimited(clientIp(req))) {
    return res.status(429).json({ error: "Muitas requisições. Tente novamente em instantes." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const { messages, model, max_tokens, temperature } = body;

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return res.status(400).json({ error: "Payload inválido: 'messages'." });
  }

  const safeMessages: Array<{ role: string; content: string }> = [];
  for (const m of messages) {
    if (
      !m ||
      !ALLOWED_ROLES.has(m.role) ||
      typeof m.content !== "string" ||
      m.content.length > MAX_CONTENT_LENGTH
    ) {
      return res.status(400).json({ error: "Payload inválido: mensagem malformada." });
    }
    safeMessages.push({ role: m.role, content: m.content });
  }

  const safeModel = typeof model === "string" && ALLOWED_MODELS.has(model) ? model : DEFAULT_MODEL;
  const safeMaxTokens =
    typeof max_tokens === "number" && max_tokens > 0 ? Math.min(Math.floor(max_tokens), MAX_TOKENS_CAP) : 1000;
  const safeTemperature =
    typeof temperature === "number" && temperature >= 0 && temperature <= 2 ? temperature : 0.7;

  try {
    const upstream = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: safeModel,
        messages: safeMessages,
        max_tokens: safeMaxTokens,
        temperature: safeTemperature,
        stream: false,
      }),
    });

    const text = await upstream.text();
    res.setHeader("Content-Type", "application/json");
    return res.status(upstream.status).send(text);
  } catch (error) {
    console.error("[api/chat] Falha ao contatar Groq:", error);
    return res.status(502).json({ error: "Falha ao comunicar com o serviço de IA." });
  }
}
