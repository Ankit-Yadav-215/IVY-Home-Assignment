// api-config.js
module.exports = {
    // API URLs for different versions
    API_URLS: {
      v1: 'http://35.200.185.69:8000/v1/autocomplete?query=',
      v2: 'http://35.200.185.69:8000/v2/autocomplete?query=',
      v3: 'http://35.200.185.69:8000/v3/autocomplete?query='
    },
    
    // Alphabet configurations for each version
    ALPHABETS: {
      v1: 'abcdefghijklmnopqrstuvwxyz',
      v2: 'abcdefghijklmnopqrstuvwxyz1234567890',
      v3: 'abcdefghijklmnopqrstuvwxyz1234567890>.<,?!@#$%^&*()_+-=[]{}|;: '
    },
    
    // Common configuration parameters
    MAX_LENGTH: 3,
    RATE_LIMIT_DELAY: 600,
    MAX_RETRIES: 5,
    MAX_CONCURRENT_REQUESTS: 5,
    MAX_RESULTS_PER_CALL: 15
  };