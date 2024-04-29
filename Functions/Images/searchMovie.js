import { movieApiKey } from "../../Storage/config.js";
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
  
    throw error;
  }
}

export {fetchMovieData};