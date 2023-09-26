const core = require('@actions/core');
const github = require('@actions/github');
const https = require('https');
const _ = require('lodash');
const GithubUtils = require('../../../libs/GithubUtils');
const CONST = require('../../../libs/CONST');
const newComponentCategory = require('./newComponentCategory');

const pathToAuthorChecklist = 'https://raw.githubusercontent.com/Expensify/App/main/.github/PULL_REQUEST_TEMPLATE.md';
const checklistStartsWith = '### PR Author Checklist';
const checklistEndsWith = '### Screenshots/Videos';

const prNumber = github.context.payload.pull_request.number;


const CHECKLIST_CATEGORIES = {
    NEW_COMPONENT: newComponentCategory
};

/**
 * Look at the contents of the pull request, and determine which checklist categories apply.
 *
 * @returns {Promise<Array<String>>}
 */
async function getChecklistCategoriesForPullRequest() {
    const categories = [];
    const changedFiles = await GithubUtils.paginate(GithubUtils.octokit.pulls.listFiles, {
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        pull_number: prNumber,
        per_page: 100,
    });

    for (const category of _.values(CHECKLIST_CATEGORIES)) {
        const { detectFunction, items } = category;
        const categoryDetected = await detectFunction(changedFiles);
        if (!categoryDetected) {
            return;
        }
        categories.push(items);
    };

    // TODO add more if statements to look for other dynamic checklist categories

    return categories;
}

/**
 * Takes string in markdown, and divides it's content by two contant markers.
 *
 * @param {String} body
 * @returns {[String, String, String]}
 */
function partitionWithChecklist(body) {
    const [contentBeforeChecklist, contentAfterStartOfChecklist] = body.split(checklistStartsWith);
    const [checklistContent, contentAfterChecklist] = contentAfterStartOfChecklist.split(checklistEndsWith);
    return [contentBeforeChecklist, checklistContent, contentAfterChecklist];
};

/**
 * @returns {Promise}
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
                    // eslint-disable-next-line no-unused-vars
                    const [_start, checklist] = partitionWithChecklist(fileContents);

                    const numberOfChecklistItems = (checklist.match(/\[ \]/g) || []).length;
                    resolve(numberOfChecklistItems);
                });
            })
            .on('error', reject);
    });
}

/**
 * @param {Number} numberOfChecklistItems
 */
function checkPRForCompletedChecklist(numberOfChecklistItems) {
    const pullRequestBody = github.context.payload.pull_request.body;

    // eslint-disable-next-line no-unused-vars
    const [_start, checklist] = partitionWithChecklist(pullRequestBody);

    const numberOfFinishedChecklistItems = (checklist.match(/- \[x\]/gi) || []).length;
    const numberOfUnfinishedChecklistItems = (checklist.match(/- \[ \]/g) || []).length;

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
    const checks = new Set();
    const categories = await getChecklistCategoriesForPullRequest();
    for (const checksForCategory of categories) {
        for (const check of checksForCategory) {
            checks.add(check);
        }
    }

    const body = github.context.payload.pull_request.body;
    // eslint-disable-next-line prefer-const
    let [contentBeforeChecklist, checklist, contentAfterChecklist] = partitionWithChecklist(body);

    let isPassing = true;
    for (const check of checks) {
        // Check if it's already in the PR body, capturing the whether or not it's already checked
        const regex = new RegExp(`- \\[([ x])] ${_.escapeRegExp(check)}\n`);
        const match = regex.exec(checklist);
        if (!match) {
            // Add it to the PR body
            isPassing = false;
            checklist += `- [ ] ${check}\n`;
        } else {
            const isChecked = match[1] === 'x';
            if (!isChecked) {
                isPassing = false;
            }
        }
    }
    const allChecks = _.flatten(CHECKLIST_CATEGORIES.values);
    for (const check of allChecks) {
        if (!checks.has(check)) {
            // Check if some dynamic check has been added with previous commit, but the check is not relevant anymore
            const regex = new RegExp(`- \\[([ x])] ${check}\n`);
            const match = regex.exec(checklist);
            if (match) {
                // Remove it from the PR body
                checklist = checklist.replace(match[0], '');
            }
        }
    }

    // Put the PR body back together, need to add the markers back in
    const newBody = contentBeforeChecklist + checklistStartsWith + checklist + checklistEndsWith + contentAfterChecklist;

    // Update the PR body
    if (checks.length > 0) {
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
        const numberofItems = await getNumberOfItemsFromAuthorChecklist();
        checkPRForCompletedChecklist(numberofItems)
    } catch (err) {
        console.error(err);
        core.setFailed(err);
    }
}

if (require.main === module) {
    generateDynamicChecksAndCheckForCompletion();
}

module.exports = generateDynamicChecksAndCheckForCompletion;
