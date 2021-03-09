const {promisify} = require('util');
const exec = promisify(require('child_process').exec);

module.exports = class GitUtils {
    /**
     * Takes in two git refs and returns a list of PR numbers of all PRs merged between those two refs
     *
     * @param {String} fromRef
     * @param {String} toRef
     * @returns {Promise}
     */
    getPullRequestsMergedBetween(fromRef, toRef) {
        return exec(`git log --format="%s" ${fromRef}...${toRef}`)
            .then(({stdout}) => {
                const pullRequestNumbers = [...stdout.matchAll(new RegExp(/Merge pull request #(\d{1,6})/, 'g'))]
                    .map(match => match[1]);
                return pullRequestNumbers;
            });
    }
};
