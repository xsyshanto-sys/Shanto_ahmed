const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");

module.exports.config = {
  name: "uptime",
  aliases: ["up"],
  version: "2.0.0",
  author: "Shanto",
  countDown: 3,
  role: 0,
  description: "Show uptime over the custom image",
  category: "INFO",
  guide: { en: "{pn}" }
};

function getUptimeText() {
  const total = Math.floor(process.uptime());
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `UPTIME  ${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

module.exports.onStart = async function ({ api, event }) {
  const imagePath = path.join(__dirname, "uptime.jpg");
  const outputPath = path.join(__dirname, `uptime-output-${Date.now()}.jpg`);

  try {
    if (!fs.existsSync(imagePath)) {
      return api.sendMessage(
        "uptime.jpg file ta uptime.js-er sathe eki folder-e rakho.",
        event.threadID,
        event.messageID
      );
    }

    const image = await Jimp.read(imagePath);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    const text = getUptimeText();
    const maxWidth = Math.min(image.bitmap.width - 60, 900);
    const textHeight = 70;
    const x = Math.floor((image.bitmap.width - maxWidth) / 2);
    const y = Math.floor(image.bitmap.height / 2 - textHeight / 2);
    const options = {
      text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    };

    // Print twice with a 1px offset to make the white text look bolder.
    image.print(font, x, y, options, maxWidth, textHeight);
    image.print(font, x + 1, y, options, maxWidth, textHeight);

    await image.quality(95).writeAsync(outputPath);

    api.sendMessage(
      { attachment: fs.createReadStream(outputPath) },
      event.threadID,
      (err) => {
        if (err) console.error("Uptime image send error:", err);
        setTimeout(() => {
          try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch (_) {}
        }, 10000);
      },
      event.messageID
    );
  } catch (error) {
    console.error("Uptime CMD error:", error);
    return api.sendMessage(
      "Uptime image create korte parini. Server-e jimp install ache kina check koro.",
      event.threadID,
      event.messageID
    );
  }
};
