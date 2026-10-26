
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const videoIds = [
  "1-gJdG8bxmZLyOC7-6E4A5Hm95Q9gWIPO",
  "1-ryNR8j529EZyTCuMur9wmkFz4ahlv-f",
  "1-vHh7XBtPOS3s42q-s8s30Bzsx2u6czu",
  "11IUd-PDHozLmh_RtvSf0S-f3G6wut1ZT",
  "12YCqZovJ8sVZZZTDLu8dv8NAwsMGfqiB",
  "12eIiCYpd_Jm8zIVRSkqlSt7W-7OsxB6g",
  "13utWruipZ_3fR0QSMtGMnFjGt3bthnbf",
  "14GYNaYL-pkEh3UH0oIUXVamru5h830DY",
  "14UGb2fH4wyUbVSQ-Vt5yf-4sH3-icXGC",
  "161O9_EbCQJ8nHTT7VeE7BWtHvEjHAT4k",
  "170YWB4jpMfR5GpmPb_Lymh6OmrmWDE0x",
  "17nvXNBpMWVmuWLK-kkLzkbrbpW43rD4r",
  "17w7sehThOv6IRrcsLboi7Zk6zZvfBHr5",
  "17yaPd3PoYJkuL0IEZHzcBic9pX4AmGiK",
  "18Dyc1vkysNhHSGi5OYpa6AzD5rk3_vkf",
  "18brau5aYmiMAxfhDTLz_nFWuIcb_mja5",
  "19GcLpOzFYypYFu1FboQyVjWxC9Jh3JC5",
  "19lKQChg0hv2MOTphkyI4zTiUIxuujd03",
  "1AjrBOBRWKpKjLOYV1oof2mVZBzx0ebgD",
  "1BPOEwIt7lGv66w5pUTDU937q4i5ym5S_",
  "1C-VxCoO5gMKCq2rg7PxjlitK4bOg7pt2",
  "1C9t9VNpLT9DelBeDnbFNjdAA0tK_cXh-",
  "1DrhAOOeYIHlTWJU5e26OMjO0R5nueyf7",
  "1Dz7UfOejW9rDFYFAtxmAq_ncv04WaTTL",
  "1EcBmrdqYfQbwSPr2kiKY2QV_6CXLJJj6",
  "1F5Xc5Qff4RGyUuHzuqPfmOn2EZKQIn7P",
  "1FTxkmgt2sWf8U2h8a5HszyKINMr6Gnwm",
  "1Frf4GUg26Abw2lJdQ_RHycNhDMZXfMm2",
  "1FtdiGL244Kcj7tiA6F_2mKeTmMpVCyjr",
  "1G2tE1VdFzzqochfGwXwc46nuwkTeRRSc",
  "1GB6VOhgA3-JUSUZ3D1xgjlKH1Jswy0Z4",
  "1G_04XtbUP-QZNWFzdLohwY_w6BRdmijk",
  "1GpvlwryNcsRz2i6VYEV3NqSLr0WtGGn_",
  "1HYn-ZCVB0JcipKWrMxPnSrAVP4oSjePT",
  "1H_5i2V6W8Fl0N5QIKPACEUcljd8-q_dT",
  "1HhFPMOMXI7DDKc371C-12A0yfC0101x7",
  "1JNRfPMJe1_SodueqhMVf4so0-vjWaK9V",
  "1Jjy85bIGE9efsUIlmHykEistAquEB9oT",
  "1JoXCYZz4YoKpWe809ttUaaSsJdsCJZNf",
  "1Ko-ScBYddulpKX4I4xS7BRkndIaZZ3gT",
  "1LU4PTBFjWlhgzP2HiiJX_Esw2iIq7Zpj",
  "1LaM2kIlZUdA_UbCzX8s92nxcqEJieHLN",
  "1LcClA0b5Qih_tIv_wVRUsWX9gk3bVmzj",
  "1LgVpbMhe0CXM7rIUr9pJNK46QtZcpRtK",
  "1MB-KTUmPMkSb1o4J_EIRQ8mJ3w-cUOtY",
  "1M_cHjSaNWT5b_8p9VSPmzVyz-rqBqo3S",
  "1NC3fFj68PqqvZeg67AdA_cHyNdOBlRfF",
  "1Nk534yO5owt7IaMOKjbT6IGLGW96Gv0f",
  "1O1Cej8MFdytRun3RmGTnmT6uk1T-Zcmu",
  "1O801cupSBdjgkEHcRj9gZgyj2UVbyBZ_",
  "1OZUKqC7ooU572Vice1a0w3O3qRbC1F-r"
];

module.exports = {
  config: {
    name: "nvideo",
    aliases: ["nv"],
    version: "1.0.0",
    author: "SHANTO",
    countDown: 5,
    role: 0,
    shortDescription: "Send a random video",
    longDescription: "Send a random video from the configured Google Drive links",
    category: "media",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    const threadID = event.threadID;
    const videoId = videoIds[
      Math.floor(Math.random() * videoIds.length)
    ];

    const url =
      `https://drive.google.com/uc?export=download&id=${videoId}`;

    const filePath = path.join(
      os.tmpdir(),
      `nvideo_${Date.now()}_${Math.random().toString(36).slice(2)}.mp4`
    );

    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 120000,
        maxRedirects: 10,
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      const contentType = (
        response.headers["content-type"] || ""
      ).toLowerCase();

      if (
        contentType.includes("text/html") ||
        contentType.includes("application/json")
      ) {
        throw new Error(
          "Google Drive returned a webpage instead of a video."
        );
      }

      await fs.writeFile(filePath, response.data);

      if ((await fs.stat(filePath)).size === 0) {
        throw new Error("Downloaded file is empty.");
      }

      api.sendMessage(
        {
          body: "",
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        (err) => {
          fs.remove(filePath).catch(() => {});

          if (err) {
            console.error("[NVIDEO] Send failed:", err);
          }
        },
        event.messageID
      );
    } catch (err) {
      await fs.remove(filePath).catch(() => {});
      console.error("[NVIDEO] Error:", err.message);

      api.sendMessage(
        "ভিডিও পাঠানো যায়নি। Google Drive লিংকের permission ও Railway logs চেক করো।",
        threadID,
        event.messageID
      );
    }
  }
};
