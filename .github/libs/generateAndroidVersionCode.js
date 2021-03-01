const getMajorVersion = require('semver/functions/major');
const getMinorVersion = require('semver/functions/minor');
const getPatchVersion = require('semver/functions/patch');
const getBuildVersion = require('semver/functions/prerelease');

/**
 * Pad a number to be three digits (with leading zeros if necessary).
 *
 * @param {Number} number - Must be an integer.
 * @returns {String} - A string representation of the number w/ length 3.
 */
function padToThreeDigits(number) {
    if (!number) {
        return '000';
    }
    if (number >= 100) {
        return number.toString();
    }
    if (number >= 10) {
        return `0${number.toString()}`;
    }
    return `00${number.toString()}`;
}

/**
 * Generate the 12-digit versionCode for android.
 * This version code allocates three digits each for MAJOR, MINOR, PATCH, and BUILD versions.
 * As a result, our max version is 999.999.999-999.
 *
 * @param {String} npmVersion
 * @returns {String}
 */
module.exports = function generateAndroidVersionCode(npmVersion) {
    return ''.concat(
        padToThreeDigits(getMajorVersion(npmVersion)),
        padToThreeDigits(getMinorVersion(npmVersion)),
        padToThreeDigits(getPatchVersion(npmVersion)),
        padToThreeDigits(getBuildVersion(npmVersion)),
    );
};
