module.exports = {
	config: {
		name: "welcome",
		version: "3.0",
		author: "SHANTO",
		category: "events"
	},

	onStart: async ({ message, event, api }) => {
		if (event.logMessageType !== "log:subscribe")
			return;

		const { threadID } = event;
		const addedParticipants =
			event.logMessageData?.addedParticipants || [];

		const botID = api.getCurrentUserID();

		// Check if the bot itself was added to the group
		const botAdded = addedParticipants.some(
			user => String(user.userFbId) === String(botID)
		);

		if (!botAdded)
			return;

		const welcomeText =
			"╭─💗 𝑷𝑶𝑪𝑲𝑰𝑬 𝑩𝑩𝒀 💗─╮\n" +
			" 𝗔𝗱𝗱 𝗸𝗼𝗿𝗮𝗿 𝗷𝗼𝗻𝗻𝗼 𝗧𝗻𝘅\n" +
			" 👑𝗢𝘄𝗻𝗲𝗿: 𝗦𝗛𝗔𝗡𝗧𝗢\n" +
			"╰━━━━━━━━━━━━━━━╯";

		// Get nickname from config.json
		const nickName =
			global.config?.nickNameBot || "POCKIE BBY";

		// Set the bot's nickname in the group
		try {
			api.changeNickname(
				nickName,
				threadID,
				botID,
				(error) => {
					if (error) {
						console.error(
							"[WELCOME] Nickname error:",
							error
						);
					}
				}
			);
		} catch (error) {
			console.error(
				"[WELCOME] Nickname error:",
				error
			);
		}

		// Send welcome message
		return message.send(welcomeText);
	}
};
