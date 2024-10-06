/**
 * Description: Decides what information to display based on the nature of the media (video, music, etc)
 */
import { autoOMDB, defaultActivityType, iconNames, movieApiKey } from '../Storage/config.js';
import { checkDetailLength, setSmallImageKey } from './utilityFunctions.js';
import { handleMovie, handleMusic, handleShow } from './mediaFunctions.js';
import { activityCache } from './Discord_Client.js';
import { searchAll } from './searchFunctions.js';

/**
 * Main function for formatting status information based on content type.
 * @param {*} status - Object containing status information.
 * @param {*} changedFiles - Whether or not the file that is playing was changed to another file.
 * @returns {object} - Formatted status information for display.
 */
export async function format(status, changedFiles) {
  // Initialize variables
  let details = '';
  let image = iconNames.vlc;
  let state = '';
  let partySize = null;
  let partyMax = null;

  // Extract information about what's playing
  const { meta } = status.information.category;

  // If it's a TV show 
  if (meta.genre === 'show') {
    if (changedFiles) {
      const showResult = await handleShow(meta, state);
      ({ details, state, image } = showResult);
    } else if (!changedFiles) {
      ({ details, state } = activityCache);
      image = activityCache.largeImageKey;
    }
  } 

  // If it's a movie
  else if (meta.genre === 'movie' && meta.title && movieApiKey !== '' && changedFiles) {
    const movieResult = await handleMovie(meta, state);
    ({ details, state, image } = movieResult);
  } else if (meta.genre === 'movie' && !changedFiles) {
    ({ details, state } = activityCache);
    image = activityCache.largeImageKey;
  }
  
  // If it's a music video
  else if (meta.artist) {
    const musicResult = await handleMusic(meta, state);
    ({ details, state, partySize, partyMax, image } = musicResult);
    // If the video is currently playing
  } else if (meta.now_playing) {
    // Set the state to  the value of the "now_playing" meta data (if available) or "Stream"
    state = meta.now_playing || 'Stream';
    details = meta.filename;
  }
  
  else if (autoOMDB) {
    if (changedFiles) {
      const result = await searchAll(meta, state);
      ({ details, state, image } = result);
    } else if (!changedFiles) {
      ({ details, state } = activityCache);
      image = activityCache.largeImageKey;
    }
  } else {
    details = meta.filename;
    state = meta.title || 'Video';
  }

  // Make sure the details variable is not too long to be displayed (limited by Discord)
  details = checkDetailLength(details);

  const start = Math.floor(Date.now() / 1000 - (status.time) / status.rate);
  const end = Math.floor(Date.now() / 1000 + (status.length - status.time) / status.rate);

  return {
    state: state,
    details: details,
    largeImageKey: image,
    smallImageKey: setSmallImageKey(status),
    smallImageText: `Volume: ${Math.round(status.volume / 2.56)}%`,
    instance: true,
    partySize: partySize,
    partyMax: partyMax,
    startTimestamp: status.state === 'playing' && status.length !== 0 ? start : null,
    endTimestamp: status.state === 'playing' && status.length !== 0 ? end : null,
    // Supported: https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-types
    type: defaultActivityType
  };
}

