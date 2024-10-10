import * as core from '@actions/core';
import * as github from '@actions/github';
import https from 'https';
import GitHubUtils from '@github/libs/GithubUtils';

const pathToReviewerChecklist = 'https://raw.githubusercontent.com/Expensify/App/main/contributingGuides/REVIEWER_CHECKLIST.md';
const reviewerChecklistContains = '# Reviewer Checklist';
const issue: number = github.context.payload.issue?.number ?? github.context.payload.pull_request?.number;
const combinedComments: string[] = [];

function getNumberOfItemsFromReviewerChecklist() {
    console.log('Getting the number of items in the reviewer checklist...');
    return new Promise<number>((resolve, reject) => {
        https
            .get(pathToReviewerChecklist, (res) => {
                let fileContents = '';
                res.on('data', (chunk) => {
                    fileContents += chunk;
                });
                res.on('end', () => {
                    const numberOfChecklistItems = (fileContents.match(/- \[ \]/g) ?? []).length;
                    console.log(`There are ${numberOfChecklistItems} items in the reviewer checklist.`);
                    resolve(numberOfChecklistItems);
                });
            })
            .on('error', (err) => {
                console.error(err);
                reject(err);
            });
    });
}

function checkIssueForCompletedChecklist(numberOfChecklistItems: number) {
    GitHubUtils.getAllReviewComments(issue)
        .then((reviewComments) => {
            console.log(`Pulled ${reviewComments.length} review comments, now adding them to the list...`);
            combinedComments.push(...reviewComments);
        })
        .then(() => GitHubUtils.getAllComments(issue))
        .then((comments) => {
            console.log(`Pulled ${comments.length} comments, now adding them to the list...`);
            combinedComments.push(...(comments.filter(Boolean) as string[]));
        })
        .then(() => {
            console.log(`Looking through all ${combinedComments.length} comments for the reviewer checklist...`);
            let foundReviewerChecklist = false;
            let numberOfFinishedChecklistItems = 0;
            let numberOfUnfinishedChecklistItems = 0;

            // Once we've gathered all the data, loop through each comment and look to see if it contains the reviewer checklist
            for (let i = 0; i < combinedComments.length; i++) {
                // Skip all other comments if we already found the reviewer checklist
                if (foundReviewerChecklist) {
                    break;
                }

                const whitespace = /([\n\r])/gm;
                const comment = combinedComments.at(i)?.replace(whitespace, '');

                console.log(`Comment ${i} starts with: ${comment?.slice(0, 20)}...`);

                // Found the reviewer checklist, so count how many completed checklist items there are
                if (comment?.indexOf(reviewerChecklistContains) !== -1) {
                    console.log('Found the reviewer checklist!');
                    foundReviewerChecklist = true;
                    numberOfFinishedChecklistItems = (comment?.match(/- \[x\]/gi) ?? []).length;
                    numberOfUnfinishedChecklistItems = (comment?.match(/- \[ \]/g) ?? []).length;
                }
            }

            if (!foundReviewerChecklist) {
                core.setFailed('No PR Reviewer Checklist was found');
                return;
            }

            const maxCompletedItems = numberOfChecklistItems + 2;
            const minCompletedItems = numberOfChecklistItems - 2;

            console.log(`You completed ${numberOfFinishedChecklistItems} out of ${numberOfChecklistItems} checklist items with ${numberOfUnfinishedChecklistItems} unfinished items`);

            if (numberOfFinishedChecklistItems >= minCompletedItems && numberOfFinishedChecklistItems <= maxCompletedItems && numberOfUnfinishedChecklistItems === 0) {
                console.log('PR Reviewer checklist is complete 🎉');
                return;
            }

            console.log(`Make sure you are using the most up to date checklist found here: ${pathToReviewerChecklist}`);
            core.setFailed("PR Reviewer Checklist is not completely filled out. Please check every box to verify you've thought about the item.");
        });
}

getNumberOfItemsFromReviewerChecklist()
    .then(checkIssueForCompletedChecklist)
    .catch((err: string | Error) => {
        console.error(err);
        core.setFailed(err);
    });
