import { handleRateLimits } from './handleRateLimits.js';
import { movieApiKey } from '../../Storage/config.js';
/**
 * Searches for a movie by name using the OMDb API.
 * @param {string} movieName - The name of the movie to search for.
 * @returns {object | null} An object containing the name of the show and its image URL if found, or null if not found or an error occurs.
 */
async function fetchMovieData(movieName) {
  const url = `http://www.omdbapi.com/?i=tt3896198&apikey=${movieApiKey}&s=${movieName}&type=movie`;

  const options = {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  };
  
  try {
  
    let response = await fetch(url, options);

    if (response.status === 429) {
      response = await handleRateLimits(url, response);
    }
  
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  
    const data = await response.json();

    const pages = Math.ceil(data.totalResults/10);
    for (let i = 2; i <= pages; i++) {
      const pagedURL = `http://www.omdbapi.com/?i=tt3896198&apikey=${movieApiKey}&s=${movieName}&type=movie&page=${i}`;
      try {
  
        let pageResponse = await fetch(pagedURL, options);
      
        if (pageResponse.status === 429) {
          pageResponse = await handleRateLimits(pagedURL, pageResponse);
        }

        if (!pageResponse.ok) {
          throw new Error(`HTTP error! Status: ${pageResponse.status}`);
        }
        const pageData = await pageResponse.json();
        data.Search = data.Search.concat(pageData.Search);
      } catch (error) {
        console.error('Error occurred during the API request:', error);
        // Prevent app from crashing
        return { 'Response': 'False' };
      }
    }

    return data;
  } catch (error) {
    console.error('Error occurred during the API request:', error);
    // Prevent app from crashing
    return { 'Response': 'False' };
  }
}

export { fetchMovieData };