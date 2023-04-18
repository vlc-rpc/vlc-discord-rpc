const config = require("../../Storage/config.js");
const { getAlbumArt } = require("../Images/getAlbumArt.js");
const { searchShow } = require("../Images/searchShow.js");

async function pause(status) {
  state = "Paused";
  var details = "";
  const meta = status.information.category.meta;

  // Check if it's a song
  if (meta.artist) {
    try {
      var image = await getAlbumArt(meta.album);
    } catch {
      var image = config.iconNames.vlc;
    }
    details = meta.title;

    state = meta.artist;
    if (meta.album) {
      state += ` - ${meta.album}`;
    }
    if (meta.track_number && meta.track_total) {
      state += parseInt(meta.track_number, 10);
      state += parseInt(meta.track_total, 10);
    }
    // Check if it's a show
  }
  if (meta.showName) {
    try {
      const show = await searchShow(meta.showName);
      var image = show.image;
    } catch {
      var image = config.iconNames.vlc;
    }
    details = meta.showName;

    if (meta.seasonNumber) {
      state = ` Season ${meta.seasonNumber}`;

      if (meta.episodeNumber) {
        state += ` - Episode ${meta.episodeNumber}`;
      }
    }
  }

  return {
    state: state,
    details: details,
    largeImageKey: image,
    smallImageKey: config.iconNames.pause,
    smallImageText: "Paused",
    instance: true,
  };
}
module.exports = { pause };
