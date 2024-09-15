// Import the 'vlc.js' library and the configuration file
import {logUpdates, richPresenseSettings, vlcConfig} from "../Storage/config.js";
import { VLCClient as _VLCClient } from "vlc.js";

// Create a new instance of the VLC client
const VLCClient = new _VLCClient(vlcConfig);

// Keep track of the last known status of VLC
const lastStatus = {
  filename: "",
  now_playing: "",
  state: "",
  icon_url: "",
  time: 0
};

// Export a function that takes a callback as an argument
let updating = false;
export const diff = async (callback) => {
  if(updating === true) {
    return;
  }

  updating = true;
  try {
    // Get the current status of VLC
    const status = await VLCClient.getStatus();
    if (status.information) {
      // Get the metadata
      const { meta } = status.information.category;

      // Check if the current filename has changed
      if (meta.filename !== lastStatus.filename) {
        if (logUpdates) {
          console.log(`File has changed from: ${lastStatus.filename} to ${meta.filename}`);
        }
        
        lastStatus.filename = meta.filename;

        await callback(status, true, true);
      }
      // Check if the current now playing track has changed
      else if (meta.now_playing !== lastStatus.now_playing) {
        if (logUpdates && lastStatus.now_playing) {
          console.log(`Track has changed from: ${lastStatus.now_playing} to ${meta.now_playing}`);
        }

        lastStatus.now_playing = meta.now_playing;
        lastStatus.icon_url = meta.artwork_url || "vlc";

        await callback(status, true, false);
        // Check if the state (playing, paused, stopped) has changed
      } else if (status.state !== lastStatus.state) {
        if (logUpdates) {
          console.log(`State has changed from: ${lastStatus.state} to ${status.state}`);
        }

        lastStatus.state = status.state;

        await callback(status, true, false);
        // Check if the time has changed by more than the update interval or if the time has gone backwards
      } else if (status.time - (lastStatus.time + richPresenseSettings.updateInterval / 1000) > 3 || lastStatus.time > status.time) {
        if (logUpdates) {
          console.log(`Time has changed from: ${lastStatus.time} to ${status.time}`);
        }

        await callback(status, true, false);
        // Check if the volume has changed
      } else if (status.volume !== lastStatus.volume) {
        if (logUpdates && lastStatus.volume) {
          console.log(`Volume has changed from: ${Math.round(lastStatus.volume / 2.56)}% to ${Math.round(status.volume / 2.56)}%`);
        }

        lastStatus.volume = status.volume;
        await callback(status, true, false);
        // If none of the above conditions are met, call the callback function with 'false'
      } else {
        await callback(status, false, false);
      }

      // Update the last status object
      lastStatus.filename = status.information ? meta.filename : null;
      lastStatus.now_playing = meta.now_playing;

      // If there is no information in the status object, call the callback function with the status object
    } else {
      await callback(status);
    }

    // Update the last status object
    lastStatus.state = status.state;
    lastStatus.time = status.time;

  } catch (err) {
    //  If there is an error connecting to VLC, log an error message and call the callback function with a stopped state
    if (err.code === "ECONNREFUSED") {
      console.log("Failed to reach VLC. Is it open?");
      callback({ state: "stopped" }, false);
      // If there is any other error, throw it
    } else {
      throw err;
    }
  } finally {
    updating = false;
  }
};