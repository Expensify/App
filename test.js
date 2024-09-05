const StreamArray = require('stream-json/streamers/StreamArray');
const fs = require('fs');
const path = require('path');

const jsonStream = StreamArray.withParser();

const symbolCounts = {};

// Use fs.createReadStream to handle large files
fs.createReadStream(path.resolve(__dirname, './trace/main-types.json')).pipe(jsonStream.input);

jsonStream.on('data', ({key, value}) => {
    if (value.symbolName !== undefined) {
        if (value.symbolName in symbolCounts) {
            symbolCounts[value.symbolName]++;
        } else {
            symbolCounts[value.symbolName] = 1;
        }
    }
});

jsonStream.on('end', () => {
    // Filter out symbolNames that have a count less than 1000
    const filteredCounts = Object.entries(symbolCounts).filter(([symbolName, count]) => count > 1000);

    // Sort them
    const sortedCounts = filteredCounts.sort((a, b) => b[1] - a[1]);

    // Log the results
    console.log(sortedCounts);
});
