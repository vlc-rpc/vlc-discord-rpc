/**
 * Description: Decides what information to display based on the nature of the media (video, music, etc)
 */
import { autoOMDB, defaultActivityType, iconNames, movieApiKey} from "../Storage/config.js";
import { checkDetailLength, setSmallImageKey } from './utilityFunctions.js';
import { handleMovie, handleMusic, handleShow } from './mediaFunctions.js';
import { activityCache } from './Discord_Client.js';
import {searchAll} from './searchFunctions.js';

/**
 * Main function for formatting status information based on content type.
 * @param {*} status - Object containing status information.
 * @param {*} changedFiles - Whether or not the file that is playing was changed to another file.
 * @returns {object} - Formatted status information for display.
 */
export async function format(status, changedFiles) {
  // Initialize variables
  let details = "";
  let image = iconNames.vlc;
  let state = "";
  let smallImageKey = "";
  let partySize = null;
  let partyMax = null;

  smallImageKey = setSmallImageKey(status);

  // Extract information about what's playing
  const {meta} = status.information.category;

  // If it's a TV show 
  if (meta.genre === "show" && changedFiles) {
    const showResult = await handleShow(meta, state);
    ({details} = showResult);
    ({state} = showResult);
    ({image} = showResult);
  } else if(meta.genre === "show" && !changedFiles) {
    ({details} = activityCache);
    ({state} = activityCache);
    image = activityCache.largeImageKey;
  }

  // If it's a movie
  else if (meta.genre === "movie" && meta.title && movieApiKey !== "" && changedFiles) {
    const movieResult = await handleMovie(meta, state);
    ({details} = movieResult);
    ({state} = movieResult);
    ({image} = movieResult);
  } else if(meta.genre === "movie" && !changedFiles) {
    ({details} = activityCache);
    ({state} = activityCache);
    image = activityCache.largeImageKey;
  }
  
  // If it's a music video
  else if (meta.artist) {
    const musicResult = await handleMusic(meta, state);
    ({details} = musicResult);
    ({state} = musicResult);
    ({partySize} = musicResult);
    ({partyMax} = musicResult);
    ({image} = musicResult);
    // If the video is currently playing
  } else if (meta.now_playing) {
    // Set the state to  the value of the "now_playing" meta data (if available) or "Stream"
    state = meta.now_playing || "Stream";
    details = meta.filename;
  }
  else if(autoOMDB && changedFiles) {
    const result = await searchAll(meta, state);
    ({details} = result);
    ({state} = result);
    ({image} = result);
  } else if(autoOMDB && !changedFiles) {
    ({details} = activityCache);
    ({state} = activityCache);
    image = activityCache.largeImageKey;
  } else {
    details = meta.filename;
    state = meta.title || "Video";
  }

  // Make sure the details variable is not too long to be displayed (limited by Discord)
  details = checkDetailLength(details);

  return {
    state: state,
    details: details,
    largeImageKey: image,
    smallImageKey: smallImageKey,
    smallImageText: `Volume: ${Math.round(status.volume / 2.56)}%`,
    instance: true,
    partySize: partySize,
    partyMax: partyMax,
    // Supported: https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-types
    type: defaultActivityType
  };
}

