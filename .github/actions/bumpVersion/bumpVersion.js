const {promisify} = require('util');
const exec = promisify(require('child_process').exec);
const _ = require('underscore');
const core = require('@actions/core');
const github = require('@actions/github');
const versionUpdater = require('../../libs/versionUpdater');
const {updateAndroidVersion, updateiOSVersion, generateAndroidVersionCode} = require('../../libs/nativeVersionUpdater');

let newVersion;

/**
 * Update the native app versions.
 *
 * @param {String} version
 */
function updateNativeVersions(version) {
    console.log(`Updating native versions to ${version}`);

    // Update Android
    const androidVersionCode = generateAndroidVersionCode(version);
    updateAndroidVersion(version, androidVersionCode)
        .then(() => {
            console.log('Successfully updated Android!');
        })
        .catch((err) => {
            console.error('Error updating Android');
            core.setFailed(err);
        });

    // Update iOS
    try {
        const cfBundleVersion = updateiOSVersion(version);
        if (_.isString(cfBundleVersion) && cfBundleVersion.split('.').length === 4) {
            core.setOutput('NEW_IOS_VERSION', cfBundleVersion);
            console.log('Successfully updated iOS!');
        } else {
            core.setFailed(`Failed to set NEW_IOS_VERSION. CFBundleVersion: ${cfBundleVersion}`);
        }
    } catch (err) {
        console.error('Error updating iOS');
        core.setFailed(err);
    }
}

const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', {required: true}));
let semanticVersionLevel = core.getInput('SEMVER_LEVEL', {require: true});

if (!semanticVersionLevel || !_.find(versionUpdater.SEMANTIC_VERSION_LEVELS, v => v === semanticVersionLevel)) {
    console.log(
        `Invalid input for 'SEMVER_LEVEL': ${semanticVersionLevel}`,
        `Defaulting to: ${versionUpdater.SEMANTIC_VERSION_LEVELS.BUILD}`,
    );
    semanticVersionLevel = versionUpdater.SEMANTIC_VERSION_LEVELS.BUILD;
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

        newVersion = versionUpdater.incrementVersion(highestVersion, semanticVersionLevel);

        updateNativeVersions(newVersion);
        console.log(`Setting npm version for this PR to ${newVersion}`);
        return exec(`npm --no-git-tag-version version ${newVersion} -m "Update version to ${newVersion}"`);
    })
    .then(({stdout}) => {
        // NPM and native versions successfully updated, output new version
        console.log(stdout);
        core.setOutput('NEW_VERSION', newVersion);
    })
    .catch(({stdout, stderr}) => {
        // Log errors and retry
        console.log(stdout);
        console.error(stderr);
        core.setFailed('An error occurred in the `npm version` command');
    });
