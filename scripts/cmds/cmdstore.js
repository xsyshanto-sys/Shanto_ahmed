const axios = require("axios");

const availableCmdsUrl = "https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/availableCmds.json";
const cmdUrlsJson = "https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/cmdUrls.json";
const ITEMS_PER_PAGE = 10;

// Unicode Bold Text
function bold(text) {
  const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const styled = "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗";
  return String(text).split("").map(char => {
    const index = normal.indexOf(char);
    return index === -1 ? char : styled[index];
  }).join("");
}

module.exports.config = {
  name: "cmdstore",
  aliases: ["cs", "cmds"],
  author: "Dipto + shanto",
  role: 0,
  version: "7.0",
  description: {
    en: "Premium Commands Store"
  },
  countDown: 3,
  category: "goatbot",
  guide: {
    en: "{pn} [command name | single character | page number]"
  }
};

module.exports.onStart = async function ({ api, event, args }) {
  const query = args.join(" ").trim().toLowerCase();

  try {
    const response = await axios.get(availableCmdsUrl);
    const cmds = response.data.cmdName;
    let finalArray = cmds;
    let page = 1;

    if (query) {
      if (!isNaN(query)) {
        page = parseInt(query);
      } else if (query.length === 1) {
        finalArray = cmds.filter(cmd =>
          cmd.cmd.toLowerCase().startsWith(query)
        );

        if (finalArray.length === 0) {
          return api.sendMessage(
            `❌ | ${bold(`No commands found starting with "${query}".`)}`,
            event.threadID,
            event.messageID
          );
        }
      } else {
        finalArray = cmds.filter(cmd =>
          cmd.cmd.toLowerCase().includes(query)
        );

        if (finalArray.length === 0) {
          return api.sendMessage(
            `❌ | ${bold(`Command "${query}" not found.`)}`,
            event.threadID,
            event.messageID
          );
        }
      }
    }

    const totalPages = Math.ceil(finalArray.length / ITEMS_PER_PAGE);

    if (page < 1 || page > totalPages) {
      return api.sendMessage(
        `❌ | ${bold(`Invalid page number. Enter a number between 1 and ${totalPages}.`)}`,
        event.threadID,
        event.messageID
      );
    }

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const cmdsToShow = finalArray.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    let msg =
      `╭───✦ ${bold("CMD STORE")} ✦───╮\n` +
      `│ ${bold("PAGE")}: ${bold(page)} ${bold("OF")} ${bold(totalPages)}\n` +
      `│ ${bold("TOTAL COMMANDS")}: ${bold(finalArray.length)}\n`;

    cmdsToShow.forEach((cmd, index) => {
      msg +=
        `│ ───✦ ${bold(startIndex + index + 1)}. ${bold(cmd.cmd)}\n` +
        `│ ${bold("AUTHOR")}: ${bold(cmd.author || "Unknown")}\n` +
        `│ ${bold("UPDATE")}: ${bold(cmd.update || "N/A")}\n`;
    });

    msg += `╰─────────────⧕`;

    if (page < totalPages) {
      msg += `\n${bold(`Type "${this.config.name} ${page + 1}" for more commands.`)}`;
    }

    api.sendMessage(
      msg,
      event.threadID,
      (error, info) => {
        if (error || !info) return;

        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          cmdName: finalArray,
          page
        });
      },
      event.messageID
    );
  } catch (error) {
    console.error("CMDSTORE ERROR:", error);
    api.sendMessage(
      `❌ | ${bold("Failed to retrieve commands.")}`,
      event.threadID,
      event.messageID
    );
  }
};

module.exports.onReply = async function ({ api, event, Reply }) {
  if (Reply.author != event.senderID) {
    return api.sendMessage(
      `❌ | ${bold("Only the original requester can select a command.")}`,
      event.threadID,
      event.messageID
    );
  }

  const reply = parseInt(event.body);
  const startIndex = (Reply.page - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, Reply.cmdName.length);

  if (isNaN(reply) || reply < startIndex + 1 || reply > endIndex) {
    return api.sendMessage(
      `❌ | ${bold(`Reply with a number between ${startIndex + 1} and ${endIndex}.`)}`,
      event.threadID,
      event.messageID
    );
  }

  try {
    const selected = Reply.cmdName[reply - 1];
    const cmdName = selected.cmd;
    const status = selected.status;

    const response = await axios.get(cmdUrlsJson);
    const selectedCmdUrl = response.data[cmdName];

    if (!selectedCmdUrl) {
      return api.sendMessage(
        `❌ | ${bold("Command URL not found.")}`,
        event.threadID,
        event.messageID
      );
    }

    api.unsendMessage(Reply.messageID);

    const msg =
      `╭───────⭓\n` +
      `│ ${bold("STATUS")}: ${bold(status || "N/A")}\n` +
      `│ ${bold("COMMAND")}: ${bold(cmdName)}\n` +
      `│ ${bold("COMMAND URL")}: ${selectedCmdUrl}\n` +
      `╰─────────────⭓`;

    api.sendMessage(msg, event.threadID, event.messageID);
  } catch (error) {
    console.error("CMDSTORE REPLY ERROR:", error);
    api.sendMessage(
      `❌ | ${bold("Failed to retrieve the command URL.")}`,
      event.threadID,
      event.messageID
    );
  }
};
