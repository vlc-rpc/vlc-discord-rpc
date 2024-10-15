const readline = require('readline');
const fs = require('fs');
const path = require('path');

// eslint-disable-next-line
let vlc_path_replaced = `C:/Program Files/VideoLAN/VLC/vlc.exe`

if (process.argv.length >= 3) {
  const [vlc_path_custom] = process.argv.slice(2);
  vlc_path_replaced = vlc_path_custom.replace(/\\/g, '/');
}

// Configure readline for input/output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask questions, returning a promise to use with async/await
function askQuestion(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {return resolve(answer);});
  });
}

async function getRichPresenceSettings() {
  const applicationId = await askQuestion('What is your Discord application ID: ');
  let updateInterval = await askQuestion('Choose an update interval (Default: 1000): ');
  let sleepTime = await askQuestion('Choose a sleep time (Default: 30000): ');

  if (updateInterval === '') {
    updateInterval = '1000';
  }

  if (sleepTime === '') {
    sleepTime = '30000';
  }

  return { applicationId, updateInterval, sleepTime };
}

async function getIconNames() {
  const icons = await askQuestion('Do you want to use custom icons? (Y/N): ');
  // eslint-disable-next-line
  let playingIcon = `'https://i.imgur.com/8IYhOc2.png'`;
  // eslint-disable-next-line
  let pauseIcon = `'https://i.imgur.com/CCg9fxf.png'`;
  // eslint-disable-next-line
  let vlcIcon = `'https://i.imgur.com/7CRaCeT.png'`;

  if (icons.toLowerCase() === 'y') {
    playingIcon = await askQuestion('Choose a link for your playing icon: ');
    pauseIcon = await askQuestion('Choose a link for your pause icon: ');
    vlcIcon = await askQuestion('Choose a link for your VLC icon: ');
  }

  return { playingIcon, pauseIcon, vlcIcon };
}

async function getSpotify() {
  const useSpotify = await askQuestion('Do you want to use Spotify for album art? (Y/N): ');
  let spotify = 'false';
  
  // eslint-disable-next-line
  let spotifyClientID = `''`;

  // eslint-disable-next-line
  let spotifyClientSecret = `''`;

  if (useSpotify.toLowerCase() === 'y') {
    spotify = 'true';
    spotifyClientID = await askQuestion('Enter your Spotify Client ID: ');
    spotifyClientSecret = await askQuestion('Enter your Spotify Client Secret: ');
  }

  return { spotify, spotifyClientID, spotifyClientSecret };
}

async function getLogUpdates() {
  const logUpdates = await askQuestion('Do you want to log all status updates? (Y/N): ');
  let logging = false;
  if (logUpdates.toLowerCase() === 'y') {
    logging = true;
  }
  return logging;
}

async function getDetatched() {
  const detached = await askQuestion('Do you want to run in detached mode? (Y/N): ');
  let detach = false;
  // eslint-disable-next-line
  let vlcPassword = `''`;
  let vlcPort = '8080';
  // eslint-disable-next-line
  let vlcAddress = `'localhost'`;

  if (detached.toLowerCase() === 'y') {
    detach = true;
    vlcPassword = await askQuestion('Enter the password you set for VLC: ');
    vlcPort = await askQuestion('Enter the port VLC runs on (Default: 8080): ');
    vlcAddress = await askQuestion('Enter the address to VLC (Default: localhost): ');

    if (vlcPort === '') {
      vlcPort = '8080';
    }

    if (vlcAddress === '') {
      // eslint-disable-next-line
      vlcAddress = `'localhost'`;
    }
  }

  return { detach, vlcAddress, vlcPort, vlcPassword };
}

async function askQuestions() {
  console.log('To enter a default hit enter!');
  // richPresenseSettings
  ({ applicationId, updateInterval, sleepTime } = await getRichPresenceSettings());

  // iconNames
  ({ playingIcon, pauseIcon, vlcIcon } = await getIconNames());

  // Spotify
  ({ spotify, spotifyClientID, spotifyClientSecret } = await getSpotify());
  
  // logUpdates
  logging = await getLogUpdates();
  
  // Detached
  ({ detach, vlcAddress, vlcPort, vlcPassword } = await getDetatched());

  const directories = await askQuestion('Do you want to set custom paths for metadata_auto.js (Y/N): ');
  // eslint-disable-next-line
  let shows = `'C:/Users/user/vlc-discord-rpc/Media/Shows'`;
  // eslint-disable-next-line
  let movies = `'C:/Users/user/vlc-discord-rpc/Media/Movies'`;
  if (directories.toLowerCase() === 'y') {
    const showPath = await askQuestion('Enter path to shows: ');

    shows = `'${showPath}'`;

    const moviePath = await askQuestion('Enter path to movies: ');

    movies = `'${moviePath}'`;
  }

  const separator = await askQuestion('Do you want to change the default separator? (Y/N): ');
  // eslint-disable-next-line
  let separate = `'_'`;
  if (separator.toLowerCase() === 'y') {
    const separateText = await askQuestion('Enter the desired character: (Default: _ ): ');
    separate = `'${separateText}'`;
  }

  const omdb = await askQuestion('Do you want to have movie/show covers displayed (requires API key)? (Y/N): ');
  let autoOMDB = false;
  // eslint-disable-next-line
  let movieApiKey = `''`;
  if (omdb.toLowerCase() === 'y') {
    autoOMDB = true;
  }

  let defMediaType = '';
  defMediaType = await askQuestion('Enter a default media type (Optional: Movie, Show, or Video) (Default: none): ');

  if (defMediaType === '') {
    // eslint-disable-next-line
    defMediaType = `''`;
  }

  let defaultResultNumber = -1;
  let defResultNumber = await askQuestion('Choose a default result number (Default: -1): ');
  while (isNaN(defResultNumber)) {
    defResultNumber = await askQuestion('Choose a default result number (Default: -1): ');
  }

  if (defResultNumber !== '') {
    defaultResultNumber = defResultNumber;
  }

  let defaultActivityType = 'ActivityType.Watching';
  let defActivityType = await askQuestion('Choose playing, watching, or listening for the status: ');
  while (!['playing', 'listening', 'watching', ''].includes(defActivityType.toLowerCase())) {
    defActivityType = await askQuestion('Choose playing, watching, or listening for the status: ');
  }

  if (defActivityType === 'playing') {
    defaultActivityType = 'ActivityType.Playing;';
  } else if (defActivityType === 'watching') {
    defaultActivityType = 'ActivityType.Watching;';
  } else if (defActivityType === 'listening') {
    defaultActivityType = 'ActivityType.Listening;';
  }

  let defaultMaxRateLimitWait = 120;
  let maxRateLimitWait = await askQuestion('Choose a max rate limit wait value (Default: 120): ');
  while (isNaN(maxRateLimitWait)) {
    maxRateLimitWait = await askQuestion('Choose a max rate limit wait value (Default: 120): ');
  }
  if ( maxRateLimitWait === '' ) {
    maxRateLimitWait = 120;
  }
  defaultMaxRateLimitWait = maxRateLimitWait;

  // eslint-disable-next-line
  let defaultMarkdownIgnore = `'[]'`;
  const markdownIgnore = await askQuestion('Enter list of items for markdown ignore (Default: None): ');

  if (markdownIgnore !== '') {
    defaultMarkdownIgnore = `'${markdownIgnore}'`;
  }

  rl.close(); 

  fileString = `import { ActivityType } from 'discord-api-types/v10';

// Where to look for VLC
const platformDefaults = {
  win32: 'C:/Program Files/VideoLAN/VLC/vlc.exe',
  winalt: 'C:/Program Files (x86)/VideoLAN/VLC/vlc.exe',
  linux: '/usr/bin/vlc',
  unix: '/usr/bin/vlc',
  darwin: '/Applications/VLC.app/Contents/MacOS/VLC'
};

// Is VLC somewhere else?
const vlcPath = '${vlc_path_replaced}';

// Settings
const richPresenseSettings = {
  id: '${applicationId}',
  updateInterval: ${updateInterval},
  sleepTime: ${sleepTime}
};

// Default icons. Change if you would like.
const iconNames = {
  pause: ${pauseIcon},
  playing: ${playingIcon},
  vlc: ${vlcIcon}
};

// Must fill these out for album covers
const useSpotify = ${spotify};

const spotify = {
  clientID: ${spotifyClientID},
  clientSecret: ${spotifyClientSecret}
};

// Local VLC Config
const vlcConfig = {
  password: ${vlcPassword},
  port: ${vlcPort},
  address: ${vlcAddress}
};

// Do you want it to log every time your presence is updated? (Useful for debug)
const logUpdates = ${logging};

// READ THE READ ME. This is complicated to set up!
const detached = ${detach};

const movieApiKey = ${movieApiKey};

// Directories for Metadata/metadata_auto.js to use
const directories = {
  'shows': ${shows},
  'movies':  ${movies}
};

// Separator for file names used in metadata_auto.js
// For example Breaking_Bad_S1E2.wmv is separated by _
const separator = ${separate};

const autoOMDB = ${autoOMDB};

// Set to "" to disable. Other accepted parameters are "show", "movie", or "video".
const defaultMediaType = ${defMediaType};

// Set to -1 to disable. Any Number 0 through the number of results will work.
const defaultResultNumber = ${defaultResultNumber};

// View VLC-RPC documentation online for valid types. Link is on the Github.
const defaultActivityType = ${defaultActivityType};

// The maximum amount of time to wait for a rate limit before deciding to just display it as a video (no image and with file name) in seconds
const maxRateLimitWait = ${defaultMaxRateLimitWait};

// Things inside of these will be ignored.
// The default is [], where anything inside [] will not appear in your status
// Set to '' to ignore
const markdownForIgnore = ${defaultMarkdownIgnore};

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
`;
}

askQuestions().then(() => {
  try {
    const filePath = path.join(__dirname, 'Storage', 'config.js');

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    fs.writeFileSync(filePath, fileString, 'utf8');
  } catch (error) {
    console.log('There was an error writing your config.js file. Please copy and paste this into your config.js!');
    console.log(fileString);
    console.error(error);
  }
      
});
