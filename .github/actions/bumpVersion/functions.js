const utils = require('util');
const exec = utils.promisify(require('child_process').exec);

const semanticVersionLevels = {
    major: 'MAJOR',
    minor: 'MINOR',
    patch: 'PATCH',
    build: 'BUILD',
};
const maxIncrements = 999;

const getVersionNumberFromString = (versionString) => {
    const [version, build] = versionString.slice(1).split('-');
    const [major, minor, patch] = version.split('.').map(n => Number(n));
    return [major, minor, patch, build ? Number(build) : undefined];
};

const getVersionStringFromNumber = (major, minor, patch, build) => {
    if (build) { return `v${major}.${minor}.${patch}-${build}`; }
    return `v${major}.${minor}.${patch}`;
};

const incrementMinor = (major, minor) => {
    if (minor < maxIncrements) { return getVersionStringFromNumber(major, minor + 1, 0); }
    return getVersionStringFromNumber(major + 1, 0, 0);
};

const incrementPatch = (major, minor, patch) => {
    if (patch < maxIncrements) { return getVersionStringFromNumber(major, minor, patch + 1); }
    return incrementMinor(major, minor);
};

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

const execUpdateToNewVersion = async version => exec(
    `npm version ${version} -m "Update version to ${version}"`,
);

module.exports = {
    execUpdateToNewVersion,
    getVersionNumberFromString,
    getVersionStringFromNumber,
    incrementVersion,

    // for the tests
    maxIncrements,
    semanticVersionLevels,
    incrementMinor,
    incrementPatch,
};

// const getHighestBuildNumberFromPatchVersion = (tags, currentPatchVersion) => Math.max(
//     ...tags
//         .filter(tag => tag.startsWith(currentPatchVersion))
//         .map(tag => tag.split('-')[1]),
// );
