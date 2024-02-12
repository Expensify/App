/**
 * NOTE: This is a compiled file. DO NOT directly edit this file.
 */
/**
 * NOTE: This is a compiled file. DO NOT directly edit this file.
*/
/******/ /* webpack/runtime/compat */
/******/
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + '/';
/******/
/************************************************************************/
var __webpack_exports__ = {};
import core from '@actions/core';
import github from '@actions/github';
import _ from 'underscore';
import CONST from '../../../libs/CONST';
import GitHubUtils from '../../../libs/GithubUtils';

const PR_NUMBER = Number.parseInt(core.getInput('PR_NUMBER'), 10) || github.context.payload.pull_request.number;

GitHubUtils.octokit.pulls
    .listCommits({
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        pull_number: PR_NUMBER,
    })
    .then(({data}) => {
        const unsignedCommits = _.filter(data, (datum) => !datum.commit.verification.verified);

        if (!_.isEmpty(unsignedCommits)) {
            const errorMessage = `Error: the following commits are unsigned: ${JSON.stringify(_.map(unsignedCommits, (commitObj) => commitObj.sha))}`;
            console.error(errorMessage);
            core.setFailed(errorMessage);
        } else {
            console.log('All commits signed! 🎉');
        }
    });
