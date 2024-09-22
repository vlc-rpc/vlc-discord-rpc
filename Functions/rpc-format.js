/**
 * Description: Decides what information to display based on the nature of the media (video, music, etc)
 */
import { askQuestion, createReadline, extractShowDetails } from '../Metadata/metadata_functions.cjs'; 
import { 
  autoOMDB, 
  defaultActivityType, 
  defaultMediaType, 
  defaultResultNumber, 
  iconNames, 
  logUpdates,
  movieApiKey, 
  useSpotify 
} from "../Storage/config.js";
import { getAlbumArt, getAlbumArtArchive, getCustomArt } from "./Images/getAlbumArt.js";
import { searchShow, searchShowMultipleResults } from "./Images/searchShow.js";
import { activityCache } from './Discord_Client.js';
import { fetchMovieData } from "./Images/searchMovie.js";
import { handleRateLimits } from './Images/handleRateLimits.js';

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

  if(logUpdates) {
    console.log("----------------\nLog Updates\nSearch Show Function is running\n----------------\n");
  }

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

  if(logUpdates) {
    console.log("----------------\nLog Updates\nFetch Movie Data Function is running\n----------------\n");
  }

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
 * Ask the user for the type of media.
 * @returns mediaType - Whether it is a show or movie.
 */
async function askMediaType() {
  const showOrMovierl = createReadline();
  let mediaType = await askQuestion(showOrMovierl, "Is this a show (s), movie (m), or a video (v)? ");

  if(mediaType.toLowerCase() === "s") {
    mediaType = "show";
  }

  if(mediaType.toLowerCase() === "m") {
    mediaType = "movie";
  }

  if(mediaType.toLowerCase() === "v") {
    mediaType = "video";
  }

  while(mediaType.toLowerCase() !== "show" && mediaType.toLowerCase() !== "movie" && mediaType !== "video") {
    console.log("Invalid type. Please try again.");
    mediaType = await askQuestion(showOrMovierl, "Is this a show (s), movie (m), or video (v)? ");

    if(mediaType.toLowerCase() === "s") {
      mediaType = "show";
    }
  
    if(mediaType.toLowerCase() === "m") {
      mediaType = "movie";
    }

    if(mediaType.toLowerCase() === "v") {
      mediaType = "video";
    }
  }

  showOrMovierl.close();
  return mediaType.toLowerCase();
}

async function getMovieNumber(fileInformation, currentPage, resultNumber, totalPages, itemsPerPage) {

  for (let i = 0; i < fileInformation.Search.length; i++) {
    console.log(`Result ${i}: ${fileInformation.Search[i].Title} (${fileInformation.Search[i].Year})`);

    if ((i + 1) % itemsPerPage === 0 || i === fileInformation.Search.length - 1) {
      console.log(`Page ${currentPage}/${totalPages}`);

      if (i < fileInformation.Search.length - 1) {
        const movieResultNumberrl = createReadline();

        resultNumber = await askQuestion(movieResultNumberrl, "What result number would you like to use? Enter 'n' to see the next page. ");
        if (resultNumber.toLowerCase() === 'n') {
          currentPage++;
        } else {
          resultNumber = parseInt(resultNumber); 

          if (isNaN(resultNumber) || resultNumber < 0 || resultNumber >= fileInformation.Search.length) {
            console.log("Invalid result number. Defaulting to 0.");
            resultNumber = 0;
          }
          
          movieResultNumberrl.close();
          break; 
        }
        movieResultNumberrl.close();
      } else {
        console.log("There are no more pages. Please select a result");
        const movieResultNumberrl = createReadline();
        resultNumber = await askQuestion(movieResultNumberrl, "What result number would you like to use? There are no more pages. ");
      }
    }
  }
  return resultNumber;
}

async function autoSearchShow(fileMetadata) {
  let details = fileMetadata.showName.trim();
  let image = iconNames.vlc;
  state = "Watching media";

  const showResults = await searchShowMultipleResults(fileMetadata.showName.trim());
  state = fileMetadata.season > 0 ? `Season ${fileMetadata.season} - Episode ${fileMetadata.episode}` : "Unknown episode";
  if(showResults) {
    let resultNumber = 0;
    if(defaultResultNumber === -1) {
      for (let i = 0; i < showResults.length; i++) {
        console.log(`Result ${i}: ${showResults[i].show.name}`);
      }

      const showResultNumberrl = createReadline();

      resultNumber = await askQuestion(showResultNumberrl, "What result number would you like to use? ");
      if(resultNumber > showResults.length - 1 || resultNumber < 0) {
        console.log("Invalid file number... defaulting to 0");
        resultNumber = 0;
      }

      console.log(`Using result number ${resultNumber} (${showResults[resultNumber].show.name})!`);

      showResultNumberrl.close();
    } else {
      resultNumber = defaultResultNumber;
      console.log(`----------------\nUsing default result number from config.js: ${defaultResultNumber}\n----------------\n`);
    }

    const imageURL = `http://api.tvmaze.com/shows/${showResults[resultNumber].show.id}/images`;
    const imageResponse = await fetch(imageURL);

    if(imageResponse.status === 429) {
      const result = await handleRateLimits(imageURL, imageResponse);
      const resultData = await result.json();

      if(resultData && resultData.length > 0) {

        // Get the first image (most common)
        image = resultData[0].resolutions.original.url;
      }
    }

    const imageData = await imageResponse.json();
    if(imageData && imageData.length > 0) {

      // Get the first image (most common)
      image = imageData[0].resolutions.original.url;
    }

    details = showResults[resultNumber].show.name ?? "Watching a show";

    return {details, state, image};
  } else {
    console.log("----------------");
    console.log(`WARNING: No results for... ${fileMetadata.showName.trim()}`);
    console.log("----------------\n");
    return {details, state, image};
  }
}

/**
 * Automatically convert the file name to a show or movie name and search for it.
 * @param {*} meta - Metadata object containing information about the movie or show.
 * @returns {object} - Object containing details, state, and image.
 */
async function searchAll(meta, state) {
  if(logUpdates) {
    console.log("----------------\nLog Updates\nSearch All Function is running\n----------------\n");
  }

  let mediaType = "";
  let details = meta.filename;
  let image = iconNames.vlc;
  state = "Watching media";

  if(defaultMediaType.toLowerCase() !== "show" && defaultMediaType.toLowerCase() !== "movie" && defaultMediaType.toLowerCase() !== "video")  {
    mediaType = await askMediaType();
  } else if (defaultMediaType.toLowerCase() === "video") {
    console.log(`----------------\nUsing default media type from config.js: video\n----------------\n`);
    console.log("----------------");
    console.log(`Using file name... ${details}`);
    console.log(`If this name is incorrect please rename your file`);
    console.log("----------------\n");
    return {details, state, image};
  } else {
    mediaType = defaultMediaType.toLowerCase();
    console.log(`----------------\nUsing default media type from config.js: ${mediaType}\n----------------\n`);
  }

  const fileMetadata = extractShowDetails(meta.filename);

  if(mediaType === "show" || mediaType === "movie") {
    details = fileMetadata.showName.trim();

    console.log("----------------");
    console.log(`Finding results for... ${fileMetadata.showName.trim()}`);
    console.log(`If this name is incorrect please rename your file`);
    console.log("----------------\n");
  }
  
  if(mediaType === "show") {
    ({details, state, image} = autoSearchShow(fileMetadata));
  } else if(mediaType === "movie") {
    const fileInformation = await fetchMovieData(fileMetadata.showName.trim());
    let resultNumber = 0;

    if(fileInformation.Response !== 'False') {
      console.log(fileInformation);

      console.log(`There are ${fileInformation.Search.length} results.`);
      if(fileInformation.Search.length > 0) {
        if(defaultResultNumber !== -1) {
          resultNumber = defaultResultNumber;
          console.log(`----------------\nUsing default result number from config.js: ${defaultResultNumber}\n----------------\n`);
        } else {
          const itemsPerPage = 10;
          const currentPage = 1;
        
          const totalPages = Math.ceil(fileInformation.Search.length / itemsPerPage);
          resultNumber = await getMovieNumber(fileInformation, currentPage, resultNumber, totalPages, itemsPerPage);
        } 
      }

      console.log(`Using result number ${resultNumber} (${fileInformation.Search[resultNumber].Title})!`);

      details = fileInformation.Search[resultNumber].Title ?? "Watching a movie";
      state = `${fileInformation.Search[resultNumber].Year}`;
      image = fileInformation.Search[resultNumber].Poster;
    } else {
      console.log("----------------");
      console.log(`WARNING: No results for... ${fileMetadata.showName.trim()}`);
      console.log("----------------\n");
    }
  } else if (mediaType === "video") {
    console.log("----------------");
    console.log(`Using file name... ${details}`);
    console.log(`If this name is incorrect please rename your file`);
    console.log("----------------\n");
      
    return {details, state, image};
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

function checkDetailLength(details) {
  if (details.length > 125) {
    details = details.substring(0, 125) + "...";
  }

  // Details field must be >= 2 characters
  if(details.length < 2) {
    details += ".";
  }

  return details;
}

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
  let endTimestamp = null;

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

  // Get time left in video
  const end = Math.floor(Date.now() / 1000 + (status.length - status.time) / status.rate);
  if (status.state === "playing" && status.length !== 0) {
    endTimestamp = end;
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
    endTimestamp: endTimestamp,
    partySize: partySize,
    partyMax: partyMax,
    // Supported: https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-types
    type: defaultActivityType
  };
}

