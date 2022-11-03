const core = require('@actions/core');
const github = require('@actions/github');
const _ = require('underscore');
const https = require('https');
const GitHubUtils = require('../../../libs/GithubUtils');

const pathToReviewerChecklist = 'https://raw.githubusercontent.com/Expensify/App/main/contributingGuides/REVIEWER_CHECKLIST.md';
const reviewerChecklistStartsWith = '## Reviewer Checklist';
const issue = github.context.payload.issue ? github.context.payload.issue.number : github.context.payload.pull_request.number;
const combinedComments = [];

/**
 * @returns {Promise}
 */
function getNumberOfItemsFromReviewerChecklist() {
    return new Promise((resolve, reject) => {
        https.get(pathToReviewerChecklist, (res) => {
            let fileContents = '';
            res.on('data', (chunk) => {
                fileContents += chunk;
            });
            res.on('end', () => {
                const numberOfChecklistItems = (fileContents.match(/- \[ \]/g) || []).length;
                resolve(numberOfChecklistItems);
            });
        })
            .on('error', reject);
    });
}

/**
 * @returns {Promise}
 */
function getAllReviewComments() {
    return GitHubUtils.paginate(GitHubUtils.octokit.pulls.listReviews, {
        owner: GitHubUtils.GITHUB_OWNER,
        repo: GitHubUtils.APP_REPO,
        pull_number: issue,
        per_page: 100,
    }, response => _.map(response.data, review => review.body));
}

/**
 * @returns {Promise}
 */
function getAllComments() {
    return GitHubUtils.paginate(GitHubUtils.octokit.issues.listComments, {
        owner: GitHubUtils.GITHUB_OWNER,
        repo: GitHubUtils.APP_REPO,
        issue_number: issue,
        per_page: 100,
    }, response => _.map(response.data, comment => comment.body));
}

/**
 * @param {Number} numberOfChecklistItems
 */
function checkIssueForCompletedChecklist(numberOfChecklistItems) {
    getAllReviewComments()
        .then(reviewComments => combinedComments.push(...reviewComments))
        .then(() => getAllComments())
        .then(comments => combinedComments.push(...comments))
        .then(() => {
            let foundReviewerChecklist = false;
            let numberOfFinishedChecklistItems = 0;
            let numberOfUnfinishedChecklistItems = 0;

            // Once we've gathered all the data, loop through each comment and look to see if it contains the reviewer checklist
            for (let i = 0; i < combinedComments.length; i++) {
                // Skip all other comments if we already found the reviewer checklist
                if (foundReviewerChecklist) {
                    return;
                }

                const whitespace = /([\n\r])/gm;
                const comment = combinedComments[i].replace(whitespace, '');

                // Found the reviewer checklist, so count how many completed checklist items there are
                if (comment.startsWith(reviewerChecklistStartsWith)) {
                    foundReviewerChecklist = true;
                    numberOfFinishedChecklistItems = (comment.match(/- \[x\]/g) || []).length;
                    numberOfUnfinishedChecklistItems = (comment.match(/- \[ \]/g) || []).length;
                }
            }

            const maxCompletedItems = numberOfChecklistItems + 2;
            const minCompletedItems = numberOfChecklistItems - 2;

            console.log(`You completed ${numberOfFinishedChecklistItems} out of ${numberOfChecklistItems} checklist items`);

            if (numberOfUnfinishedChecklistItems >= minCompletedItems
                && numberOfFinishedChecklistItems <= maxCompletedItems
                && numberOfUnfinishedChecklistItems === 0) {
                console.log('PR Author checklist is complete 🎉');
                return;
            }

            console.log(`Make sure you are using the most up to date checklist found here: ${pathToReviewerChecklist}`);
            core.setFailed('PR Reviewer Checklist is not completely filled out. Please check every box to verify you\'ve thought about the item.');
        });
}

getNumberOfItemsFromReviewerChecklist()
    .then(checkIssueForCompletedChecklist, (err) => {
        console.error(err);
    });
