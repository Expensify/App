const core = require('@actions/core');
const github = require('@actions/github');
const https = require('https');
const GitHubUtils = require('../../../libs/GithubUtils');

const pathToAuthorChecklist = 'https://raw.githubusercontent.com/Expensify/App/main/.github/PULL_REQUEST_TEMPLATE.md';
const authorChecklistStartsWith = '### PR Author Checklist';
const reviewerChecklistStartsWith = '<summary><h4>PR Reviewer Checklist</h4>';
const issue = github.context.payload.issue ? github.context.payload.issue.number : github.context.payload.pull_request.number;

/**
 * @returns {Promise}
 */
function getNumberOfItemsFromAuthorChecklist() {
    return new Promise((resolve, reject) => {
        https.get(pathToAuthorChecklist, (res) => {
            let fileContents = '';
            res.on('data', (chunk) => {
                fileContents += chunk;
            });
            res.on('end', () => {
                // Currently, both the author and reviewer checklists are in the PR template file, so we need to do a little bit of parsing the PR description to get just the author
                // checklist.
                const contentAfterStartOfAuthorChecklist = fileContents.split(authorChecklistStartsWith).pop();
                const contentBeforeStartOfReviewerChecklist = contentAfterStartOfAuthorChecklist.split(reviewerChecklistStartsWith).shift();

                const numberOfChecklistItems = (contentBeforeStartOfReviewerChecklist.match(/\[ \]/g) || []).length;
                resolve(numberOfChecklistItems);
            });
        })
            .on('error', reject);
    });
}

/**
 * @returns {Promise}
 */
function getPullRequestBody() {
    return GitHubUtils.octokit.pulls.get({
        owner: GitHubUtils.GITHUB_OWNER,
        repo: GitHubUtils.APP_REPO,
        pull_number: issue,
    }).then(({data: pullRequestComment}) => pullRequestComment.body);
}

/**
 * @param {Number} numberOfChecklistItems
 */
function checkIssueForCompletedChecklist(numberOfChecklistItems) {
    getPullRequestBody()
        .then((pullRequestBody) => {
            const contentAfterStartOfAuthorChecklist = fileContents.split(authorChecklistStartsWith).pop();
            const contentOfAuthorChecklist = contentAfterStartOfAuthorChecklist.split(reviewerChecklistStartsWith).shift();

            const numberOfFinishedChecklistItems = (contentOfAuthorChecklist.match(/- \[x\]/g) || []).length;
            const numberOfUnfinishedChecklistItems = (contentOfAuthorChecklist.match(/- \[ \]/g) || []).length;

            const maxCompletedItems = numberOfChecklistItems + 2;
            const minCompletedItems = numberOfChecklistItems - 2;

            console.log(`You completed ${numberOfFinishedChecklistItems} out of ${numberOfChecklistItems} checklist items with ${numberOfUnfinishedChecklistItems} unfinished items`);

            if (numberOfUnfinishedChecklistItems >= minCompletedItems
                && numberOfFinishedChecklistItems <= maxCompletedItems
                && numberOfUnfinishedChecklistItems === 0) {
                console.log('PR Author checklist is complete 🎉');
                return;
            }

            console.log(`Make sure you are using the most up to date checklist found here: ${pathToAuthorChecklist}`);
            core.setFailed('PR Author Checklist is not completely filled out. Please check every box to verify you\'ve thought about the item.');
        });
}

getNumberOfItemsFromAuthorChecklist()
    .then(checkIssueForCompletedChecklist, (err) => {
        console.error(err);
    });
