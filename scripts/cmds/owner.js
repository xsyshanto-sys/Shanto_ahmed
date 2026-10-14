const fs = require("fs-extra");
const request = require("request");
const path = require("path");

module.exports = {
  config: {
    name: "owner",
    version: "1.3.0",
    author: "Mᴏʜᴀᴍᴍᴀᴅ Aᴋᴀsʜ",
    role: 0,
    shortDescription: "Owner information with image",
    category: "Information",
    guide: {
      en: "owner"
    }
  },

  onStart: async function ({ api, event }) {
    const ownerText = 
`╭─ 👑 Oᴡɴᴇʀ Iɴғᴏ 👑 ─╮
│ 👤 Nᴀᴍᴇ       : 𝗦𝗵𝗔𝗻𝗧𝗼 𝗔𝗵𝗺𝗲𝗱
│ 🧸 Nɪᴄᴋ       : 𝐗𝐒𝐘 𝐒𝐇𝐀𝐍𝐓𝐎
│ 🎂 Aɢᴇ        : 𝟭𝟵+
│ 💘 Rᴇʟᴀᴛɪᴏɴ : 𝗦𝗜𝗡𝗚𝗟𝗘
│ 🎓 Pʀᴏғᴇssɪᴏɴ : 𝗦𝗧𝗨𝗗𝗘𝗡𝗧
│ 📚 Eᴅᴜᴄᴀᴛɪᴏɴ : 𝗜𝗡𝗧𝗘𝗥 𝟮𝗡𝗗
│ 🏡 Lᴏᴄᴀᴛɪᴏɴ : 𝗕𝗔𝗥𝗜𝗦𝗛𝗔𝗟 - 𝗕𝗛𝗢𝗟𝗔
├─ 🔗 Cᴏɴᴛᴀᴄᴛ ─╮
│ 📘 Facebook  : Shanto xhmed's
│ 💬 Messenger: m.me/Shantoahmedbabe
│ 📞 WhatsApp  : wa.me/01826363486
╰────────────────╯`;

    const cacheDir = path.join(__dirname, "cache");
    const imgPath = path.join(cacheDir, "owner.jpg");

    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const imgLink = "https://i.imgur.com/1G4ZhU7.jpeg";

    const send = () => {
      api.sendMessage(
        {
          body: ownerText,
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => fs.unlinkSync(imgPath),
        event.messageID
      );
    };

    request(encodeURI(imgLink))
      .pipe(fs.createWriteStream(imgPath))
      .on("close", send);
  }
};
