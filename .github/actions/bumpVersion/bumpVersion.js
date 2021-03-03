const {promisify} = require('util');
const exec = promisify(require('child_process').exec);
const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');
const {
    BUILD_GRADLE_PATH,
    PLIST_PATH,
    PLIST_PATH_TEST,
    generateAndroidVersionCode,
    updateAndroidVersion,
    updateiOSVersion,
} = require('../../libs/nativeVersionUpdater');

const PACKAGE_JSON_PATH = './package.json';
const PACKAGE_LOCK_PATH = './package-lock.json';

/**
 * Update the native app versions.
 *
 * @param {String} newVersion
 */
function updateNativeVersions(newVersion) {
    console.log(`Updating native versions to ${newVersion}`);

    // Update Android
    const androidVersionCode = generateAndroidVersionCode(newVersion);
    updateAndroidVersion(newVersion, androidVersionCode)
        .then(() => {
            console.log('Successfully updated Android!');
        })
        .catch((err) => {
            console.error('Error updating Android');
            core.setFailed(err);
        });

    // Update iOS
    updateiOSVersion(newVersion)
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
    if (errCount > 0) {
        console.log(
            'Err: npm version conflict, attempting to automatically resolve',
            `retryCount: ${++errCount}`,
        );
    }

    if (errCount < MAX_RETRIES) {
        // Determine current patch version
        const {version} = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH));
        const currentPatchVersion = version.split('-')[0];
        console.log('Current patch version:', currentPatchVersion);

        let newVersion;

        // Fetch tags
        console.log('Fetching tags from github...');
        const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', {required: true}));
        return octokit.repos.listTags({
            owner: repoOwner,
            repo: repoName,
        })
            .catch(githubError => core.setFailed(githubError))
            .then((githubResponse) => {
                // Find the highest build version git tag
                const tags = githubResponse.data.map(tag => tag.name);
                console.log('Tags: ', tags);
                const highestBuildNumber = Math.max(
                    ...(tags
                        .filter(tag => (tag.startsWith(currentPatchVersion)))
                        .map(tag => tag.split('-')[1])
                    ),
                );
                console.log('Highest build number from current patch version:', highestBuildNumber);

                // Increment the build version, update the native and npm versions.
                newVersion = `${currentPatchVersion}-${highestBuildNumber + 1}`;
                updateNativeVersions(newVersion);
                console.log(`Setting npm version for this PR to ${newVersion}`);
                return exec(`npm --no-git-tag-version version ${newVersion} -m "Update version to ${newVersion}"`);
            })
            .then(({stdout}) => {
                // NPM and native versions successfully updated, create a tag
                console.log(stdout);
                const addCommand = `git add ${
                    [PACKAGE_JSON_PATH, PACKAGE_LOCK_PATH, BUILD_GRADLE_PATH, PLIST_PATH, PLIST_PATH_TEST].join(' ')
                }`;
                const commitCommand = `git commit -m "Update version to ${newVersion}`;
                const tagCommand = `git tag ${newVersion} && git push --tags`;
                return exec(`${[addCommand, commitCommand, tagCommand].join(' && ')}`);
            })
            // eslint-disable-next-line no-loop-func
            .catch(({stdout, stderr}) => {
                // Log errors and retry
                console.log(stdout);
                console.error(stderr);
                shouldRetry = true;
            });
    }

    // Maximum retries reached, fail this action.
    core.setFailed('Maximum retries reached, something is wrong with this action.');
} while (shouldRetry);
