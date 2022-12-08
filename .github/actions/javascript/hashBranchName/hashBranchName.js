/* eslint-disable no-bitwise */
const core = require('@actions/core');

const eventName = core.getInput('EVENT_NAME');
const pullRequestHeadRef = core.getInput('PULL_REQUEST_HEAD_REF');
const refName = core.getInput('REF_NAME');

const hashBranchName = function () {
    if (eventName === 'workflow_dispatch') {
        return btoa(refName);
    } else {
        return btoa(pullRequestHeadRef);
    }
};

core.setOutput('BRANCH_NAME_HASH', hashBranchName());
