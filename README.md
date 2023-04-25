# VLC-RPC
This is a modified version of the [Pigpog/vlc-discord-rpc project](https://github.com/Pigpog/vlc-discord-rpc), which is no longer being actively maintained. We have updated and enhanced the project by adding new features, such as album and show covers. 

1. Download the code from this repository, then unzip it.
2. Install [Node.js](https://nodejs.org/en/download).
3. Make an application and get your [Discord Application ID](https://discord.com/developers/applications).
4. Upload your icons to the application by clicking on `Rich Presence` and then `Art Assets`.
5. Retrieve your [Spotify APi key](https://developer.spotify.com/documentation/web-api/tutorials/getting-started).
6. Add both of these values in the `./Storage/config.js` file under the `richPresenceSettings` and `spotify` area.
7. If the names you chose in step 2, change them under the iconNames area to be exactly how you named them.
8. Open a terminal, move to the folder you downloaded from this repository, and run `npm i` then run `node .`.

