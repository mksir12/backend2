export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") return new Response("OK");

    const update = await request.json();
    const msg = update.message;
    if (!msg || !msg.text) return new Response("OK");

    const chatId = msg.chat.id;
    const text = msg.text.trim();

    // Match Terabox links
    const teraRegex = /https?:\/\/(?:www\.)?[^/\s]*tera[^/\s]*\.[a-z]+\/s\/\S+/i;
    const match = text.match(teraRegex);
    if (!match) return new Response("OK");

    const link = match[0];

    // Notify user
    await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "📥 Download started. Please wait while I fetch your file from Terabox."
      })
    });

    // Forward to backend
    await fetch(env.BACKEND_URL + "/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        link,
        bot_token: env.BOT_TOKEN
      })
    });

    return new Response("OK");
  }
};
