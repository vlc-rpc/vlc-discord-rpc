import { getAlbumArt, getAlbumArtArchive, getCustomArt } from './Images/getAlbumArt.js';
import { iconNames, logUpdates, useSpotify } from '../Storage/config.js';
import { extractShowDetails } from '../Metadata/metadata_functions.cjs';
import { fetchMovieData } from './Images/searchMovie.js';
import { searchShow } from './Images/searchShow.js';

/**
 * Given a show with a description in its metadata, format the description to be in Season Episode format.
 * @param {*} meta - Metadata object containing information about the show.
 * @returns {string} - Formatted state in Season Episode format.
 */
function setShowState(meta) {
  if(meta.description || meta.Description) {
    const description = meta.description || meta.Description;
    const sIndex = description.indexOf('S:');
    const eIndex = description.indexOf('E:');
  
    if (sIndex !== -1 && eIndex !== -1) {
      const seasonNumber = description.slice(sIndex + 2, eIndex).trim();
      const episodeNumber = description.slice(eIndex + 2).trim();
      return ` Season ${seasonNumber} - Episode ${episodeNumber}`;
    } else {
      return 'Unknown Episode';
    }
  } else {
    return 'Unknown Episode';
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
  
  if(logUpdates) {
    console.log('----------------\nLog Updates\nSearch Show Function is running\n----------------\n');
  }
  
  const show = await searchShow(extractShowDetails(meta.title).showName);

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
  
  if(logUpdates) {
    console.log('----------------\nLog Updates\nFetch Movie Data Function is running\n----------------\n');
  }
  
  // Try to search for the movie and get its image
  const movie = await fetchMovieData(meta.title);
  
  // Make sure we actually got a movie
  if (movie && movie.Response !== 'False') {
    details = movie.Search[0].Title;
    state = `${movie.Search[0].Year}`;
    image = movie.Search[0].Poster;
  } else {
    // Fallback in case we don't have a movie
    console.log('WARNING: Movie with that name not found! Please try and find it on IMDB and use that name!');
    details = 'Watching a movie';
    state = meta.title || 'Video';
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
  let details = '';
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

export {handleShow, handleMovie, handleMusic};