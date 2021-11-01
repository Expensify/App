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
    const command = `git log --format="{[%B]}" ${fromRef}...${toRef}`;
    console.log('Getting pull requests merged between the following refs:', fromRef, toRef);
    console.log('Running command: ', command);
    const localGitLogs = execSync(command).toString();

    // Remove the PRs which are duplicated by cherry pick
    return _.map(
        [...localGitLogs.matchAll(/{\[Merge pull request #(\d{1,6}) from (?!(?:Expensify\/(?:master|main|version-))|(?:[^(\]})]*\(cherry picked from commit .*\)\s*\]}))/g)],
        match => match[1],
    );
}

module.exports = {
    getPullRequestsMergedBetween,
};
