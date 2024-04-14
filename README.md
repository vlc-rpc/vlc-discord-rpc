# VLC-RPC
Updated Discord rich presence for VLC media player.

This is a modified version of the [Pigpog/vlc-discord-rpc project](https://github.com/Pigpog/vlc-discord-rpc), which is no longer being actively maintained. We have updated and enhanced the project by adding new features, such as album and show covers. 

![image](https://user-images.githubusercontent.com/61550272/234398623-02c343fa-c500-421c-a7a8-cb4d33f88a81.png)
![image](https://user-images.githubusercontent.com/61550272/234403580-4a910bd7-41a5-4ceb-8a31-180c2efda417.png)


## Setup
1. Download the code from this repository, then unzip it.
2. Install [Node.js](https://nodejs.org/en/download).
3. Make an application and get your [Discord Application ID](https://discord.com/developers/applications).
4. Proceed to the next step if you would like to use spotify art, or just go to step 8.
5. OPTIONAL: Retrieve your [Spotify API key](https://developer.spotify.com/documentation/web-api/tutorials/getting-started). 
6. Add both of these values in the `./Storage/config.js` file under the `richPresenceSettings` and `spotify` area if you are choosing to use the album art.
7. In `./Storage/config.js` right before the `spotify` area, set useSpotify to true.
8. Open a terminal, move to the folder you downloaded from this repository, and run `npm i` then run `node .`.

## Detached State
1. Open VLC.
2. Select Tools in the top menu bar.
3. Select Preferences.
4. At the bottom left, select all.
5. Select Main Interfaces.
6. Check the box labelled Web.
7. Back where we selected Main Interfaces, select the caret next to it.
8. Select Lua.
9. Enter your configuration information into the bottom box.
10. Update any needed values in your config. Change detached to true. You MUST set your own password and make sure to include it in VLC.
11. Start VLC, then run the program as normal.
