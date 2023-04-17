/**
 * Description: Decides what information to display based on the nature of the media (video, music, etc)
 */

const { getAlbumArt } = require("./Images/getAlbumArt.js");

module.exports = async (status) => {
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

  // if playback is stopped
  if (status.state === "stopped") {
    const meta = status.information.category.meta;
    if (meta.artist) {
      var image = await getAlbumArt(meta.album);
    } else if (meta.showName) {
      const show = await searchShow(meta.showName);
      var image = show.image;
    }
    return {
      state: "Stopped",
      details: "Nothing is playing",
      largeImageKey: image,
      smallImageKey: "stopped",
      instance: true,
    };
  } // else

  if (status.state == "paused") {
    const meta = status.information.category.meta;
    if (meta.artist) {
      console.log(status.information.category.meta);
      var image = await getAlbumArt(status.information.category.meta.album);
    } else if (meta.showName) {
      const show = await searchShow(meta.showName);
      var image = show.image;
    }
    return {
      state: "Paused",
      details: "Video is paused",
      largeImageKey: image,
      smallImageKey: "paused",
      instance: true,
    };
  }
  const { meta } = status.information.category;
  const output = {
    details: meta.title || meta.filename,
    largeImageKey: await getAlbumArt(status.information.category.meta.artist, status.information.category.meta.title),
    smallImageKey: status.state,
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
    if (meta.episodeNumber) {
      output.state = `Episode ${meta.episodeNumber}`;
      if (meta.seasonNumber) {
        output.state += ` - Season ${meta.seasonNumber}`;
      }
    } else if (meta.artist) {
      output.state = meta.artist;
    } else {
      output.state = `${status.date || ""} Video`;
    }

    const show = await searchShow(meta.showName);
    console.log(show);
    output.largeImageKey = show.image;
  } else if (meta.now_playing) {
    // if a stream
    output.state = meta.now_playing || "Stream";
  } else if (meta.artist) {
    // if in an album
    output.state = meta.artist;
    // if the song is part of an album
    if (meta.album) output.state += ` - ${meta.album}`;
    // display track #
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
