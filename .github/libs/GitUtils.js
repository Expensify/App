const _ = require('underscore');
const {spawn} = require('child_process');

/**
 * Get merge logs between two refs (inclusive) as a JavaScript object.
 *
 * @param {String} fromRef
 * @param {String} toRef
 * @returns {Promise<Object<{commit: String, subject: String}>>}
 */
function getMergeLogsAsJSON(fromRef, toRef) {
    const command = `git log --format='{"commit": "%H", "subject": "%s"},' ${fromRef}...${toRef}`;
    console.log('Getting pull requests merged between the following refs:', fromRef, toRef);
    console.log('Running command: ', command);
    return new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        const spawnedProcess = spawn('git', ['log', '--format={"commit": "%H", "subject": "%s"},', `${fromRef}...${toRef}`]);
        spawnedProcess.on('message', console.log);
        spawnedProcess.stdout.on('data', (chunk) => {
            console.log(chunk.toString());
            stdout += chunk.toString();
        });
        spawnedProcess.stderr.on('data', (chunk) => {
            console.error(chunk.toString());
            stderr += chunk.toString();
        });
        spawnedProcess.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`${stderr}`));
            }

            resolve(stdout);
        });
        spawnedProcess.on('error', err => reject(err));
    })
        .then((stdout) => {
            // Remove any double-quotes from commit subjects
            let sanitizedOutput = stdout.replace(/(?<="subject": ").*(?="})/g, subject => subject.replace(/"/g, "'"));

            // Also remove any newlines
            sanitizedOutput = sanitizedOutput.replace(/(\r\n|\n|\r)/gm, '');

            // Then format as JSON and convert to a proper JS object
            const json = `[${sanitizedOutput}]`.replace('},]', '}]')

                // Escape backslashes in commit messages that end with a backslash
                .replace('\\"}', '\\\\"}');

            return JSON.parse(json);
        });
}

/**
 * Parse merged PRs, excluding those from irrelevant branches.
 *
 * @param {Array<String>} commitMessages
 * @returns {Array<String>}
 */
function getValidMergedPRs(commitMessages) {
    return _.reduce(commitMessages, (mergedPRs, commitMessage) => {
        if (!_.isString(commitMessage)) {
            return mergedPRs;
        }

        const match = commitMessage.match(/Merge pull request #(\d+) from (?!Expensify\/(?:main|version-|update-staging-from-main|update-production-from-staging))/);
        if (!_.isNull(match) && match[1]) {
            mergedPRs.push(match[1]);
        }

        return mergedPRs;
    }, []);
}

/**
 * Takes in two git refs and returns a list of PR numbers of all PRs merged between those two refs
 *
 * @param {String} fromRef
 * @param {String} toRef
 * @returns {Promise<Array<String>>} – Pull request numbers
 */
function getPullRequestsMergedBetween(fromRef, toRef) {
    let targetMergeList;
    return getMergeLogsAsJSON(fromRef, toRef)
        .then((mergeList) => {
            console.log(`Commits made between ${fromRef} and ${toRef}:`, mergeList);
            targetMergeList = mergeList;

            // Get the full history on this branch, inclusive of the oldest commit from our target comparison
            const oldestCommit = _.last(mergeList).commit;
            return getMergeLogsAsJSON(oldestCommit, 'HEAD');
        })
        .then((fullMergeList) => {
            // Remove from the final merge list any commits whose message appears in the full merge list more than once.
            // This indicates that the PR should not be included in our list because it is a duplicate, and thus has already been processed by our CI
            // See https://github.com/Expensify/App/issues/4977 for details
            const duplicateMergeList = _.chain(fullMergeList)
                .groupBy('subject')
                .values()
                .filter(i => i.length > 1)
                .flatten()
                .pluck('commit')
                .value();
            const finalMergeList = _.filter(targetMergeList, i => !_.contains(duplicateMergeList, i.commit));
            console.log('Filtered out the following commits which were duplicated in the full git log:', _.difference(targetMergeList, finalMergeList));

            // Find which commit messages correspond to merged PR's
            const pullRequestNumbers = getValidMergedPRs(_.pluck(finalMergeList, 'subject'));
            console.log(`List of pull requests merged between ${fromRef} and ${toRef}`, pullRequestNumbers);
            return pullRequestNumbers;
        });
}

module.exports = {
    getValidMergedPRs,
    getPullRequestsMergedBetween,
};
