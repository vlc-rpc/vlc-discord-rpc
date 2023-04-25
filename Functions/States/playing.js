// Import necessary modules
const { getAlbumArt } = require("../Images/getAlbumArt.js");
const { searchShow } = require("../Images/searchShow.js");
const config = require("../../Storage/config.js");

// Define the async function 'play'
async function play(status) {
  // Initialize variables
  var state = "Playing";
  var details = "";
  var image = config.iconNames.vlc;

  // Extract information about what's playing
  const meta = status.information.category.meta;

  // If it's a TV show
  if (meta.showName) {
    // Set the details variable to the name of the show
    details = meta.showName;

    // If there's a season number, append it to the state variable
    if (meta.seasonNumber) {
      state = ` Season ${meta.seasonNumber}`;

      // If there's an episode number, append it to the state variable
      if (meta.episodeNumber) {
        state += ` - Episode ${meta.episodeNumber}`;
      }
    }

    // Try to search for the show and get its image
    try {
      const show = await searchShow(meta.showName);
      image = show.image;
      console.log(show.image);
    } catch {
      console.log("Could not grab show image!");
    }
    // If it's a music video
  } else if (meta.artist) {
    state = meta.artist;
    // If there's a track number and total number of tracks, set the party size and max
    if (meta.track_number && meta.track_total) {
      var partySize = parseInt(meta.track_number, 10);
      var partyMax = parseInt(meta.track_total, 10);
    }
    // Try to get the album art for the music
    try {
      image = await getAlbumArt(meta.album);
    } catch {
      console.log("Could not grab album image!");
    }
    // If the video is currently playing
  } else if (meta.now_playing) {
    // Set the state to  the value of the "now_playing" meta data (if available) or "Stream"
    state = meta.now_playing || "Stream";
  }

  // Get time left in video
  const end = Math.floor(Date.now() / 1000 + (status.length - status.time) / status.rate);
  if (status.state === "playing" && status.length != 0) {
    var endTimestamp = end;
    var details = meta.filename;
  }

  return {
    state: state,
    details: details,
    largeImageKey: image,
    smallImageKey: config.iconNames.playing,
    smallImageText: `Volume: ${Math.round(status.volume / 2.56)}%`,
    instance: true,
    endTimestamp: endTimestamp,
    partySize: partySize,
    partyMax: partyMax,
  };
}

module.exports = { play };
