const semanticVersionLevels = {
    major: 'MAJOR',
    minor: 'MINOR',
    patch: 'PATCH',
    build: 'BUILD',
};
const maxIncrements = 999;

/**
 * Transforms a versions string into a number
 *
 * @param {String} versionString
 * @returns {Array}
 */
const getVersionNumberFromString = (versionString) => {
    const [version, build] = versionString.split('-');
    const [major, minor, patch] = version.split('.').map(n => Number(n));
    return [major, minor, patch, build ? Number(build) : undefined];
};

/**
 * Transforms version numbers components into a version string
 *
 * @param {Number} major
 * @param {Number} minor
 * @param {Number} patch
 * @param {Number} build
 * @returns {String}
 */
const getVersionStringFromNumber = (major, minor, patch, build) => {
    if (build) { return `${major}.${minor}.${patch}-${build}`; }
    return `${major}.${minor}.${patch}`;
};

/**
 * Increments a minor version
 *
 * @param {Number} major
 * @param {Number} minor
 * @returns {String}
 */
const incrementMinor = (major, minor) => {
    if (minor < maxIncrements) { return getVersionStringFromNumber(major, minor + 1, 0); }
    return getVersionStringFromNumber(major + 1, 0, 0);
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
    if (patch < maxIncrements) { return getVersionStringFromNumber(major, minor, patch + 1); }
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
    if (level === semanticVersionLevels.major) { return getVersionStringFromNumber(major + 1, 0, 0); }

    if (level === semanticVersionLevels.minor) {
        return incrementMinor(major, minor);
    }
    if (level === semanticVersionLevels.patch) {
        return incrementPatch(major, minor, patch);
    }
    if (build === undefined) { return getVersionStringFromNumber(major, minor, patch, 1); }
    if (build < maxIncrements) {
        return getVersionStringFromNumber(major, minor, patch, build + 1);
    }
    return incrementPatch(major, minor, patch);
};

module.exports = {
    getVersionNumberFromString,
    getVersionStringFromNumber,
    incrementVersion,

    // for the tests
    maxIncrements,
    semanticVersionLevels,
    incrementMinor,
    incrementPatch,
};
