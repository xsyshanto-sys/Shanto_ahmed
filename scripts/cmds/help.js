const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
 config: Object.freeze({
 name: "help",
 version: "1.20",
 author: "SHANTO",
 countDown: 5,
 role: 0,
 shortDescription: { en: "📖 View command usage" },
 longDescription: { en: "📜 View command usage and list all commands" },
 category: "system",
 guide: { en: "✦ {pn} [page] | {pn} [command] | {pn} -a [author] | {pn} -c [category]" },
 priority: 1,
 }),

 onStart: async function ({ message, args, event, role, api }) {
 const { threadID, messageID } = event;
 const prefix = getPrefix(threadID);

 if (!global.helpMessageIDs) {
 global.helpMessageIDs = {};
 }
 if (!global.helpMessageIDs[threadID]) {
 global.helpMessageIDs[threadID] = [];
 }

 const previousMessages = global.helpMessageIDs[threadID] || [];
 for (const msgID of previousMessages) {
 try {
 await api.unsendMessage(msgID);
 } catch (e) {
 
 }
 }

 global.helpMessageIDs[threadID] = [];

 let filterAuthor = null;
 let filterCategory = null;
 let page = 1;

 if (args[0] === "-a" && args[1]) {
 filterAuthor = args.slice(1).join(" ").toLowerCase();
 } else if (args[0] === "-c" && args[1]) {
 filterCategory = args.slice(1).join(" ").toLowerCase();
 } else if (!isNaN(args[0])) {
 page = parseInt(args[0]);
 } else if (args.length > 0 && !args[0].startsWith("-")) {
 const commandName = args[0].toLowerCase();
 const command = commands.get(commandName) || commands.get(aliases.get(commandName));
 if (!command) return message.reply(`❌ Command "${commandName}" not found.`);

 const configCommand = command.config;
 const roleText = roleTextToString(configCommand.role);
 const usage = (configCommand.guide?.en || "No guide available.")
 .replace(/{pn}/g, prefix)
 .replace(/{n}/g, configCommand.name);

 const replyMsg = await message.reply(
`╭──「 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐇𝐄𝐋𝐏 」──⦿
┃ ✦ 𝗡𝗮𝗺𝗲: ${configCommand.name}
┃ ✦ 𝗗𝗲𝘀𝗰: ${configCommand.longDescription?.en || "No description"}
┃ ✦ 𝗔𝗹𝗶𝗮𝘀𝗲𝘀: ${configCommand.aliases?.join(", ") || "None"}
┃ ✦ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: ${configCommand.version || "1.0"}
┃ ✦ 𝗥𝗼𝗹𝗲: ${roleText}
┃ ✦ 𝗖𝗼𝗼𝗹𝗱𝗼𝘄𝗻: ${configCommand.countDown || 1}s
┃ ✦ 𝗔𝘂𝘁𝗵𝗼𝗿: ${configCommand.author || "Unknown"}
┃ ✦ 𝗨𝘀𝗮𝗴𝗲: ${usage}
╰────「 𝗣𝗢𝗖𝗞𝗘 𝗕𝗕'𝗘 」───⦿`
 );

 global.helpMessageIDs[threadID].push(replyMsg.messageID);

 setTimeout(async () => {
 try {
 await api.unsendMessage(replyMsg.messageID);
 global.helpMessageIDs[threadID] = global.helpMessageIDs[threadID].filter(id => id !== replyMsg.messageID);
 } catch (e) {
 
 }
 }, 60000);

 return;
 }

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

 allCommands.sort((a, b) => {
 if (a.category === b.category) {
 return a.name.localeCompare(b.name);
 }
 return a.category.localeCompare(b.category);
 });

 const categories = {};
 for (const cmd of allCommands) {
 if (!categories[cmd.category]) {
 categories[cmd.category] = [];
 }
 categories[cmd.category].push({
 name: cmd.name,
 role: cmd.role
 });
 }

 const commandsPerPage = 20;
 const totalPages = Math.ceil(total / commandsPerPage);

 if (page < 1) page = 1;
 if (page > totalPages) page = totalPages;

 const startIndex = (page - 1) * commandsPerPage;
 const endIndex = Math.min(startIndex + commandsPerPage, total);

 let msg = `╭━━━ -ღ´🦋𝗣𝗼𝗰𝗸𝗲🍒🥂 ━━━╮\n` +
 `┃ 🔰 Total Commands Available: ${total}\n` +
 `┃ 📥 Use: ${prefix}help [command] or ${prefix}help [page]\n` +
 `┃ 📄 Page: ${page}/${totalPages}\n` +
 `╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
 `╭──「 𝗣𝗢𝗖𝗞𝗘 𝗕𝗕'𝗘 𝗛𝗘𝗟𝗣 𝗠𝗘𝗡𝗨 」─⦿\n`;

 let count = 0;
 let displayed = 0;
 let currentCategory = "";

 for (const category of Object.keys(categories).sort()) {
 const categoryCommands = categories[category];

 for (const cmd of categoryCommands) {
 if (count >= endIndex) break;
 
 if (count >= startIndex) {
 if (currentCategory !== category) {
 if (displayed > 0) {
 msg += `┃\n`;
 }
 msg += `┃ ✦ 📂 ${category.toUpperCase()}\n`;
 currentCategory = category;
 }
 
 const roleIndicator = cmd.role > 0 ? " 🔒" : "";
 msg += `┃ ✦ ⚙ ${cmd.name}${roleIndicator}\n`;
 displayed++;
 }
 count++;
 }

 if (count >= endIndex) break;
 }

 msg += `┃\n`;
 msg += `┃ ✦ 📄 𝗣𝗮𝗴𝗲: ${page}/${totalPages}\n`;
 msg += `┃ ✦ 📊 𝗧𝗼𝘁𝗮𝗹 𝗔𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲: ${total} commands\n`;

 if (totalPages > 1) {
 msg += `┃ ✦ 🔄 𝗨𝘀𝗲: ${prefix}help <page>\n`;
 }

 
 msg += `┃ ✦ ℹ Commands marked with 🔒 are admin-only\n`;

 msg += `╰───「 𝗣𝗢𝗖𝗞𝗘 𝗕𝗕'𝗘 」──⦿`;

 const replyMsg = await message.reply(msg);

 global.helpMessageIDs[threadID].push(replyMsg.messageID);

 setTimeout(async () => {
 try {
 await api.unsendMessage(replyMsg.messageID);
 global.helpMessageIDs[threadID] = global.helpMessageIDs[threadID].filter(id => id !== replyMsg.messageID);
 } catch (e) {
 
 }
 }, 60000);
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
