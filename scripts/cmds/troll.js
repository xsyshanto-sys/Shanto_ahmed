 module.exports = {
  config: {
    name: "troll",
    version: "3.0",
    author: "SHANTO",
    countDown: 2,
    role: 2, // 🔒 Role 2 মানে শুধুমাত্র Bot Admin (আপনি) কমান্ডটি চালাতে পারবেন
    shortDescription: "Troll people (Admin Only)",
    category: "fun",
    guide: { en: "শুধু 'troll' লিখুন (প্রিফিক্স ছাড়া) বা কারো মেসেজে রিপ্লাই দিয়ে 'troll' লিখুন।" }
  },

  // এটি বটকে এরর থেকে বাঁচাবে এবং কমান্ড লোড হতে দেবে
  onStart: async function ({ event, api }) {
    // onChat এ কাজ হবে, তাই এখানে কিছু রাখার দরকার নেই
  },

  onChat: async function ({ event, api }) {
    const { threadID, senderID, body, messageReply, mentions } = event;
    
    // ১. বট নিজে মেসেজ দিলে রিপ্লাই করবে না
    if (!body || senderID == api.getCurrentUserID()) return;

    const text = body.toLowerCase().trim();
    
    // ২. আপনার UID এখানে বসান (নিরাপত্তার জন্য)
    // আপনার UID না জানলে global.GoatBot.config.adminBot থেকে চেক করবে
    const myUID = "61595411632306"; // ⚠️ এখানে আপনার আসল Facebook UID দিন
    const isBotAdmin = String(senderID) === String(myUID) || global.GoatBot.config.adminBot.includes(String(senderID));

    // ৩. আপনি ছাড়া অন্য কেউ 'troll' লিখলে বট কিছুই করবে না
    if (!isBotAdmin) return;

    // ৪. চেক করা হচ্ছে আপনি শুধু "troll" বা "Troll" লিখেছেন কিনা (প্রিফিক্স ছাড়া)
    if (text === "troll" || text === "-troll" || text === ".troll") {
      
      const profileLink = "https://www.facebook.com/share/1AJyE7TBDr/";
      
      let targetID = senderID; // ডিফল্টভাবে আপনার নিজের আইডি
      let targetName = "তুই";

      // ৫. যদি আপনি কারো মেসেজে রিপ্লাই দিয়ে troll লেখেন
      if (messageReply) {
        targetID = messageReply.senderID;
        targetName = messageReply.senderName || "সেই মানুষটা";
      } 
      // ৬. যদি আপনি কাউকে মেনশন (@tag) করে troll লেখেন
      else if (mentions && Object.keys(mentions).length > 0) {
        targetID = Object.keys(mentions)[0];
        targetName = mentions[targetID].replace("@", "") || "সেই মানুষটা";
      }

      // ১০০+ ট্রল ক্যাপশন
      const captions = [
        `কিরে ${targetName}, তুই নাকি পরকিয়া করতে গিয়ে ধরা পড়সো 🤡\n\nএই নে তোর লিংক ভাইরাল হয়ে গেছে:\n${profileLink}`,
        `কিরে ${targetName}, তোর লিংক নাকি ভাইরাল হয়ে গেছে? 😂\n\nনিজের প্রোফাইল দেখে আয়:\n${profileLink}`,
        `এই যে সিঙ্গেল বয় ${targetName}, এইদিক দিয়ে আয় 😏\n\nতোর লিংক:\n${profileLink}`,
        `কি অবস্থা ${targetName}? চুরি করতে গিয়ে ধরা খাইছেন নাকি? 🥱\n\nপ্রোফাইল:\n${profileLink}`,
        `তুই তো দেখি বড় টোকাই ${targetName} 🤣\n\nএই নে তোর অরিজিনাল লিংক:\n${profileLink}`,
        `কিরে ${targetName}, তোর লিংক নাকি ছড়িয়ে গেছে? 🤡\n\nমজা নেওয়ার জন্য এইটা দেখ:\n${profileLink}`,
        `জানোয়ার ${targetName}, তোর ফেসবুক লিংক সবাইকে দিয়ে দিলাম 🐸\n\n${profileLink}`,
        `আয় আয় আয়, এই যে আমাদের গ্রুপের সেরা চোর ${targetName} 🕵️‍♂️\n\nএই নে তোর লিংক:\n${profileLink}`,
        `তোর মুখে লাগছে না ${targetName}, প্রথমে আয়নায় দেখে আয় 🪞\n\nতোর লিংক:\n${profileLink}`,
        `হিরো আলগা ${targetName}, তোর লিংক নিয়ে সবাই হাসছে 😂\n\n${profileLink}`,
        `কিরে বোকা ${targetName}, তুই এখন গ্রুপের সেরা মিম 🤡\n\nএই নে তোর লিংক:\n${profileLink}`,
        `মেয়েরা দেখো, এই সেই ${targetName} যে সবসময় ফ্রেন্ড রিকোয়েস্ট পাঠায় 🤣\n\nপ্রোফাইল:\n${profileLink}`,
        `তোর তো কপালই খারাপ ${targetName}, ধরা খেয়ে গেলি 🤦‍♂️\n\nএই নে তোর লিংক:\n${profileLink}`,
        `কিরে ${targetName}, প্রোফাইল ছবিটা তো বেশ সুন্দর! কিন্তু চেহারা দেখে ভয় লাগে 🤣\n\n${profileLink}`,
        `তুই নাকি গ্রুপের সবচেয়ে বড় পাগল ${targetName}? 🐶\n\nপ্রমাণ দেখো:\n${profileLink}`,
        `এই যে বোলোদ ${targetName}, আপনার ডাক্তারি চেম্বার এখানে না 🩺\n\nআপনার লিংক:\n${profileLink}`,
        `কিরে ${targetName}, তোর প্রোফাইল দেখে তো মনে হচ্ছে, তুই নিজেই তোর প্রোফাইলের ছবিতে কমেন্ট করিস 😂\n\n${profileLink}`,
        `তোর লাইফের সেরা এডিটা হলো এই লিংকটা ${targetName} 🤡\n\n${profileLink}`,
        `কিরে ${targetName}, তোর লিংকে ক্লিক করলেই নাকি ফ্রি ফায়ার আইডি পাওয়া যায়? 🤣\n\n${profileLink}`,
        `গ্রুপের সবাই শুনো, এই যে আমাদের সেরা ট্রলার ${targetName}! 🎯\n\nতার প্রোফাইল:\n${profileLink}`,
        `তোর লিংক দেখে তো মনে হচ্ছে, তুই নাকি ইন্টারনেটের সেরা বোকা ${targetName} 🤡\n\nএই নে:\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি প্রেম করতে গিয়ে ফ্রেন্ড জোন খেয়েছিস? 💔\n\nতোর লিংক:\n${profileLink}`,
        `তোর প্রোফাইল দেখে সিস্টেম হ্যাং করে গেছে ${targetName} 🖥️\n\nদেখে আয়:\n${profileLink}`,
        `এতক্ষণ ধরে খুঁজতেছিলাম, এই যে আমাদের গ্রুপের চোর ${targetName} 🏃‍♂️\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি সিঙ্গেল হয়ে গ্রুপে ঘুরছিস? 😂\n\nএই নে তোর বায়োডাটা:\n${profileLink}`,
        `তোর তো বুদ্ধিটাই কম ${targetName}, লিংকটা দেখে আয় 🤣\n\n${profileLink}`,
        `কিরে ${targetName}, প্রোফাইলে নাকি তোর ছবি দেখে ভূত পালায়? 👻\n\n${profileLink}`,
        `এই যে টোকাই ${targetName}, তোর লিংকটা এখানে কেউ চায় নাই 🥱\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি গ্রুপের সবচেয়ে বড় পাগল? 🤪\n\nএই নে তোর সার্টিফিকেট:\n${profileLink}`,
        `তোর লিংকটা দিয়ে গ্রুপের সবাইকে বিনোদন দিলাম ${targetName} 🎪\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি এই গ্রুপের সেরা ডন? 😎\n\nতোর প্রোফাইল:\n${profileLink}`,
        `তুই তো দেখি প্রেমের দিক দিয়ে একদম জিরো ${targetName} 😂\n\nএই নে তোর প্রোফাইল:\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি সবার সাথে ঝগড়া করিস? 🤬\n\nএই নে তোর লিংক:\n${profileLink}`,
        `তোর ফেসবুক আইডির দাম কত ${targetName}? নাকি একদম ফ্রি? 🤣\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি মেয়েদের ইনবক্সে স্প্যাম করিস? 🚫\n\n${profileLink}`,
        `তুই তো দেখি গ্রুপের সেরা সিঙ্গেল কোয়ালিফাইড বয় ${targetName} 🤣\n\n${profileLink}`,
        `কিরে ${targetName}, তোর লিংক দিয়ে নাকি সবাই ফ্রি ফায়ার ডাউনলোড করে? 📱\n\n${profileLink}`,
        `এই যে চোর ${targetName}, তোর লিংকটা সবাইকে দেখানোর সময় এসেছে 🚨\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি গ্রুপের সেরা বোকা? 🐶\n\nএই নে তোর প্রোফাইল:\n${profileLink}`,
        `তোর প্রোফাইল দেখে তো আমার হাসি থামছে না ${targetName} 🤣\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি সবার সাথে প্র্যাঙ্ক করিস? 😜\n\nএই নে তোর লিংক:\n${profileLink}`,
        `তোর লিংকটা দিয়ে গ্রুপের সবাই মজা নিচ্ছে ${targetName} 🤡\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি প্রেম করতে গিয়ে ধরা খেয়েছিস? 💔\n\n${profileLink}`,
        `এই যে সেরা ট্রলার ${targetName}, তোর লিংকটা এখানে সবাই দেখছে 🎯\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি গ্রুপের সেরা পাগল? 🐸\n\n${profileLink}`,
        `তোর লিংকটা দেখে তো আমার মাথা ব্যথা করছে ${targetName} 🤕\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি সবার সাথে ঝগড়া করিস? 😂\n\n${profileLink}`,
        `এই যে বোকা ${targetName}, তোর লিংকটা সবাইকে দিয়ে দিলাম 🤡\n\n${profileLink}`,
        `তোর লিংকটা গ্রুপের সবচেয়ে বড় মজার বিষয় ${targetName} 😂\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি পরকিয়া করতে গিয়ে ধরা পড়সো? 🤣\n\nএই নে তোর লিংক:\n${profileLink}`,
        `কিরে ${targetName}, তোর চেহারা দেখে তো মনে হয় তুই দিনে ১০ বার মুখ ধোয় না 🧼\n\nপ্রোফাইল:\n${profileLink}`,
        `তুই তো গ্রুপের সেরা "সিঙ্গেল" মেম্বার ${targetName}, কারণ তোকে কেউ পটাতে চায় না 🤣\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি আজকাল প্রেম করার ভান করিস? 💔\n\nএই নে তোর সত্যিকারের প্রোফাইল:\n${profileLink}`,
        `এই যে বোকা ${targetName}, তোর লিংকটা এখানে দিয়ে সবাইকে হাসালাম 😂\n\n${profileLink}`,
        `তুই নাকি গ্রুপের সবচেয়ে বড় পাগল ${targetName}? 🐶\n\nপ্রমাণ:\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি রাতে ঘুমানোর সময় অ্যাডমিনের স্বপ্ন দেখিস? 😴\n\n${profileLink}`,
        `তুই তো গ্রুপের সেরা "চোর" ${targetName}, কারণ তুই সবার ইনবক্স চুরি করিস 🕵️‍♂️\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি মেয়েদের সাথে কথা বলতে গিয়ে লজ্জা পাস? 😳\n\nপ্রোফাইল:\n${profileLink}`,
        `এই যে টোকাই ${targetName}, তোর লিংকটা আমি সবাইকে দিয়ে দিলাম 🤡\n\n${profileLink}`,
        `তুই তো দেখি গ্রুপের সেরা "বলোদ" ${targetName} 🐂\n\nএই নে তোর প্রোফাইল:\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি আজকাল প্রেমে পড়েছিস? 🤣\n\nপ্রেমের প্রমাণ:\n${profileLink}`,
        `তোর লিংকটা দিয়ে তো আমি গ্রুপের সবাইকে হাসাতে পারব ${targetName} 😂\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি গ্রুপের সবচেয়ে বড় স্প্যামার? 🚫\n\n${profileLink}`,
        `তুই তো দেখি গ্রুপের সেরা "ফ্রেন্ড জোন" এর শিকার ${targetName} 💔\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি সবার সাথে প্র্যাঙ্ক করিস? 😜\n\nএই নে তোর লিংক:\n${profileLink}`,
        `তোর প্রোফাইল দেখে তো আমার হাসি থামছে না ${targetName} 🤣\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি গ্রুপের সেরা "চাগল"? 🐐\n\n${profileLink}`,
        `তুই তো গ্রুপের সেরা "গাধা" ${targetName} 🐴\n\nএই নে তোর লিংক:\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি প্রেম করতে গিয়ে ধরা খেয়েছিস? 💔\n\n${profileLink}`,
        `এই যে সেরা ট্রলার ${targetName}, তোর লিংকটা এখানে সবাই দেখছে 🎯\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি গ্রুপের সেরা পাগল? 🐸\n\n${profileLink}`,
        `তোর লিংকটা দেখে তো আমার মাথা ব্যথা করছে ${targetName} 🤕\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি সবার সাথে ঝগড়া করিস? 😂\n\n${profileLink}`,
        `এই যে বোকা ${targetName}, তোর লিংকটা সবাইকে দিয়ে দিলাম 🤡\n\n${profileLink}`,
        `তোর লিংকটা গ্রুপের সবচেয়ে বড় মজার বিষয় ${targetName} 😂\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি পরকিয়া করতে গিয়ে ধরা পড়সো? 🤣\n\nএই নে তোর লিংক:\n${profileLink}`,
        `তুই তো গ্রুপের সেরা "বোকা" ${targetName} 🐶\n\nএই নে তোর প্রোফাইল:\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি মেয়েদের সাথে ফ্লার্ট করিস? 😘\n\n${profileLink}`,
        `তোর প্রোফাইল দেখে তো সবাই হাসছে ${targetName} 🤣\n\n${profileLink}`,
        `এই যে চোর ${targetName}, তোর লিংকটা সবাইকে দেখানোর সময় এসেছে 🚨\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি গ্রুপের সেরা বোকা? 🐶\n\nএই নে তোর প্রোফাইল:\n${profileLink}`,
        `তোর প্রোফাইল দেখে তো আমার হাসি থামছে না ${targetName} 🤣\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি সবার সাথে প্র্যাঙ্ক করিস? 😜\n\nএই নে তোর লিংক:\n${profileLink}`,
        `তোর লিংকটা দিয়ে গ্রুপের সবাই মজা নিচ্ছে ${targetName} 🤡\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি প্রেম করতে গিয়ে ধরা খেয়েছিস? 💔\n\n${profileLink}`,
        `এই যে সেরা ট্রলার ${targetName}, তোর লিংকটা এখানে সবাই দেখছে 🎯\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি গ্রুপের সেরা পাগল? 🐸\n\n${profileLink}`,
        `তোর লিংকটা দেখে তো আমার মাথা ব্যথা করছে ${targetName} 🤕\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি সবার সাথে ঝগড়া করিস? 😂\n\n${profileLink}`,
        `এই যে বোকা ${targetName}, তোর লিংকটা সবাইকে দিয়ে দিলাম 🤡\n\n${profileLink}`,
        `তোর লিংকটা গ্রুপের সবচেয়ে বড় মজার বিষয় ${targetName} 😂\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি পরকিয়া করতে গিয়ে ধরা পড়সো? 🤣\n\nএই নে তোর লিংক:\n${profileLink}`,
        `তুই তো গ্রুপের সেরা "টোকাই" ${targetName} 🐔\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি গ্রুপের সবচেয়ে বড় "পাগল"? 🤪\n\n${profileLink}`,
        `তোর লিংকটা দেখে তো সবাই হাসছে ${targetName} 😂\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি গ্রুপের সেরা "খানকি"? 🤣\n\n${profileLink}`,
        `এই যে বোকা ${targetName}, তোর লিংকটা সবাইকে দিয়ে দিলাম 🤡\n\n${profileLink}`,
        `তোর লিংকটা গ্রুপের সবচেয়ে বড় মজার বিষয় ${targetName} 😂\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি গ্রুপের সেরা "মাগি"? 🤣\n\n${profileLink}`,
        `তুই তো গ্রুপের সেরা "শালা" ${targetName} 🐕\n\n${profileLink}`,
        `কিরে ${targetName}, তুই নাকি গ্রুপের সবচেয়ে বড় "কুত্তা"? 🐶\n\n${profileLink}`,
        `তোর প্রোফাইল দেখে তো সবাই হাসছে ${targetName} 🤣\n\n${profileLink}`
      ];

      // র‍্যান্ডম ক্যাপশন সিলেক্ট
      const randomCaption = captions[Math.floor(Math.random() * captions.length)];

      // রিপ্লাই দেওয়া
      return api.sendMessage({ body: randomCaption }, threadID, messageID);
    }
  }
};
