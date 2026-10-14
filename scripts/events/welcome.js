const { getTime } = global.utils;

module.exports = {
	config: {
		name: "welcome",
		version: "2.0",
		author: "SHANTO",
		category: "events"
	},

	onStart: async ({ message, event, api }) => {
		if (event.logMessageType !== "log:subscribe")
			return;

		const { threadID } = event;
		const addedParticipants = event.logMessageData?.addedParticipants || [];
		const botID = api.getCurrentUserID();

		// Bot ke group e add korle
		if (addedParticipants.some(user => user.userFbId == botID)) {
			const welcomeText =
				"╭─💗 𝑷𝑶𝑪𝑲𝑰𝑬 𝑩𝑩𝒀 💗─╮\n" +
				" 𝗔𝗱𝗱 𝗸𝗼𝗿𝗮𝗿 𝗷𝗼𝗻𝗻𝗼 𝗧𝗻𝘅\n" +
				" 👑𝗢𝘄𝗻𝗲𝗿: 𝗦𝗛𝗔𝗡𝗧𝗢\n" +
				"╰━━━━━━━━━━━━━━━━╯";

			return message.send(welcomeText);
		}
	}
};
