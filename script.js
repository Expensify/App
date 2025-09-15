const fs = require('fs');

const filePath = './test-output.log'; // your saved test output
const data = fs.readFileSync(filePath, 'utf-8');
const lines = data.split('\n');

let currentFile = null;
const filesWithErrors = new Set();

// Match lines like "PASS  tests/ui/SomeFile.tsx (2.3 s)"
const fileRegex = /^(PASS|FAIL)\s+(.+\.(js|jsx|ts|tsx))/i;

lines.forEach(line => {
    // Detect test file headers
    const fileMatch = line.match(fileRegex);
    if (fileMatch) {
        currentFile = fileMatch[2].trim();
        return;
    }

    // Look for any console.error line (ignoring spaces)
    if (line.includes('inside a test was not wrapped in act(...)') && currentFile) {
        filesWithErrors.add(currentFile);
    }
});

// Print results
if (filesWithErrors.size === 0) {
    console.log('No console.error found.');
} else {
    console.log(" tests found with act errors", filesWithErrors.size);
    console.log('Files with console.error:\n');
    for (const file of filesWithErrors) {
        console.log(file);
    }
}
