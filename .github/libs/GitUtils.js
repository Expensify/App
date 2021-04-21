const {promisify} = require('util');
const exec = promisify(require('child_process').exec);

/**
 * Takes in two git refs and returns a list of PR numbers of all PRs merged between those two refs
 *
 * @param {String} fromRef
 * @param {String} toRef
 * @returns {Promise}
 */
function getPullRequestsMergedBetween(fromRef, toRef) {
    return exec(`git log --format="%s" ${fromRef}...${toRef}`)
        .then(({stdout}) => (
            [...stdout.matchAll(/Merge pull request #(\d{1,6}) from (?!Expensify\/(?:master|main|version-))/g)]
                .map(match => match[1])
        ));
}

module.exports = {
    getPullRequestsMergedBetween,
};
