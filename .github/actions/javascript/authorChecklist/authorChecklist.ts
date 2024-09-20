/* eslint-disable @typescript-eslint/naming-convention */
import * as core from '@actions/core';
import * as github from '@actions/github';
import escapeRegExp from 'lodash/escapeRegExp';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';
import newComponentCategory from './categories/newComponentCategory';

const pathToAuthorChecklist = `https://raw.githubusercontent.com/${CONST.GITHUB_OWNER}/${CONST.APP_REPO}/main/.github/PULL_REQUEST_TEMPLATE.md`;
const checklistStartsWith = '### PR Author Checklist';
const checklistEndsWith = '\r\n### Screenshots/Videos';

const prNumber = github.context.payload.pull_request?.number;

const CHECKLIST_CATEGORIES = {
    NEW_COMPONENT: newComponentCategory,
};

/**
 * Look at the contents of the pull request, and determine which checklist categories apply.
 */
async function getChecklistCategoriesForPullRequest(): Promise<Set<string>> {
    const checks = new Set<string>();
    if (prNumber !== undefined) {
        const changedFiles = await GithubUtils.paginate(GithubUtils.octokit.pulls.listFiles, {
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            pull_number: prNumber,
            per_page: 100,
        });
        const possibleCategories = await Promise.all(
            Object.values(CHECKLIST_CATEGORIES).map(async (category) => ({
                items: category.items,
                doesCategoryApply: await category.detect(changedFiles),
            })),
        );
        for (const category of possibleCategories) {
            if (category.doesCategoryApply) {
                for (const item of category.items) {
                    checks.add(item);
                }
            }
        }
    }
    return checks;
}

function partitionWithChecklist(body: string): string[] {
    const [contentBeforeChecklist, contentAfterStartOfChecklist] = body.split(checklistStartsWith);
    const [checklistContent, contentAfterChecklist] = contentAfterStartOfChecklist.split(checklistEndsWith);
    return [contentBeforeChecklist, checklistContent, contentAfterChecklist];
}

async function getNumberOfItemsFromAuthorChecklist(): Promise<number> {
    const response = await fetch(pathToAuthorChecklist);
    const fileContents = await response.text();
    const checklist = partitionWithChecklist(fileContents).at(1) ?? '';
    const numberOfChecklistItems = (checklist.match(/\[ \]/g) ?? []).length;
    return numberOfChecklistItems;
}

function checkPRForCompletedChecklist(expectedNumberOfChecklistItems: number, checklist: string) {
    const numberOfFinishedChecklistItems = (checklist.match(/- \[x\]/gi) ?? []).length;
    const numberOfUnfinishedChecklistItems = (checklist.match(/- \[ \]/g) ?? []).length;

    const minCompletedItems = expectedNumberOfChecklistItems - 2;

    console.log(`You completed ${numberOfFinishedChecklistItems} out of ${expectedNumberOfChecklistItems} checklist items with ${numberOfUnfinishedChecklistItems} unfinished items`);

    if (numberOfFinishedChecklistItems >= minCompletedItems && numberOfUnfinishedChecklistItems === 0) {
        console.log('PR Author checklist is complete 🎉');
        return;
    }

    console.log(`Make sure you are using the most up to date checklist found here: ${pathToAuthorChecklist}`);
    core.setFailed("PR Author Checklist is not completely filled out. Please check every box to verify you've thought about the item.");
}

async function generateDynamicChecksAndCheckForCompletion() {
    // Generate dynamic checks
    console.log('Generating dynamic checks...');
    const dynamicChecks = await getChecklistCategoriesForPullRequest();
    let isPassing = true;
    let didChecklistChange = false;

    const body = github.context.payload.pull_request?.body ?? '';

    // eslint-disable-next-line prefer-const
    let [contentBeforeChecklist, checklist, contentAfterChecklist] = partitionWithChecklist(body);

    for (const check of dynamicChecks) {
        // Check if it's already in the PR body, capturing the whether or not it's already checked
        const regex = new RegExp(`- \\[([ x])] ${escapeRegExp(check)}`);
        const match = regex.exec(checklist);
        if (!match) {
            console.log('Adding check to the checklist:', check);
            // Add it to the PR body
            isPassing = false;
            checklist += `- [ ] ${check}\r\n`;
            didChecklistChange = true;
        } else {
            const isChecked = match[1] === 'x';
            if (!isChecked) {
                console.log('Found unchecked checklist item:', check);
                isPassing = false;
            }
        }
    }

    // Check if some dynamic check was added with previous commit, but is not relevant anymore
    const allChecks = Object.values(CHECKLIST_CATEGORIES).reduce((acc: string[], category) => acc.concat(category.items), []);

    for (const check of allChecks) {
        if (!dynamicChecks.has(check)) {
            const regex = new RegExp(`- \\[([ x])] ${escapeRegExp(check)}\r\n`);
            const match = regex.exec(checklist);
            if (match) {
                // Remove it from the PR body
                console.log('Check has been removed from the checklist:', check);
                checklist = checklist.replace(match[0], '');
                didChecklistChange = true;
            }
        }
    }

    // Put the PR body back together, need to add the markers back in
    const newBody = contentBeforeChecklist + checklistStartsWith + checklist + checklistEndsWith + contentAfterChecklist;

    // Update the PR body
    if (didChecklistChange && prNumber !== undefined) {
        console.log('Checklist changed, updating PR...');
        await GithubUtils.octokit.pulls.update({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
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
        const numberOfItems = await getNumberOfItemsFromAuthorChecklist();
        checkPRForCompletedChecklist(numberOfItems, checklist);
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
