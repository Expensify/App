import {execSync, spawn} from 'child_process';
import CONST from './CONST';
import sanitizeStringForJSONParse from './sanitizeStringForJSONParse';
import * as VERSION_UPDATER from './versionUpdater';

type CommitType = {
    commit: string;
    subject: string;
    authorName: string;
};

/**
 * @param [shallowExcludeTag] When fetching the given tag, exclude all history reachable by the shallowExcludeTag (used to make fetch much faster)
 */
function fetchTag(tag: string, shallowExcludeTag = '') {
    let shouldRetry = true;
    let needsRepack = false;
    while (shouldRetry) {
        try {
            let command = '';
            if (needsRepack) {
                // We have seen some scenarios where this fixes the git fetch.
                // Why? Who knows... https://github.com/Expensify/App/pull/31459
                command = 'git repack -d';
                console.log(`Running command: ${command}`);
                execSync(command);
            }

            command = `git fetch origin tag ${tag} --no-tags`;

            // Note that this condition is only ever NOT true in the 1.0.0-0 edge case
            if (shallowExcludeTag && shallowExcludeTag !== tag) {
                command += ` --shallow-exclude=${shallowExcludeTag}`;
            }

            console.log(`Running command: ${command}`);
            execSync(command);
            shouldRetry = false;
        } catch (e) {
            console.error(e);
            if (!needsRepack) {
                console.log('Attempting to repack and retry...');
                needsRepack = true;
            } else {
                console.error("Repack didn't help, giving up...");
                shouldRetry = false;
            }
        }
    }
}

/**
 * Get merge logs between two tags (inclusive) as a JavaScript object.
 */
function getCommitHistoryAsJSON(fromTag: string, toTag: string): Promise<CommitType[]> {
    // Fetch tags, exclude commits reachable from the previous patch version (i.e: previous checklist), so that we don't have to fetch the full history
    const previousPatchVersion = VERSION_UPDATER.getPreviousVersion(fromTag, VERSION_UPDATER.SEMANTIC_VERSION_LEVELS.PATCH);
    fetchTag(fromTag, previousPatchVersion);
    fetchTag(toTag, previousPatchVersion);

    console.log('Getting pull requests merged between the following tags:', fromTag, toTag);
    return new Promise<string>((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        const args = ['log', '--format={"commit": "%H", "authorName": "%an", "subject": "%s"},', `${fromTag}...${toTag}`];
        console.log(`Running command: git ${args.join(' ')}`);
        const spawnedProcess = spawn('git', args);
        spawnedProcess.on('message', console.log);
        spawnedProcess.stdout.on('data', (chunk: Buffer) => {
            console.log(chunk.toString());
            stdout += chunk.toString();
        });
        spawnedProcess.stderr.on('data', (chunk: Buffer) => {
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

        return JSON.parse(json) as CommitType[];
    });
}

/**
 * Parse merged PRs, excluding those from irrelevant branches.
 */
function getValidMergedPRs(commits: CommitType[]): number[] {
    const mergedPRs = new Set<number>();
    commits.forEach((commit) => {
        const author = commit.authorName;
        if (author === CONST.OS_BOTIFY) {
            return;
        }

        const match = commit.subject.match(/Merge pull request #(\d+) from (?!Expensify\/.*-cherry-pick-staging)/);
        if (!Array.isArray(match) || match.length < 2) {
            return;
        }

        const pr = Number.parseInt(match[1], 10);
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
 */
async function getPullRequestsMergedBetween(fromTag: string, toTag: string) {
    console.log(`Looking for commits made between ${fromTag} and ${toTag}...`);
    const commitList = await getCommitHistoryAsJSON(fromTag, toTag);
    console.log(`Commits made between ${fromTag} and ${toTag}:`, commitList);

    // Find which commit messages correspond to merged PR's
    const pullRequestNumbers = getValidMergedPRs(commitList).sort((a, b) => a - b);
    console.log(`List of pull requests merged between ${fromTag} and ${toTag}`, pullRequestNumbers);
    return pullRequestNumbers;
}

export default {
    getValidMergedPRs,
    getPullRequestsMergedBetween,
};
export type {CommitType};
