// TODO: convert this to a typescript script

const fs = require('fs');
const path = require('path');
const { SourceMapConsumer, SourceMapGenerator } = require('source-map');

const distDir = path.resolve(__dirname, '..', 'dist');
const outputFile = path.join(distDir, 'merged-source-map.js.map');

async function mergeSourceMaps() {
  // Read all .map files in the dist directory
  const sourceMapFiles = fs.readdirSync(distDir)
    .filter(file => file.endsWith('.map'))
    .map(file => path.join(distDir, file));

  const mergedGenerator = new SourceMapGenerator();

  for (const file of sourceMapFiles) {
    const sourceMapContent = JSON.parse(fs.readFileSync(file, 'utf8'));
    const consumer = await new SourceMapConsumer(sourceMapContent);

    consumer.eachMapping(mapping => {
      if (mapping.source) {
        mergedGenerator.addMapping({
          generated: {
            line: mapping.generatedLine,
            column: mapping.generatedColumn
          },
          original: {
            line: mapping.originalLine,
            column: mapping.originalColumn
          },
          source: mapping.source,
          name: mapping.name
        });
      }
    });

    // Add the sources content
    consumer.sources.forEach((sourceFile) => {
      const content = consumer.sourceContentFor(sourceFile);
      if (content) {
        mergedGenerator.setSourceContent(sourceFile, content);
      }
    });

    consumer.destroy();
  }

  // Write the merged source map to a file
  fs.writeFileSync(outputFile, mergedGenerator.toString());

  console.log(`Merged source map written to ${outputFile}`);
}

mergeSourceMaps().catch(console.error);