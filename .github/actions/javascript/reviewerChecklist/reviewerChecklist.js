const core = require('@actions/core');
const github = require('@actions/github');
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
        console.log(`Fetching checklist from ${pathToReviewerChecklist}`);
        https.get(pathToReviewerChecklist, (res) => {
            let fileContents = '';
            res.on('data', (chunk) => {
                fileContents += chunk;
            });
            res.on('end', () => {
                console.log('Finished fetching checklist');
                const numberOfChecklistItems = (fileContents.match(/- \[ \]/g) || []).length;
                resolve(numberOfChecklistItems);
            });
        })
            .on('error', (err) => {
                console.log('Problem fetching checklist')
                console.error(err);
                reject(err);
            });
    });
}

/**
 * @param {Number} numberOfChecklistItems
 */
function checkIssueForCompletedChecklist(numberOfChecklistItems) {
    console.log('Starting to look for completed checklist');
    console.log('Getting all comments from PR reviews');
    GitHubUtils.getAllReviewComments(issue)
        .then(reviewComments => {
            console.log(`Found ${reviewComments.length} comments from PR reviews on this PR`);
            combinedComments.push(...reviewComments)
        })
        .then(() => {
            console.log('Getting all PR comments');
            GitHubUtils.getAllComments(issue)
        })
        .then(comments => {
            console.log(`Found ${comments.length} PR comments on this PR`);
            combinedComments.push(...comments)
        })
        .then(() => {
            console.log(`Found ${combinedComments.length} total comments`);
            let foundReviewerChecklist = false;
            let numberOfFinishedChecklistItems = 0;
            let numberOfUnfinishedChecklistItems = 0;

            console.log('Looking for the reviewer checklist comment');
            // Once we've gathered all the data, loop through each comment and look to see if it contains the reviewer checklist
            for (let i = 0; i < combinedComments.length; i++) {
                // Skip all other comments if we already found the reviewer checklist
                if (foundReviewerChecklist) {
                    return;
                }

                const whitespace = /([\n\r])/gm;
                const comment = combinedComments[i].replace(whitespace, '');

                console.log(`Comment ${i} starts with: ${comment.slice(0, 20)}...`);

                // Found the reviewer checklist, so count how many completed checklist items there are
                if (comment.startsWith(reviewerChecklistStartsWith)) {
                    console.log('Found checklist comment');
                    foundReviewerChecklist = true;
                    numberOfFinishedChecklistItems = (comment.match(/- \[x\]/gi) || []).length;
                    numberOfUnfinishedChecklistItems = (comment.match(/- \[ \]/g) || []).length;
                }
            }

            if (!foundReviewerChecklist) {
                core.setFailed('PR Reviewer Checklist was not found in any comments');
                return;
            }

            const maxCompletedItems = numberOfChecklistItems + 2;
            const minCompletedItems = numberOfChecklistItems - 2;

            console.log(`You completed ${numberOfFinishedChecklistItems} out of ${numberOfChecklistItems} checklist items with ${numberOfUnfinishedChecklistItems} unfinished items`);

            if (numberOfFinishedChecklistItems >= minCompletedItems
                && numberOfFinishedChecklistItems <= maxCompletedItems
                && numberOfUnfinishedChecklistItems === 0) {
                console.log('PR Reviewer checklist is complete 🎉');
                return;
            }

            console.log(`Make sure you are using the most up to date checklist found here: ${pathToReviewerChecklist}`);
            core.setFailed('PR Reviewer Checklist is not completely filled out. Please check every box to verify you\'ve thought about the item.');
        });
}

console.log('Starting reviewer checklist');
getNumberOfItemsFromReviewerChecklist()
    .then(checkIssueForCompletedChecklist, (err) => {
        console.error(err);
    });
