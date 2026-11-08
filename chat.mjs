// NOSHIN AI multi-provider server function.
// Store all API keys in Netlify Site configuration > Environment variables.
// Never place API keys in index.html or send them from the browser.
export default async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "শুধু POST অনুরোধ গ্রহণ করা হয়।" }, { status: 405 });
  }

  let body;
  try { body = await req.json(); }
  catch { return Response.json({ error: "অনুরোধের তথ্য পড়া যায়নি।" }, { status: 400 }); }

  const provider = String(body.provider || "openai").toLowerCase();
  const message = String(body.message || "").trim().slice(0, 8000);
  if (!message) return Response.json({ error: "আপনার কথা লিখুন বা বলুন।" }, { status: 400 });

  const system = "তুমি নশিন, একজন সহায়ক বাংলা AI সহকারী। স্বাভাবিক, উষ্ণ, সম্মানজনক ও পরিষ্কার বাংলায় উত্তর দাও। ব্যবহারকারী অন্য ভাষা চাইলে সেই ভাষায় উত্তর দাও। সংক্ষিপ্তভাবে শুরু করো, প্রয়োজন হলে বিস্তারিত বলো।";
  try {
    let reply = "";
    if (provider === "openai") {
      if (!process.env.OPENAI_API_KEY) throw new Error("Netlify-তে OPENAI_API_KEY যোগ করা হয়নি");
      const r = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-6",
          instructions: system,
          input: message
        })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error?.message || "OpenAI অনুরোধ ব্যর্থ");
      reply = d.output?.flatMap(x => x.content || []).filter(x => x.type === "output_text").map(x => x.text).join("\n") || d.output_text || "";
    } else if (provider === "gemini") {
      if (!process.env.GEMINI_API_KEY) throw new Error("Netlify-তে GEMINI_API_KEY যোগ করা হয়নি");
      const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: "user", parts: [{ text: message }] }] })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error?.message || "Gemini অনুরোধ ব্যর্থ");
      reply = d.candidates?.[0]?.content?.parts?.map(x => x.text || "").join("\n") || "";
    } else if (provider === "claude") {
      if (!process.env.ANTHROPIC_API_KEY) throw new Error("Netlify-তে ANTHROPIC_API_KEY যোগ করা হয়নি");
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
          max_tokens: 1200,
          system,
          messages: [{ role: "user", content: message }]
        })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error?.message || "Claude অনুরোধ ব্যর্থ");
      reply = d.content?.filter(x => x.type === "text").map(x => x.text).join("\n") || "";
    } else {
      return Response.json({ error: "এই AI provider সমর্থিত নয়।" }, { status: 400 });
    }
    if (!reply) throw new Error("AI থেকে খালি উত্তর এসেছে");
    return Response.json({ reply });
  } catch (e) {
    return Response.json({ error: e.message || "AI সংযোগে সমস্যা হয়েছে" }, { status: 502 });
  }
};
