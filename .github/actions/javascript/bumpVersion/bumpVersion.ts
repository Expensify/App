import * as core from '@actions/core';
import {exec as originalExec} from 'child_process';
import {promises as fs} from 'fs';
import path from 'path';
import type {PackageJson} from 'type-fest';
import {promisify} from 'util';
import {generateAndroidVersionCode, updateAndroidVersion, updateiOSVersion} from '@github/libs/nativeVersionUpdater';
import * as versionUpdater from '@github/libs/versionUpdater';
import type {SemverLevel} from '@github/libs/versionUpdater';

const exec = promisify(originalExec);

// Filepath constants
const ROOT_DIR = path.resolve(__dirname, '../../../..');
const PACKAGE_JSON_PATH = path.resolve(ROOT_DIR, 'package.json');
const MOBILE_EXPENSIFY_CONFIG_JSON_PATH = path.resolve(ROOT_DIR, 'Mobile-Expensify/app/config/config.json');

type ConfigJSON = {
    meta: {
        version: string;
    };
};

/**
 * Update the Android native versions in E/App and the Mobile-Expensify submodule.
 */
async function updateAndroidVersions(version: string) {
    console.log(`Updating Android versions to ${version}`);
    const androidVersionCode = generateAndroidVersionCode(version);
    try {
        await updateAndroidVersion(version, androidVersionCode);
        console.log('Successfully updated Android');
    } catch (err) {
        console.error('Error updating Android');
        if (err instanceof Error) {
            core.setFailed(err);
        }
    }
}

/**
 * Update the iOS native versions in E/App and the Mobile-Expensify submodule.
 */
async function updateIOSVersions(version: string) {
    console.log(`Updating native versions to ${version}`);
    try {
        const cfBundleVersion = await updateiOSVersion(version);
        if (cfBundleVersion.split('.').length === 4) {
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

/**
 * Update package.json and package-lock.json
 */
async function updateNPMVersion(version: string) {
    console.log(`Setting npm version to ${version}`);
    try {
        const {stdout} = await exec(`npm --no-git-tag-version version ${version} -m "Update version to ${version}"`);

        // NPM and native versions successfully updated, output new version
        console.log(stdout);
        core.setOutput('NEW_VERSION', version);
    } catch (err) {
        // Log errors and fail gracefully
        if (err instanceof Error) {
            console.error('Error:', err.message);
        }
        core.setFailed('An error occurred in the `npm version` command');
    }
}

/**
 * Update Mobile-Expensify config.json.
 */
async function updateConfigJSON(version: string) {
    try {
        console.log(`Updating ${MOBILE_EXPENSIFY_CONFIG_JSON_PATH} to ${version}`);
        const fileContent = JSON.parse(await fs.readFile(MOBILE_EXPENSIFY_CONFIG_JSON_PATH, {encoding: 'utf8'})) as ConfigJSON;
        fileContent.meta.version = version;
        await fs.writeFile(MOBILE_EXPENSIFY_CONFIG_JSON_PATH, JSON.stringify(fileContent), {encoding: 'utf8'});
        console.log(`Updated ${MOBILE_EXPENSIFY_CONFIG_JSON_PATH}`);
    } catch (err) {
        // Log errors and fail gracefully
        if (err instanceof Error) {
            console.error('Error:', err.message);
        }
        core.setFailed('An error occurred updating Mobile-Expensify config.json');
    }
}

async function run() {
    let semanticVersionLevel = core.getInput('SEMVER_LEVEL', {required: true});
    if (!semanticVersionLevel || !versionUpdater.isValidSemverLevel(semanticVersionLevel)) {
        semanticVersionLevel = versionUpdater.SEMANTIC_VERSION_LEVELS.BUILD;
        console.log(`Invalid input for 'SEMVER_LEVEL': ${semanticVersionLevel}`, `Defaulting to: ${semanticVersionLevel}`);
    }

    const {version: previousVersion} = JSON.parse(await fs.readFile(PACKAGE_JSON_PATH, {encoding: 'utf8'})) as PackageJson;
    if (!previousVersion) {
        core.setFailed('Error: Could not read package.json');
    }

    const newVersion = versionUpdater.incrementVersion(previousVersion ?? '', semanticVersionLevel as SemverLevel);
    console.log(`Previous version: ${previousVersion}`, `New version: ${newVersion}`);

    await Promise.all([updateAndroidVersions(newVersion), updateIOSVersions(newVersion), updateNPMVersion(newVersion), updateConfigJSON(newVersion)]);
}

if (require.main === module) {
    run();
}

export default run;
