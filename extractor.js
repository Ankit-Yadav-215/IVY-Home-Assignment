// autocomplete-extractor.js
const axios = require('axios');
const fs = require('fs');
const config = require('./api-config');

class AutocompleteExtractor {
  constructor(version) {
    if (!['v1', 'v2', 'v3'].includes(version)) {
      throw new Error('Invalid API version. Must be v1, v2, or v3');
    }
    
    this.version = version;
    this.API_URL = config.API_URLS[version];
    this.ALPHABET = config.ALPHABETS[version];
    this.MAX_LENGTH = config.MAX_LENGTH;
    this.RATE_LIMIT_DELAY = config.RATE_LIMIT_DELAY;
    this.MAX_RETRIES = config.MAX_RETRIES;
    this.MAX_CONCURRENT_REQUESTS = config.MAX_CONCURRENT_REQUESTS;
    this.MAX_RESULTS_PER_CALL = config.MAX_RESULTS_PER_CALL;
    
    this.apiCalls = 0;
    this.uniqueWords = new Set();
    this.memoizationCache = new Map();
  }
  
  // Sleep function for rate limiting
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Function to fetch autocomplete results with memoization & exponential backoff
  async fetchAutocomplete(prefix, retries = 0) {
    if (this.memoizationCache.has(prefix)) {
      return this.memoizationCache.get(prefix); // Return cached result
    }
    
    try {
      await this.sleep(this.RATE_LIMIT_DELAY); // Control request pacing
      const response = await axios.get(this.API_URL + encodeURIComponent(prefix));
      this.apiCalls++;
      
      let words = response.data.results || [];
      this.memoizationCache.set(prefix, words); // Cache results
      words.forEach(word => this.uniqueWords.add(word));
      
      return words;
    } catch (error) {
      if (error.response && error.response.status === 429 && retries < this.MAX_RETRIES) {
        let waitTime = this.RATE_LIMIT_DELAY * (retries + 1);
        console.warn(`Rate limited on prefix "${prefix}" (${this.version}). Retrying in ${waitTime}ms...`);
        await this.sleep(waitTime);
        return this.fetchAutocomplete(prefix, retries + 1);
      } else {
        console.error(`Error fetching for prefix '${prefix}' (${this.version}):`, error.message);
        return [];
      }
    }
  }
  
  // Function to generate combinations efficiently with parallel API calls
  async exploreAutocomplete() {
    let queue = this.ALPHABET.split(''); // Start with single letters
    
    while (queue.length > 0) {
      let batch = queue.splice(0, this.MAX_CONCURRENT_REQUESTS); // Process in parallel batches
      let results = await Promise.all(batch.map(prefix => this.fetchAutocomplete(prefix)));
      
      results.forEach((words, index) => {
        let prefix = batch[index];
        // Expand only if results suggest more possibilities
        if (words.length === this.MAX_RESULTS_PER_CALL && prefix.length < this.MAX_LENGTH) {
          this.ALPHABET.split('').forEach(letter => {
            queue.push(prefix + letter);
          });
        }
      });
      
      // Enforce rate limits
      if (this.apiCalls % this.MAX_CONCURRENT_REQUESTS === 0) {
        await this.sleep(this.RATE_LIMIT_DELAY);
      }
    }
  }
  
  // Run the extraction and save results
  async run() {
    console.log(`Starting API calls for ${this.version} with alphabet: ${this.ALPHABET.substring(0, 20)}${this.ALPHABET.length > 20 ? '...' : ''}`);
    
    const startTime = Date.now();
    await this.exploreAutocomplete();
    const endTime = Date.now();
    
    console.log(`${this.version} extraction completed in ${(endTime - startTime) / 1000} seconds`);
    console.log(`API calls made: ${this.apiCalls}`);
    console.log(`Unique words collected: ${this.uniqueWords.size}`);
    
    fs.writeFileSync(`results_${this.version}.json`, JSON.stringify([...this.uniqueWords], null, 2));
    console.log(`Results saved to results_${this.version}.json`);
    
    return {
      version: this.version,
      apiCalls: this.apiCalls,
      uniqueWordsCount: this.uniqueWords.size,
      words: [...this.uniqueWords]
    };
  }
}

module.exports = AutocompleteExtractor;