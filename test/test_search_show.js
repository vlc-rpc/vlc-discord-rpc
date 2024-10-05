/* eslint no-unused-expressions: 0 */
import { searchShow, searchShowMultipleResults } from '../Functions/Images/searchShow.js';
import { expect } from 'chai';

describe('Search for shows with searchShow', function() {
  it('It should correctly find a show', async function() {
    this.timeout(5000);
    const show = await searchShow('Breaking Bad');
    expect(show).is.not.null;
    expect(show.name).equals('Breaking Bad');
  });

  it('It should correctly handle a non-existant show', async function() {
    const show = await searchShow('Some made up show name');
    expect(show).is.null;
  });
});

describe('Search for shows with searchShowMultipleResults', function() {
  it('It should correctly find a show', async function() {
    const show = await searchShowMultipleResults('Breaking Bad');
    expect(show).is.not.null;
    expect(show.length > 1).is.true;
  });
  
  it('It should correctly handle a non-existant show', async function() {
    const show = await searchShowMultipleResults('Some made up show name');
    expect(show).is.null;
  });
});