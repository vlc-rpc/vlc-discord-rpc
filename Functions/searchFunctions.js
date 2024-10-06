import { askQuestion, createReadline, extractShowDetails } from '../Metadata/metadata_functions.cjs'; 
import { defaultMediaType, defaultResultNumber, iconNames, logUpdates } from '../Storage/config.js';
import { askMediaType } from './utilityFunctions.js';
import { fetchMovieData } from './Images/searchMovie.js';
import { handleRateLimits } from './Images/handleRateLimits.js';
import { searchShowMultipleResults } from './Images/searchShow.js';

async function getMovieNumber(fileInformation, currentPage, resultNumber, totalPages, itemsPerPage) {

  for (let i = 0; i < fileInformation.Search.length; i++) {
    console.log(`Result ${i}: ${fileInformation.Search[i].Title} (${fileInformation.Search[i].Year})`);
  
    if ((i + 1) % itemsPerPage === 0 || i === fileInformation.Search.length - 1) {
      console.log(`Page ${currentPage}/${totalPages}`);
  
      if (i < fileInformation.Search.length - 1) {
        const movieResultNumberrl = createReadline();
  
        resultNumber = await askQuestion(movieResultNumberrl, 'What result number would you like to use? Enter \'n\' to see the next page. ');
        if (resultNumber.toLowerCase() === 'n') {
          currentPage++;
        } else {
          resultNumber = parseInt(resultNumber); 
  
          if (isNaN(resultNumber) || resultNumber < 0 || resultNumber >= fileInformation.Search.length) {
            console.log('Invalid result number. Defaulting to 0.');
            resultNumber = 0;
          }
            
          movieResultNumberrl.close();
          break; 
        }
        movieResultNumberrl.close();
      } else {
        console.log('There are no more pages. Please select a result');
        const movieResultNumberrl = createReadline();
        resultNumber = await askQuestion(movieResultNumberrl, 'What result number would you like to use? There are no more pages. ');
      }
    }
  }
  return resultNumber;
}
  
async function autoSearchShow(fileMetadata) {
  let details = fileMetadata.showName.trim();
  let image = iconNames.vlc;
  let state = 'Watching media';
  
  const showResults = await searchShowMultipleResults(fileMetadata.showName.trim());
  
  state = fileMetadata.season > 0 ? `Season ${fileMetadata.season} - Episode ${fileMetadata.episode}` : 'Unknown episode';
  if (showResults) {
    let resultNumber = 0;
    if (defaultResultNumber === -1) {
      for (let i = 0; i < showResults.length; i++) {
        console.log(`Result ${i}: ${showResults[i].show.name}`);
      }
  
      const showResultNumberrl = createReadline();
  
      resultNumber = await askQuestion(showResultNumberrl, 'What result number would you like to use? ');
      if (resultNumber > showResults.length - 1 || resultNumber < 0) {
        console.log('Invalid file number... defaulting to 0');
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
  
    if (imageResponse.status === 429) {
      const result = await handleRateLimits(imageURL, imageResponse);
      const resultData = await result.json();
  
      if (resultData && resultData.length > 0) {
  
        // Get the first image (most common)
        image = resultData[0].resolutions.original.url;
      }
    }
  
    const imageData = await imageResponse.json();
    if (imageData && imageData.length > 0) {
  
      // Get the first image (most common)
      image = imageData[0].resolutions.original.url;
    }
  
    details = showResults[resultNumber].show.name ?? 'Watching a show';
  
    return { details, state, image };
  } else {
    console.log('----------------');
    console.log(`WARNING: No results for... ${fileMetadata.showName.trim()}`);
    console.log('----------------\n');
    return { details, state, image };
  }
}
  
/**
   * Automatically convert the file name to a show or movie name and search for it.
   * @param {*} meta - Metadata object containing information about the movie or show.
   * @returns {object} - Object containing details, state, and image.
   */
async function searchAll(meta, state) {
  if (logUpdates) {
    console.log('----------------\nLog Updates\nSearch All Function is running\n----------------\n');
  }
  
  let mediaType = '';
  let details = meta.filename;
  let image = iconNames.vlc;
  state = 'Watching media';
  
  if (defaultMediaType.toLowerCase() !== 'show' && defaultMediaType.toLowerCase() !== 'movie' && defaultMediaType.toLowerCase() !== 'video')  {
    mediaType = await askMediaType();
  } else if (defaultMediaType.toLowerCase() === 'video') {
    console.log('----------------\nUsing default media type from config.js: video\n----------------\n');
    console.log('----------------');
    console.log(`Using file name... ${details}`);
    console.log('If this name is incorrect please rename your file');
    console.log('----------------\n');
    return { details, state, image };
  } else {
    mediaType = defaultMediaType.toLowerCase();
    console.log(`----------------\nUsing default media type from config.js: ${mediaType}\n----------------\n`);
  }
  
  const fileMetadata = extractShowDetails(meta.filename);
  
  if (mediaType === 'show' || mediaType === 'movie') {
    details = fileMetadata.showName.trim();
  
    console.log('----------------');
    console.log(`Finding results for... ${fileMetadata.showName.trim()}`);
    console.log('If this name is incorrect please rename your file');
    console.log('----------------\n');
  }
    
  if (mediaType === 'show') {
    ({ details, state, image } = await autoSearchShow(fileMetadata));
  } else if (mediaType === 'movie') {
    const fileInformation = await fetchMovieData(fileMetadata.showName.trim());
    let resultNumber = 0;
  
    if (fileInformation.Response !== 'False') {
      console.log(`There are ${fileInformation.Search.length} results.`);
      if (fileInformation.Search.length > 0) {
        if (defaultResultNumber !== -1) {
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
  
      details = fileInformation.Search[resultNumber].Title ?? 'Watching a movie';
      state = `${fileInformation.Search[resultNumber].Year}`;
      image = fileInformation.Search[resultNumber].Poster;
    } else {
      console.log('----------------');
      console.log(`WARNING: No results for... ${fileMetadata.showName.trim()}`);
      console.log('----------------\n');
    }
  } else if (mediaType === 'video') {
    console.log('----------------');
    console.log(`Using file name... ${details}`);
    console.log('If this name is incorrect please rename your file');
    console.log('----------------\n');
        
    return { details, state, image };
  }
    
  return { details, state, image };
}

export { searchAll };