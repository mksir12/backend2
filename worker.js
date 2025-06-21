const BOT_TOKEN = "7621395891:AAHhHL4vNZCNAzdMYKdKxvuwiUCblc8CSI0";
const BACKEND_URL = "https://backend-drab-alpha-79.vercel.app";

export default {
  async fetch(request) {
    if (request.method !== "POST") return new Response("OK");

    const update = await request.json();
    const msg = update.message;
    if (!msg || !msg.text) return new Response("OK");

    const chatId = msg.chat.id;
    const text = msg.text.trim();

    // ✅ START command
    if (text === "/start") {
      const welcome = `👋 Welcome to the Terabox Downloader Bot!

📥 Just send me a valid Terabox share link and I’ll fetch the file for you.
⚠️ Only files under 2GB are supported.

Made by @MrMNTG`;
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: welcome
        })
      });
      return new Response("OK");
    }

    // ✅ Match Terabox link
    const teraRegex = /https?:\/\/(?:www\.)?[^/\s]*tera[^/\s]*\.[a-z]+\/s\/\S+/i;
    const match = text.match(teraRegex);
    if (!match) return new Response("OK");

    const link = match[0];

    // ✅ Notify user
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "📥 Download started. Please wait while I fetch your file from Terabox..."
      })
    });

    // ✅ Forward to backend
    await fetch(BACKEND_URL + "/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        link,
        bot_token: BOT_TOKEN
      })
    });

    return new Response("OK");
  }
};
