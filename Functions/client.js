const RPC = require("discord-rpc");
const config = require("../Storage/config.js");
const diff = require("./status.js");
const format = require("./rpc-format.js");

const client = new RPC.Client({ transport: "ipc" });
let awake = true;
let timeInactive = 0;

async function update() {
  diff(async (status, difference) => {
    if (difference) {
      let formatted = await format(status);
      client.setActivity(formatted);
      console.log("Presence updated");

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
          let formatted = await format(status);
          client.setActivity(formatted);
          console.log("Presence updated");
          awake = false;
        }
      }
    }
  });
}

client.on("ready", () => {
  console.log("Logged in as", client.user.username);
});

console.log("Connecting to Discord...");
client
  .login({ clientId: config.richPresenseSettings.id })
  .then(() => {
    setInterval(update, config.richPresenseSettings.updateInterval);
  })
  .catch((err) => {
    if (err.toString() === "Error: Could not connect") {
      console.log("Failed to connect to Discord. Is your Discord client open? Retrying in 20 seconds...");
      // Retry login
      setTimeout(discordLogin, 20000);
    } else {
      console.log("An unknown error occurred when connecting to Discord");
      throw err;
    }
  });
