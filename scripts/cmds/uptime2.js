const fs = require("fs");
const path = require("path");
const dns = require("dns").promises;
const { createCanvas } = require("canvas");
const GIFEncoder = require("gifencoder");

module.exports.config = {
  name: "uptime2",
  aliases: ["up2"],
  version: "1.0.1",
  author: "SHANTO",
  countDown: 5,
  role: 0,
  description: "SHANTO Animated Black Uptime Dashboard",
  category: "INFO",
  guide: { en: "{pn}" }
};

function formatUptime() {
  const total = Math.floor(process.uptime());
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

async function getPing() {
  const start = Date.now();

  try {
    await dns.lookup("google.com");
    return Date.now() - start;
  } catch (_) {
    return null;
  }
}

function countCommands() {
  try {
    return fs.readdirSync(__dirname).filter(file =>
      file.endsWith(".js") && !file.endsWith(".disabled.js")
    ).length;
  } catch (_) {
    return 0;
  }
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCard(ctx, frame, uptime, ping, commands, memory) {
  const W = 960;
  const H = 540;

  ctx.fillStyle = "#050607";
  ctx.fillRect(0, 0, W, H);

  // Background grid
  ctx.strokeStyle = "rgba(0,220,160,0.055)";
  ctx.lineWidth = 1;

  for (let x = 0; x < W; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  for (let y = 0; y < H; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Header
  ctx.fillStyle = "#00e6a0";
  ctx.font = "bold 18px Arial";
  ctx.fillText("● SYSTEM ONLINE", 42, 48);

  ctx.textAlign = "right";
  ctx.fillStyle = "#7e8b88";
  ctx.font = "14px Arial";
  ctx.fillText("LIVE BOT MONITOR", 918, 48);
  ctx.textAlign = "left";

  ctx.fillStyle = "#f4f7f6";
  ctx.font = "bold 42px Arial";
  ctx.fillText("SHANTO", 42, 103);

  ctx.fillStyle = "#00e6a0";
  ctx.font = "bold 16px Arial";
  ctx.fillText("UPTIME DASHBOARD", 44, 132);

  const cards = [
    {
      x: 42, y: 160, w: 420, h: 104,
      label: "BOT UPTIME",
      value: uptime,
      accent: "#00e6a0"
    },
    {
      x: 482, y: 160, w: 436, h: 104,
      label: "NETWORK PING",
      value: ping === null ? "Unavailable" : `${ping} ms`,
      accent: "#00c8ff"
    },
    {
      x: 42, y: 282, w: 420, h: 104,
      label: "TOTAL COMMAND FILES",
      value: String(commands),
      accent: "#a58bff"
    },
    {
      x: 482, y: 282, w: 436, h: 104,
      label: "MEMORY USAGE",
      value: `${memory} MB`,
      accent: "#ffbd59"
    }
  ];

  for (const card of cards) {
    roundedRect(
      ctx,
      card.x,
      card.y,
      card.w,
      card.h,
      14
    );

    ctx.fillStyle = "#0b1011";
    ctx.fill();

    ctx.strokeStyle = "#202a2a";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = card.accent;
    ctx.fillRect(card.x + 18, card.y + 20, 4, 20);

    ctx.fillStyle = "#84918e";
    ctx.font = "bold 13px Arial";
    ctx.fillText(
      card.label,
      card.x + 34,
      card.y + 34
    );

    ctx.fillStyle = "#f4f7f6";
    ctx.font = card.value.length > 17
      ? "bold 21px Arial"
      : "bold 28px Arial";

    ctx.fillText(
      card.value,
      card.x + 34,
      card.y + 75
    );
  }

  // Animated graph
  roundedRect(ctx, 42, 404, 876, 94, 14);

  ctx.fillStyle = "#0b1011";
  ctx.fill();

  ctx.strokeStyle = "#202a2a";
  ctx.stroke();

  ctx.fillStyle = "#84918e";
  ctx.font = "bold 13px Arial";
  ctx.fillText("PING ACTIVITY", 62, 427);

  const left = 62;
  const top = 443;
  const width = 836;
  const height = 38;

  ctx.beginPath();

  for (let i = 0; i <= width; i += 4) {
    const wave =
      Math.sin(i * 0.035 + frame * 0.42) * 8 +
      Math.sin(i * 0.08 - frame * 0.25) * 4 +
      Math.cos(i * 0.018 + frame * 0.18) * 3;

    const y = top + height / 2 + wave;

    if (i === 0) {
      ctx.moveTo(left + i, y);
    } else {
      ctx.lineTo(left + i, y);
    }
  }

  ctx.strokeStyle = "#00e6a0";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#00e6a0";
  ctx.shadowBlur = 9;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#65716e";
  ctx.font = "12px Arial";
  ctx.fillText("SHANTO • GOATBOT", 42, 524);

  ctx.textAlign = "right";
  ctx.fillText(
    `FRAME ${String(frame + 1).padStart(2, "0")}/24`,
    918,
    524
  );
  ctx.textAlign = "left";
}

async function createGif(
  outputPath,
  uptime,
  ping,
  commands,
  memory
) {
  const width = 960;
  const height = 540;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  const encoder = new GIFEncoder(width, height);

  return new Promise((resolve, reject) => {
    let settled = false;

    const output = fs.createWriteStream(outputPath);

    function fail(error) {
      if (settled) return;

      settled = true;

      try {
        output.destroy();
      } catch (_) {}

      try {
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
      } catch (_) {}

      reject(error);
    }

    output.once("error", fail);

    output.once("finish", () => {
      if (settled) return;

      settled = true;
      resolve();
    });

    try {
      // Do not use encoder.on(); this encoder version does not support it.
      encoder.createReadStream().pipe(output);

      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(100);
      encoder.setQuality(10);

      for (let frame = 0; frame < 24; frame++) {
        drawCard(
          ctx,
          frame,
          uptime,
          ping,
          commands,
          memory
        );

        encoder.addFrame(ctx);
      }

      encoder.finish();
    } catch (error) {
      fail(error);
    }
  });
}

module.exports.onStart = async function ({ api, event }) {
  const outputPath = path.join(
    __dirname,
    `uptime2-${Date.now()}.gif`
  );

  try {
    const uptime = formatUptime();
    const ping = await getPing();
    const commands = countCommands();

    const memory = Math.round(
      process.memoryUsage().rss / 1024 / 1024
    );

    await createGif(
      outputPath,
      uptime,
      ping,
      commands,
      memory
    );

    api.sendMessage(
      {
        body: "🖤 SHANTO • UPTIME2",
        attachment: fs.createReadStream(outputPath)
      },
      event.threadID,
      (err) => {
        if (err) {
          console.error("Uptime2 send error:", err);
        }

        setTimeout(() => {
          try {
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
            }
          } catch (_) {}
        }, 15000);
      },
      event.messageID
    );
  } catch (error) {
    console.error("Uptime2 CMD error:", error);

    return api.sendMessage(
      "Uptime2 GIF তৈরি হয়নি। Railway Deploy Logs পরীক্ষা করো।",
      event.threadID,
      event.messageID
    );
  }
};
