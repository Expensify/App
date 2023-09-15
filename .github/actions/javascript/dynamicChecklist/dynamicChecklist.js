const core = require('@actions/core');
const github = require('@actions/github');
const _ = require('underscore');
const GithubUtils = require('../../../libs/GithubUtils');
const CONST = require('../../../libs/CONST');

const checklistStartsWith = '### PR Author Checklist';
const checklistEndsWith = '### Screenshots/Videos';

const prNumber = github.context.payload.pull_request.number;

const typeScriptChecklistItems = ['Make sure types pass'];

const CHECKLIST_CATEGORIES = {
    TS: typeScriptChecklistItems,
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

    if (
        _.some(
            _.map(changedFiles, (file) => file.filename),
            (filename) => filename.endsWith('.ts') || filename.endsWith('.tsx'),
        )
    ) {
        categories.push(CHECKLIST_CATEGORIES.TS);
    }

    // TODO add more if statements to look for other dynamic checklist categories

    return categories;
}

async function generateChecklist() {
    // Get the current checklist from the PR description
    // const checks = Set<String>
    // [{check: string, isChecked: bool}]

    // Generate dynamic checks
    const checks = new Set();
    const categories = await getChecklistCategoriesForPullRequest();
    for (const checksForCategory of categories) {
        for (const check of checksForCategory) {
            checks.add(check);
        }
    }

    const body = github.context.payload.pull_request.body;
    const [contentBeforeChecklist, contentAfterStartOfChecklist] = body.split(checklistStartsWith);
    // eslint-disable-next-line prefer-const
    let [checklistContent, contentAfterChecklist] = contentAfterStartOfChecklist.split(checklistEndsWith);

    let isPassing = true;
    for (const check of checks) {
        // Check if it's already in the PR body, capturing the whether or not it's already checked
        const regex = new RegExp(`- \\[([ x])] ${check}`);
        const match = regex.exec(checklistContent);
        if (!match) {
            // Add it to the PR body
            isPassing = false;
            checklistContent += `- [ ] ${check}\n`;
        } else {
            const isChecked = match[1] === 'x';
            if (!isChecked) {
                isPassing = false;
            }
        }
    }

    // Put the PR body back together, need to add the markers back in
    const newBody = contentBeforeChecklist + checklistStartsWith + checklistContent + checklistEndsWith + contentAfterChecklist;

    // Update the PR body
    const result = await GithubUtils.octokit.pulls.update({
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        pull_number: prNumber,
        body: newBody,
    });

    console.log('Done. Updated PR checklist', result);

    if (!isPassing) {
        // TODO: fail action (and workflow)
        const err = new Error('Some items from checklist are not checked');
        console.error(err);
        core.setFailed(err);
    }
}

if (require.main === module) {
    generateChecklist();
}

module.exports = generateChecklist;
