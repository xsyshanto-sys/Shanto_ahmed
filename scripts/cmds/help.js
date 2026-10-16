const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

// 𝐀𝐛𝐜𝐝 স্টাইল ফন্ট কনভার্টার
function toBoldFont(text) {
  const boldMap = {
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠',
    'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧',
    'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮',
    'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆',
    'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍',
    'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔',
    'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒',
    '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
  };
  return text.split('').map(c => boldMap[c] || c).join('');
}

module.exports = {
  config: Object.freeze({
    name: "help",
    version: "2.0",
    author: "✦ 𝗦𝗛𝗔𝗡𝗧𝗢 ✦",
    countDown: 5,
    role: 0,
    shortDescription: { en: "📖 View command usage" },
    longDescription: { en: "📜 View command usage and list all commands" },
    category: "system",
    guide: { en: "✦ {pn} [command] | {pn} -a [author] | {pn} -c [category]" },
    priority: 1,
  }),

  onStart: async function ({ message, args, event, role, api }) {
    const { threadID, messageID } = event;
    const prefix = getPrefix(threadID);

    if (!global.helpMessageIDs) global.helpMessageIDs = {};
    if (!global.helpMessageIDs[threadID]) global.helpMessageIDs[threadID] = [];

    // পুরানো মেসেজ ডিলিট
    const previousMessages = global.helpMessageIDs[threadID] || [];
    for (const msgID of previousMessages) {
      try { await api.unsendMessage(msgID); } catch (e) {}
    }
    global.helpMessageIDs[threadID] = [];

    let filterAuthor = null;
    let filterCategory = null;

    // Filter হ্যান্ডলিং
    if (args[0] === "-a" && args[1]) {
      filterAuthor = args.slice(1).join(" ").toLowerCase();
    } else if (args[0] === "-c" && args[1]) {
      filterCategory = args.slice(1).join(" ").toLowerCase();
    } else if (args.length > 0 && !args[0].startsWith("-")) {
      // নির্দিষ্ট কমান্ডের help
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));
      if (!command) return message.reply(`❌ Command "${commandName}" not found.`);

      const configCommand = command.config;
      const roleText = roleTextToString(configCommand.role);
      const usage = (configCommand.guide?.en || "No guide available.")
        .replace(/{pn}/g, prefix)
        .replace(/{n}/g, configCommand.name);

      const replyMsg = await message.reply(
`╭──「 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗛𝗘𝗟𝗣 」──⦿
┃ ✦ 𝗡𝗮𝗺𝗲: ${configCommand.name}
┃ ✦ 𝗗𝗲𝘀𝗰: ${configCommand.longDescription?.en || "No description"}
┃ ✦ 𝗔𝗹𝗶𝗮𝘀𝗲𝘀: ${configCommand.aliases?.join(", ") || "None"}
┃ ✦ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: ${configCommand.version || "1.0"}
┃ ✦ 𝗥𝗼𝗹𝗲: ${roleText}
┃ ✦ 𝗖𝗼𝗼𝗹𝗱𝗼𝘄𝗻: ${configCommand.countDown || 1}s
┃ ✦ 𝗔𝘂𝘁𝗵𝗼𝗿: ${configCommand.author || "Unknown"}
┃ ✦ 𝗨𝘀𝗮𝗴𝗲: ${usage}
╰────「 𝗣𝗢𝗖𝗞𝗘 」───⦿`
      );

      global.helpMessageIDs[threadID].push(replyMsg.messageID);
      return;
    }

    // সব কমান্ড সংগ্রহ
    const allCommands = [];
    let total = 0;

    for (const [name, value] of commands) {
      const config = value.config;

      if (filterAuthor && (!config.author || !config.author.toLowerCase().includes(filterAuthor))) continue;
      if (filterCategory && (!config.category || !config.category.toLowerCase().includes(filterCategory))) continue;

      allCommands.push({
        name,
        category: config.category || "Uncategorized",
        role: config.role || 0
      });
      total++;
    }

    if (total === 0) {
      const filterMsg = filterAuthor ? `author "${filterAuthor}"` : `category "${filterCategory}"`;
      return message.reply(`❌ No commands found for ${filterMsg}.`);
    }

    // Sort by category
    allCommands.sort((a, b) => {
      if (a.category === b.category) return a.name.localeCompare(b.name);
      return a.category.localeCompare(b.category);
    });

    // Category ভাগ করা
    const categories = {};
    for (const cmd of allCommands) {
      if (!categories[cmd.category]) categories[cmd.category] = [];
      categories[cmd.category].push({
        name: cmd.name,
        role: cmd.role
      });
    }

    // 🔥 Premium Header
    let msg = `╔═══════════════════════╗\n`;
    msg += `║   ✦ 𝗣𝗢𝗖𝗞𝗘 𝗕𝗢𝗧 𝗛𝗘𝗟𝗣 ✦   ║\n`;
    msg += `╚═══════════════════════╝\n\n`;
    msg += `╭━━━ 📊 𝗦𝗧𝗔𝗧𝗜𝗦𝗧𝗜𝗖𝗦 ━━━╮\n`;
    msg += `┃ ✦ 📦 Total Commands: ${total}\n`;
    msg += `┃ ✦ 📂 Total Categories: ${Object.keys(categories).length}\n`;
    msg += `┃ ✦ 🔰 Prefix: ${prefix}\n`;
    msg += `╰━━━━━━━━━━━━━━━━━━━━━╯\n\n`;

    // সব কমান্ড দেখানো (একসাথে)
    for (const category of Object.keys(categories).sort()) {
      const categoryCommands = categories[category];

      // Category Header
      msg += `╭──「 📂 ${toBoldFont(category.toUpperCase())} 」──⦿\n`;

      for (const cmd of categoryCommands) {
        const roleIndicator = cmd.role > 0 ? " 🔒" : "  ";
        msg += `┃ ✦ ⚙ ${toBoldFont(cmd.name)}${roleIndicator}\n`;
      }

      msg += `╰━━━━━━━━━━━━━━━━━━━━━╯\n\n`;
    }

    // Footer
    msg += `╭━━━ ℹ 𝗜𝗡𝗙𝗢 ━━━╮\n`;
    msg += `┃ ✦ 🔒 = Admin Only\n`;
    msg += `┃ ✦ ✦ Use: ${prefix}help [cmd]\n`;
    msg += `┃ ✦ ✦ Owner: 𝗦𝗛𝗔𝗡𝗧𝗢\n`;
    msg += `╰━━━━━━━━━━━━━━━╯\n\n`;
    msg += `✦ ━━━━━ 𝗣𝗢𝗖𝗞𝗘 𝗕𝗢𝗧 ━━━━━ ✦`;

    const replyMsg = await message.reply(msg);
    global.helpMessageIDs[threadID].push(replyMsg.messageID);
  },
};

function roleTextToString(role) {
  switch (role) {
    case 0: return "👥 All Users";
    case 1: return "👑 Group Admins";
    case 2: return "🤖 Bot Admins";
    default: return "🔒 Unknown Role";
  }
     }
