// Where to look for VLC
const platformDefaults = {
  win32: "C:/Program Files/VideoLAN/VLC/vlc.exe",
  winalt: "C:/Program Files (x86)/VideoLAN/VLC/vlc.exe",
  linux: "/usr/bin/vlc",
  unix: "/usr/bin/vlc",
  darwin: "/Applications/VLC.app/Contents/MacOS/VLC",
};

// Is VLC somewhere else?
const vlcPath = "";

// Settings
const richPresenseSettings = {
  id: "",
  updateInterval: 500,
  removeAfter: 5000,
};

// What did you name your icons in the developer portal? Type it exactly how you see it in the developer portal.
const iconNames = {
  pause: "pause",
  playing: "playing",
  stopped: "stopped",
  vlc: "vlc",
};

// Must fill these out for album covers
const spotify = {
  clientID: "",
  clientSecret: "",
};

// Local VLC Config
const vlcConfig = {
  password: "",
  port: 8080,
  address: "localhost",
};

// Modules to load
module.exports = { platformDefaults, vlcPath, richPresenseSettings, vlcConfig, lastFMAPIKey, spotify, iconNames };
