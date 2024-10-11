import { ActivityType } from 'discord-api-types/v10';

// Where to look for VLC
const platformDefaults = {
  win32: 'C:/Program Files/VideoLAN/VLC/vlc.exe',
  winalt: 'C:/Program Files (x86)/VideoLAN/VLC/vlc.exe',
  linux: '/usr/bin/vlc',
  unix: '/usr/bin/vlc',
  darwin: '/Applications/VLC.app/Contents/MacOS/VLC'
};

// Is VLC somewhere else?
const vlcPath = '';

// Settings
const richPresenseSettings = {
  id: '',
  updateInterval: 5000,
  sleepTime: 5000
};

// Default icons. Change if you would like.
const iconNames = {
  pause: 'https://i.imgur.com/CCg9fxf.png',
  playing: 'https://i.imgur.com/8IYhOc2.png',
  vlc: 'https://i.imgur.com/7CRaCeT.png'
};

// Must fill these out for album covers
const useSpotify = false;

const spotify = {
  clientID: '',
  clientSecret: ''
};

// Local VLC Config
const vlcConfig = {
  password: '',
  port: 8080,
  address: 'localhost'
};

// Do you want it to log every time your presence is updated? (Useful for debug)
const logUpdates = false;

// READ THE READ ME. This is complicated to set up!
const detached = false;

const movieApiKey = '';

// Directories for Metadata/metadata_auto.js to use
const directories = {
  'shows': 'C:/Users/user/vlc-discord-rpc/Media/Shows',
  'movies': 'C:/Users/user/vlc-discord-rpc/Media/Movies'
};

// Separator for file names used in metadata_auto.js
// For example Breaking_Bad_S1E2.wmv is separated by _
const separator = '_';

const autoOMDB = false;

// Set to "" to disable. Other accepted parameters are "show", "movie", or "video".
const defaultMediaType = '';

// Set to -1 to disable. Any Number 0 through the number of results will work.
const defaultResultNumber = -1;

// View VLC-RPC documentation online for valid types. Link is on the Github.
const defaultActivityType = ActivityType.Watching;

// The maximum amount of time to wait for a rate limit before deciding to just display it as a video (no image and with file name) in seconds
const maxRateLimitWait = 120;

// Things inside of these will be ignored.
// The default is [], where anything inside [] will not appear in your status
// Set to '' to ignore
const markdownForIgnore = '[]';

// Modules to load
export { 
  platformDefaults,
  vlcPath, 
  richPresenseSettings, 
  vlcConfig, 
  useSpotify, 
  spotify, 
  iconNames, 
  logUpdates, 
  detached, 
  movieApiKey, 
  directories, 
  separator,
  autoOMDB,
  defaultMediaType,
  defaultResultNumber,
  defaultActivityType,
  maxRateLimitWait,
  markdownForIgnore };
