import {execSync} from 'child_process';
import {promises as fs} from 'fs';
import path from 'path';
import type {SemVer} from 'semver';
import getMajorVersion from 'semver/functions/major';
import getMinorVersion from 'semver/functions/minor';
import getPatchVersion from 'semver/functions/patch';
import getBuildVersion from 'semver/functions/prerelease';

// Filepath constants
const BUILD_GRADLE_PATH = process.env.NODE_ENV === 'test' ? path.resolve(__dirname, '../../android/app/build.gradle') : './android/app/build.gradle';
const PLIST_PATH = './ios/NewExpensify/Info.plist';
const PLIST_PATH_NSE = './ios/NotificationServiceExtension/Info.plist';
const PLIST_PATH_SHARE = './ios/ShareViewController/Info.plist';

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
function generateAndroidVersionCode(npmVersion: string | SemVer): string {
    // All Android versions will be prefixed with '10' due to previous versioning
    const prefix = '10';
    return ''.concat(
        prefix,
        padToTwoDigits(getMajorVersion(npmVersion) ?? 0),
        padToTwoDigits(getMinorVersion(npmVersion) ?? 0),
        padToTwoDigits(getPatchVersion(npmVersion) ?? 0),
        padToTwoDigits(Number(getBuildVersion(npmVersion)) ?? 0),
    );
}

/**
 * Update the Android app versionName and versionCode.
 */
function updateAndroidVersion(versionName: string, versionCode: string): Promise<void> {
    console.log('Updating android:', `versionName: ${versionName}`, `versionCode: ${versionCode}`);
    return fs
        .readFile(BUILD_GRADLE_PATH, {encoding: 'utf8'})
        .then((content) => {
            let updatedContent = content.toString().replace(/versionName "([0-9.-]*)"/, `versionName "${versionName}"`);
            return (updatedContent = updatedContent.replace(/versionCode ([0-9]*)/, `versionCode ${versionCode}`));
        })
        .then((updatedContent) => fs.writeFile(BUILD_GRADLE_PATH, updatedContent, {encoding: 'utf8'}));
}

/**
 * Update the iOS app version.
 * Updates the CFBundleShortVersionString and the CFBundleVersion.
 */
function updateiOSVersion(version: string): string {
    const shortVersion = version.split('-').at(0);
    const cfVersion = version.includes('-') ? version.replace('-', '.') : `${version}.0`;
    console.log('Updating iOS', `CFBundleShortVersionString: ${shortVersion}`, `CFBundleVersion: ${cfVersion}`);

    // Update Plists
    execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString ${shortVersion}" ${PLIST_PATH}`);
    execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString ${shortVersion}" ${PLIST_PATH_NSE}`);
    execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString ${shortVersion}" ${PLIST_PATH_SHARE}`);
    execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleVersion ${cfVersion}" ${PLIST_PATH}`);
    execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleVersion ${cfVersion}" ${PLIST_PATH_NSE}`);
    execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleVersion ${cfVersion}" ${PLIST_PATH_SHARE}`);

    // Return the cfVersion so we can set the NEW_IOS_VERSION in ios.yml
    return cfVersion;
}

export {updateiOSVersion, updateAndroidVersion, generateAndroidVersionCode, BUILD_GRADLE_PATH, PLIST_PATH};
