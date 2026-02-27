import type {ValueOf} from 'type-fest';

const SEMANTIC_VERSION_LEVELS = {
    MAJOR: 'MAJOR',
    MINOR: 'MINOR',
    PATCH: 'PATCH',
    BUILD: 'BUILD',
} as const;
type SemverLevel = ValueOf<typeof SEMANTIC_VERSION_LEVELS>;

const MAX_INCREMENTS = 99;

function isValidSemverLevel(str: string): str is SemverLevel {
    return Object.keys(SEMANTIC_VERSION_LEVELS).includes(str);
}

/**
 * Transforms a versions string into a number
 */
const getVersionNumberFromString = (versionString: string): number[] => {
    const [version, build] = versionString.split('-');
    const [major, minor, patch] = version.split('.').map((n) => Number(n));

    return [major, minor, patch, Number.isInteger(Number(build)) ? Number(build) : 0];
};

/**
 * Transforms version numbers components into a version string
 */
const getVersionStringFromNumber = (major: number, minor: number, patch: number, build = 0): string => `${major}.${minor}.${patch}-${build}`;

/**
 * Increments a minor version
 */
const incrementMinor = (major: number, minor: number): string => {
    if (minor < MAX_INCREMENTS) {
        return getVersionStringFromNumber(major, minor + 1, 0, 0);
    }

    return getVersionStringFromNumber(major + 1, 0, 0, 0);
};

/**
 * Increments a Patch version
 */
const incrementPatch = (major: number, minor: number, patch: number): string => {
    if (patch < MAX_INCREMENTS) {
        return getVersionStringFromNumber(major, minor, patch + 1, 0);
    }
    return incrementMinor(major, minor);
};

/**
 * Increments a build version
 */
const incrementVersion = (version: string, level: SemverLevel): string => {
    const [major, minor, patch, build] = getVersionNumberFromString(version);

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

function getPreviousVersion(currentVersion: string, level: string): string {
    const [major, minor, patch, build] = getVersionNumberFromString(currentVersion);

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

export type {SemverLevel};
export {
    isValidSemverLevel,
    getVersionNumberFromString,
    getVersionStringFromNumber,
    incrementVersion,

    // For tests
    MAX_INCREMENTS,
    SEMANTIC_VERSION_LEVELS,
    incrementMinor,
    incrementPatch,
    getPreviousVersion,
};
