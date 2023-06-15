const _ = require('underscore');
const {spawn} = require('child_process');
const sanitizeStringForJSONParse = require('./sanitizeStringForJSONParse');

/**
 * Get merge logs between two refs (inclusive) as a JavaScript object.
 *
 * @param {String} fromRef
 * @param {String} toRef
 * @returns {Promise<Object<{commit: String, subject: String}>>}
 */
function getCommitHistoryAsJSON(fromRef, toRef) {
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
        spawnedProcess.on('error', (err) => reject(err));
    }).then((stdout) => {
        // Sanitize just the text within commit subjects as that's the only potentially un-parseable text.
        const sanitizedOutput = stdout.replace(/(?<="subject": ").*?(?="})/g, (subject) => sanitizeStringForJSONParse(subject));

        // Then remove newlines, format as JSON and convert to a proper JS object
        const json = `[${sanitizedOutput}]`.replace(/(\r\n|\n|\r)/gm, '').replace('},]', '}]');

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
    return _.reduce(
        commitMessages,
        (mergedPRs, commitMessage) => {
            if (!_.isString(commitMessage)) {
                return mergedPRs;
            }

            const match = commitMessage.match(/Merge pull request #(\d+) from (?!Expensify\/.*-cherry-pick-staging)/);
            if (!_.isNull(match) && match[1] && !_.contains(mergedPRs, match[1])) {
                mergedPRs.push(match[1]);
            }

            return mergedPRs;
        },
        [],
    );
}

/**
 * Takes in two git refs and returns a list of PR numbers of all PRs merged between those two refs
 *
 * @param {String} fromRef
 * @param {String} toRef
 * @returns {Promise<Array<String>>} – Pull request numbers
 */
function getPullRequestsMergedBetween(fromRef, toRef) {
    return getCommitHistoryAsJSON(fromRef, toRef).then((commitList) => {
        console.log(`Commits made between ${fromRef} and ${toRef}:`, commitList);

        // Find which commit messages correspond to merged PR's
        const pullRequestNumbers = getValidMergedPRs(_.pluck(commitList, 'subject'));
        console.log(`List of pull requests merged between ${fromRef} and ${toRef}`, pullRequestNumbers);
        return pullRequestNumbers;
    });
}

module.exports = {
    getValidMergedPRs,
    getPullRequestsMergedBetween,
};
