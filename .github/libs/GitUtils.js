const _ = require('underscore');
const {spawn, execSync} = require('child_process');
const CONST = require('./CONST');
const sanitizeStringForJSONParse = require('./sanitizeStringForJSONParse');

/**
 * @param {String} ref
 */
function fetchRefIfNeeded(ref) {
    try {
        console.log(`Checking if ref ${ref} exists locally`);
        const command = `git rev-parse --verify ${ref}`;
        console.log(`Running command: ${command}`);
        execSync(command);
    } catch (e) {
        console.log(`Ref ${ref} not found locally, attempting to fetch it.`);
        const command = `git fetch ${ref}`;
        console.log(`Running command: ${command}`);
        execSync(command);
    }
}

/**
 * Get merge logs between two refs (inclusive) as a JavaScript object.
 *
 * @param {String} fromRef
 * @param {String} toRef
 * @returns {Promise<Array<Object<{commit: String, subject: String, authorName: String}>>>}
 */
function getCommitHistoryAsJSON(fromRef, toRef) {
    fetchRefIfNeeded(fromRef);
    fetchRefIfNeeded(toRef);

    console.log('Getting pull requests merged between the following refs:', fromRef, toRef);
    return new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        const args = ['log', '--format={"commit": "%H", "authorName": "%an", "subject": "%s"},', `${fromRef}...${toRef}`];
        console.log(`Running command: git ${args.join(' ')}`);
        const spawnedProcess = spawn('git', args);
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
 * @param {Array<Object<{commit: String, subject: String, authorName: String}>>} commits
 * @returns {Array<String>}
 */
function getValidMergedPRs(commits) {
    const mergedPRs = new Set();
    _.each(commits, (commit) => {
        const author = commit.authorName;
        if (author === CONST.OS_BOTIFY) {
            return;
        }

        const match = commit.subject.match(/Merge pull request #(\d+) from (?!Expensify\/.*-cherry-pick-staging)/);
        if (!_.isArray(match) || match.length < 2) {
            return;
        }

        const pr = match[1];
        if (mergedPRs.has(pr)) {
            // If a PR shows up in the log twice, that means that the PR was deployed in the previous checklist.
            // That also means that we don't want to include it in the current checklist, so we remove it now.
            mergedPRs.delete(pr);
            return;
        }

        mergedPRs.add(pr);
    });

    return Array.from(mergedPRs);
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
        const pullRequestNumbers = getValidMergedPRs(commitList);
        console.log(`List of pull requests merged between ${fromRef} and ${toRef}`, pullRequestNumbers);
        return pullRequestNumbers;
    });
}

module.exports = {
    getValidMergedPRs,
    getPullRequestsMergedBetween,
};
