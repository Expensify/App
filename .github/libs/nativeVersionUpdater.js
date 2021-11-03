const {execSync} = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const getMajorVersion = require('semver/functions/major');
const getMinorVersion = require('semver/functions/minor');
const getPatchVersion = require('semver/functions/patch');
const getBuildVersion = require('semver/functions/prerelease');

// Filepath constants
const BUILD_GRADLE_PATH = process.env.NODE_ENV === 'test'
    ? path.resolve(__dirname, '../../android/app/build.gradle')
    : './android/app/build.gradle';
const PLIST_PATH = './ios/NewExpensify/Info.plist';
const PLIST_PATH_TEST = './ios/NewExpensifyTests/Info.plist';

exports.BUILD_GRADLE_PATH = BUILD_GRADLE_PATH;
exports.PLIST_PATH = PLIST_PATH;
exports.PLIST_PATH_TEST = PLIST_PATH_TEST;

/**
 * Pad a number to be two digits (with leading zeros if necessary).
 *
 * @param {Number} number - Must be an integer.
 * @returns {String} - A string representation of the number with length 2.
 */
function padToTwoDigits(number) {
    if (number >= 10) {
        return number.toString();
    }
    return `0${number.toString()}`;
}

/**
 * Generate the 10-digit versionCode for android.
 * This version code allocates two digits each for PREFIX, MAJOR, MINOR, PATCH, and BUILD versions.
 * As a result, our max version is 99.99.99-99.
 *
 * @param {String} npmVersion
 * @returns {String}
 */
exports.generateAndroidVersionCode = function generateAndroidVersionCode(npmVersion) {
    // All Android versions will be prefixed with '10' due to previous versioning
    const prefix = '10';
    return ''.concat(
        prefix,
        padToTwoDigits(getMajorVersion(npmVersion) || 0),
        padToTwoDigits(getMinorVersion(npmVersion) || 0),
        padToTwoDigits(getPatchVersion(npmVersion) || 0),
        padToTwoDigits(getBuildVersion(npmVersion) || 0),
    );
};


/**
 * Update the Android app versionName and versionCode.
 *
 * @param {String} versionName
 * @param {String} versionCode
 * @returns {Promise}
 */
exports.updateAndroidVersion = function updateAndroidVersion(versionName, versionCode) {
    console.log('Updating android:', `versionName: ${versionName}`, `versionCode: ${versionCode}`);
    return fs.readFile(BUILD_GRADLE_PATH, {encoding: 'utf8'})
        .then((content) => {
            let updatedContent = content.toString().replace(/versionName "([0-9.-]*)"/, `versionName "${versionName}"`);
            return updatedContent = updatedContent.replace(/versionCode ([0-9]*)/, `versionCode ${versionCode}`);
        })
        .then(updatedContent => fs.writeFile(BUILD_GRADLE_PATH, updatedContent, {encoding: 'utf8'}));
};

/**
 * Update the iOS app version.
 * Updates the CFBundleShortVersionString and the CFBundleVersion.
 *
 * @param {String} version
 * @returns {String}
 */
exports.updateiOSVersion = function updateiOSVersion(version) {
    const shortVersion = version.split('-')[0];
    const cfVersion = version.includes('-') ? version.replace('-', '.') : `${version}.0`;
    console.log('Updating iOS', `CFBundleShortVersionString: ${shortVersion}`, `CFBundleVersion: ${cfVersion}`);

    // Update Plists
    execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString ${shortVersion}" ${PLIST_PATH}`);
    execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString ${shortVersion}" ${PLIST_PATH_TEST}`);
    execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleVersion ${cfVersion}" ${PLIST_PATH}`);
    execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleVersion ${cfVersion}" ${PLIST_PATH_TEST}`);

    // Return the cfVersion so we can set the NEW_IOS_VERSION in ios.yml
    return cfVersion;
};
