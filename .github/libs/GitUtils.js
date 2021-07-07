const _ = require('underscore');
const {execSync} = require('child_process');

/**
 * Takes in two git refs and returns a list of PR numbers of all PRs merged between those two refs
 *
 * @param {String} fromRef
 * @param {String} toRef
 * @returns {Array}
 */
function getPullRequestsMergedBetween(fromRef, toRef) {
    console.log('Getting pull requests merged between the following refs:', fromRef, toRef);
    const localGitLogs = execSync(`git log --format="%s" ${fromRef}...${toRef}`).toString();
    return _.map(
        [...localGitLogs.matchAll(/Merge pull request #(\d{1,6}) from (?!Expensify\/main)/g)],
        match => match[1],
    );
}

module.exports = {
    getPullRequestsMergedBetween,
};
