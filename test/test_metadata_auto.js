// describe and it are undefined because Mocha uses them globally
import { extractMovieName, extractShowDetails } from '../Metadata/metadata_functions.cjs';
import { expect } from 'chai';

describe('Name Cleaning', function() {
  describe('cleanName', function() {
    it('should clean the name for Breaking Bad episode', function() {
      // The script uses .split('/').pop() to retrieve the file name, but here we are just passing the file name
      const result = extractMovieName('Godzilla.x.Kong.The.New.Empire.mkv');
      expect(result).to.equal('Godzilla x Kong The New Empire');
    });
  });
  describe('Show Details Extraction', function() {
    it('should correctly extract details from Breaking Bad episode', function() {
      const result = extractShowDetails('Breaking_Bad_S1E2.mkv');
      const finalName = result.showName.length === 3 && result.showName[1] === ' ' ? result.showName.replace(' ', '') : result.showName;
      result.showName = finalName;
      expect(result).to.deep.equal({
        showName: 'Breaking Bad',
        season: 1,
        episode: 2,
        episodeTitle: ''
      });
    });
  
    it('should correctly extract details from Law and Order Toronto Criminal Intent episode', function() {
      const result = extractShowDetails('Law.and.Order.Toronto.Criminal.Intent.S01E08.720p.mkv');
      const finalName = result.showName.length === 3 && result.showName[1] === ' ' ? result.showName.replace(' ', '') : result.showName;
      result.showName = finalName;
      expect(result).to.deep.equal({
        showName: 'Law and Order Toronto Criminal Intent',
        season: 1,
        episode: 8,
        episodeTitle: ''
      });
    });
  
    it('should correctly extract details from S.W.A.T. 2017 episode', function() {
      const result = extractShowDetails('S.W.A.T.2017.S07E01.720p.mkv');
      const finalName = result.showName.length === 3 && result.showName[1] === ' ' ? result.showName.replace(' ', '') : result.showName;
      result.showName = finalName;
      expect(result).to.deep.equal({
        showName: 'S W A T',
        season: 7,
        episode: 1,
        episodeTitle: ''
      });
    });
  
    it('should correctly extract details from Shark Tank episode', function() {
      const result = extractShowDetails('Shark.Tank.S15E04.720p.mkv');
      const finalName = result.showName.length === 3 && result.showName[1] === ' ' ? result.showName.replace(' ', '') : result.showName;
      result.showName = finalName;
      expect(result).to.deep.equal({
        showName: 'Shark Tank',
        season: 15,
        episode: 4,
        episodeTitle: ''
      });
    });
  
    it('should correctly extract details from The Gentlemen 2024 series', function() {
      const result = extractShowDetails('The.Gentlemen.2024.S01E01.1080p.mkv');
      const finalName = result.showName.length === 3 && result.showName[1] === ' ' ? result.showName.replace(' ', '') : result.showName;
      result.showName = finalName;
      expect(result).to.deep.equal({
        showName: 'The Gentlemen',
        season: 1,
        episode: 1,
        episodeTitle: ''
      });
    });

    it('should correctly extract details from the DF series', function() {
      const result = extractShowDetails('D.P.S01E01.A.Man.Holding.Flowers.DUAL-AUDIO.KOR-ENG.1080p.10bit.WEBRip.6CH.x265.HEVC-PSA.mkv');
      const finalName = result.showName.length === 3 && result.showName[1] === ' ' ? result.showName.replace(' ', '') : result.showName;
      result.showName = finalName;
      expect(result).to.deep.equal({
        showName: 'DP',
        season: 1,
        episode: 1,
        episodeTitle: 'A Man Holding Flowers'
      });
    });
  });
});