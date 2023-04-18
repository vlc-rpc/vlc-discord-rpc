/**
 * Description: Pause or playing?
 */

const { pause } = require("./States/paused.js");
const { play } = require("./States/playing.js");

module.exports = async (status) => {
  if (status.state == "paused") {
    var output = pause(status);
  } else {
    var output = play(status);
  }
  return output;
};
