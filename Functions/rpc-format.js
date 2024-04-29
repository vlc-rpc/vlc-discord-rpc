/**
 * Description: Decides what information to display based on the nature of the media (video, music, etc)
 */
import { iconNames, movieApiKey, useSpotify } from "../Storage/config.js";
import { fetchMovieData } from "./Images/searchMovie.js";
import { getAlbumArt } from "./Images/getAlbumArt.js";
import { searchShow } from "./Images/searchShow.js";

/**
 * Given a show with a description in it's metadata, format the description to be in Season Episode format
 * @param {*} meta 
 * @param {*} state 
 * @returns Formatted state in Season Episode format
 */
function setShowState(meta) {
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
}

/**
 * Check for state changes and set's the icon accordingly
 * @param {*} status 
 * @returns Icon to be displayed
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
    // Set the details variable to the name of the show
    details = meta.title;

    state = setShowState(meta, state);

    const show = await searchShow(meta.title);

    if (show && show.image) {
      ({image} = show);
    }
  } 

  // If it's a movie
  else if (meta.genre === "movie" && meta.title && movieApiKey !== "") {
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
  } 
  
  // If it's a music video
  else if (meta.artist) {
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
    if(useSpotify) {
      const art = await getAlbumArt(meta.album, meta.artist);
      if (art) {
        image = art;
      }
    } 

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

  if (details.length > 125) {
    details = details.substring(0, 125) + "...";
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
    buttons: [
      {
        label: "GitHub Repo",
        url: "https://github.com/vlc-rpc/vlc-discord-rpc"
      }
    ]
  };
}

