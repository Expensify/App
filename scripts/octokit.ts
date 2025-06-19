/* eslint-disable */

if (!process.env.GITHUB_REPOSITORY) {
    process.env.GITHUB_REPOSITORY = 'Expensify/App';
}

import GitHubUtils from '@github/libs/GithubUtils';

console.log('🐙 GitHubUtils has been imported to the repl.\n');
