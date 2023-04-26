const RPC = require("discord-rpc");
const config = require("../Storage/config.js");
const diff = require("./status.js");
const format = require("./rpc-format.js");

const client = new RPC.Client({ transport: "ipc" });
let awake = true;
let timeInactive = 0;

async function update() {
  diff(async (status, shouldUpdate) => {
    if (shouldUpdate) {
      const formatted = await format(status);
      client.setActivity(formatted);

      if (!awake) {
        awake = true;
        timeInactive = 0;
      }
    } else if (awake) {
      if (status.state !== "playing") {
        timeInactive += config.richPresenseSettings.updateInterval;
        if (timeInactive >= config.richPresenseSettings.sleepTime || status.state === "stopped") {
          console.log("VLC not playing; going to sleep.", true);
          awake = false;
          client.clearActivity();
        } else {
          const formattedStatus = await format(status);
          client.setActivity(formattedStatus);
          awake = false;
        }
      }
    }
  });
}

client.on("ready", () => {
  console.log("Logged in as", client.user.username);
});

async function connectToDiscord() {
  try {
    console.log("Connecting to Discord...");
    await client.login({ clientId: config.richPresenseSettings.id });
    setInterval(update, config.richPresenseSettings.updateInterval);
  } catch (error) {
    if (error.toString() === "Error: Could not connect") {
      console.log("Failed to connect to Discord. Is your Discord client open? Retrying in 20 seconds...");
      // Retry login
      setTimeout(connectToDiscord, 20000);
    } else {
      console.log("An unknown error occurred when connecting to Discord");
      throw error;
    }
  }
}
connectToDiscord();
