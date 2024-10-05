/* eslint no-unused-expressions: 0 */
// describe and it are undefined because Mocha uses them globally
import {  
  createReadline, directoryExists, extractMovieName, extractShowDetails, validateFileExtensions 
} from '../Metadata/metadata_functions.cjs';

import { expect } from 'chai';
import path from 'path';

describe('Name Cleaning', function() {
  describe('cleanName', function() {
    it('Should correctly get the Godzilla x Kong Movie Name', function() {
      const result = extractMovieName('Godzilla.x.Kong.The.New.Empire.mkv');
      expect(result).to.equal('Godzilla x Kong The New Empire');
    });
  });
  describe('Show Details Extraction', function() {
    it('Should correctly extract details from Breaking Bad episode', function() {
      const result = extractShowDetails('Breaking_Bad_S1E2.mkv');
      expect(result).to.deep.equal({
        showName: 'Breaking Bad',
        season: 1,
        episode: 2,
        episodeTitle: 'Unknown'
      });
    });
  
    it('Should correctly extract details from Law and Order Toronto Criminal Intent episode', function() {
      const result = extractShowDetails('Law.and.Order.Toronto.Criminal.Intent.S01E08.720p.mkv');
 
      expect(result).to.deep.equal({
        showName: 'Law and Order Toronto Criminal Intent',
        season: 1,
        episode: 8,
        episodeTitle: 'Unknown'
      });
    });
  
    it('Should correctly extract details from S.W.A.T. episode', function() {
      const result = extractShowDetails('S.W.A.T.2017.S07E01.720p.mkv');
 
      expect(result).to.deep.equal({
        showName: 'S W A T',
        season: 7,
        episode: 1,
        episodeTitle: 'Unknown'
      });
    });
  
    it('Should correctly extract details from Shark Tank episode', function() {
      const result = extractShowDetails('Shark.Tank.S15E04.720p.mkv');
 
      expect(result).to.deep.equal({
        showName: 'Shark Tank',
        season: 15,
        episode: 4,
        episodeTitle: 'Unknown'
      });
    });
  
    it('Should correctly extract details from The Gentlemen series', function() {
      const result = extractShowDetails('The.Gentlemen.2024.S01E01.1080p.mkv');
 
      expect(result).to.deep.equal({
        showName: 'The Gentlemen',
        season: 1,
        episode: 1,
        episodeTitle: 'Unknown'
      });
    });

    it('Should correctly extract details from the DP series', function() {
      const result = extractShowDetails('D.P.S01E01.A.Man.Holding.Flowers.DUAL-AUDIO.KOR-ENG.1080p.10bit.WEBRip.6CH.x265.HEVC-PSA.mkv');
 
      expect(result).to.deep.equal({
        showName: 'DP',
        season: 1,
        episode: 1,
        episodeTitle: 'A Man Holding Flowers'
      });
    });

    it('Should correctly extract details from the Azumanga Daioh series', function() {
      const result = extractShowDetails('Azumanga Daioh - S01E01.mp4');
 
      expect(result).to.deep.equal({
        showName: 'Azumanga Daioh',
        season: 1,
        episode: 1,
        episodeTitle: 'Unknown'
      });
    });

    it('Should correctly handle a non-existant show', function() {
      const result = extractShowDetails('SomeShowHere');
 
      expect(result).to.deep.equal({
        showName: 'SomeShowHere',
        season: 0,
        episode: 0,
        episodeTitle: 'Unknown'
      });
    });

    it('Should correctly handle a show without an episode or season number', function() {
      const result = extractShowDetails('Azumanga Daioh.mp4');
 
      expect(result).to.deep.equal({
        showName: 'Azumanga Daioh',
        season: 0,
        episode: 0,
        episodeTitle: 'Unknown'
      });
    });
  });
});

describe('Validate file extensions', function() {
  it('Should Correctly match mp4 file extensions', async function() {
    const result = await validateFileExtensions('input.mp4', 'output.mp4');

    // Expect the result to be the correct output file
    expect(result).to.deep.equal('output.mp4');
  });
});

describe('Create a readline interface', function() {
  it('Should Correctly create a readline interface', async function() {
    const rl = createReadline();
     
    expect(rl).is.not.null;
    rl.close();
  });
});

describe('Make sure directories exist', function() {
  it('Should return true for existing directory', async function() {
    const exists = await directoryExists(process.cwd());
    expect(exists).equals(true);
  });

  it('Should return false for a non-existant directory', async function() {
    const exists = await directoryExists(path.join(process.cwd(), '../abc'));
    expect(exists).equals(false);
  });
});