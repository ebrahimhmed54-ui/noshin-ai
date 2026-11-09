
// NOSHIN AI - Bengali AI Assistant
// API keys must stay in Netlify Environment Variables.

export default async (req) => {
  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });

  if (req.method !== "POST") {
    return json({ error: "শুধু POST অনুরোধ গ্রহণ করা হয়।" }, 405);
  }

  try {
    const body = await req.json();
    const provider = String(body.provider || "gemini").toLowerCase();
    const message = String(body.message || "").trim().slice(0, 8000);

    if (!message) {
      return json({ error: "আপনার কথা লিখুন বা বলুন।" }, 400);
    }

    const system = "তুমি নশিন, একজন সহায়ক বাংলা AI সহকারী। স্বাভাবিক, উষ্ণ, সম্মানজনক ও পরিষ্কার বাংলায় উত্তর দাও। ব্যবহারকারী অন্য ভাষা চাইলে সেই ভাষায় উত্তর দাও।";

    let reply = "";

    if (provider === "gemini") {
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        return json({ error: "Netlify-তে GEMINI_API_KEY পাওয়া যায়নি।" }, 500);
      }

      const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: system }]
            },
            contents: [{
              role: "user",
              parts: [{ text: message }]
            }]
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return json({
          error: data.error?.message || "Gemini সংযোগ ব্যর্থ হয়েছে।"
        }, response.status);
      }

      reply = data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("\n") || "";

    } else if (provider === "openai") {
      const key = process.env.OPENAI_API_KEY;

      if (!key) {
        return json({
          error: "ChatGPT ব্যবহার করতে Netlify-তে OPENAI_API_KEY যোগ করতে হবে।"
        }, 500);
      }

      const response = await fetch(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${key}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || "gpt-4.1",
            instructions: system,
            input: message
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return json({
          error: data.error?.message || "ChatGPT সংযোগ ব্যর্থ হয়েছে।"
        }, response.status);
      }

      reply = data.output
        ?.flatMap(item => item.content || [])
        .filter(item => item.type === "output_text")
        .map(item => item.text)
        .join("\n") || data.output_text || "";

    } else {
      return json({ error: "এই AI provider সমর্থিত নয়।" }, 400);
    }

    if (!reply) {
      return json({ error: "AI থেকে কোনো উত্তর পাওয়া যায়নি।" }, 502);
    }

    return json({ reply });

  } catch (error) {
    return json({
      error: error.message || "সার্ভারে সমস্যা হয়েছে।"
    }, 500);
  }
};
