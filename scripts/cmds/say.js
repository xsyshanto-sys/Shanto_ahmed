const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const API_URL = "https://shanto-fish-api.onrender.com/tts";

const VOICES = {
  naruto: "d34183dcf4a041f5a82aa3dd19644329",
  momoi: "4482fc170b434bd68d80ccb1215e61af",
  man: "e3856b21a37d4a648395292b21539d45",
  default: "922256d5d40846b1b18986fd1bc9034a"
};

module.exports = {
  config: {
    name: "say",
    aliases: ["tts", "voice"],
    version: "3.0",
    author: "SHANTO",
    countDown: 5,
    role: 0,
    shortDescription: "AI Voice Generator",
    longDescription: "Convert text into AI voice",
    category: "utility",
    guide: {
      en: "{pn} <text>\n{pn} naruto <text>\n{pn} momoi <text>\n{pn} man <text>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args.length) return;

    let voice = "default";
    let text = args.join(" ");

    const first = args[0].toLowerCase();

    if (VOICES[first]) {
      voice = first;
      text = args.slice(1).join(" ");
    }

    if (!text.trim()) return;

    const filePath = path.join(
      __dirname,
      "cache",
      `say_${Date.now()}.mp3`
    );

    try {
      // Only react, no pending message
      api.setMessageReaction("⏳", messageID, () => {}, true);

      const response = await axios.post(
        API_URL,
        {
          text: text,
          reference_id: VOICES[voice]
        },
        {
          responseType: "arraybuffer",
          timeout: 120000,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, Buffer.from(response.data));

      api.setMessageReaction("✅", messageID, () => {}, true);

      await api.sendMessage(
        {
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        async () => {
          await fs.remove(filePath).catch(() => {});
        },
        messageID
      );

    } catch (error) {
      await fs.remove(filePath).catch(() => {});
      api.setMessageReaction("❌", messageID, () => {}, true);
    }
  }
};
