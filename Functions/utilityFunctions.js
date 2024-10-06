import { askQuestion, createReadline } from '../Metadata/metadata_functions.cjs'; 
import { iconNames } from '../Storage/config.js';
/**
 * Check for state changes and set the icon accordingly.
 * @param {*} status - Object containing status information.
 * @returns {string} - Icon to be displayed.
 */
function setSmallImageKey(status) {
  if (status.state === 'playing') {
    return iconNames.playing;
  } else if (status.state === 'paused') {
    return iconNames.pause;
  } else {
    return iconNames.vlc;
  }
}

/**
 * Ask the user for the type of media.
 * @returns mediaType - Whether it is a show or movie.
 */
async function askMediaType() {
  const showOrMovierl = createReadline();
  let mediaType = (await askQuestion(showOrMovierl, 'Is this a show (s), movie (m), or a video (v)? ')).toLowerCase();
  
  if (mediaType === 's') {
    mediaType = 'show';
  }
  
  if (mediaType === 'm') {
    mediaType = 'movie';
  }
  
  if (mediaType === 'v') {
    mediaType = 'video';
  }
  
  while (mediaType !== 'show' && mediaType !== 'movie' && mediaType !== 'video') {
    console.log('Invalid type. Please try again.');
    mediaType = (await askQuestion(showOrMovierl, 'Is this a show (s), movie (m), or video (v)? ')).toLowerCase();
  
    if (mediaType === 's') {
      mediaType = 'show';
    }
    
    if (mediaType === 'm') {
      mediaType = 'movie';
    }
  
    if (mediaType === 'v') {
      mediaType = 'video';
    }
  }
  
  showOrMovierl.close();
  return mediaType;
}

function checkDetailLength(details) {

  if (typeof details !== 'string') {
    return 'Unknown';
  }
  
  if (details && details.length > 125) {
    details = `${details.substring(0, 125)  }...`;
  }
  
  // Details field must be >= 2 characters
  if (details && details.length < 2) {
    while (details.length < 2) {
      details += '.';
    }
  }
  
  return details || 'Unknown';
}

export { askMediaType, checkDetailLength, setSmallImageKey };