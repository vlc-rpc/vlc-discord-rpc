async function fetchStuff(showName) {
  const showURL = `http://api.tvmaze.com/search/shows?q=${showName}`;
  console.log(showURL);
  const response = await fetch(showURL);
  console.log(response);
}

fetchStuff("Breaking Bad");