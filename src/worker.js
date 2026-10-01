const corsHeaders = request => {
  const origin = request.headers.get("Origin");
  if (!origin) return {};
  try {
    const parsed = new URL(origin);
    if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(".github.io")) return {};
  } catch {
    return {};
  }
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "Content-Type",
    "access-control-max-age": "86400",
    "vary": "Origin",
  };
};

const json = (data, status = 200, request) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...corsHeaders(request) },
});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/posts" && request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }
    if (url.pathname === "/api/posts" && request.method === "GET") {
      const quakeId = (url.searchParams.get("quakeId") || "").trim();
      if (!quakeId || quakeId.length > 128) return json({ error: "quakeId is required" }, 400, request);
      const { results } = await env.DB.prepare(
        "SELECT id, nickname, mood, body, latitude, longitude, created_at FROM posts WHERE quake_id = ? ORDER BY created_at DESC LIMIT 100"
      ).bind(quakeId).all();
      return json({ posts: results }, 200, request);
    }
    if (url.pathname === "/api/posts" && request.method === "POST") {
      let input;
      try { input = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400, request); }
      const quakeId = String(input.quakeId || "").trim();
      const quakeTitle = String(input.quakeTitle || "震源情報").trim().slice(0, 120);
      const nickname = String(input.nickname || "匿名").trim().slice(0, 24) || "匿名";
      const mood = ["びっくり", "不安", "無事です", "落ち着いた"].includes(input.mood) ? input.mood : "ひとこと";
      const body = String(input.body || "").trim();
      const latitude = Number(input.latitude);
      const longitude = Number(input.longitude);
      if (!quakeId || quakeId.length > 128) return json({ error: "地震情報を確認できません" }, 400, request);
      if (!body || body.length > 1000) return json({ error: "投稿は1〜1000文字で入力してください" }, 400, request);
      if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        return json({ error: "地図上で投稿場所を選んでください" }, 400, request);
      }
      await env.DB.prepare(
        "INSERT INTO posts (quake_id, quake_title, nickname, mood, body, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(quakeId, quakeTitle, nickname, mood, body, latitude, longitude).run();
      return json({ ok: true }, 201, request);
    }
    if (url.pathname.startsWith("/api/")) return json({ error: "Not found" }, 404, request);
    return env.ASSETS.fetch(request);
  },
};


