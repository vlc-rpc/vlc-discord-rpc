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
    if (!status.information) {
      callback(status);
      return;
    }

    // Get the metadata
    const { meta } = status.information.category;
    let shouldUpdate = false;

    const logUpdate = (field, oldValue, newValue) => {
      if (config.logUpdates) {
        console.log(`${field} has changed from: ${oldValue} to ${newValue}`);
      }
      shouldUpdate = true;
    };

    // Check if the current now playing track has changed
    if (meta.now_playing !== lastStatus.now_playing) {
      logUpdate("Track", lastStatus.now_playing, meta.now_playing);
      lastStatus.now_playing = meta.now_playing;
      lastStatus.icon_url = meta.artwork_url || "vlc";
      // Check if the current filename has changed
    } else if (meta.filename !== lastStatus.filename) {
      logUpdate("File", lastStatus.filename, meta.filename);
      lastStatus.filename = meta.filename;
      // Check if the state (playing, paused, stopped) has changed
    } else if (status.state !== lastStatus.state) {
      logUpdate("State", lastStatus.state, status.state);
      lastStatus.state = status.state;
      // Check if the time has changed by more than the update interval or if the time has gone backwards
    } else if (status.time - (lastStatus.time + config.richPresenseSettings.updateInterval / 1000) > 3 || lastStatus.time > status.time) {
      logUpdate("Time", lastStatus.time, status.time);
      // Check if the volume has changed
    } else if (status.volume !== lastStatus.volume) {
      logUpdate("Volume", Math.round(lastStatus.volume / 2.56) + '%', Math.round(status.volume / 2.56) + '%');
      lastStatus.volume = status.volume;
    }

    // Update the last status object
    lastStatus.filename = meta.filename;
    lastStatus.now_playing = meta.now_playing;

    callback(status, shouldUpdate);
    // Update the last status object
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
