const _ = require('underscore');
const core = require('@actions/core');
const ActionUtils = require('../../../libs/ActionUtils');
const GithubUtils = require('../../../libs/GithubUtils');

// Parse the stringified JSON array of PR numbers, and cast each from String -> Number
const PRList = _.map(ActionUtils.getJSONInput('PR_LIST', {required: true}), Number);
console.log(`Got PR list: ${PRList}`);

const releaseBody = GithubUtils.getReleaseBody(PRList);
console.log(`Generated release body: ${releaseBody}`);

core.setOutput('RELEASE_BODY', releaseBody);
