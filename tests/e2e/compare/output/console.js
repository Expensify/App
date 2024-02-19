import * as format from './format';

const printRegularLine = (entry) => {
    console.debug(` - ${entry.name}: ${format.formatDurationDiffChange(entry)}`);
};

/**
 * Prints the result simply to console.
 * @param {Object} data
 */
export default (data) => {
    // No need to log errors or warnings as these were be logged on the fly
    console.debug('');
    console.debug('❇️  Performance comparison results:');

    console.debug('\n➡️  Significant changes to duration');
    data.significance.forEach(printRegularLine);

    console.debug('\n➡️  Meaningless changes to duration');
    data.meaningless.forEach(printRegularLine);

    console.debug('');
};
