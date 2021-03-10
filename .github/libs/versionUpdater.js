const SEMANTIC_VERSION_LEVELS = {
    MAJOR: 'MAJOR',
    MINOR: 'MINOR',
    PATCH: 'PATCH',
    BUILD: 'BUILD',
};
const MAX_INCREMENTS = 999;

/**
 * Transforms a versions string into a number
 *
 * @param {String} versionString
 * @returns {Array}
 */
const getVersionNumberFromString = (versionString) => {
    const [version, build] = versionString.split('-');
    const [major, minor, patch] = version.split('.').map(n => Number(n));

    return [major, minor, patch, build ? Number(build) : 0];
};

/**
 * Transforms version numbers components into a version string
 *
 * @param {Number} major
 * @param {Number} minor
 * @param {Number} patch
 * @param {Number} [build]
 * @returns {String}
 */
const getVersionStringFromNumber = (major, minor, patch, build) => {
    if (build) {
        return `${major}.${minor}.${patch}-${build}`;
    }

    return `${major}.${minor}.${patch}-0`;
};

/**
 * Increments a minor version
 *
 * @param {Number} major
 * @param {Number} minor
 * @returns {String}
 */
const incrementMinor = (major, minor) => {
    if (minor < MAX_INCREMENTS) {
        return getVersionStringFromNumber(major, minor + 1, 0, 0);
    }

    return getVersionStringFromNumber(major + 1, 0, 0, 0);
};

/**
 * Increments a Patch version
 *
 * @param {Number} major
 * @param {Number} minor
 * @param {Number} patch
 * @returns {String}
 */
const incrementPatch = (major, minor, patch) => {
    if (patch < MAX_INCREMENTS) {
        return getVersionStringFromNumber(major, minor, patch + 1, 0);
    }

    return incrementMinor(major, minor);
};

/**
 * Increments a build version
 *
 * @param {Number} version
 * @param {Number} level
 * @returns {String}
 */
const incrementVersion = (version, level) => {
    const [major, minor, patch, build] = getVersionNumberFromString(
        version,
    );

    // majors will always be incremented
    if (level === SEMANTIC_VERSION_LEVELS.MAJOR) {
        return getVersionStringFromNumber(major + 1, 0, 0, 0);
    }

    if (level === SEMANTIC_VERSION_LEVELS.MINOR) {
        return incrementMinor(major, minor);
    }

    if (level === SEMANTIC_VERSION_LEVELS.PATCH) {
        return incrementPatch(major, minor, patch);
    }

    if (build === undefined || build === 0) {
        return getVersionStringFromNumber(major, minor, patch, 1);
    }

    if (build < MAX_INCREMENTS) {
        return getVersionStringFromNumber(major, minor, patch, build + 1);
    }

    return incrementPatch(major, minor, patch);
};

module.exports = {
    getVersionNumberFromString,
    getVersionStringFromNumber,
    incrementVersion,

    // for the tests
    MAX_INCREMENTS,
    SEMANTIC_VERSION_LEVELS,
    incrementMinor,
    incrementPatch,
};
