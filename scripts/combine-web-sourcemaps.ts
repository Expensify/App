/* eslint-disable @typescript-eslint/await-thenable */
import fs from 'fs';
import path from 'path';
import type {RawSourceMap} from 'source-map';
import {SourceMapConsumer, SourceMapGenerator} from 'source-map';
import parseCommandLineArguments from './utils/parseCommandLineArguments';

const argsMap = parseCommandLineArguments();

const distDir = path.resolve(__dirname, '..', argsMap.path ?? 'dist');
const outputFile = path.join(distDir, 'merged-source-map.js.map');

async function mergeSourceMaps() {
    // Read all .map files in the dist directory
    const sourceMapFiles = fs
        .readdirSync(distDir)
        .filter((file) => file.endsWith('.map'))
        .map((file) => path.join(distDir, file));

    const mergedGenerator = new SourceMapGenerator();

    for (const file of sourceMapFiles) {
        const sourceMapContent = JSON.parse(fs.readFileSync(file, 'utf8')) as RawSourceMap;
        const consumer = await new SourceMapConsumer(sourceMapContent);

        consumer.eachMapping((mapping) => {
            if (!mapping.source) {
                return;
            }

            mergedGenerator.addMapping({
                generated: {
                    line: mapping.generatedLine,
                    column: mapping.generatedColumn,
                },
                original: {
                    line: mapping.originalLine,
                    column: mapping.originalColumn,
                },
                source: mapping.source,
                name: mapping.name,
            });
        });

        // Add the sources content
        consumer.sources.forEach((sourceFile: string) => {
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
