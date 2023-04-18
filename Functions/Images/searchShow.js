async function searchShow(showName) {
  try {
    // Use the TVmaze API to search for the show by name
    const response = await fetch(`http://api.tvmaze.com/search/shows?q=${showName}`);
    const data = await response.json();

    // Get the first result (most relevant)
    const show = data[0].show;

    // Use the TVmaze API to get the show's image URL
    const imageResponse = await fetch(`http://api.tvmaze.com/shows/${show.id}/images`);
    const imageData = await imageResponse.json();

    // Get the first image (most common)
    const image = imageData[0].resolutions.original.url;

    return {
      name: show.name,
      image,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}
module.exports = { searchShow };
