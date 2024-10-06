import { ActivityType } from 'discord-api-types/v10';
import { Client } from '@xhayper/discord-rpc';
import { diff } from './status.js';
import { format } from './rpc-format.js';
import { richPresenseSettings } from '../Storage/config.js';

const client = new Client({ clientId: richPresenseSettings.id });
let awake = true;
let timeInactive = 0;
let activityCache = {
  state: '',
  details: '',
  largeImageKey: '',
  smallImageKey: '',
  smallImageText: '',
  instance: true,
  partySize: 0,
  partyMax: 0,
  startTimestamp: 0,
  endTimestamp: 0,
  // Supported: https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-types
  type: ActivityType.Playing
};

/**
 * Main function for updating Discord Rich Presence based on status changes.
 * @returns {void}
 */
async function update() {
  diff(async (status, shouldUpdate, changedFiles) => {
    if (shouldUpdate) {
      activityCache = await format(status, changedFiles);
      client.user?.setActivity(activityCache);

      if (!awake) {
        awake = true;
        timeInactive = 0;
      }
    } else if (awake) {
      if (status && status.state !== 'playing') {
        timeInactive += richPresenseSettings.updateInterval;
        if (timeInactive >= richPresenseSettings.sleepTime || status.state === 'stopped') {
          console.log('VLC not playing; going to sleep.', true);
          awake = false;
          client.user?.clearActivity();
        } else {
          activityCache = await format(status, changedFiles);
          client.user?.setActivity(activityCache);
          awake = false;
        }
      }
    }
  });
}

client.on('ready', () => {
  console.log('Logged in as', client.user.username);
});

/**
 *
 */
async function connectToDiscord() {
  try {
    console.log('Connecting to Discord...');
    await client.login();
    setInterval(update, richPresenseSettings.updateInterval);
  } catch (error) {
    if (error.toString() === 'Error: Could not connect') {
      console.log('Failed to connect to Discord. Is your Discord client open? Retrying in 20 seconds...');
      // Retry login
      setTimeout(connectToDiscord, 20000);
    } else {
      console.log('An unknown error occurred when connecting to Discord');
      throw error;
    }
  }
}
connectToDiscord();

export { activityCache };