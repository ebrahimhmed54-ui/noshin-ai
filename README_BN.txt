NOSHIN AI — MULTI-AI UPGRADE (বাংলা নির্দেশনা)

এই প্যাকেজে যা আছে
- আগের Archer-style NOSHIN AI screen, menu, voice input/output, notes এবং tasks রাখা হয়েছে।
- Settings-এ ChatGPT/OpenAI, Google Gemini এবং Claude বেছে নেওয়ার অপশন যোগ হয়েছে।
- Netlify Function backend যোগ হয়েছে। API key browser-এর HTML-এ রাখা হয় না।

গুরুত্বপূর্ণ
এটি AI সংযোগের প্রস্তুত প্যাকেজ; API keys না যোগ করা পর্যন্ত বাস্তব AI উত্তর কাজ করবে না।
API ব্যবহারে provider অনুযায়ী খরচ/বিলিং লাগতে পারে। Free tier/availability provider-এর নিয়মে বদলাতে পারে।
কোনো API key আমাকে chat-এ পাঠাবেন না। কাউকে screenshot-এও দেখাবেন না।

Netlify-তে প্রকাশ
1) ZIP extract করুন। ভিতরের index.html, manifest.webmanifest, sw.js এবং netlify ফোল্ডারসহ সব ফাইল একসাথে site deploy করুন।
2) Netlify Dashboard > আপনার NOSHIN AI site > Site configuration > Environment variables-এ যান।
3) নিচের key গুলো প্রয়োজনমতো আলাদা করে যোগ করুন:
   OPENAI_API_KEY       (OpenAI key)
   GEMINI_API_KEY       (Google Gemini key)
   ANTHROPIC_API_KEY    (Claude key)
4) Optional model settings:
   OPENAI_MODEL         default: gpt-6
   GEMINI_MODEL         default: gemini-2.5-flash
   ANTHROPIC_MODEL      default: claude-sonnet-4-5
5) Environment variables save করার পর নতুন deploy করতে হবে।
6) অ্যাপ খুলে Settings > AI নির্বাচন থেকে যে provider-এর key যোগ করেছেন সেটি বেছে নিন।

নিরাপত্তা
- API keys কখনো index.html, public ZIP, GitHub public repository, বা chat-এ লিখবেন না।
- Netlify environment variables-এ key রাখবেন; Functions runtime-এ ব্যবহৃত হবে।
- চাইলে প্রথমে শুধু একটি provider দিয়ে পরীক্ষা করুন। পরে অন্য keys যোগ করুন।
- কোনো payment, bank, OTP, PIN বা password permission এই প্যাকেজে নেই।

সীমাবদ্ধতা
- এই আপডেট background wake-word "নশিন" যোগ করে না; browser/PWA background microphone সীমাবদ্ধ।
- ফোনের স্ক্রিন বন্ধ বা অ্যাপ বন্ধ থাকলে সবসময় শুনতে পারবে—এমন নিশ্চয়তা নেই।
- বাংলা voice quality Android-এর installed Text-to-Speech voice-এর ওপর নির্ভর করে।
