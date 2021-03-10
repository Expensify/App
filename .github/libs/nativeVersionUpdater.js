const {promisify} = require('util');
const exec = promisify(require('child_process').exec);
const fs = require('fs').promises;
const path = require('path');

// Filepath constants
const BUILD_GRADLE_PATH = process.env.NODE_ENV === 'test'
    ? path.resolve(__dirname, '../../android/app/build.gradle')
    : './android/app/build.gradle';
const PLIST_PATH = './ios/ExpensifyCash/Info.plist';
const PLIST_PATH_TEST = './ios/ExpensifyCashTests/Info.plist';

exports.BUILD_GRADLE_PATH = BUILD_GRADLE_PATH;
exports.PLIST_PATH = PLIST_PATH;
exports.PLIST_PATH_TEST = PLIST_PATH_TEST;

/**
 * Update the Android app versionName and versionCode.
 *
 * @param {String} versionName
 * @returns {Promise}
 */
exports.updateAndroidVersion = function updateAndroidVersion(versionName) {
    console.log('Updating android:', `versionName: ${versionName}`);
    return fs.readFile(BUILD_GRADLE_PATH, {encoding: 'utf8'})
        .then((content) => {
            const updatedContent = content.toString().replace(
                /versionName "([0-9.-]+)"/,
                `versionName "${versionName}"`,
            );
            return updatedContent.replace(
                /versionCode ([0-9]+)/,
                (_, oldVersionCode) => `versionCode ${Number.parseInt(oldVersionCode, 10) + 1}`,
            );
        })
        .then(updatedContent => fs.writeFile(BUILD_GRADLE_PATH, updatedContent, {encoding: 'utf8'}));
};

/**
 * Update the iOS app version.
 * Updates the CFBundleShortVersionString and the CFBundleVersion.
 *
 * @param {String} version
 * @returns {Promise}
 */
exports.updateiOSVersion = function updateiOSVersion(version) {
    const shortVersion = version.split('-')[0];
    const cfVersion = version.includes('-') ? version.replace('-', '.') : `${version}.0`;
    console.log('Updating iOS', `CFBundleShortVersionString: ${shortVersion}`, `CFBundleVersion: ${version}`);
    return Promise.all([
        exec(`/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString ${shortVersion}" ${PLIST_PATH}`),
        exec(`/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString ${shortVersion}" ${PLIST_PATH_TEST}`),
        exec(`/usr/libexec/PlistBuddy -c "Set :CFBundleVersion ${cfVersion}" ${PLIST_PATH}`),
        exec(`/usr/libexec/PlistBuddy -c "Set :CFBundleVersion ${cfVersion}" ${PLIST_PATH_TEST}`),
    ]);
};
