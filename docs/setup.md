# Setup
1. Download the code from this repository, then unzip it.
2. Install [Node.js](https://nodejs.org/en/download). You must use version 17.5 at the minimum due to [fetch](https://nodejs.org/dist/latest-v18.x/docs/api/globals.html#fetch)!
3. In the storage folder, make a file called `config.js`, and copy over the contents of `example_config.js`.
4. Make an application and get your [Discord Application ID](https://discord.com/developers/applications). Set this as the `id` under `richPresenseSettings`.
5. Proceed to the next step if you would like to use spotify art, or just go to step 9. If you add your API key, which is free, it will allow your songs to have images, as shown in the above images.
6. OPTIONAL: Retrieve your [Spotify API information](https://developer.spotify.com/documentation/web-api/tutorials/getting-started). You will need the `clientID` and `clientSecret`.
7. In `./Storage/config.js` right before the `spotify` area, set useSpotify to true.
8. OPTIONAL: Add your [OMDb Api Key](https://www.omdbapi.com/apikey.aspx) as the `movieApiKey`. This will allow you to display movies as movies, instead of videos. 
9. Open a terminal, move to the folder you downloaded from this repository, and run `npm i` then run `node .`.

Note: If you don't want to have to rerun the command everytime you close/open VLC, view [Detached](./detached.html)

