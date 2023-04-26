const VLC = require("vlc.js");
const config = require("../Storage/config.js");

const VLCClient = new VLC.VLCClient(config.vlcConfig);

let lastStatus = {
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

      if (meta.now_playing !== lastStatus.now_playing) {
        lastStatus.now_playing = meta.now_playing;
        lastStatus.icon_url = meta.artwork_url || "vlc";
        callback(status, true);
      } else if (meta.filename !== lastStatus.filename) {
        lastStatus.filename = meta.filename;
        callback(status, true);
      } else if (status.state !== lastStatus.state) {
        lastStatus.state = status.state;
        callback(status, true);
      } else if (status.time - (lastStatus.time + config.richPresenseSettings.updateInterval / 1000) > 3 || lastStatus.time > status.time) {
        callback(status, true);
      } else if (status.volume !== lastStatus.volume) {
        lastStatus.volume = status.volume;
        callback(status, true);
      } else {
        callback(status, false);
      }

      lastStatus.filename = status.information ? meta.filename : undefined;
      lastStatus.now_playing = meta.now_playing;
    } else {
      callback(status);
    }

    lastStatus.state = status.state;
    lastStatus.time = status.time;
  } catch (err) {
    if (err.code === "ECONNREFUSED") {
      console.log("Failed to reach VLC. Is it open?");
      callback({ status: { state: "stopped" }, updated: false });
    } else {
      throw err;
    }
  }
};
