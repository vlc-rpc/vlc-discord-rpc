// Import the 'vlc.js' library and the configuration file
const VLC = require("vlc.js");
const config = require("../Storage/config.js");

// Create a new instance of the VLC client
const VLCClient = new VLC.VLCClient(config.vlcConfig);

// Keep track of the last known status of VLC
let lastStatus = {
  filename: "",
  now_playing: "",
  state: "",
  icon_url: "",
  time: 0,
};

// Export a function that takes a callback as an argument
module.exports = async (callback) => {
  try {
    // Get the current status of VLC
    const status = await VLCClient.getStatus();
    if (status.information) {
      // Get the metadata
      const { meta } = status.information.category;

      // Check if the current now playing track has changed
      if (meta.now_playing !== lastStatus.now_playing) {
        if (config.logUpdates) {
          console.log("Track has changed!");
        }

        lastStatus.now_playing = meta.now_playing;
        lastStatus.icon_url = meta.artwork_url || "vlc";
        callback(status, true);
        // Check if the current filename has changed
      } else if (meta.filename !== lastStatus.filename) {
        if (config.logUpdates) {
          console.log("File has changed!");
        }
        lastStatus.filename = meta.filename;
        callback(status, true);
        // Check if the state (playing, paused, stopped) has changed
      } else if (status.state !== lastStatus.state) {
        if (config.logUpdates) {
          console.log("State has changed!");
        }
        lastStatus.state = status.state;
        callback(status, true);
        // Check if the time has changed by more than the update interval or if the time has gone backwards
      } else if (status.time - (lastStatus.time + config.richPresenseSettings.updateInterval / 1000) > 3 || lastStatus.time > status.time) {
        if (config.logUpdates) {
          console.log("Time has changed!");
        }

        callback(status, true);
        // Check if the volume has changed
      } else if (status.volume !== lastStatus.volume) {
        if (config.logUpdates) {
          console.log("Volume has changed!");
        }

        lastStatus.volume = status.volume;
        callback(status, true);
        // If none of the above conditions are met, call the callback function with 'false'
      } else {
        callback(status, false);
      }

      // Update the last status object
      lastStatus.filename = status.information ? meta.filename : undefined;
      lastStatus.now_playing = meta.now_playing;

      // If there is no information in the status object, call the callback function with the status object
    } else {
      callback(status);
    }

    // // Update the last status object
    lastStatus.state = status.state;
    lastStatus.time = status.time;
  } catch (err) {
    //  If there is an error connecting to VLC, log an error message and call the callback function with a stopped state
    if (err.code === "ECONNREFUSED") {
      console.log("Failed to reach VLC. Is it open?");
      callback({ status: { state: "stopped" }, updated: false });
      // If there is any other error, throw it
    } else {
      throw err;
    }
  }
};
