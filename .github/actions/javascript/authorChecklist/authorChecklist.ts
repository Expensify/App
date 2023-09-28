import core from '@actions/core';
import github from '@actions/github';
import https from 'https';
import _ from 'lodash';
import GithubUtils from '../../../libs/GithubUtils';
import CONST from '../../../libs/CONST';
import newComponentCategory from './newComponentCategory';

const pathToAuthorChecklist = 'https://raw.githubusercontent.com/Expensify/App/main/.github/PULL_REQUEST_TEMPLATE.md';
const checklistStartsWith = '### PR Author Checklist';
const checklistEndsWith = "\r\n### Screenshots/Videos";

const prNumber = github.context.payload.pull_request?.number;

const CHECKLIST_CATEGORIES = {
    NEW_COMPONENT: newComponentCategory,
};

/**
 * Look at the contents of the pull request, and determine which checklist categories apply.
 */
async function getChecklistCategoriesForPullRequest() {
    const categories = [];
    const changedFiles = await GithubUtils.paginate(GithubUtils.octokit.pulls.listFiles, {
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        pull_number: prNumber,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        per_page: 100,
    });

    for (const category of Object.values(CHECKLIST_CATEGORIES)) {
        const {detectFunction, items} = category;
        const categoryDetected = await detectFunction(changedFiles);
        if (categoryDetected) {
            categories.push(items);
        }
    }
    return categories;
}

/**
 * Takes string in markdown, and divides it's content by two contant markers.
 */
function partitionWithChecklist(body: string) {
    const [contentBeforeChecklist, contentAfterStartOfChecklist] = body.split(checklistStartsWith);
    const [checklistContent, contentAfterChecklist] = contentAfterStartOfChecklist.split(checklistEndsWith);
    return [contentBeforeChecklist, checklistContent, contentAfterChecklist];
}

/**
 * @returns
 */
function getNumberOfItemsFromAuthorChecklist() {
    return new Promise((resolve, reject) => {
        https
            .get(pathToAuthorChecklist, (res) => {
                let fileContents = '';
                res.on('data', (chunk) => {
                    fileContents += chunk;
                });
                res.on('end', () => {
                    const [, checklist] = partitionWithChecklist(fileContents);

                    const numberOfChecklistItems = (checklist.match(/\[ \]/g) || []).length;
                    resolve(numberOfChecklistItems);
                });
            })
            .on('error', reject);
    });
}

function checkPRForCompletedChecklist(numberOfChecklistItems: number, pullRequestBody: string) {
    // eslint-disable-next-line no-unused-vars
    const [, checklist] = partitionWithChecklist(pullRequestBody);

    const numberOfFinishedChecklistItems = (checklist.match(/- \[x\]/gi) ?? []).length;
    const numberOfUnfinishedChecklistItems = (checklist.match(/- \[ \]/g) ?? []).length;

    const minCompletedItems = numberOfChecklistItems - 2;

    console.log(`You completed ${numberOfFinishedChecklistItems} out of ${numberOfChecklistItems} checklist items with ${numberOfUnfinishedChecklistItems} unfinished items`);

    if (numberOfFinishedChecklistItems >= minCompletedItems && numberOfUnfinishedChecklistItems === 0) {
        console.log('PR Author checklist is complete 🎉');
        return;
    }

    console.log(`Make sure you are using the most up to date checklist found here: ${pathToAuthorChecklist}`);
    core.setFailed("PR Author Checklist is not completely filled out. Please check every box to verify you've thought about the item.");
}

async function generateDynamicChecksAndCheckForCompletion() {
    // Generate dynamic checks
    const checks = new Set<string>();
    const categories = await getChecklistCategoriesForPullRequest();
    for (const checksForCategory of categories) {
        for (const check of checksForCategory) {
            checks.add(check);
        }
    }

    const body = github.context.payload.pull_request?.body ?? '';

    // eslint-disable-next-line prefer-const
    let [contentBeforeChecklist, checklist, contentAfterChecklist] = partitionWithChecklist(body);

    let isPassing = true;
    let checklistChanged = false;
    for (const check of checks) {
        // Check if it's already in the PR body, capturing the whether or not it's already checked
        const regex = new RegExp(`- \\[([ x])] ${_.escapeRegExp(check)}`);
        const match = regex.exec(checklist);
        if (!match) {
            // Add it to the PR body
            isPassing = false;
            checklist += `- [ ] ${check}\r\n`;
            checklistChanged = true;
        } else {
            const isChecked = match[1] === 'x';
            if (!isChecked) {
                isPassing = false;
            }
        }
    }
    // eslint-disable-next-line you-dont-need-lodash-underscore/flatten, you-dont-need-lodash-underscore/map
    const allChecks = _.flatten(_.map(Object.values(CHECKLIST_CATEGORIES), 'items'));
    for (const check of allChecks) {
        if (!checks.has(check)) {
            // Check if some dynamic check has been added with previous commit, but the check is not relevant anymore
            const regex = new RegExp(`- \\[([ x])] ${_.escapeRegExp(check)}\r\n`);
            const match = regex.exec(checklist);
            if (match) {
                // Remove it from the PR body
                checklist = checklist.replace(match[0], '');
                checklistChanged = true;
            }
        }
    }

    // Put the PR body back together, need to add the markers back in
    const newBody = contentBeforeChecklist + checklistStartsWith + checklist + checklistEndsWith + contentAfterChecklist;

    // Update the PR body
    if (checklistChanged) {
        await GithubUtils.octokit.pulls.update({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            pull_number: prNumber,
            body: newBody,
        });
        console.log('Updated PR checklist');
    }

    if (!isPassing) {
        const err = new Error("New checks were added into checklist. Please check every box to verify you've thought about the item.");
        console.error(err);
        core.setFailed(err);
    }

    // check for completion
    try {
        const numberofItems = await getNumberOfItemsFromAuthorChecklist() as number;
        checkPRForCompletedChecklist(numberofItems, newBody);
    } catch (err) {
        console.error(err);
        core.setFailed(err as Error);
    }
}

if (require.main === module) {
    generateDynamicChecksAndCheckForCompletion();
}

export default generateDynamicChecksAndCheckForCompletion;
