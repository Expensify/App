/**
 * NOTE: This is a compiled file. DO NOT directly edit this file.
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 451:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

const {execSync} = __nccwpck_require__(81);
const fs = (__nccwpck_require__(147).promises);
const path = __nccwpck_require__(17);
const getMajorVersion = __nccwpck_require__(651);
const getMinorVersion = __nccwpck_require__(730);
const getPatchVersion = __nccwpck_require__(446);
const getBuildVersion = __nccwpck_require__(750);

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


/***/ }),

/***/ 320:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 651:
/***/ ((module) => {

module.exports = eval("require")("semver/functions/major");


/***/ }),

/***/ 730:
/***/ ((module) => {

module.exports = eval("require")("semver/functions/minor");


/***/ }),

/***/ 446:
/***/ ((module) => {

module.exports = eval("require")("semver/functions/patch");


/***/ }),

/***/ 750:
/***/ ((module) => {

module.exports = eval("require")("semver/functions/prerelease");


/***/ }),

/***/ 81:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 17:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(320);
const {execSync} = __nccwpck_require__(81);
const {PLIST_PATH} = __nccwpck_require__(451);

const bundleVersion = execSync(`grep -A1 'CFBundleVersion' ${PLIST_PATH} | grep -v 'CFBundleVersion' | sed 's|[</string>,]||g'`).toString().trim();
const shortBundleVersion = execSync(`grep -A1 'CFBundleShortVersionString' ${PLIST_PATH} | grep -v 'CFBundleShortVersionString' | sed 's|[</string>,]||g'`).toString().trim();

console.log(`Bundle Version: ${bundleVersion}`);
console.log(`Short Bundle Version: ${shortBundleVersion}`);

const hasValue = shortBundleVersion && bundleVersion;
if (!hasValue) {
    console.log('Failed to get Bundle Versions from plist');
    core.setOutput('BUNDLE_VERSIONS_MATCH', false);
} else if (bundleVersion.includes(shortBundleVersion)) {
    console.log('Bundle Versions are compatible');
    core.setOutput('BUNDLE_VERSIONS_MATCH', true);
} else {
    console.log('Bundle Versions are not compatible');
    core.setOutput('BUNDLE_VERSIONS_MATCH', false);
}

})();

module.exports = __webpack_exports__;
/******/ })()
;
