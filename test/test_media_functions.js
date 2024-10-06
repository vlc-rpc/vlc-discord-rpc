import { handleMovie, handleMusic, handleShow } from '../Functions/mediaFunctions.js';
import { expect } from 'chai';

describe('Correctly return media information', function() {

  // Test for handling a show
  it('Should correctly return an existing show', async function() {
    this.timeout(5000);
    const meta = {
      'showName': 'Breaking Bad',
      'track_total': '',
      'episodeNumber': '02',
      'copyright': '',
      'description': 'S:1 E:1',
      'artist': '',
      'seasonNumber': '01',
      'album': '',
      'publisher': '',
      'title': 'Breaking Bad - S01E02 - Cat\'s in the Bag…',
      'date': '',
      'genre': 'show',
      'track_number': '',
      'language': ''
    };
    const state = { 'state': 'playing' };
    
    const data = await handleShow(meta, state);

    expect(data).to.deep.equal({
      'details': 'Breaking Bad - S01E02 - Cat\'s in the Bag…',
      'image': 'https://static.tvmaze.com/uploads/images/original_untouched/0/2400.jpg',
      'state': ' Season 1 - Episode 1'
    }); 
  });

  // Test for handling a show
  it('Should correctly return an existing show without a description', async function() {
    this.timeout(5000);
    const meta = {
      'showName': 'Breaking Bad',
      'track_total': '',
      'episodeNumber': '02',
      'copyright': '',
      'description': '',
      'artist': '',
      'seasonNumber': '01',
      'album': '',
      'publisher': '',
      'title': 'Breaking Bad - S01E02 - Cat\'s in the Bag…',
      'date': '',
      'genre': 'show',
      'track_number': '',
      'language': ''
    };
    const state = { 'state': 'playing' };
      
    const data = await handleShow(meta, state);
  
    expect(data).to.deep.equal({
      'details': 'Breaking Bad - S01E02 - Cat\'s in the Bag…',
      'image': 'https://static.tvmaze.com/uploads/images/original_untouched/0/2400.jpg',
      'state': 'Unknown Episode'
    }); 
  });

  // Test for handling a show
  it('Should correctly return an existing show with a nonsense description', async function() {
    this.timeout(5000);
    const meta = {
      'showName': 'Breaking Bad',
      'track_total': '',
      'episodeNumber': '02',
      'copyright': '',
      'description': 'adwdwadwafawdaad',
      'artist': '',
      'seasonNumber': '01',
      'album': '',
      'publisher': '',
      'title': 'Breaking Bad - S01E02 - Cat\'s in the Bag…',
      'date': '',
      'genre': 'show',
      'track_number': '',
      'language': ''
    };
    const state = { 'state': 'playing' };
        
    const data = await handleShow(meta, state);
    
    expect(data).to.deep.equal({
      'details': 'Breaking Bad - S01E02 - Cat\'s in the Bag…',
      'image': 'https://static.tvmaze.com/uploads/images/original_untouched/0/2400.jpg',
      'state': 'Unknown Episode'
    }); 
  });

  // Test for handling a show
  it('Should correctly return an existing show with a Description (capital D)', async function() {
    this.timeout(5000);
    const meta = {
      'showName': 'Breaking Bad',
      'track_total': '',
      'episodeNumber': '02',
      'copyright': '',
      'Description': 'S:1 E:1',
      'artist': '',
      'seasonNumber': '01',
      'album': '',
      'publisher': '',
      'title': 'Breaking Bad - S01E02 - Cat\'s in the Bag…',
      'date': '',
      'genre': 'show',
      'track_number': '',
      'language': ''
    };
    const state = { 'state': 'playing' };
          
    const data = await handleShow(meta, state);
      
    expect(data).to.deep.equal({
      'details': 'Breaking Bad - S01E02 - Cat\'s in the Bag…',
      'image': 'https://static.tvmaze.com/uploads/images/original_untouched/0/2400.jpg',
      'state': ' Season 1 - Episode 1'
    }); 
  });

  // Test for handling a movie
  it('Should correctly return an existing movie', async function() {
    this.timeout(5000);
    const meta = { 'title': 'Inception' };
    const state = { 'state': 'playing' };
    
    const data = await handleMovie(meta, state);

    expect(data).to.deep.equal({
      'details': 'Inception',
      'image': 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
      'state': '2010'
    });
  });

  // Test for handling music
  it('Should correctly return an existing song', async function() {
    this.timeout(5000);
    const meta = {
      'ISRC': 'USQX91702676',
      'PUBLISHER': 'Disruptor Records/Columbia',
      'date': '2018-12-14',
      'track_number': '6',
      'track_total': '10',
      'filename': '06. Sick Boy.flac',
      'LENGTH': '193000',
      'COMPOSER': 'Emily Warren',
      'SOURCEMEDIA': 'PMEDIA',
      'RELEASECOUNTRY': 'PMEDIA',
      'BARCODE': '886447471074',
      'copyright': 'PMEDIA',
      'artwork_url': 'file:///C:/Users/lauren/AppData/Roaming/vlc/art/artistalbum/The%20Chainsmokers/Sick%20Boy/art.jpg',
      'artist': 'The Chainsmokers',
      'ENCODED-BY': 'PMEDIA',
      'album': 'Sick Boy',
      'ENCODERSETTINGS': 'PMEDIA',
      'title': 'Sick Boy',
      'ITUNESADVISORY': '0',
      'WORK': 'PMEDIA',
      'DISCNUMBER': '1',
      'genre': 'Dance',
      'ALBUMARTIST': 'The Chainsmokers'
    };
    
    const state = { 'state': 'playing' };

    const data = await handleMusic(meta, state);

    expect(data).to.deep.equal({
      'details': 'Sick Boy',
      'image': 'https://i.scdn.co/image/ab67616d0000b2738e26bf4293c9da7a6439607b',
      'partyMax': 10,
      'partySize': 6,
      'state': 'The Chainsmokers | Sick Boy'
    });
  });

  // Test for when no valid show is found
  it('Should return an error for non-existing show', async function() {
    this.timeout(5000);
    const meta = { 'title': 'fdawfawfwafwafwawfa' };
    const state = { 'state': 'stopped' };

    try {
      await handleShow(meta, state);
    } catch (error) {
      expect(error.message).to.equal('Show not found');
    }
  });

  // Test for when no valid movie is found
  it('Should return an error for non-existing movie', async function() {
    this.timeout(5000);
    const meta = { 'title': 'fdawfawfwafwafwawfa' };
    const state = { 'state': 'stopped' };

    try {
      await handleMovie(meta, state);
    } catch (error) {
      expect(error.message).to.equal('Movie not found');
    }
  });

  // Test for when no valid music is found
  it('Should return an error for non-existing song', async function() {
    this.timeout(5000);
    const meta = { 'title': 'fdawfawfwafwafwawfa', 'artist': 'awdkjjwaijfijwafijfwijaji' };
    const state = { 'state': 'stopped' };

    try {
      await handleMusic(meta, state);
    } catch (error) {
      expect(error.message).to.equal('Song not found');
    }
  });

});
