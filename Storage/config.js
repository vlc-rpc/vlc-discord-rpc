// Where to look for VLC (Do not change unless you know what you are doing)
const platformDefaults = {
  win32: "C:/Program Files/VideoLAN/VLC/vlc.exe",
  winalt: "C:/Program Files (x86)/VideoLAN/VLC/vlc.exe",
  linux: "/usr/bin/vlc",
  unix: "/usr/bin/vlc",
  darwin: "/Applications/VLC.app/Contents/MacOS/VLC",
};

// Is VLC somewhere else? (Do not change unless you know what you are doing)
const vlcPath = "";

// Settings (Must add application ID)
const richPresenseSettings = {
  id: "", // Application ID
  updateInterval: 500, // How often to check for status updates in MS
  removeAfter: 5000, // How long to remove status after no activity in MS
};

// Local VLC Config (Do not change unless you know what you are doing)
const vlcConfig = {
  password: "",
  port: 8080,
  address: "localhost",
};

// Must add your lastFM api key (https://www.last.fm/api/account/create)
const lastFMAPIKey = "";

// Modules to load
module.exports = { platformDefaults, vlcPath, richPresenseSettings, vlcConfig, lastFMAPIKey };
