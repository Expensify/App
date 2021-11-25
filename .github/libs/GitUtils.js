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

    // Parse the git log into an array of commit messages between the two refs
    const commitMessages = _.map(
        [...localGitLogs.matchAll(/{\[([\s\S]*?)\]}/gm)],
        match => match[1],
    );
    console.log(`A list of commits made between ${fromRef} and ${toRef}:\n${commitMessages}`);

    // We need to find which commit messages correspond to merge commits and get PR numbers.
    // Additionally, we omit merge commits made while cherry picking using negative lookahead in the regexp.
    const pullRequestIDs = _.reduce(commitMessages, (mergedPRs, commitMessage) => {
        const mergeCommits = [
            ...commitMessage.matchAll(/Merge pull request #(\d{1,6}) from (?!(?:Expensify\/(?:master|main|version-))|(?:([\s\S]*?)\(cherry picked from commit .*\)\s*))/gm),
        ];

        // Get the PR number of the first match (there should not be multiple matches in one commit message)
        if (_.size(mergeCommits)) {
            mergedPRs.push(mergeCommits[0][1]);
        }
        return mergedPRs;
    }, []);
    console.log(`A list of pull requests merged between ${fromRef} and ${toRef}:\n${pullRequestIDs}`);
    return pullRequestIDs;
}

module.exports = {
    getPullRequestsMergedBetween,
};
