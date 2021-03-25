const _ = require('underscore');
const core = require('@actions/core');
const GithubUtils = require('../../libs/GithubUtils');

// Parse the stringified JSON array of PR numbers, and cast each from String -> Number
const PRList = _.map(JSON.parse(core.getInput('PR_LIST', {required: true})), Number);
console.log(`Got PR list: ${PRList}`);

const releaseBody = GithubUtils.getReleaseBody(PRList);
console.log(`Generated release body: ${releaseBody}`);

core.setOutput('RELEASE_BODY', releaseBody);
