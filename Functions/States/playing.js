const { getAlbumArt } = require("../Images/getAlbumArt.js");
const { searchShow } = require("../Images/searchShow.js");
const config = require("../../Storage/config.js");

async function play(status) {
  state = "Playing";
  var details = "";
  const meta = status.information.category.meta;

  if (status.stats.decodedvideo > 0) {
    // If it's a tv show
    if (meta.showName) {
      var details = meta.showName;

      if (meta.seasonNumber) {
        var state = ` Season ${meta.seasonNumber}`;
        if (meta.episodeNumber) {
          state += ` - Episode ${meta.episodeNumber}`;
        }
      }

      try {
        const show = await searchShow(meta.showName);
        var image = show.image;
      } catch {
        var image = config.iconNames.vlc;
      }
    } else if (meta.artist) {
      var state = meta.artist;
      if (meta.track_number && meta.track_total) {
        var partySize = parseInt(meta.track_number, 10);
        var partyMax = parseInt(meta.track_total, 10);
      }
      try {
        var image = await getAlbumArt(meta.album);
      } catch {
        var image = config.iconNames.vlc;
      }
    } else {
      var state = `${status.date || ""} Video`;
      var image = config.iconNames.vlc;
    }
  } else if (meta.now_playing) {
    var state = meta.now_playing || "Stream";
  } else if (meta.artist) {
    var state = meta.artist;

    if (meta.album) {
      state += ` - ${meta.album}`;
      if (meta.track_number && meta.track_total) {
        var partySize = parseInt(meta.track_number, 10);
        var partyMax = parseInt(meta.track_total, 10);
      }
    }

    try {
      var image = await getAlbumArt(meta.album);
    } catch {
      var image = config.iconNames.vlc;
    }
  } else {
    var state = status.state;
  }
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
