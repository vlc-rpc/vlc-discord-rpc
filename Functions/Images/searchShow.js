const fetch = require("node-fetch");

async function searchShow(showName) {
  try {
    // Use the TVmaze API to search for the show by name
    const response = await fetch(`http://api.tvmaze.com/search/shows?q=${showName}`);
    if (!response.ok) {
      console.error(`Error searching show: ${response.statusText}`);
      return null;
    }
    const data = await response.json();

    // Get the first result (most relevant)
    const show = data[0].show;

    // Use the TVmaze API to get the show's image URL
    const imageResponse = await fetch(`http://api.tvmaze.com/shows/${show.id}/images`);
    if (!imageResponse.ok) {
      console.error(`Error fetching show images: ${imageResponse.statusText}`);
      return null;
    }
    const imageData = await imageResponse.json();

    // Get the first image (most common)
    const image = imageData[0].resolutions.original.url;

    return {
      name: show.name,
      image,
    };
  } catch (error) {
    console.error("Error in searchShow function:", error.message);
    return null;
  }
}

module.exports = { searchShow };
