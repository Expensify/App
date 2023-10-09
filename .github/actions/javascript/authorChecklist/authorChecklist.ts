import core from '@actions/core';
import github from '@actions/github';
import escapeRegExp from 'lodash/escapeRegExp';
import GithubUtils from '../../../libs/GithubUtils';
import CONST from '../../../libs/CONST';
import newComponentCategory from './newComponentCategory';

const pathToAuthorChecklist = 'https://raw.githubusercontent.com/Expensify/App/main/.github/PULL_REQUEST_TEMPLATE.md';
const checklistStartsWith = '### PR Author Checklist';
const checklistEndsWith = '\r\n### Screenshots/Videos';

const prNumber = github.context.payload.pull_request?.number;

const CHECKLIST_CATEGORIES = {
    NEW_COMPONENT: newComponentCategory,
};

/**
 * Look at the contents of the pull request, and determine which checklist categories apply.
 */
async function getChecklistCategoriesForPullRequest(): Promise<string[][]> {
    const categories: string[][] = [];
    const changedFiles = await GithubUtils.paginate(GithubUtils.octokit.pulls.listFiles, {
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        pull_number: prNumber,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        per_page: 100,
    });
    for (const category of Object.values(CHECKLIST_CATEGORIES)) {
        const doesCategoryApply = await category.detect(changedFiles);
        if (doesCategoryApply) {
            categories.push(category.items);
        }
        return categories;
    }
    return categories;
}

function partitionWithChecklist(body: string): string[] {
    const [contentBeforeChecklist, contentAfterStartOfChecklist] = body.split(checklistStartsWith);
    const [checklistContent, contentAfterChecklist] = contentAfterStartOfChecklist.split(checklistEndsWith);
    return [contentBeforeChecklist, checklistContent, contentAfterChecklist];
}

async function getNumberOfItemsFromAuthorChecklist(): Promise<number> {
    const response = await fetch(pathToAuthorChecklist);
    const fileContents = await response.text();
    const checklist = partitionWithChecklist(fileContents)[1];
    const numberOfChecklistItems = (checklist.match(/\[ \]/g) ?? []).length;
    return numberOfChecklistItems;
}

function checkPRForCompletedChecklist(numberOfChecklistItems: number, pullRequestBody: string) {
    const checklist = partitionWithChecklist(pullRequestBody)[1];

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
        const regex = new RegExp(`- \\[([ x])] ${escapeRegExp(check)}`);
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
    const allChecks = Object.values(CHECKLIST_CATEGORIES).reduce((acc: string[], category) => acc.concat(category.items), []);

    for (const check of allChecks) {
        if (!checks.has(check)) {
            // Check if some dynamic check has been added with previous commit, but the check is not relevant anymore
            const regex = new RegExp(`- \\[([ x])] ${escapeRegExp(check)}\r\n`);
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
        const numberofItems = await getNumberOfItemsFromAuthorChecklist();
        checkPRForCompletedChecklist(numberofItems, newBody);
    } catch (error) {
        console.error(error);
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}

if (require.main === module) {
    generateDynamicChecksAndCheckForCompletion();
}

export default generateDynamicChecksAndCheckForCompletion;
