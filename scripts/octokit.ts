if (!process.env.GITHUB_REPOSITORY) {
    process.env.GITHUB_REPOSITORY = 'Expensify/App';
}

// eslint-disable-next-line
const {default: GitHubUtils} = require('@github/libs/GithubUtils');

console.log(`Working directory: ${process.cwd()}`);
console.log('🐙 GitHubUtils has been imported to the repl.\n');
