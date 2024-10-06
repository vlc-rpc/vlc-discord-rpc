import { maxRateLimitWait } from '../../Storage/config.js';

async function handleRateLimits(url, response) {
  // Set initial cooldown to the retry-after or 10 seconds
  let cooldown = response.headers.get('Retry-After') || 10000;
  if (cooldown > maxRateLimitWait) {
    return { 'response': null };
  }
  console.log(`WARNING: Rate limit hit making request to ${url}! Waiting for cooldown (${cooldown/1000}s)...`);
  await new Promise((resolve) => {return setTimeout(resolve, cooldown);});
  
  try {
    // First fetch request
    const imageResponse = await fetch(url);
  
    // Check if rate-limited
    if (imageResponse.status === 429) {
      console.log(`WARNING: Rate limit hit making request to ${url}! Waiting for cooldown (${cooldown/1000}s)...`);
  
      // Extend cooldown by 10 seconds
      cooldown += imageResponse.headers.get('Retry-After') || 10000;
      if (cooldown > maxRateLimitWait) {
        return { 'response': null };
      }
  
      // Wait for cooldown duration
      await new Promise((resolve) => {return setTimeout(resolve, cooldown);});
  
      // Retry fetch after cooldown
      const retryResponse = await fetch(url);
      if (!retryResponse.ok) {
        throw new Error(`Error after ${url} retry: ${retryResponse.status}. Please report this to the VLC-RPC developers.`);
      }
  
      console.log(`Successfully sent a request to ${url} after cooldown.`);
      return await retryResponse.json();
    }
  
    // If no rate limit, return the response data
    return await imageResponse.json();
  } catch (error) {
    console.error('Error during fetch:', error);
  }
}

export { handleRateLimits };
  