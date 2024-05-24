/* eslint-disable no-undef */
// describe and it are undefined because Mocha uses them globally
import { cleanName } from '../Metadata/metadata_functions.cjs';
import { expect } from 'chai';

describe('Name Cleaning', function() {
  describe('cleanName', function() {
    it('should clean the name for Breaking Bad episode', function() {
      const result = cleanName('Breaking_Bad_S1E2.mkv');
      expect(result).to.equal('Breaking Bad S1E2 mkv');
    });

    it('should clean the name for Law and Order Toronto Criminal Intent episode', function() {
      const result = cleanName('Law.and.Order.Toronto.Criminal.Intent.S01E08.720p.mkv');
      expect(result).to.equal('Law and Order Toronto Criminal Intent S01E08 mkv');
    });

    it('should clean the name for S.W.A.T. 2017 episode', function() {
      const result = cleanName('S.W.A.T.2017.S07E01.720p.mkv');
      expect(result).to.equal('S W A T');
    });

    it('should clean the name for Shark Tank episode', function() {
      const result = cleanName('Shark.Tank.S15E04.720p.mkv');
      expect(result).to.equal('Shark Tank S15E04 mkv');
    });

    it('should clean the name for The Gentlemen 2024 series', function() {
      const result = cleanName('The.Gentlemen.2024.S01E01.1080p.mkv');
      expect(result).to.equal('The Gentlemen');
    });
  });
});
