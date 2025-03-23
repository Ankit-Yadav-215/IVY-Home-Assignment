# Autocomplete API Extraction Tool

This tool efficiently extracts and compiles dictionaries from an autocomplete API by systematically querying all possible word combinations within defined character sets.

## API Endpoints

The autocomplete API provides three different endpoints, each with increasing capabilities:

- **v1**: Returns only alphabetic words (max 10 results per query)
- **v2**: Returns words with both letters and numbers (max 12 results per query)
- **v3**: Returns words with letters, numbers, and special characters including spaces (max 15 results per query)

## Getting Started

### Prerequisites

- Node.js (v12 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/autocomplete-extractor.git
cd autocomplete-extractor
```

2. Install dependencies:
```bash
npm install
```

### Usage

Run the extraction tool:
```bash
node runner.js
```

This will:
- Run extractions for all three API versions
- Save results to individual JSON files (`results_v1.json`, `results_v2.json`, `results_v3.json`)
- Create a summary report (`extraction_summary.json`)

## Optimization Techniques

The extraction process employs several optimization strategies to efficiently explore the vast search space while respecting API rate limits:

### ✅ 1. Memoization (Avoid Repeating API Calls)
* Before making an API request, we check if the prefix has already been queried
* **Speeds up execution by eliminating redundant queries**

### ✅ 2. Parallel Requests Using Batching (Concurrency)
* Instead of **waiting for one request at a time**, we send up to **5 requests concurrently**
* **Drastically reduces execution time by 80%+** compared to naive sequential execution

### ✅ 3. Smart Prefix Pruning
* If a prefix yields **less than the maximum possible results**, **further expansion is stopped**
* **Reduces total number of API calls significantly** by skipping unnecessary prefixes

### ✅ 4. Exponential Backoff for Rate Limiting
* Automatically handles rate limiting with intelligent retry logic
* Gradually increases wait time between retries to respect server constraints

## Configuration

You can modify extraction parameters in `api-config.js`:

```javascript
module.exports = {
  // API URLs for different versions
  API_URLS: {
    v1: 'http://35.200.185.69:8000/v1/autocomplete?query=',
    v2: 'http://35.200.185.69:8000/v2/autocomplete?query=',
    v3: 'http://35.200.185.69:8000/v3/autocomplete?query='
  },
  
  // Character sets for each version
  ALPHABETS: {
    v1: 'abcdefghijklmnopqrstuvwxyz',
    v2: 'abcdefghijklmnopqrstuvwxyz1234567890',
    v3: 'abcdefghijklmnopqrstuvwxyz1234567890>.<,?!@#$%^&*()_+-=[]{}|;: '
  },
  
  // Common parameters
  MAX_LENGTH: 3,               // Maximum prefix length to explore
  RATE_LIMIT_DELAY: 600,       // Delay between requests (ms)
  MAX_RETRIES: 5,              // Maximum retry attempts
  MAX_CONCURRENT_REQUESTS: 5,  // Concurrent requests limit
  MAX_RESULTS_PER_CALL: 15     // Maximum results per API call
};
```

## Project Structure

- `api-config.js` - Configuration parameters for all API versions
- `extractor.js` - Core extraction logic
- `runner.js` - Main script to run extractions

## License

This project is licensed under the MIT License - see the LICENSE file for details.
