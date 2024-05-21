import { movieApiKey } from "../../Storage/config.js";
/**
 * Searches for a movie by name using the OMDb API.
 * @param {string} movieName - The name of the movie to search for.
 * @returns {object | null} An object containing the name of the show and its image URL if found, or null if not found or an error occurs.
 */
async function fetchMovieData(movieName) {
  const url = `https://www.omdbapi.com/?apiKey=${movieApiKey}&t=${movieName}&plot=full`;
  const options = {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  };
  
  try {
  
    const response = await fetch(url, options);
  
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  
    const data = await response.json();
  
    return data;
  } catch (error) {
    console.error('Error occurred during the API request:', error);
    // Prevent app from crashing
    return {"Response": 'False'};
  }
}

export {fetchMovieData};