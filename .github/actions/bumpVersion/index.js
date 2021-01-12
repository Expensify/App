// THIS IS A COMPILED FILE. DO NOT MODIFY.

module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 959:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __nccwpck_require__) => {

const {exec} = __nccwpck_require__(129);
const core = __nccwpck_require__(80);
const github = __nccwpck_require__(928);

// Use Github Actions' default environment variables to get repo information
// https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables#default-environment-variables
const [repoOwner, repoName] = process.env.GITHUB_REPOSITORY.split('/');

const MAX_RETRIES = 10;
let errCount = 0;
let shouldRetry = false;

do {
    exec('npm version prerelease -m "Update version to %s"', (err, stdout, stderr) => {
        console.log(stdout);
        if (err) {
            console.log(stderr);

            // It is possible that two PRs were merged in rapid succession.
            // In this case, both PRs will attempt to update to the same npm version.
            // This will cause the deploy to fail with an exit code 128, saying the git tag for that version already exists.
            if (err.code === 128 && errCount < MAX_RETRIES) {
                console.log(
                    'Err: npm version conflict, attempting to automatically resolve',
                    `retryCount: ${++errCount}`,
                );
                shouldRetry = true;
                const currentPatchVersion = __nccwpck_require__(719)/* .version.slice */ .i8.slice(0, -4);

                // Get the highest build version git tag from the repo
                console.log('Fetching tags from github...');
                const octokit = github.getOctokit(core.getInput('token'));
                octokit.listTags({
                    owner: repoOwner,
                    repo: repoName,
                })
                    .then(tags => {
                        const highestBuildNumber = Math.max(...(tags.filter(tag =>
                            tag.name.startsWith(currentPatchVersion)
                        )));
                        console.log('Highest build number from current patch version:', highestBuildNumber);

                        const newBuildNumber = `${currentPatchVersion}-${highestBuildNumber + 1}`;
                        console.log(`Setting npm version for this PR to ${newBuildNumber}`);
                        exec(`npm version ${newBuildNumber} -m "Update version to ${newBuildNumber}"`, (err, stdout, stderr) => {
                            console.log(stdout);
                            if (err) {
                                console.log(stderr);
                            }
                        });
                    })
            } else {
                core.setFailed(err.message);
            }
        }
    });
} while (shouldRetry);


/***/ }),

/***/ 80:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 928:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 719:
/***/ ((module) => {

"use strict";
module.exports = {"i8":"1.0.1-332"};

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
/******/ 	return __nccwpck_require__(959);
/******/ })()
;
