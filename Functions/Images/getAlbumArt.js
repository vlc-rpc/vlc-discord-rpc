const config = require("../../Storage/config.js");

const axios = require("axios");

// Spotify API endpoint for searching albums
const url = "https://api.spotify.com/v1/search";

// Your Spotify app client ID and client secret
const client_id = config.spotify.clientID;
const client_secret = config.spotify.clientSecret;

// Base64-encoded string of the form "client_id:client_secret"
const credentials = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

// Function to search for an album by name and retrieve its cover image
async function getAlbumArt(albumName) {
  try {
    // Make POST request to obtain an access token using the Client Credentials Flow
    const tokenResponse = await axios.post("https://accounts.spotify.com/api/token", "grant_type=client_credentials", {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // Extract the access token from the response
    const access_token = tokenResponse.data.access_token;

    // Set headers with access token for authorization
    const headers = {
      Authorization: `Bearer ${access_token}`,
    };

    // Make GET request to search for the album
    const response = await axios.get(url, {
      headers: headers,
      params: {
        q: albumName,
        type: "album",
      },
    });

    // Extract the first album from the response
    const album = response.data.albums.items[0];

    // Return the album cover image URL
    return album.images[0].url;
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = { getAlbumArt };
