"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementPatch = exports.incrementMinor = exports.SEMANTIC_VERSION_LEVELS = exports.MAX_INCREMENTS = exports.incrementVersion = exports.getVersionStringFromNumber = exports.getVersionNumberFromString = void 0;
exports.isValidSemverLevel = isValidSemverLevel;
exports.getPreviousVersion = getPreviousVersion;
var SEMANTIC_VERSION_LEVELS = {
    MAJOR: 'MAJOR',
    MINOR: 'MINOR',
    PATCH: 'PATCH',
    BUILD: 'BUILD',
};
exports.SEMANTIC_VERSION_LEVELS = SEMANTIC_VERSION_LEVELS;
var MAX_INCREMENTS = 99;
exports.MAX_INCREMENTS = MAX_INCREMENTS;
function isValidSemverLevel(str) {
    return Object.keys(SEMANTIC_VERSION_LEVELS).includes(str);
}
/**
 * Transforms a versions string into a number
 */
var getVersionNumberFromString = function (versionString) {
    var _a = versionString.split('-'), version = _a[0], build = _a[1];
    var _b = version.split('.').map(function (n) { return Number(n); }), major = _b[0], minor = _b[1], patch = _b[2];
    return [major, minor, patch, Number.isInteger(Number(build)) ? Number(build) : 0];
};
exports.getVersionNumberFromString = getVersionNumberFromString;
/**
 * Transforms version numbers components into a version string
 */
var getVersionStringFromNumber = function (major, minor, patch, build) {
    if (build === void 0) { build = 0; }
    return "".concat(major, ".").concat(minor, ".").concat(patch, "-").concat(build);
};
exports.getVersionStringFromNumber = getVersionStringFromNumber;
/**
 * Increments a minor version
 */
var incrementMinor = function (major, minor) {
    if (minor < MAX_INCREMENTS) {
        return getVersionStringFromNumber(major, minor + 1, 0, 0);
    }
    return getVersionStringFromNumber(major + 1, 0, 0, 0);
};
exports.incrementMinor = incrementMinor;
/**
 * Increments a Patch version
 */
var incrementPatch = function (major, minor, patch) {
    if (patch < MAX_INCREMENTS) {
        return getVersionStringFromNumber(major, minor, patch + 1, 0);
    }
    return incrementMinor(major, minor);
};
exports.incrementPatch = incrementPatch;
/**
 * Increments a build version
 */
var incrementVersion = function (version, level) {
    var _a = getVersionNumberFromString(version), major = _a[0], minor = _a[1], patch = _a[2], build = _a[3];
    // Majors will always be incremented
    if (level === SEMANTIC_VERSION_LEVELS.MAJOR) {
        return getVersionStringFromNumber(major + 1, 0, 0, 0);
    }
    if (level === SEMANTIC_VERSION_LEVELS.MINOR) {
        return incrementMinor(major, minor);
    }
    if (level === SEMANTIC_VERSION_LEVELS.PATCH) {
        return incrementPatch(major, minor, patch);
    }
    if (build < MAX_INCREMENTS) {
        return getVersionStringFromNumber(major, minor, patch, build + 1);
    }
    return incrementPatch(major, minor, patch);
};
exports.incrementVersion = incrementVersion;
function getPreviousVersion(currentVersion, level) {
    var _a = getVersionNumberFromString(currentVersion), major = _a[0], minor = _a[1], patch = _a[2], build = _a[3];
    if (level === SEMANTIC_VERSION_LEVELS.MAJOR) {
        if (major === 1) {
            return getVersionStringFromNumber(1, 0, 0, 0);
        }
        return getVersionStringFromNumber(major - 1, 0, 0, 0);
    }
    if (level === SEMANTIC_VERSION_LEVELS.MINOR) {
        if (minor === 0) {
            return getPreviousVersion(currentVersion, SEMANTIC_VERSION_LEVELS.MAJOR);
        }
        return getVersionStringFromNumber(major, minor - 1, 0, 0);
    }
    if (level === SEMANTIC_VERSION_LEVELS.PATCH) {
        if (patch === 0) {
            return getPreviousVersion(currentVersion, SEMANTIC_VERSION_LEVELS.MINOR);
        }
        return getVersionStringFromNumber(major, minor, patch - 1, 0);
    }
    if (build === 0) {
        return getPreviousVersion(currentVersion, SEMANTIC_VERSION_LEVELS.PATCH);
    }
    return getVersionStringFromNumber(major, minor, patch, build - 1);
}
