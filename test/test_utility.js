import { checkDetailLength, setSmallImageKey } from "../Functions/utilityFunctions.js";
import { expect } from "chai";
import { iconNames } from "../Storage/config.js";

describe('Return details object of appropriate length', function() {

  it('should correctly return "Unknown" for an empty string', async function() {
    const details = checkDetailLength("");
    expect(details).to.equal("Unknown");
  });

  it('should correctly return "Unknown" for null', async function() {
    const details = checkDetailLength(null);
    expect(details).to.equal("Unknown");
  });

  it('should return the same string if the length is between 2 and 125 characters', async function() {
    const input = "This is a valid string";
    const details = checkDetailLength(input);
    expect(details).to.equal(input);
  });

  it('should truncate the string if the length is greater than 125 characters', async function() {
    const input = "a".repeat(130);
    const expected = "a".repeat(125) + "...";
    const details = checkDetailLength(input);
    expect(details).to.equal(expected);
  });

  it('should pad the string with dots if the length is less than 2 characters', async function() {
    const details = checkDetailLength("a");
    expect(details).to.equal("a.");
  });

  it('should not modify the string if it is exactly 2 characters long', async function() {
    const details = checkDetailLength("ab");
    expect(details).to.equal("ab");
  });

  it('should handle non-string values (like numbers) gracefully by returning "Unknown"', async function() {
    const details = checkDetailLength(123);
    expect(details).to.equal("Unknown");
  });

  it('should return "Unknown" if details is an empty array', async function() {
    const details = checkDetailLength([]);
    expect(details).to.equal("Unknown");
  });

  it('should correctly handle objects by returning "Unknown"', async function() {
    const details = checkDetailLength({});
    expect(details).to.equal("Unknown");
  });
});

describe('It should correctly set the small image', function() {
  it("Should correctly return the playing image", async function() {
    const status = {"state": "playing"};
    const smallImage = setSmallImageKey(status);
    expect(smallImage).to.be.equal(iconNames.playing);
  });

  it("Should correctly return the paused image", async function() {
    const status = {"state": "paused"};
    const smallImage = setSmallImageKey(status);
    expect(smallImage).to.be.equal(iconNames.pause);
  });

  it("Should correctly return the paused image", async function() {
    const status = {"state": "unknown"};
    const smallImage = setSmallImageKey(status);
    expect(smallImage).to.be.equal(iconNames.vlc);
  });
});