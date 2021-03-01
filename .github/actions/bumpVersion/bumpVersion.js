const {promisify} = require('util');
const exec = promisify(require('child_process').exec);
const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');
const semverClean = require('semver/functions/clean');
const {generateAndroidVersionCode, updateAndroidVersion, updateiOSVersion} = require('../../libs/nativeVersionUpdater');

/**
 * A callback function for a successful `npm version` command.
 *
 * @param {String} newVersion
 */
function postVersionUpdateNative(newVersion) {
    const cleanNewVersion = semverClean(newVersion);
    console.log(`Updated npm version to ${cleanNewVersion}! Updating native versions...`);

    // Update Android
    const androidVersionCode = generateAndroidVersionCode(cleanNewVersion);
    updateAndroidVersion(cleanNewVersion, androidVersionCode)
        .then(() => {
            console.log('Successfully updated Android!');
        })
        .catch((err) => {
            console.error('Error updating Android');
            core.setFailed(err);
        });

    // Update iOS
    updateiOSVersion(cleanNewVersion)
        .then(() => {
            console.log('Successfully updated iOS!');
        })
        .catch((err) => {
            console.error('Error updating iOS');
            core.setFailed(err);
        });
}

// Use Github Actions' default environment variables to get repo information
// https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables#default-environment-variables
const [repoOwner, repoName] = process.env.GITHUB_REPOSITORY.split('/');

const MAX_RETRIES = 10;
let errCount = 0;
let shouldRetry;

do {
    shouldRetry = false;
    exec('npm version prerelease -m "Update version to %s"')
        .then(({stdout}) => {
            postVersionUpdateNative(stdout);
        })
        // eslint-disable-next-line no-loop-func
        .catch((err) => {
            console.log(err.stdout);
            console.log(err.stderr);

            // It's possible that two PRs were merged in rapid succession.
            // In this case, both PRs will attempt to update to the same npm version.
            // This will cause the deploy to fail with an exit code 128,
            // saying the git tag for that version already exists.
            if (errCount < MAX_RETRIES) {
                console.log(
                    'Err: npm version conflict, attempting to automatically resolve',
                    `retryCount: ${++errCount}`,
                );
                shouldRetry = true;
                const {version} = JSON.parse(fs.readFileSync('./package.json'));
                const currentPatchVersion = `v${version.split('-')[0]}`;
                console.log('Current patch version:', currentPatchVersion);

                // Fetch tags
                console.log('Fetching tags from github...');
                const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', {required: true}));
                return octokit.repos.listTags({
                    owner: repoOwner,
                    repo: repoName,
                })
                    .then(githubResponse => ({currentPatchVersion, githubResponse}))
                    .catch(githubError => core.setFailed(githubError));
            }

            // Maximum retries reached, fail this action.
            core.setFailed(err);
        })
        .then(({currentPatchVersion, githubResponse}) => {
            // Find the highest build version git tag
            const tags = githubResponse.data.map(tag => tag.name);
            console.log('Tags: ', tags);
            const highestBuildNumber = Math.max(
                ...(tags
                    .filter(tag => tag.startsWith(currentPatchVersion))
                    .map(tag => tag.split('-')[1])
                ),
            );
            console.log('Highest build number from current patch version:', highestBuildNumber);

            // Bump the build number again
            const newBuildNumber = `${currentPatchVersion}-${highestBuildNumber + 1}`;
            console.log(`Setting npm version for this PR to ${newBuildNumber}`);
            return exec(`npm version ${newBuildNumber} -m "Update version to ${newBuildNumber}"`);
        })
        // eslint-disable-next-line no-loop-func
        .then(({stdout}) => {
            // NPM version successfully updated, update native versions - don't retry.
            postVersionUpdateNative(stdout);
            shouldRetry = false;
        })
        .catch(({stdout, stderr}) => {
            // Log errors and retry
            console.log(stdout);
            console.error(stderr);
        });
} while (shouldRetry);
