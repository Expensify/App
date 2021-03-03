const {promisify} = require('util');
const exec = promisify(require('child_process').exec);
const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');
const {generateAndroidVersionCode, updateAndroidVersion, updateiOSVersion} = require('../../libs/nativeVersionUpdater');

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

// Determine current patch version
const {version} = JSON.parse(fs.readFileSync('./package.json'));
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
        // NPM and native versions successfully updated, output new version
        console.log(stdout);
        core.setOutput('newVersion', newVersion);
    })
    // eslint-disable-next-line no-loop-func
    .catch(({stdout, stderr}) => {
        // Log errors and retry
        console.log(stdout);
        console.error(stderr);
        core.setFailed('An error occurred in the `npm version` command');
    });
