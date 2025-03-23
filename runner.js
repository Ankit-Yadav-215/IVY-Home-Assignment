// run-extraction.js
const AutocompleteExtractor = require('./extractor');
const fs = require('fs');

async function runAllExtractions() {
  console.log('Starting autocomplete dictionary extraction for all API versions...');
  console.log('======================================================');
  
  const results = {};
  
  // Run extraction for each API version
  for (const version of ['v1', 'v2', 'v3']) {
    try {
      const extractor = new AutocompleteExtractor(version);
      const result = await extractor.run();
      
      results[version] = {
        wordCount: result.uniqueWordsCount,
        apiCalls: result.apiCalls
      };
      
      console.log('======================================================');
    } catch (error) {
      console.error(`Error running extraction for ${version}:`, error.message);
    }
  }
  
  // Save summary report
  const summary = {
    timestamp: new Date().toISOString(),
    results
  };
  
  fs.writeFileSync('extraction_summary.json', JSON.stringify(summary, null, 2));
  console.log('Extraction complete! Summary saved to extraction_summary.json');
}

runAllExtractions().catch(err => {
  console.error('Fatal error in extraction process:', err);
  process.exit(1);
});