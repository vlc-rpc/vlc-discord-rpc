/**
 * Description: Decides what information to display based on the nature of the media (video, music, etc)
 */

const { pause } = require("./States/paused.js");
const { play } = require("./States/playing.js");

module.exports = async (status) => {
  // Add a pause function so the file does not get too long (makes editing easier as well)
  if (status.state == "paused") {
    var output = pause(status);
  } else {
    var output = play(status);
  }
  return output;
};
