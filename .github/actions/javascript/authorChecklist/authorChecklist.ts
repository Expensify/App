import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';

/* eslint-disable @typescript-eslint/naming-convention */
import * as core from '@actions/core';
import * as github from '@actions/github';
import escapeRegExp from 'lodash/escapeRegExp';

const pathToAuthorChecklist = `https://raw.githubusercontent.com/${CONST.GITHUB_OWNER}/${CONST.APP_REPO}/main/.github/PULL_REQUEST_TEMPLATE.md`;
const checklistStartsWith = '### PR Author Checklist';
const checklistEndsWith = '\r\n### Screenshots/Videos';

const prNumber = github.context.payload.pull_request?.number;

// Items that used to be added to the checklist automatically and are now enforced by the coding-standards
// rules instead. Transitional: this list and the strip below can go once the PRs still carrying them close.
const RETIRED_CHECKLIST_ITEMS = [
    "I verified that similar component doesn't exist in the codebase",
    'I verified that all props are defined accurately and each prop has a `/** comment above it */`',
    'I verified that each file is named correctly',
    'I verified that each component has a clear name that is non-ambiguous and the purpose of the component can be inferred from the name alone',
    'I verified that the only data being stored in component state is data necessary for rendering and nothing else',
    "In component if we are not using the full Onyx data that we loaded, I've added the proper selector in order to ensure the component only re-renders when the data it is using changes",
    'For Class Components, any internal methods passed to components event handlers are bound to `this` properly so there are no scoping issues (i.e. for `onClick={this.submit}` the method `this.submit` should be bound to `this` in the constructor)',
    'I verified that component internal methods bound to `this` are necessary to be bound (i.e. avoid `this.submit = this.submit.bind(this);` if `this.submit` is never passed to a component event handler like `onClick`)',
    'I verified that all JSX used for rendering exists in the render method',
    'I verified that each component has the minimum amount of code necessary for its purpose, and it is broken down into smaller components in order to separate concerns and functions',
];

function partitionWithChecklist(body: string): string[] {
    const [contentBeforeChecklist, contentAfterStartOfChecklist] = body.split(checklistStartsWith);
    const [checklistContent, contentAfterChecklist] = contentAfterStartOfChecklist.split(checklistEndsWith);
    return [contentBeforeChecklist, checklistContent, contentAfterChecklist];
}

async function getNumberOfItemsFromAuthorChecklist(): Promise<number> {
    const response = await fetch(pathToAuthorChecklist);
    const fileContents = await response.text();
    const checklist = partitionWithChecklist(fileContents).at(1);
    const numberOfChecklistItems = (checklist?.match(/\[ \]/g) ?? []).length ?? 0;
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

async function removeRetiredChecksAndCheckForCompletion() {
    let didChecklistChange = false;

    const body = github.context.payload.pull_request?.body ?? '';

    // eslint-disable-next-line prefer-const
    let [contentBeforeChecklist, checklist, contentAfterChecklist] = partitionWithChecklist(body);

    // Drop items that were added to the checklist before they became coding-standards rules, so PRs opened
    // back then are not left holding boxes that nobody is meant to tick.
    for (const check of RETIRED_CHECKLIST_ITEMS) {
        const regex = new RegExp(`- \\[([ x])] ${escapeRegExp(check)}\r\n`);
        const match = regex.exec(checklist);
        if (match) {
            console.log('Removing retired checklist item:', check);
            checklist = checklist.replace(match[0], '');
            didChecklistChange = true;
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
    removeRetiredChecksAndCheckForCompletion();
}

export default removeRetiredChecksAndCheckForCompletion;
