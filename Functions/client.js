import RPC from "discord-rpc";
import config from "../Storage/config.js";
import diff from "./status.js";
import format from "./rpc-format.js";

const client = new RPC.Client({ transport: "ipc" });
let awake = true;
let timeInactive = 0;

async function update() {
  await diff(async (status, shouldUpdate) => {
    if (shouldUpdate) {
      const formatted = await format(status);
      await client.setActivity(formatted);

      if (!awake) {
        awake = true;
        timeInactive = 0;
      }
    } else if (awake) {
      if (status.state !== "playing") {
        timeInactive += config.richPresenceSettings.updateInterval;
        if (timeInactive >= config.richPresenceSettings.sleepTime || status.state === "stopped") {
          console.log("VLC not playing; going to sleep.", true);
          awake = false;
          await client.clearActivity();
        } else {
          const formattedStatus = await format(status);
          await client.setActivity(formattedStatus);
          awake = false;
        }
      }
    }
  });
}

client.on("ready", () => {
  console.log("Logged in as", client.user.username);
});

export async function connectToDiscord() {
  try {
    console.log("Connecting to Discord...");
    await client.login({ clientId: config.richPresenceSettings.id });
    setInterval(update, config.richPresenceSettings.updateInterval);
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
