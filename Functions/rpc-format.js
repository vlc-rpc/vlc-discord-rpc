/**
 * Description: Decides what information to display based on the nature of the media (video, music, etc)
 */

const { getAlbumArt } = require("./Images/getAlbumArt.js");
const { searchShow } = require("./Images/searchShow.js");
const { pause } = require("./States/paused.js");
const config = require("../Storage/config.js");

module.exports = async (status) => {
  // Add a pause function so the file does not get too long (makes editing easier as well)
  if (status.state == "paused") {
    pause(status);
  }

  const { meta } = status.information.category;

  if (meta.artist) {
    try {
      var image = await getAlbumArt(meta.album);
    } catch {
      var image = config.iconNames.vlc;
    }
  } else if (meta.showName) {
    try {
      const show = await searchShow(meta.showName);
      var image = show.image;
    } catch {
      var image = config.iconNames.vlc;
    }
  }

  const output = {
    details: meta.title || meta.filename,
    largeImageKey: image,
    smallImageKey: "playing",
    smallImageText: `Volume: ${Math.round(status.volume / 2.56)}%`,
    instance: true,
  };
  // if video
  if (status.stats.decodedvideo > 0) {
    // if youtube video
    if (meta["YouTube Start Time"] !== undefined) {
      output.largeImageKey = "youtube";
      output.largeImageText = meta.url;
    }
    // If it's a tv show
    if (meta.showName) output.details = meta.showName;

    if (meta.seasonNumber) {
      output.state = ` Season ${meta.seasonNumber}`;
      if (meta.episodeNumber) {
        output.state += ` - Episode ${meta.episodeNumber}`;
      }
    } else if (meta.artist) {
      output.state = meta.artist;
    } else {
      output.state = `${status.date || ""} Video`;
    }

    const show = await searchShow(meta.showName);
    output.largeImageKey = show.image;
  } else if (meta.now_playing) {
    output.state = meta.now_playing || "Stream";
  } else if (meta.artist) {
    output.state = meta.artist;

    if (meta.album) output.state += ` - ${meta.album}`;
    if (meta.track_number && meta.track_total) {
      output.partySize = parseInt(meta.track_number, 10);
      output.partyMax = parseInt(meta.track_total, 10);
    }
  } else {
    output.state = status.state;
  }
  const end = Math.floor(Date.now() / 1000 + (status.length - status.time) / status.rate);
  if (status.state === "playing" && status.length != 0) {
    output.endTimestamp = end;
  }

  return output;
};
