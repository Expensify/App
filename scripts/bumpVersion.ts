#!/usr/bin/env ts-node
import {execSync, exec as originalExec} from 'child_process';
import {promises as fs} from 'fs';
import path from 'path';
import type {SemVer} from 'semver';
import getMajorVersion from 'semver/functions/major';
import getMinorVersion from 'semver/functions/minor';
import getPatchVersion from 'semver/functions/patch';
import getBuildVersion from 'semver/functions/prerelease';
import type {PackageJson} from 'type-fest';
import {promisify} from 'util';
// Disabling lint on the next two imports due to a bug in @dword-design/import-alias/prefer-alias
// eslint-disable-next-line
import * as versionUpdater from '@github/libs/versionUpdater';
// eslint-disable-next-line
import type {SemverLevel} from '@github/libs/versionUpdater';

const exec = promisify(originalExec);

type ConfigJSON = {
    meta: {
        version: string;
    };
};

// PlistBuddy executable path
const PLIST_BUDDY = '/usr/libexec/PlistBuddy';

/**
 * This is a utility function to get the repo root.
 * It's a helpful alternative to __dirname, which doesn't work with ncc-compiled scripts.
 * __dirname doesn't work, because:
 *   - if it's evaluated at compile time it will include an absolute path in the computer in which the file was compiled
 *   - if it's evaluated at runtime, it won't refer to the directory of the imported module, because the code will have moved to wherever it's bundled
 */
function getRepoRoot(): string {
    return execSync('git rev-parse --show-toplevel', {
        encoding: 'utf8',
    }).trim();
}

// Filepath constants
const ROOT_DIR = getRepoRoot();
const PACKAGE_JSON_PATH = path.resolve(ROOT_DIR, 'package.json');
const BUILD_GRADLE_PATH = path.resolve(ROOT_DIR, 'android/app/build.gradle');
const PLIST_PATH = path.resolve(ROOT_DIR, 'ios/NewExpensify/Info.plist');
const PLIST_PATH_NSE = path.resolve(ROOT_DIR, 'ios/NotificationServiceExtension/Info.plist');
const PLIST_PATH_SHARE = path.resolve(ROOT_DIR, 'ios/ShareViewController/Info.plist');

// Filepath constants (submodule)
const MOBILE_EXPENSIFY_DIR = path.resolve(ROOT_DIR, 'Mobile-Expensify');
const MOBILE_EXPENSIFY_CONFIG_JSON_PATH = path.resolve(MOBILE_EXPENSIFY_DIR, 'app/config/config.json');
const MOBILE_EXPENSIFY_ANDROID_MANIFEST_PATH = path.resolve(MOBILE_EXPENSIFY_DIR, 'Android/AndroidManifest.xml');
const MOBILE_EXPENSIFY_PLIST_PATH = path.resolve(MOBILE_EXPENSIFY_DIR, 'iOS/Expensify/Expensify-Info.plist');
const MOBILE_EXPENSIFY_PLIST_PATH_NSE = path.resolve(MOBILE_EXPENSIFY_DIR, 'iOS/NotificationServiceExtension/Info.plist');
const MOBILE_EXPENSIFY_PLIST_PATH_SS = path.resolve(MOBILE_EXPENSIFY_DIR, 'iOS/SmartScanExtension/Info.plist');

/**
 * Pad a number to be two digits (with leading zeros if necessary).
 */
function padToTwoDigits(value: number): string {
    if (value >= 10) {
        return value.toString();
    }
    return `0${value.toString()}`;
}

/**
 * Generate the 10-digit versionCode for android.
 * This version code allocates two digits each for PREFIX, MAJOR, MINOR, PATCH, and BUILD versions.
 * As a result, our max version is 99.99.99-99.
 */
function generateAndroidVersionCode(npmVersion: string | SemVer, prefix: string): string {
    return ''.concat(
        prefix,
        padToTwoDigits(getMajorVersion(npmVersion) ?? 0),
        padToTwoDigits(getMinorVersion(npmVersion) ?? 0),
        padToTwoDigits(getPatchVersion(npmVersion) ?? 0),
        padToTwoDigits(Number(getBuildVersion(npmVersion)) ?? 0),
    );
}

/**
 * Update the Android native versions in E/App and the Mobile-Expensify submodule.
 */
async function updateAndroid(version: string) {
    console.log(`Updating Android versions to ${version}`);
    try {
        const versionNamePattern = '([0-9.-]*)';
        const versionCodePattern = '([0-9]*)';
        const updateBuildGradle = async () => {
            // build.gradle versions will be prefixed with '10' due to previous versioning
            const versionCode = generateAndroidVersionCode(version, '10');

            console.log(`Updating ${BUILD_GRADLE_PATH}:`, {version, versionCode});
            const fileContent = await fs.readFile(BUILD_GRADLE_PATH, {encoding: 'utf8'});
            const updatedContent = fileContent
                .replace(new RegExp(`versionName "${versionNamePattern}"`), `versionName "${version}"`)
                .replace(new RegExp(`versionCode ${versionCodePattern}`), `versionCode ${versionCode}`);
            await fs.writeFile(BUILD_GRADLE_PATH, updatedContent, {encoding: 'utf8'});
            console.log(`Updated ${BUILD_GRADLE_PATH}`);
        };
        const updateAndroidManifest = async () => {
            // AndroidManifest.xml versions will be prefixed with '05' due to previous versioning
            const versionCode = generateAndroidVersionCode(version, '05');

            console.log(`Updating ${MOBILE_EXPENSIFY_ANDROID_MANIFEST_PATH}:`, {version, versionCode});
            const fileContent = await fs.readFile(MOBILE_EXPENSIFY_ANDROID_MANIFEST_PATH, {encoding: 'utf8'});
            const updatedContent = fileContent
                .replace(new RegExp(`android:versionName="${versionNamePattern}"`), `android:versionName="${version}"`)
                .replace(new RegExp(`android:versionCode="${versionCodePattern}"`), `android:versionCode="${versionCode}"`);
            await fs.writeFile(MOBILE_EXPENSIFY_ANDROID_MANIFEST_PATH, updatedContent, {encoding: 'utf8'});
            console.log(`Updated ${MOBILE_EXPENSIFY_ANDROID_MANIFEST_PATH}`);
        };
        await Promise.all([updateBuildGradle(), updateAndroidManifest()]);
        console.log('Successfully updated Android');
    } catch (err) {
        console.error('Error updating Android');
        throw new Error('Error updating Android');
    }
}

/**
 * Update the iOS native versions in E/App and the Mobile-Expensify submodule.
 */
async function updateIOS(version: string) {
    console.log(`Updating native versions to ${version}`);
    try {
        const PLIST_KEYS = {
            CF_BUNDLE_SHORT_VERSION: 'CFBundleShortVersionString',
            CF_BUNDLE_VERSION: 'CFBundleVersion',
        };

        const shortVersion = version.split('-').at(0);
        const cfVersion = version.includes('-') ? version.replace('-', '.') : `${version}.0`;
        console.log('Updating iOS', {
            [PLIST_KEYS.CF_BUNDLE_SHORT_VERSION]: shortVersion,
            [PLIST_KEYS.CF_BUNDLE_VERSION]: cfVersion,
        });

        // Update plist
        await Promise.all(
            [PLIST_PATH, PLIST_PATH_NSE, PLIST_PATH_SHARE, MOBILE_EXPENSIFY_PLIST_PATH, MOBILE_EXPENSIFY_PLIST_PATH_NSE, MOBILE_EXPENSIFY_PLIST_PATH_SS].map(async (file) => {
                console.log(`Updating ${file}`);
                await exec(`${PLIST_BUDDY} -c "Set :${PLIST_KEYS.CF_BUNDLE_SHORT_VERSION} ${shortVersion}" ${file}`);
                await exec(`${PLIST_BUDDY} -c "Set :${PLIST_KEYS.CF_BUNDLE_VERSION} ${cfVersion}" ${file}`);
                console.log(`Updated ${file}`);
            }),
        );
        console.log('Successfully updated iOS');
    } catch (err) {
        console.error('Error updating iOS');
        throw new Error('Error updating iOS');
    }
}

/**
 * Update package.json and package-lock.json
 */
async function updateNPM(version: string) {
    console.log(`Setting npm version to ${version}`);
    try {
        const {stdout} = await exec(`npm --no-git-tag-version version ${version} -m "Update version to ${version}"`);

        // NPM and native versions successfully updated, output new version
        console.log(stdout);
    } catch (err) {
        // Log errors and fail gracefully
        if (err instanceof Error) {
            console.error('Error:', err.message);
        }
        throw new Error('Error updating npm version');
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
        await fs.writeFile(MOBILE_EXPENSIFY_CONFIG_JSON_PATH, JSON.stringify(fileContent, null, 4), {encoding: 'utf8'});
        console.log(`Updated ${MOBILE_EXPENSIFY_CONFIG_JSON_PATH}`);
    } catch (err) {
        // Log errors and fail gracefully
        if (err instanceof Error) {
            console.error('Error:', err.message);
        }
        throw new Error('Error updating Mobile-Expensify config.json');
    }
}

async function run(semanticVersionLevel: SemverLevel) {
    // Parse the current version from package.json
    const {version: previousVersion} = JSON.parse(await fs.readFile(PACKAGE_JSON_PATH, {encoding: 'utf8'})) as PackageJson;
    if (!previousVersion) {
        throw new Error('Could not read package.json');
    }

    // Figure out the next version
    const newVersion = versionUpdater.incrementVersion(previousVersion ?? '', semanticVersionLevel);
    console.log(`Previous version: ${previousVersion}`, `New version: ${newVersion}`);

    // Apply the version changes in Android, iOS, and JS config files (E/App and Mobile-Expensify)
    await Promise.all([updateAndroid(newVersion), updateIOS(newVersion), updateNPM(newVersion), updateConfigJSON(newVersion)]);
    return newVersion;
}

if (require.main === module) {
    // Get and validate SEMVER_LEVEL input
    const semanticVersionLevel = process.argv.at(2) ?? 'BUILD';
    if (!versionUpdater.isValidSemverLevel(semanticVersionLevel)) {
        throw new Error(`Invalid semver level ${semanticVersionLevel}. Must be one of: ${Object.values(versionUpdater.SEMANTIC_VERSION_LEVELS).join(', ')}`);
    }
    run(semanticVersionLevel);
}

export default run;
export {updateAndroid, generateAndroidVersionCode};
