/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import { fetchMovieData } from '../Functions/Images/searchMovie.js';

describe('Search for movies', function() {
  it('It should correctly find a movie', async function() {
    this.timeout(5000);
    const movie = await fetchMovieData('Deadpool');
    expect(movie).is.not.null;
    expect(movie.Response).equal('True');
    expect(movie.Search.length > 1);
  });

  it('It should handle a non-existant movie', async function() {
    const movie = await fetchMovieData('dawfafawfawfggwgfagwwagwg');
    expect(movie).is.not.null;
    expect(movie.Response).equal('False');
    expect(movie.Search).is.undefined;
  });
});