const {formatDurationDiffChange} = require('./format');

type Entry = {
    name: string;
};

type Data = {
    significance: Entry[];
    meaningless: Entry[];
};

const printRegularLine = (entry: Entry) => {
    console.debug(` - ${entry.name}: ${formatDurationDiffChange(entry)}`);
};

/**
 * Prints the result simply to console.
 */
module.exports = (data: Data) => {
    // No need to log errors or warnings as these were be logged on the fly
    console.debug('');
    console.debug('❇️  Performance comparison results:');

    console.debug('\n➡️  Significant changes to duration');
    data.significance.forEach(printRegularLine);

    console.debug('\n➡️  Meaningless changes to duration');
    data.meaningless.forEach(printRegularLine);

    console.debug('');
};
