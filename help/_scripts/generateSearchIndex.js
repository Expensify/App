// Simplified script to index HTML files from the '_site' directory with FlexSearch and Cheerio
const FlexSearch = require('flexsearch');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Function to create index from HTML files in '_site' directory
async function createIndex() {
  console.log("Initializing FlexSearch index...");
  let index;
  try {
    index = new FlexSearch.Document({
      document: {
        id: 'id',
        index: ['content'],
        store: ['title', 'path', 'id']
      }
    });
    console.log("FlexSearch index initialized successfully.");
  } catch (error) {
    console.error("Error initializing FlexSearch index:", error);
    process.exit(1);
  }

  // Read HTML files from the '_site' directory
  const dir = path.join(__dirname, '../_site');
  console.log("Reading HTML files from directory:", dir);
  let htmlFiles;
  try {
    htmlFiles = fs.readdirSync(dir).filter(file => file.endsWith('.html'));
    console.log("HTML files found:", htmlFiles);
  } catch (error) {
    console.error("Error reading directory:", error);
    process.exit(1);
  }

  // Process each HTML file and add content to the index
  htmlFiles.forEach((file, id) => {
    console.log("Processing file:", file);
    try {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      const $ = cheerio.load(content);

      // Extract sections with <h1>, <h2>, <h3> tags and add to index
      $('h1, h2, h3').each((i, elem) => {
        const title = $(elem).text().trim();
        const sectionContent = $(elem).nextUntil('h1, h2, h3').text().trim();
        const fullContent = `${title} ${sectionContent}`;
        console.log(`Found section: <${elem.tagName}> ${title} (${fullContent.length} characters)`);

        index.add({
          id: `${file}-${i}`,
          title,
          path: file,
          content: fullContent
        });
        console.log(`Index entry added for section in file ${file}`);
      });
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
      process.exit(1);
    }
  });

  // Export the index manually
  console.log("Exporting search index manually...");
  let exportedIndex = {};
  try {
    await index.export((key, data) => {
      if (data) {
        exportedIndex[key] = data;
      }
    });
    if (Object.keys(exportedIndex).length === 0) {
      console.warn("Warning: Exported index is empty.");
      process.exit(1);
    } else {
      console.log("Manually exported index successfully.");

      // Write the exported index to a file
      const outputPath = path.join(dir, 'searchIndex.js');
      console.log("Writing manually exported index to file:", outputPath);
      const outputContent = `module.exports = ${JSON.stringify(exportedIndex, null, 2)};`;

      fs.writeFileSync(outputPath, outputContent);
      console.log("Search index written to file successfully.");
    }
  } catch (error) {
    console.error("Error exporting search index:", error);
    process.exit(1);
  }
}

// Function to read and search the index
async function searchIndex() {
  console.log("\n--- Running Search Test ---");
  const indexPath = path.join(__dirname, '../_site', 'searchIndex.js');
  console.log("Loading search index from file:", indexPath);
  let searchIndex;
  try {
    searchIndex = require(indexPath);
    console.log("Search index loaded successfully. Number of characters loaded:", JSON.stringify(searchIndex).length);
  } catch (error) {
    console.error("Error loading search index from file:", error);
    process.exit(1);
  }

  // Initialize a new search index instance with loaded data
  let index;
  try {
    index = new FlexSearch.Document({
      document: {
        id: 'id',
        index: ['content'],
        store: ['title', 'path', 'id']
      }
    });

    // Import each key and corresponding data
    for (const [key, data] of Object.entries(searchIndex)) {
      await index.import(key, data);
    }

    console.log("Search index imported successfully.");
  } catch (error) {
    console.error("Error initializing or importing search index:", error);
    process.exit(1);
  }

  // Perform a search test
  console.log("Searching for the term 'superapp' in the index...");
  try {
    const results = await index.search({
      query: 'superapp',
      field: 'content'
    });
    if (results && results.length > 0) {
      console.log("Search results found:", JSON.stringify(results, null, 2));
    } else {
      console.warn("Warning: No search results found.");
      process.exit(1);
    }
  } catch (error) {
    console.error("Error searching the index:", error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the main functions
(async () => {
  await createIndex();
  await searchIndex();
})();
