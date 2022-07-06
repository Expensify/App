/**
 * NOTE: This is a compiled file. DO NOT directly edit this file.
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 890:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const core = __nccwpck_require__(320);

/**
 * Safely parse a JSON input to a GitHub Action.
 *
 * @param {String} name - The name of the input.
 * @param {Object} options - Options to pass to core.getInput
 * @param {*} [defaultValue] - A default value to provide for the input.
 *                             Not required if the {required: true} option is given in the second arg to this function.
 * @returns {any}
 */
function getJSONInput(name, options, defaultValue = undefined) {
    const input = core.getInput(name, options);
    if (input) {
        return JSON.parse(input);
    }
    return defaultValue;
}

/**
 * Safely access a string input to a GitHub Action, or fall back on a default if the string is empty.
 *
 * @param {String} name
 * @param {Object} options
 * @param {*} [defaultValue]
 * @returns {string|undefined}
 */
function getStringInput(name, options, defaultValue = undefined) {
    const input = core.getInput(name, options);
    if (!input) {
        return defaultValue;
    }
    return input;
}

module.exports = {
    getJSONInput,
    getStringInput,
};


/***/ }),

/***/ 783:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const _ = __nccwpck_require__(31);
const {execSync} = __nccwpck_require__(81);

/**
 * Get merge logs between two refs (inclusive) as a JavaScript object.
 *
 * @param {String} fromRef
 * @param {String} toRef
 * @returns {Object<{commit: String, subject: String}>}
 */
function getMergeLogsAsJSON(fromRef, toRef) {
    const command = `git log --format='{"commit": "%H", "subject": "%s"},' ${fromRef}...${toRef}`;
    console.log('Getting pull requests merged between the following refs:', fromRef, toRef);
    console.log('Running command: ', command);
    const result = execSync(command).toString().trim();

    // Remove any double-quotes from commit subjects
    const sanitizedOutput = result
        .replace(/(?<="subject": ").*(?="})/g, subject => subject.replace(/"/g, "'"));

    // Then format as JSON and convert to a proper JS object
    const json = `[${sanitizedOutput}]`.replace('},]', '}]');
    return JSON.parse(json);
}

/**
 * Parse merged PRs, excluding those from irrelevant branches.
 *
 * @param {Array<String>} commitMessages
 * @returns {Array<String>}
 */
function getValidMergedPRs(commitMessages) {
    return _.reduce(commitMessages, (mergedPRs, commitMessage) => {
        if (!_.isString(commitMessage)) {
            return mergedPRs;
        }

        const match = commitMessage.match(/Merge pull request #(\d+) from (?!Expensify\/(?:main|version-|update-staging-from-main|update-production-from-staging))/);
        if (!_.isNull(match) && match[1]) {
            mergedPRs.push(match[1]);
        }

        return mergedPRs;
    }, []);
}

/**
 * Takes in two git refs and returns a list of PR numbers of all PRs merged between those two refs
 *
 * @param {String} fromRef
 * @param {String} toRef
 * @returns {Array<String>} – Pull request numbers
 */
function getPullRequestsMergedBetween(fromRef, toRef) {
    const targetMergeList = getMergeLogsAsJSON(fromRef, toRef);
    console.log(`Commits made between ${fromRef} and ${toRef}:`, targetMergeList);

    // Get the full history on this branch, inclusive of the oldest commit from our target comparison
    const oldestCommit = _.last(targetMergeList).commit;
    const fullMergeList = getMergeLogsAsJSON(oldestCommit, 'HEAD');

    // Remove from the final merge list any commits whose message appears in the full merge list more than once.
    // This indicates that the PR should not be included in our list because it is a duplicate, and thus has already been processed by our CI
    // See https://github.com/Expensify/App/issues/4977 for details
    const duplicateMergeList = _.chain(fullMergeList)
        .groupBy('subject')
        .values()
        .filter(i => i.length > 1)
        .flatten()
        .pluck('commit')
        .value();
    const finalMergeList = _.filter(targetMergeList, i => !_.contains(duplicateMergeList, i.commit));
    console.log('Filtered out the following commits which were duplicated in the full git log:', _.difference(targetMergeList, finalMergeList));

    // Find which commit messages correspond to merged PR's
    const pullRequestNumbers = getValidMergedPRs(_.pluck(finalMergeList, 'subject'));
    console.log(`List of pull requests merged between ${fromRef} and ${toRef}`, pullRequestNumbers);
    return pullRequestNumbers;
}

module.exports = {
    getValidMergedPRs,
    getPullRequestsMergedBetween,
};


/***/ }),

/***/ 320:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 280:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 31:
/***/ ((module) => {

module.exports = eval("require")("underscore");


/***/ }),

/***/ 81:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

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
const _ = __nccwpck_require__(31);
const core = __nccwpck_require__(320);
const github = __nccwpck_require__(280);
const ActionUtils = __nccwpck_require__(890);
const GitUtils = __nccwpck_require__(783);

const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', {required: true}));
const inputTag = core.getInput('TAG', {required: true});

const isProductionDeploy = ActionUtils.getJSONInput('IS_PRODUCTION_DEPLOY', {required: false}, false);
const itemToFetch = isProductionDeploy ? 'release' : 'tag';

/**
 * Gets either releases or tags for a GitHub repo
 *
 * @param {boolean} fetchReleases
 * @returns {*}
 */
function getTagsOrReleases(fetchReleases) {
    if (fetchReleases) {
        return octokit.repos.listReleases({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
        });
    }

    return octokit.repos.listTags({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
    });
}

console.log(`Fetching ${itemToFetch} list from github...`);
getTagsOrReleases(isProductionDeploy)
    .catch(githubError => core.setFailed(githubError))
    .then(({data}) => {
        const keyToPluck = isProductionDeploy ? 'tag_name' : 'name';
        const tags = _.pluck(data, keyToPluck);
        const priorTagIndex = _.indexOf(tags, inputTag) + 1;

        if (priorTagIndex === 0) {
            console.log(`No ${itemToFetch} was found for input tag ${inputTag}.`
                + `Comparing it to latest ${itemToFetch} ${tags[0]}`);
        }

        if (priorTagIndex === tags.length) {
            const err = new Error('Somehow, the input tag was at the end of the paginated result, '
                + 'so we don\'t have the prior tag');
            console.error(err.message);
            core.setFailed(err);
            return;
        }

        const priorTag = tags[priorTagIndex];
        console.log(`Given ${itemToFetch}: ${inputTag}`);
        console.log(`Prior ${itemToFetch}: ${priorTag}`);

        const pullRequestList = GitUtils.getPullRequestsMergedBetween(priorTag, inputTag);
        console.log(`Found the pull request list: ${pullRequestList}`);
        return core.setOutput('PR_LIST', pullRequestList);
    })
    .catch(error => core.setFailed(error));

})();

module.exports = __webpack_exports__;
/******/ })()
;
