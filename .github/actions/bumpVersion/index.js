module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 326:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __nccwpck_require__) => {

const {exec} = __nccwpck_require__(129);

// const fs = require('fs');
const core = __nccwpck_require__(200);
const github = __nccwpck_require__(634);
const functions = __nccwpck_require__(812);

// Use Github Actions' default environment variables to get repo information
// https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables#default-environment-variables
// const [repoOwner, repoName] = process.env.GITHUB_REPOSITORY.split('/');

const MAX_RETRIES = 10;
let errCount = 0;
let shouldRetry;

do {
    shouldRetry = false;
    // eslint-disable-next-line no-loop-func
    exec('npm version prerelease -m "Update version to %s"', (err, stdout, stderr) => {
        console.log(stdout);
        if (err) {
            console.log(stderr);

            // It's possible that two PRs were merged in rapid succession.
            // In this case, both PRs will attempt to update to the same npm version.
            // This will cause the deploy to fail with an exit code 128
            // saying the git tag for that version already exists.
            if (errCount < MAX_RETRIES) {
                console.log(
                    'Err: npm version conflict, attempting to automatically resolve',
                    `retryCount: ${++errCount}`,
                );
                shouldRetry = true;

                // const { version } = JSON.parse(fs.readFileSync('./package.json'));

                // const currentPatchVersion = `v${version.slice(0, -4)}`;
                // console.log('Current patch version:', currentPatchVersion);

                console.log('Fetching tags from github...');
                const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', {required: true}));
                octokit.repos.listTags({
                    owner: github.context.repo.owner,
                    repo: github.context.repo.repo,
                })
                    .then((response) => {
                        const tags = response.data.map(tag => tag.name);

                        // tags come from latest to oldest
                        const highestVersion = tags[0];
                        console.log(highestVersion);

                        // should SEMVER_LEVEL default to BUILD?
                        const semanticVersionLevel = core.getInput('SEMVER_LEVEL', {require: true});
                        const newVersion = functions.incrementVersion(highestVersion, semanticVersionLevel);

                        core.setOutput('VERSION', newVersion);

                        functions.execUpdateToNewVersion(newVersion);
                    })
                    .catch(exception => core.setFailed(exception));
            } else {
                core.setFailed(err);
            }
        }
    });
} while (shouldRetry);


/***/ }),

/***/ 812:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const {exec} = __nccwpck_require__(129);

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

const execUpdateToNewVersion = (version) => {
    exec(
        `npm version ${version} -m "Update version to ${version}"`,
        // eslint-disable-next-line no-shadow
        (err, stdout, stderr) => {
            console.log(stdout);
            if (err) {
                console.log(stderr);
            }
        },
    );
};

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


/***/ }),

/***/ 200:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 634:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 129:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
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
/******/ 	__nccwpck_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __nccwpck_require__(326);
/******/ })()
;