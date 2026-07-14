/**
 * Interactive helper for exploring GitHubUtils in a REPL.
 *
 * Bun's REPL doesn't share scope with preloaded modules, so this script can't inject GitHubUtils into the REPL
 * automatically. Instead, `npm run octokit` runs this file to print the import line, then drops you into
 * `bun repl` — paste the printed line to load GitHubUtils.
 */

if (!process.env.GITHUB_REPOSITORY) {
    process.env.GITHUB_REPOSITORY = 'Expensify/App';
}

console.log(`Working directory: ${process.cwd()}`);
console.log("Paste this to load GitHubUtils: const {default: GitHubUtils} = await import('../.github/libs/GithubUtils.ts');\n");
