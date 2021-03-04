const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const core = require('@actions/core');
const github = require('@actions/github');
const functions = require('./functions');
const { updateAndroidVersion, updateiOSVersion } = require('../../libs/nativeVersionUpdater');

let newVersion;

/**
 * Update the native app versions.
 *
 * @param {String} newVersion
 */
// eslint-disable-next-line no-shadow
function updateNativeVersions(newVersion) {
    console.log(`Updating native versions to ${newVersion}`);

    // Update Android
    updateAndroidVersion(newVersion)
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

const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', { required: true }));
let semanticVersionLevel = core.getInput('SEMVER_LEVEL', { require: true });

// it actually would fall to build anyway, but I think it is better to make it explicitly
if (!semanticVersionLevel || !Object.values(functions.semanticVersionLevels).find(v => v === semanticVersionLevel)) {
    console.log(
        `Invalid input for 'SEMVER_LEVEL': ${semanticVersionLevel}`,
        `Defaulting to: ${functions.semanticVersionLevels.build}`,
    );
    semanticVersionLevel = functions.semanticVersionLevels.build;
}
console.log('Fetching tags from github...');
octokit.repos.listTags({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
})
    .catch(githubError => core.setFailed(githubError))
    .then((githubResponse) => {
        // Find the highest version git tag
        const tags = githubResponse.data.map(tag => tag.name);

        // tags come from latest to oldest
        const highestVersion = tags[0];

        console.log(`Highest version found: ${highestVersion}.`);

        newVersion = functions.incrementVersion(highestVersion, semanticVersionLevel);

        updateNativeVersions(newVersion);
        console.log(`Setting npm version for this PR to ${newVersion}`);
        return exec(`npm --no-git-tag-version version ${newVersion} -m "Update version to ${newVersion}"`);
    })
    .then(({ stdout }) => {
        // NPM and native versions successfully updated, output new version
        console.log(stdout);
        core.setOutput('VERSION', newVersion);
    })
    .catch(({ stdout, stderr }) => {
        // Log errors and retry
        console.log(stdout);
        console.error(stderr);
        core.setFailed('An error occurred in the `npm version` command');
    });
