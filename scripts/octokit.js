"use strict";
if (!process.env.GITHUB_REPOSITORY) {
    process.env.GITHUB_REPOSITORY = 'Expensify/App';
}
// eslint-disable-next-line
var GitHubUtils = require('@github/libs/GithubUtils').default;
console.log("Working directory: ".concat(process.cwd()));
console.log('🐙 GitHubUtils has been imported to the repl.\n');
