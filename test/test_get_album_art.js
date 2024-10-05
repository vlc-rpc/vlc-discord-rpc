/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import { getAlbumArtArchive } from '../Functions/Images/getAlbumArt.js';

describe('Custom Album Art Retrieval', function() {
  it('should retrieve custom album artwork URL if available', async function() {
    this.timeout(5000);
    const url = await getAlbumArtArchive('21', 'Adele');
    expect(url).to.be.not.null;
  });

  it('should return null if custom album artwork is not available', async function() {
    this.timeout(5000);
    const url = await getAlbumArtArchive('UnknownAlbum', 'Someone');
    expect(url).to.be.null; 
  });
});
