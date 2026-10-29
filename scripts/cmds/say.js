
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

module.exports = {
  config: {
    name: "say",
    aliases: ["santoi", "voice"],
    version: "2.1.0",
    author: "SHANTO",
    countDown: 5,
    role: 0,
    shortDescription: "SHANTO Fish AI Voice",
    category: "AI",
    guide: "{pn} Hello Shanto"
  },

  onStart: async function ({ event, args, api }) {
    const text = args.join(" ").trim();
    if (!text) return;

    const voiceId = "e3856b21a37d4a648395292b21539d45";
    const API_URL = "https://shanto-fish-api.onrender.com/tts";

    const file = path.join(
      os.tmpdir(),
      `santoi-${Date.now()}.mp3`
    );

    try {
      const response = await axios.post(
        API_URL,
        {
          text,
          reference_id: voiceId,
          format: "mp3"
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "audio/mpeg"
          },
          responseType: "arraybuffer",
          timeout: 120000
        }
      );

      if (!response.data || response.data.length === 0) {
        throw new Error("Empty audio response");
      }

      await fs.writeFile(file, Buffer.from(response.data));

      await new Promise((resolve, reject) => {
        api.sendMessage(
          {
            attachment: fs.createReadStream(file)
          },
          event.threadID,
          err => err ? reject(err) : resolve()
        );
      });

    } catch (err) {
      console.error(
        "SANTOI API Error:",
        err.response?.status || err.message
      );
    } finally {
      await fs.remove(file).catch(() => {});
    }
  }
};
