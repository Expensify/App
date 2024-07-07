import * as core from '@actions/core';
import {exec as originalExec} from 'child_process';
import fs from 'fs';
import type {PackageJson} from 'type-fest';
import {promisify} from 'util';
import {generateAndroidVersionCode, updateAndroidVersion, updateiOSVersion} from '@github/libs/nativeVersionUpdater';
import * as versionUpdater from '@github/libs/versionUpdater';
import type {SemverLevel} from '@github/libs/versionUpdater';

const exec = promisify(originalExec);

/**
 * Update the native app versions.
 */
function updateNativeVersions(version: string) {
    console.log(`Updating native versions to ${version}`);

    // Update Android
    const androidVersionCode = generateAndroidVersionCode(version);
    updateAndroidVersion(version, androidVersionCode)
        .then(() => {
            console.log('Successfully updated Android!');
        })
        .catch((err: string | Error) => {
            console.error('Error updating Android');
            core.setFailed(err);
        });

    // Update iOS
    try {
        const cfBundleVersion = updateiOSVersion(version);
        if (typeof cfBundleVersion === 'string' && cfBundleVersion.split('.').length === 4) {
            core.setOutput('NEW_IOS_VERSION', cfBundleVersion);
            console.log('Successfully updated iOS!');
        } else {
            core.setFailed(`Failed to set NEW_IOS_VERSION. CFBundleVersion: ${cfBundleVersion}`);
        }
    } catch (err) {
        console.error('Error updating iOS');
        if (err instanceof Error) {
            core.setFailed(err);
        }
    }
}

let semanticVersionLevel = core.getInput('SEMVER_LEVEL', {required: true});
if (!semanticVersionLevel || !versionUpdater.isValidSemverLevel(semanticVersionLevel)) {
    semanticVersionLevel = versionUpdater.SEMANTIC_VERSION_LEVELS.BUILD;
    console.log(`Invalid input for 'SEMVER_LEVEL': ${semanticVersionLevel}`, `Defaulting to: ${semanticVersionLevel}`);
}

const {version: previousVersion} = JSON.parse(fs.readFileSync('./package.json').toString()) as PackageJson;
if (!previousVersion) {
    core.setFailed('Error: Could not read package.json');
}

const newVersion = versionUpdater.incrementVersion(previousVersion ?? '', semanticVersionLevel as SemverLevel);
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
