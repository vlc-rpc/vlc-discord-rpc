# Shows and Movies
If you would like to display shows and movies as such, instead of a video, you will need to use our custom metadata script. 
1. Install [FFMPEG](https://www.ffmpeg.org/download.html)
2. Add [FFMPEG to PATH](https://www.hostinger.com/tutorials/how-to-install-ffmpeg).
3. Optional: Add your movie api key to `config.js`. Movies will be displayed as videos otherwise.
4. In the vlc-rpc project folder, change directories into the Metadata folder by using `cd Metadata` in the terminal/console.

## Option 1:
1. Run `node metadata.js`. This script will ask you for an input and output file and will need to be done for each file.
2. Fill in the prompts that it asks for with the correct information. For the movie/show name use the one found on IMDB. You generally do not need to worry about looking it up on IMDB, but if the show/movie is not found, check IMDB.

## Option 2:
1. Run `node metadata_folder.js`. This script will go through a folder and automatically set the output file to the input file with `_meta` appended. For example `bb.mkv` would be changed to `bb_meta.mkv`.
2. Fill in the prompts that it asks for with the correct information. For the movie/show name use the one found on IMDB. You generally do not need to worry about looking it up on IMDB, but if the show/movie is not found, check IMDB.

## Option 3:
1. Fill out the `shows` and `movies` options in the `directories` portion of `config.js` and fill out the `separator` field based on your file names.
2. Run `node metadata_auto.js`. This script will automatically go through a folder containing shows, or/and a folder containing movies and automatically add metadata to them.

### NOTE:
Files must contain the show or movie name, or else the script will not be able to automatically fill in the metadata correctly. Shows must also contain the season and episode number. Here are some examples that the script has been tested on:
- Breaking_Bad_S1E2.mkv
- Law.and.Order.Toronto.Criminal.Intent.S01E08.720p.mkv
- S.W.A.T.2017.S07E01.720p.mkv
- Shark.Tank.S15E04.720p.mkv
- The.Gentlemen.2024.S01E01.1080p.mkv
