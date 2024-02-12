/**
 * NOTE: This is a compiled file. DO NOT directly edit this file.
 */
/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
const _ = require('underscore');
const core = require('@actions/core');
const GithubUtils = require('../../../libs/GithubUtils');

const run = function () {
    return GithubUtils.getStagingDeployCash()
        .then(({labels, number}) => {
            console.log(`Found StagingDeployCash with labels: ${_.pluck(labels, 'name')}`);
            core.setOutput('IS_LOCKED', _.contains(_.pluck(labels, 'name'), '🔐 LockCashDeploys 🔐'));
            core.setOutput('NUMBER', number);
        })
        .catch((err) => {
            console.warn('No open StagingDeployCash found, continuing...', err);
            core.setOutput('IS_LOCKED', false);
            core.setOutput('NUMBER', 0);
        });
};

if (require.main === require.cache[eval('__filename')]) {
    run();
}

module.exports = run;
