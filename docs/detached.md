# Detached State

## Tired of not being able to close and open VLC without restarting?

1. Open VLC.
2. Select Tools in the top menu bar.
3. Select Preferences.
4. At the bottom left, select all.
5. Select Main Interfaces.
6. Check the box labelled Web.
7. Back where we selected Main Interfaces, select the caret next to it.
8. Select Lua.
9. Enter a password into the Lua HTTP box. It does not matter what this is, but you will need to add it to your `config.js`.
10. Make sure you have done the normal setup steps.
11. In your `config.js`, change detached to true. You MUST set your own password and make sure to include it in VLC.
12. Start VLC, then run the program as normal. You may open and close VLC, but be sure to keep the terminal running the command!

<div align="center">
  <img src="https://github.com/vlc-rpc/vlc-discord-rpc/assets/61550272/4aa489d9-269c-4333-b595-bb3d0444fa24" alt="Detached State Image 1">
</div>

<div align="center">
  <img src="https://github.com/vlc-rpc/vlc-discord-rpc/assets/61550272/292e8748-b6c6-4ff8-88a5-225e5dd2b467" alt="Detached State Image 2">
</div>

Note: Do not touch the port or address unless you know what you are doing! 8080 is VLC's default HTTP port. 
