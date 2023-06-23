const _ = require('underscore');
const {spawn, execSync} = require('child_process');
const CONST = require('./CONST');
const sanitizeStringForJSONParse = require('./sanitizeStringForJSONParse');

/**
 * @param {String} tag
 */
function fetchTagIfNeeded(tag) {
    try {
        console.log(`Checking if tag ${tag} exists locally`);
        const command = `git rev-parse --verify ${tag}`;
        console.log(`Running command: ${command}`);
        const result = execSync(command).toString();
        console.log(result);
    } catch (e) {
        console.log(`Tag ${tag} not found locally, attempting to fetch it.`);
        let command = `git fetch origin tag ${tag} --no-tags`;
        console.log(`Running command: ${command}`);
        let result = execSync(command).toString();
        console.log(result);
        console.log('Verifying that the tag is now available...');
        command = `git rev-parse --verify ${tag}`;
        console.log(`Running command: ${command}`);
        result = execSync(command).toString();
        console.log(result);
    }
}

/**
 * Get merge logs between two tags (inclusive) as a JavaScript object.
 *
 * @param {String} fromTag
 * @param {String} toTag
 * @returns {Promise<Array<Object<{commit: String, subject: String, authorName: String}>>>}
 */
function getCommitHistoryAsJSON(fromTag, toTag) {
    fetchTagIfNeeded(fromTag);
    fetchTagIfNeeded(toTag);

    console.log('Getting pull requests merged between the following tags:', fromTag, toTag);
    return new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        const args = ['log', '--format={"commit": "%H", "authorName": "%an", "subject": "%s"},', `${fromTag}...${toTag}`];
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
 * Takes in two git tags and returns a list of PR numbers of all PRs merged between those two tags
 *
 * @param {String} fromTag
 * @param {String} toTag
 * @returns {Promise<Array<String>>} – Pull request numbers
 */
function getPullRequestsMergedBetween(fromTag, toTag) {
    return getCommitHistoryAsJSON(fromTag, toTag).then((commitList) => {
        console.log(`Commits made between ${fromTag} and ${toTag}:`, commitList);

        // Find which commit messages correspond to merged PR's
        const pullRequestNumbers = getValidMergedPRs(commitList);
        console.log(`List of pull requests merged between ${fromTag} and ${toTag}`, pullRequestNumbers);
        return pullRequestNumbers;
    });
}

module.exports = {
    getValidMergedPRs,
    getPullRequestsMergedBetween,
};
