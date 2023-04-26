/**
 * Description: Decides what information to display based on the nature of the media (video, music, etc)
 */

const { getAlbumArt } = require("./Images/getAlbumArt.js");
const { searchShow } = require("./Images/searchShow.js");
const config = require("../Storage/config.js");

module.exports = async (status) => {
  // Initialize variables
  let details = "";
  let image = config.iconNames.vlc;
  let state = "";
  let smallImageKey = "";

  if (status.state == "playing") {
    smallImageKey = config.iconNames.playing;
  } else if (status.state == "paused") {
    smallImageKey = config.iconNames.pause;
  }

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
    const show = await searchShow(meta.showName);

    if (show.image) {
      image = show.image;
    }
    // If it's a music video
  } else if (meta.artist) {
    details = meta.title;
    state = meta.artist;

    // If there is an album add it to the state
    if (meta.album) {
      state += ` | ${meta.album}`;
    }

    // If there's a track number and total number of tracks, set the party size and max
    if (meta.track_number && meta.track_total) {
      var partySize = parseInt(meta.track_number, 10);
      var partyMax = parseInt(meta.track_total, 10);
    }
    // Try to get the album art for the music
    const art = await getAlbumArt(meta.album, meta.artist);
    if (art) {
      image = art;
    }

    // If the video is currently playing
  } else if (meta.now_playing) {
    // Set the state to  the value of the "now_playing" meta data (if available) or "Stream"
    state = meta.now_playing || "Stream";
  } else {
    details = meta.filename;
    state = meta.title || "Video";
  }

  // Get time left in video
  const end = Math.floor(Date.now() / 1000 + (status.length - status.time) / status.rate);
  if (status.state === "playing" && status.length != 0) {
    var endTimestamp = end;
  }

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
    buttons: [
      {
        label: "GitHub Repo",
        url: "https://github.com/vlc-rpc/vlc-rpc",
      },
    ],
  };
};
