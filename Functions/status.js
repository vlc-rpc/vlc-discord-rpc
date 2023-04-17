// Checks for status changes (volume, playing, pausing, etc)

const VLC = require("vlc.js");
const config = require("../Storage/config.js");

const VLCClient = new VLC.VLCClient(config.vlcConfig);
const last = {
  filename: "",
  now_playing: "",
  state: "",
  icon_url: "",
  time: 0,
};

module.exports = async (callback) => {
  try {
    const status = await VLCClient.getStatus();
    if (status.information) {
      const { meta } = status.information.category;
      if (meta.now_playing !== last.now_playing) {
        callback(status, true);
        last.now_playing = meta.now_playing;
        if (meta.artwork_url) {
          last.icon_url = meta.artwork_url;
        } else {
          last.icon_url = "vlc";
        }
      } else if (meta.filename !== last.filename) {
        callback(status, true);
        last.filename = meta.filename;
      } else if (status.state !== last.state) {
        callback(status, true);
        last.state = status.state;
      } else if (status.time - (last.time + config.richPresenseSettings.updateInterval / 1000) > 3 || last.time > status.time) {
        callback(status, true);
      } else if (status.volume !== last.volume) {
        last.volume = status.volume;
        callback(status, true);
      }
      last.filename = status.information ? meta.filename : undefined;
      last.now_playing = meta.now_playing;
      callback(status, false);
    } else callback(status);
    last.state = status.state;
    last.time = status.time;
  } catch (err) {
    if (err.code === "ECONNREFUSED") {
      console.log("Failed to reach VLC. Is it open?");
      callback({ status: { state: "stopped" }, updated: false });
    } else {
      throw err;
    }
  }
};
