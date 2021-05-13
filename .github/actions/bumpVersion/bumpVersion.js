const {promisify} = require('util');
const fs = require('fs');
const exec = promisify(require('child_process').exec);
const _ = require('underscore');
const core = require('@actions/core');
const versionUpdater = require('../../libs/versionUpdater');
const {updateAndroidVersion, updateiOSVersion, generateAndroidVersionCode} = require('../../libs/nativeVersionUpdater');

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

let semanticVersionLevel = core.getInput('SEMVER_LEVEL', {require: true});
if (!semanticVersionLevel || !_.contains(versionUpdater.SEMANTIC_VERSION_LEVELS, semanticVersionLevel)) {
    console.log(
        `Invalid input for 'SEMVER_LEVEL': ${semanticVersionLevel}`,
        `Defaulting to: ${versionUpdater.SEMANTIC_VERSION_LEVELS.BUILD}`,
    );
    semanticVersionLevel = versionUpdater.SEMANTIC_VERSION_LEVELS.BUILD;
}

const {version: previousVersion} = JSON.parse(fs.readFileSync('./package.json'));
const newVersion = versionUpdater.incrementVersion(previousVersion, semanticVersionLevel);
console.log(`Previous version: ${previousVersion}`, `New version: ${newVersion}`);

updateNativeVersions(newVersion);

console.log(`Setting npm version to ${newVersion}`);
exec(`npm --no-git-tag-version version ${newVersion} -m "Update version to ${newVersion}"`)
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
