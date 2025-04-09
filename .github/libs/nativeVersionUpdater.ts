import {execSync} from 'child_process';
import {promises as fs} from 'fs';
import path from 'path';
import type {SemVer} from 'semver';
import getMajorVersion from 'semver/functions/major';
import getMinorVersion from 'semver/functions/minor';
import getPatchVersion from 'semver/functions/patch';
import getBuildVersion from 'semver/functions/prerelease';

// Filepath constants (root project)
const ROOT_DIR = path.resolve(__dirname, '../..');
const BUILD_GRADLE_PATH = path.resolve(ROOT_DIR, './android/app/build.gradle');
const PLIST_PATH = path.resolve(ROOT_DIR, './ios/NewExpensify/Info.plist');
const PLIST_PATH_NSE = path.resolve(ROOT_DIR, './ios/NotificationServiceExtension/Info.plist');
const PLIST_PATH_SHARE = path.resolve(ROOT_DIR, './ios/ShareViewController/Info.plist');

// Filepath constants (submodule)
const MOBILE_EXPENSIFY_DIR = path.resolve(ROOT_DIR, './Mobile-Expensify');
const MOBILE_EXPENSIFY_ANDROID_MANIFEST_PATH = path.resolve(MOBILE_EXPENSIFY_DIR, './Android/AndroidManifest.json');
const MOBILE_EXPENSIFY_PLIST_PATH = path.resolve(MOBILE_EXPENSIFY_DIR, './iOS/Expensify/Expensify-Info.plist');
const MOBILE_EXPENSIFY_PLIST_PATH_NSE = path.resolve(MOBILE_EXPENSIFY_DIR, './iOS/NotificationServiceExtension/Info.plist');
const MOBILE_EXPENSIFY_PLIST_PATH_SS = path.resolve(MOBILE_EXPENSIFY_DIR, './iOS/SmartScanExtension/Info.plist');

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
async function updateAndroidVersion(versionName: string, versionCode: string): Promise<void> {
    const versionNamePattern = '([0-9.-]*)';
    const versionCodePattern = '([0-9]*)';
    const updateBuildGradle = async () => {
        console.log(`Updating ${BUILD_GRADLE_PATH}:`, {versionName, versionCode});
        const fileContent = await fs.readFile(BUILD_GRADLE_PATH, {encoding: 'utf8'});
        const updatedContent = fileContent
            .replace(new RegExp(`versionName "${versionNamePattern}"`), `versionName "${versionName}"`)
            .replace(new RegExp(`versionCode ${versionCodePattern}`), `versionCode ${versionCode}`);
        await fs.writeFile(BUILD_GRADLE_PATH, updatedContent, {encoding: 'utf8'});
        console.log(`Updated ${BUILD_GRADLE_PATH}`);
    };
    const updateAndroidManifest = async () => {
        console.log(`Updating ${MOBILE_EXPENSIFY_ANDROID_MANIFEST_PATH}:`, {versionName, versionCode});
        const fileContent = await fs.readFile(MOBILE_EXPENSIFY_ANDROID_MANIFEST_PATH, {encoding: 'utf8'});
        const updatedContent = fileContent
            .replace(new RegExp(`android:versionName="${versionNamePattern}"`), `android:versionName=${versionName}`)
            .replace(new RegExp(`android:versionCode="${versionCodePattern}"`), `android:versionCode=${versionCode}`);
        await fs.writeFile(MOBILE_EXPENSIFY_ANDROID_MANIFEST_PATH, updatedContent, {encoding: 'utf8'});
        console.log(`Updated ${MOBILE_EXPENSIFY_ANDROID_MANIFEST_PATH}`);
    };
    await Promise.all([() => updateBuildGradle(), () => updateAndroidManifest()]);
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
