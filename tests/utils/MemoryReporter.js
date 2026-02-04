const fs = require('fs');
const path = require('path');

/**
 * Simple Jest reporter that records RSS memory after each test file.
 * Produces an array of {path, rssMB, deltaMB} entries.
 * Use with --reporters=./tests/utils/MemoryReporter.js and optionally pass
 * --reporterOptions output=jest-memory.json to change the output filename.
 */
class MemoryReporter {
    constructor(globalConfig, options) {
        this.results = [];
        const requestedOutput = options?.output;
        const envOutput = process.env.JEST_MEMORY_OUTPUT || process.env.MEMORY_REPORTER_OUTPUT;
        // Default name matches Jest shard so we can disambiguate artifacts.
        this.output = requestedOutput || envOutput || 'jest-memory.json';
        this.outputPath = path.resolve(process.cwd(), this.output);

        // Ensure the output file exists even if Jest aborts early (OOM, crash, etc.).
        fs.mkdirSync(path.dirname(this.outputPath), {recursive: true});
        this.flush();
    }

    flush() {
        fs.writeFileSync(this.outputPath, JSON.stringify(this.results, null, 2));
    }

    onTestStart(test) {
        // Capture baseline RSS at file start.
        test._memStart = process.memoryUsage().rss;
    }

    onTestResult(test, testResult) {
        const rssEnd = process.memoryUsage().rss;
        const rssMB = Math.round(rssEnd / 1024 / 1024);
        const deltaMB = Math.round((rssEnd - (test._memStart ?? rssEnd)) / 1024 / 1024);
        this.results.push({
            path: testResult.testFilePath,
            rssMB,
            deltaMB,
        });

        // Persist incrementally so we still get partial data if the run crashes later.
        this.flush();
    }

    onRunComplete() {
        this.flush();
        // Also print a concise line so it appears in raw logs for quick inspection.
        const maxRss = this.results.reduce((max, r) => Math.max(max, r.rssMB), 0);
        // eslint-disable-next-line no-console
        console.log(`[memory-reporter] wrote ${this.results.length} entries to ${this.output}; max RSS ${maxRss} MB`);
    }
}

module.exports = MemoryReporter;
