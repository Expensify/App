const core = require('@actions/core');
const github = require('@actions/github');
const _ = require('underscore');
const GithubUtils = require('../../../libs/GithubUtils');
const CONST = require('../../../libs/CONST');

const prNumber = github.context.payload.pull_request.number;

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

    return categories;
}

function getTypeScriptChecklistItems() {
    return ['Make sure types pass'];
}

const CHECKLIST_CATEGORIES = {
    TS: getTypeScriptChecklistItems,
};

async function generateChecklist() {
    // Get the current checklist from the PR description
    // const checks = Set<String>
    // [{check: string, isChecked: bool}]

    // Generate dynamic checks
    const checks = new Set();
    const categories = await getChecklistCategoriesForPullRequest();
    for (const category of categories) {
        const checksForCategory = CHECKLIST_CATEGORIES[category]();
        for (const check of checksForCategory) {
            checks.add(check);
        }
    }

    for (const check of checks) {
        // Check if it's already in the PR body, capturing the whether or not it's already checked
        const regex = new RegExp(`- \\[([ x])] ${check}`);
    }
}
