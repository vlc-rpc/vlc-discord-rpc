/**
 * Description: Decides what information to display based on the nature of the media (video, music, etc)
 */
import { getAlbumArt, getAlbumArtArchive, getCustomArt } from "./Images/getAlbumArt.js";
import { iconNames, movieApiKey, useSpotify } from "../Storage/config.js";
import { ActivityType } from "discord-api-types/v10";
import { fetchMovieData } from "./Images/searchMovie.js";
import { searchShow } from "./Images/searchShow.js";

/**
 * Given a show with a description in its metadata, format the description to be in Season Episode format.
 * @param {*} meta - Metadata object containing information about the show.
 * @returns {string} - Formatted state in Season Episode format.
 */
function setShowState(meta) {
  if(meta.description || meta.Description) {
    const description = meta.description || meta.Description;
    const sIndex = description.indexOf("S:");
    const eIndex = description.indexOf("E:");

    if (sIndex !== -1 && eIndex !== -1) {
      const seasonNumber = description.slice(sIndex + 2, eIndex).trim();
      const episodeNumber = description.slice(eIndex + 2).trim();
      return ` Season ${seasonNumber} - Episode ${episodeNumber}`;
    } else {
      return "Unknown Episode";
    }
  } else {
    return "Unknown Episode";
  }
}

/**
 * Check for state changes and set the icon accordingly.
 * @param {*} status - Object containing status information.
 * @returns {string} - Icon to be displayed.
 */
function setSmallImageKey(status) {
  if (status.state === "playing") {
    return iconNames.playing;
  } else if (status.state === "paused") {
    return iconNames.pause;
  } else {
    return iconNames.vlc;
  }
}

/**
 * Update the status information for a show.
 * @param {*} meta - Metadata object containing information about the show.
 * @param {*} state - Current state information.
 * @returns {object} - Object containing details, state, and image.
 */
async function handleShow(meta, state) {
  let image = iconNames.vlc;
  const details = meta.title;

  state = setShowState(meta, state);

  const show = await searchShow(meta.title);

  if (show && show.image) {
    ({image} = show);
  }
  return {details, state, image};
}

/**
 * Update the status information for a movie.
 * @param {*} meta - Metadata object containing information about the movie.
 * @param {*} state - Current state information.
 * @returns {object} - Object containing details, state, and image.
 */
async function handleMovie(meta, state) {
  let image = iconNames.vlc;
  let details = meta.title;

  // Try to search for the movie and get its image
  const movie = await fetchMovieData(meta.title);

  // Make sure we actually got a movie
  if (movie && movie.Response !== 'False') {
    details = movie.Title;
    state = `${movie.Year}`;
    image = movie.Poster;
  } else {
    // Fallback in case we don't have a movie
    console.log("WARNING: Movie with that name not found! Please try and find it on IMDB and use that name!");
    details = "Watching a movie";
    state = meta.title || "Video";
  }

  return { details, state, image };
}

/**
 * Update the status information for music.
 * @param {*} meta - Metadata object containing information about the music.
 * @param {*} state - Current state information.
 * @returns {object} - Updated status information for music.
 */
async function handleMusic(meta, state) {
  let details = "";
  let image = iconNames.vlc;
  let partySize = null;
  let partyMax = null;
  
  details = meta.title;
  state = meta.artist;

  // If there is an album add it to the state
  if (meta.album) {
    state += ` | ${meta.album}`;
  }

  // If there's a track number and total number of tracks, set the party size and max
  if (meta.track_number && meta.track_total) {
    partySize = parseInt(meta.track_number, 10);
    partyMax = parseInt(meta.track_total, 10);
  }
  // Try to get the album art for the music
  if(meta.album && meta.artist){
    // Try to use custom_art.json. Returns null if not found in file.
    let art = await getCustomArt(meta.album);
    if(art === null) {
      art = useSpotify ? await getAlbumArt(meta.album, meta.artist) : await getAlbumArtArchive(meta.album, meta.artist);
    }
    if(art){
      image = art;
    }
  }

  return {details, state, partySize, partyMax, image};
}

/**
 * Main function for formatting status information based on content type.
 * @param {*} status - Object containing status information.
 * @returns {object} - Formatted status information for display.
 */
export async function format(status) {
  // Initialize variables
  let details = "";
  let image = iconNames.vlc;
  let state = "";
  let smallImageKey = "";
  let partySize = null;
  let partyMax = null;
  let endTimestamp = null;

  smallImageKey = setSmallImageKey(status);

  // Extract information about what's playing
  const {meta} = status.information.category;

  // If it's a TV show 
  if (meta.genre === "show") {
    const showResult = await handleShow(meta, state);
    ({details} = showResult);
    ({state} = showResult);
    ({image} = showResult);
  } 

  // If it's a movie
  else if (meta.genre === "movie" && meta.title && movieApiKey !== "") {
    const movieResult = await handleMovie(meta, state);
    ({details} = movieResult);
    ({state} = movieResult);
    ({image} = movieResult);
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
  } else {
    details = meta.filename;
    state = meta.title || "Video";
  }

  // Get time left in video
  const end = Math.floor(Date.now() / 1000 + (status.length - status.time) / status.rate);
  if (status.state === "playing" && status.length !== 0) {
    endTimestamp = end;
  }

  // Make sure the details variable is not too long to be displayed (limited by Discord)
  if (details.length > 125) {
    details = details.substring(0, 125) + "...";
  }

  // Details field must be >= 2 characters
  if(details.length < 2) {
    details += ".";
  }

  return {
    state: state,
    details: details,
    largeImageKey: image,
    smallImageKey: smallImageKey,
    smallImageText: `Volume: ${Math.round(status.volume / 2.56)}%`,
    instance: true,
    endTimestamp: endTimestamp,
    partySize: partySize,
    partyMax: partyMax,
    // Supported: https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-types
    type: ActivityType.Playing
  };
}

