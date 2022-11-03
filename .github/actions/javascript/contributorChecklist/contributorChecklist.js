const core = require('@actions/core');
const github = require('@actions/github');
const _ = require('underscore');
const GitHubUtils = require('../../../libs/GithubUtils');
const https = require('https');

const pathToReviewerChecklist = 'https://raw.githubusercontent.com/Expensify/App/main/contributingGuides/REVIEWER_CHECKLIST.md';
const reviewerChecklistStartsWith = '## Reviewer Checklist';

/* eslint-disable max-len */
const completedAuthorChecklist = `- [x] I linked the correct issue in the \`### Fixed Issues\` section above
- [x] I wrote clear testing steps that cover the changes made in this PR
    - [x] I added steps for local testing in the \`Tests\` section
    - [x] I added steps for Staging and/or Production testing in the \`QA steps\` section
    - [x] I added steps to cover failure scenarios (i.e. verify an input displays the correct error message if the entered data is not correct)
    - [x] I turned off my network connection and tested it while offline to ensure it matches the expected behavior (i.e. verify the default avatar icon is displayed if app is offline)
- [x] I included screenshots or videos for tests on [all platforms](https://github.com/Expensify/App/blob/main/contributingGuides/CONTRIBUTING.md#make-sure-you-can-test-on-all-platforms)
- [x] I ran the tests on **all platforms** & verified they passed on:
    - [x] iOS / native
    - [x] Android / native
    - [x] iOS / Safari
    - [x] Android / Chrome
    - [x] MacOS / Chrome
    - [x] MacOS / Desktop
- [x] I verified there are no console errors (if there's a console error not related to the PR, report it or open an issue for it to be fixed)
- [x] I followed proper code patterns (see [Reviewing the code](https://github.com/Expensify/App/blob/main/contributingGuides/PR_REVIEW_GUIDELINES.md#reviewing-the-code))
    - [x] I verified that any callback methods that were added or modified are named for what the method does and never what callback they handle (i.e. \`toggleReport\` and not \`onIconClick\`)
    - [x] I verified that comments were added to code that is not self explanatory
    - [x] I verified that any new or modified comments were clear, correct English, and explained "why" the code was doing something instead of only explaining "what" the code was doing.
    - [x] I verified any copy / text shown in the product was added in all \`src/languages/*\` files
    - [x] I verified any copy / text that was added to the app is correct English and approved by marketing by adding the \`Waiting for Copy\` label for a copy review on the original GH to get the correct copy.
    - [x] I verified proper file naming conventions were followed for any new files or renamed files. All non-platform specific files are named after what they export and are not named "index.js". All platform-specific files are named for the platform the code supports as outlined in the README.
    - [x] I verified the JSDocs style guidelines (in [\`STYLE.md\`](https://github.com/Expensify/App/blob/main/contributingGuides/STYLE.md#jsdocs)) were followed
- [x] If a new code pattern is added I verified it was agreed to be used by multiple Expensify engineers
- [x] I followed the guidelines as stated in the [Review Guidelines](https://github.com/Expensify/App/blob/main/contributingGuides/PR_REVIEW_GUIDELINES.md)
- [x] I tested other components that can be impacted by my changes (i.e. if the PR modifies a shared library or component like \`Avatar\`, I verified the components using \`Avatar\` are working as expected)
- [x] I verified all code is DRY (the PR doesn't include any logic written more than once, with the exception of tests)
- [x] I verified any variables that can be defined as constants (ie. in CONST.js or at the top of the file that uses the constant) are defined as such
- [x] If a new component is created I verified that:
    - [x] A similar component doesn't exist in the codebase
    - [x] All props are defined accurately and each prop has a \`/** comment above it */\`
    - [x] The file is named correctly
    - [x] The component has a clear name that is non-ambiguous and the purpose of the component can be inferred from the name alone
    - [x] The only data being stored in the state is data necessary for rendering and nothing else
    - [x] For Class Components, any internal methods passed to components event handlers are bound to \`this\` properly so there are no scoping issues (i.e. for \`onClick={this.submit}\` the method \`this.submit\` should be bound to \`this\` in the constructor)
    - [x] Any internal methods bound to \`this\` are necessary to be bound (i.e. avoid \`this.submit = this.submit.bind(this);\` if \`this.submit\` is never passed to a component event handler like \`onClick\`)
    - [x] All JSX used for rendering exists in the render method
    - [x] The component has the minimum amount of code necessary for its purpose, and it is broken down into smaller components in order to separate concerns and functions
- [x] If a new CSS style is added I verified that:
    - [x] A similar style doesn't already exist
    - [x] The style can't be created with an existing [StyleUtils](https://github.com/Expensify/App/blob/main/src/styles/StyleUtils.js) function (i.e. \`StyleUtils.getBackgroundAndBorderStyle(themeColors.componentBG\`)
- [x] If the PR modifies a generic component, I tested and verified that those changes do not break usages of that component in the rest of the App (i.e. if a shared library or component like \`Avatar\` is modified, I verified that \`Avatar\` is working as expected in all cases)
- [x] If the PR modifies a component related to any of the existing Storybook stories, I tested and verified all stories for that component are still working as expected.
- [x] I have checked off every checkbox in the PR author checklist, including those that don't apply to this PR.`;

const completedReviewerChecklist = `- [x] I have verified the author checklist is complete (all boxes are checked off).
- [x] I verified the correct issue is linked in the \`### Fixed Issues\` section above
- [x] I verified testing steps are clear and they cover the changes made in this PR
    - [x] I verified the steps for local testing are in the \`Tests\` section
    - [x] I verified the steps for Staging and/or Production testing are in the \`QA steps\` section
    - [x] I verified the steps cover any possible failure scenarios (i.e. verify an input displays the correct error message if the entered data is not correct)
    - [x] I turned off my network connection and tested it while offline to ensure it matches the expected behavior (i.e. verify the default avatar icon is displayed if app is offline)
- [x] I checked that screenshots or videos are included for tests on [all platforms](https://github.com/Expensify/App/blob/main/contributingGuides/CONTRIBUTING.md#make-sure-you-can-test-on-all-platforms)
- [x] I included screenshots or videos for tests on [all platforms](https://github.com/Expensify/App/blob/main/contributingGuides/CONTRIBUTING.md#make-sure-you-can-test-on-all-platforms)
- [x] I verified tests pass on **all platforms** & I tested again on:
    - [x] iOS / native
    - [x] Android / native
    - [x] iOS / Safari
    - [x] Android / Chrome
    - [x] MacOS / Chrome
    - [x] MacOS / Desktop
- [x] If there are any errors in the console that are unrelated to this PR, I either fixed them (preferred) or linked to where I reported them in Slack
- [x] I verified proper code patterns were followed (see [Reviewing the code](https://github.com/Expensify/App/blob/main/contributingGuides/PR_REVIEW_GUIDELINES.md#reviewing-the-code))
    - [x] I verified that any callback methods that were added or modified are named for what the method does and never what callback they handle (i.e. \`toggleReport\` and not \`onIconClick\`).
    - [x] I verified that comments were added to code that is not self explanatory
    - [x] I verified that any new or modified comments were clear, correct English, and explained "why" the code was doing something instead of only explaining "what" the code was doing.
    - [x] I verified any copy / text shown in the product was added in all \`src/languages/*\` files
    - [x] I verified any copy / text that was added to the app is correct English and approved by marketing by adding the \`Waiting for Copy\` label for a copy review on the original GH to get the correct copy.
    - [x] I verified proper file naming conventions were followed for any new files or renamed files. All non-platform specific files are named after what they export and are not named "index.js". All platform-specific files are named for the platform the code supports as outlined in the README.
    - [x] I verified the JSDocs style guidelines (in [\`STYLE.md\`](https://github.com/Expensify/App/blob/main/contributingGuides/STYLE.md#jsdocs)) were followed
- [x] If a new code pattern is added I verified it was agreed to be used by multiple Expensify engineers
- [x] I verified that this PR follows the guidelines as stated in the [Review Guidelines](https://github.com/Expensify/App/blob/main/contributingGuides/PR_REVIEW_GUIDELINES.md)
- [x] I verified other components that can be impacted by these changes have been tested, and I retested again (i.e. if the PR modifies a shared library or component like \`Avatar\`, I verified the components using \`Avatar\` have been tested & I retested again)
- [x] I verified all code is DRY (the PR doesn't include any logic written more than once, with the exception of tests)
- [x] I verified any variables that can be defined as constants (ie. in CONST.js or at the top of the file that uses the constant) are defined as such
- [x] If a new component is created I verified that:
    - [x] A similar component doesn't exist in the codebase
    - [x] All props are defined accurately and each prop has a \`/** comment above it */\`
    - [x] The file is named correctly
    - [x] The component has a clear name that is non-ambiguous and the purpose of the component can be inferred from the name alone
    - [x] The only data being stored in the state is data necessary for rendering and nothing else
    - [x] For Class Components, any internal methods passed to components event handlers are bound to \`this\` properly so there are no scoping issues (i.e. for \`onClick={this.submit}\` the method \`this.submit\` should be bound to \`this\` in the constructor)
    - [x] Any internal methods bound to \`this\` are necessary to be bound (i.e. avoid \`this.submit = this.submit.bind(this);\` if \`this.submit\` is never passed to a component event handler like \`onClick\`)
    - [x] All JSX used for rendering exists in the render method
    - [x] The component has the minimum amount of code necessary for its purpose, and it is broken down into smaller components in order to separate concerns and functions
- [x] If a new CSS style is added I verified that:
    - [x] A similar style doesn't already exist
    - [x] The style can't be created with an existing [StyleUtils](https://github.com/Expensify/App/blob/main/src/styles/StyleUtils.js) function (i.e. \`StyleUtils.getBackgroundAndBorderStyle(themeColors.componentBG\`)
- [x] If the PR modifies a generic component, I tested and verified that those changes do not break usages of that component in the rest of the App (i.e. if a shared library or component like \`Avatar\` is modified, I verified that \`Avatar\` is working as expected in all cases)
- [x] If the PR modifies a component related to any of the existing Storybook stories, I tested and verified all stories for that component are still working as expected.
- [x] I have checked off every checkbox in the PR reviewer checklist, including those that don't apply to this PR.`;

/**
 * @returns {Promise}
 */
function getNumberOfItemsFromAuthorChecklist() {
    return new Promise((resolve) => {
        const numberOfChecklistItems = (completedAuthorChecklist.match(/-[x]/g) || []).length;
        resolve(numberOfChecklistItems);
    });
}

/**
 * @returns {Promise}
 */
function getNumberOfItemsFromReviewerChecklist() {
    return new Promise((resolve, reject) => {
        https.get(pathToReviewerChecklist, (res) => {
            let fileContents = '';
            res.on('data', function (chunk) {
                fileContents += chunk;
            });
            res.on('end', function () {
                const numberOfChecklistItems = (fileContents.match(/-[ ]/g) || []).length;
                resolve(numberOfChecklistItems);
            });
        })
            .on('error', reject);
    });
}

function checkIssueForCompletedChecklist(verifyingAuthorChecklist, numberOfChecklistItems) {

}

// The author checklist is being checklist
getNumberOfItemsFromAuthorChecklist()
    .then((numberOfChecklistItems) => {
        checkIssueForCompletedChecklist(true, numberOfChecklistItems);
    }, (err) => {
        console.error(err);
    });

// The reviewer checklist is being checked
getNumberOfItemsFromReviewerChecklist()
    .then((numberOfChecklistItems) => {
        checkIssueForCompletedChecklist(false, numberOfChecklistItems);
    }, (err) => {
        console.error(err);
    });
return;

// True if we are validating an author checklist, otherwise we are validating a reviewer checklist
const verifyingAuthorChecklist = core.getInput('CHECKLIST', {required: true}) === 'contributor';
const issue = github.context.payload.issue ? github.context.payload.issue.number : github.context.payload.pull_request.number;
const combinedData = [];

function getPullRequestBody() {
    return GitHubUtils.octokit.pulls.get({
        owner: GitHubUtils.GITHUB_OWNER,
        repo: GitHubUtils.APP_REPO,
        pull_number: issue,
    }).then(({data: pullRequestComment}) => pullRequestComment.body);
}

function getAllReviewComments() {
    return GitHubUtils.paginate(GitHubUtils.octokit.pulls.listReviews, {
        owner: GitHubUtils.GITHUB_OWNER,
        repo: GitHubUtils.APP_REPO,
        pull_number: issue,
        per_page: 100,
    }, response => _.map(response.data, review => review.body));
}

function getAllComments() {
    return GitHubUtils.paginate(GitHubUtils.octokit.issues.listComments, {
        owner: GitHubUtils.GITHUB_OWNER,
        repo: GitHubUtils.APP_REPO,
        issue_number: issue,
        per_page: 100,
    }, response => _.map(response.data, comment => comment.body));
}

getPullRequestBody()
    .then(pullRequestBody => combinedData.push(pullRequestBody))
    .then(() => getAllReviewComments())
    .then(reviewComments => combinedData.push(...reviewComments))
    .then(() => getAllComments())
    .then(comments => combinedData.push(...comments))
    .then(() => {
        let authorChecklistComplete = false;
        let reviewerChecklistComplete = false;

        // Once we've gathered all the data, loop through each comment and look to see if it contains a completed checklist
        for (let i = 0; i < combinedData.length; i++) {
            const whitespace = /([\n\r])/gm;
            const comment = combinedData[i].replace(whitespace, '');

            if (comment.includes(completedAuthorChecklist.replace(whitespace, ''))) {
                authorChecklistComplete = true;
            }

            if (comment.includes(completedReviewerChecklist.replace(whitespace, ''))) {
                reviewerChecklistComplete = true;
            }
        }

        if (verifyingAuthorChecklist && !authorChecklistComplete) {
            console.log('Make sure you are using the most up to date checklist found here: https://raw.githubusercontent.com/Expensify/App/main/.github/PULL_REQUEST_TEMPLATE.md');
            core.setFailed('PR Author Checklist is not completely filled out. Please check every box to verify you\'ve thought about the item.');
            return;
        }

        if (!verifyingAuthorChecklist && !reviewerChecklistComplete) {
            console.log('Make sure you are using the most up to date checklist found here: https://raw.githubusercontent.com/Expensify/App/main/.github/PULL_REQUEST_TEMPLATE.md');
            core.setFailed('PR Reviewer Checklist is not completely filled out. Please check every box to verify you\'ve thought about the item.');
            return;
        }

        console.log(`${verifyingAuthorChecklist ? 'PR Author' : 'PR Reviewer'} checklist is complete 🎉`);
    });
