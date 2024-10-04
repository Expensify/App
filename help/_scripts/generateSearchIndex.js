const FlexSearch = require('flexsearch');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Function to create the index from HTML files in '_site' directory
async function createIndex() {
  console.log("Initializing FlexSearch index...");
  let index;
  try {
    index = new FlexSearch.Document({
      document: {
        id: 'id',
        index: ['content'], // Index on the content field
        store: ['title', 'url', 'content'] // Store title, URL, and content
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

  // Process each HTML file and add sections to the index
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

        // Generate a URL for the section using the file path and a unique id based on the header
        let sectionId;
        if (elem.tagName === 'h1' && i === 0) {
          // If it's the first <h1> tag, use the root URL (no fragment)
          sectionId = '';
        } else {
          // Otherwise, generate an ID based on the element's position or existing ID
          sectionId = $(elem).attr('id') || `${file}-section-${i}`;
          $(elem).attr('id', sectionId); // Ensure the section has an id attribute
        }
        const sectionUrl = sectionId ? `${file}#${sectionId}` : `${file}#`;

        console.log(`Found section: <${elem.tagName}> ${title} (${fullContent.length} characters)`);

        // Add the section to the index with the section's URL, title, and content
        index.add({
          id: `${file}-${i}`,
          title,
          url: sectionUrl,
          content: fullContent
        });
        console.log(`Index entry added for section in file ${file}`);
      });
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
      process.exit(1);
    }
  });

  // Export the index as a JSON file
  console.log("Exporting search index as JSON...");
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
      console.log("Index exported successfully.");

      // Write the exported index to a JSON file
      const outputPath = path.join(dir, 'searchIndex.json');
      console.log("Writing search index to JSON file:", outputPath);
      const outputContent = JSON.stringify(exportedIndex, null, 2);

      fs.writeFileSync(outputPath, outputContent);
      console.log("Search index written to JSON file successfully.");
    }
  } catch (error) {
    console.error("Error exporting search index:", error);
    process.exit(1);
  }
}

// Function to read and search the index with context and section title
async function searchIndex() {
  console.log("\n--- Running Search Test ---");
  const indexPath = path.join(__dirname, '../_site', 'searchIndex.json');
  console.log("Loading search index from file:", indexPath);
  let searchIndex;
  try {
    const indexFile = fs.readFileSync(indexPath, 'utf8');
    searchIndex = JSON.parse(indexFile);
    console.log("Search index loaded successfully. Number of entries:", Object.keys(searchIndex).length);
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
        store: ['title', 'url', 'content']
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
      results.forEach(result => {
        result.result.forEach(docId => {
          const doc = index.store[docId];
          if (doc && doc.content) {  // Ensure doc and doc.content are defined
            const content = doc.content;
            const searchTermIndex = content.toLowerCase().indexOf('superapp');

            if (searchTermIndex !== -1) {
              // Extract context around the search term (30 characters before and after)
              const contextBefore = content.substring(Math.max(0, searchTermIndex - 30), searchTermIndex);
              const contextAfter = content.substring(searchTermIndex + 'superapp'.length, Math.min(content.length, searchTermIndex + 'superapp'.length + 30));

              // Print the section title, URL, and context
              console.log(`Section Title: ${doc.title}`);
              console.log(`URL: ${doc.url}`);
              console.log(`Context: ...${contextBefore}superapp${contextAfter}...`);
              console.log();  // Add an empty line for better readability
            } else {
              console.warn(`Warning: Search term 'superapp' not found in document ID: ${docId}`);
            }
          } else {
            console.warn(`Warning: Document content not found for ID: ${docId}`);
          }
        });
      });
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

