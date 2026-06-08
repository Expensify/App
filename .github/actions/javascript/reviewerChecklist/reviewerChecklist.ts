import * as core from '@actions/core';
import * as github from '@actions/github';
import https from 'https';
import CONST from '@github/libs/CONST';
import GitHubUtils from '@github/libs/GithubUtils';
import isTeamMember from '@github/libs/isTeamMember';

const pathToReviewerChecklist = 'https://raw.githubusercontent.com/Expensify/App/main/contributingGuides/REVIEWER_CHECKLIST.md';
const reviewerChecklistContains = '# Reviewer Checklist';
const issue: number = github.context.payload.issue?.number ?? github.context.payload.pull_request?.number ?? -1;
const combinedComments: string[] = [];

// Internal Expensify engineers belong to this team. We can't rely on author_association, which only reports MEMBER for publicly visible org members.
const ENGINEERING_TEAM_SLUG = 'engineering';

// A reviewer's standing is their latest review in one of these states; plain "commented" reviews don't change it.
const DECISIVE_REVIEW_STATES = new Set(['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED']);

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
            const maxCompletedItems = numberOfChecklistItems + 2;
            const minCompletedItems = numberOfChecklistItems - 2;
            let foundReviewerChecklist = false;
            let numberOfFinishedChecklistItems = 0;
            let numberOfUnfinishedChecklistItems = 0;

            // Once we've gathered all the data, loop through each comment and look to see if it contains the reviewer checklist
            for (let i = 0; i < combinedComments.length; i++) {
                const whitespace = /([\n\r])/gm;
                const comment = combinedComments.at(i)?.replaceAll(whitespace, '');

                console.log(`Comment ${i} starts with: ${comment?.slice(0, 20)}...`);

                // Found the reviewer checklist, so count how many completed checklist items there are
                if (comment?.indexOf(reviewerChecklistContains) !== -1) {
                    console.log('Found the reviewer checklist!');
                    foundReviewerChecklist = true;
                    numberOfFinishedChecklistItems = (comment?.match(/- \[x\]/gi) ?? []).length;
                    numberOfUnfinishedChecklistItems = (comment?.match(/- \[ \]/g) ?? []).length;

                    if (numberOfFinishedChecklistItems >= minCompletedItems && numberOfFinishedChecklistItems <= maxCompletedItems && numberOfUnfinishedChecklistItems === 0) {
                        console.log('PR Reviewer checklist is complete 🎉');
                        return;
                    }
                }
            }

            if (!foundReviewerChecklist) {
                core.setFailed('No PR Reviewer Checklist was found');
                return;
            }

            console.log(`You completed ${numberOfFinishedChecklistItems} out of ${numberOfChecklistItems} checklist items with ${numberOfUnfinishedChecklistItems} unfinished items`);

            if (numberOfFinishedChecklistItems >= minCompletedItems && numberOfFinishedChecklistItems <= maxCompletedItems && numberOfUnfinishedChecklistItems === 0) {
                console.log('PR Reviewer checklist is complete 🎉');
                return;
            }

            console.log(`Make sure you are using the most up to date checklist found here: ${pathToReviewerChecklist}`);
            core.setFailed("PR Reviewer Checklist is not completely filled out. Please check every box to verify you've thought about the item.");
        });
}

// An approval from an internal Expensify engineer means we've decided this PR doesn't need a C+ checklist, so let the check pass.
// This workflow re-runs on every pull_request_review event, so we scan the whole review history: once an internal approval
// stands, a later "commented" or "changes requested" review from anyone must not re-require the checklist.
async function hasStandingInternalApproval(orgToken: string): Promise<boolean> {
    const {owner, repo} = github.context.repo;
    const reviews = await GitHubUtils.paginate(GitHubUtils.octokit.pulls.listReviews, {
        owner,
        repo,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        pull_number: issue,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        per_page: 100,
    });

    const decisiveReviews = reviews.filter((review) => !!review.user?.login && DECISIVE_REVIEW_STATES.has(review.state ?? ''));

    // Resolve internal status from engineering-team membership using a read:org token, since concealed members aren't reflected in author_association.
    const orgOctokit = github.getOctokit(orgToken);
    const reviewerLogins = [...new Set(decisiveReviews.map((review) => review.user?.login ?? ''))];
    const membershipResults = await Promise.all(reviewerLogins.map((login) => isTeamMember(orgOctokit.rest, CONST.GITHUB_OWNER, ENGINEERING_TEAM_SLUG, login)));
    const internalReviewerLogins = new Set(reviewerLogins.filter((_, index) => membershipResults.at(index)));

    // GitHub treats a reviewer's latest decisive review as their standing, so keep only that per internal engineer.
    const latestStateByInternalReviewer = new Map<string, string>();
    for (const review of decisiveReviews) {
        const login = review.user?.login ?? '';
        if (!internalReviewerLogins.has(login)) {
            continue;
        }
        latestStateByInternalReviewer.set(login, review.state ?? '');
    }

    for (const state of latestStateByInternalReviewer.values()) {
        if (state === 'APPROVED') {
            return true;
        }
    }
    return false;
}

hasStandingInternalApproval(core.getInput('OS_BOTIFY_TOKEN', {required: true}))
    .then((isApproved) => {
        if (isApproved) {
            console.log('PR has a standing approval from an internal Expensify engineer, so the reviewer checklist is not required 🎉');
            return;
        }
        return getNumberOfItemsFromReviewerChecklist().then(checkIssueForCompletedChecklist);
    })
    .catch((err: string | Error) => {
        console.error(err);
        core.setFailed(err);
    });
