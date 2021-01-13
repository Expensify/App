const {exec} = require('child_process');
const core = require('@actions/core');
const github = require('@actions/github');

// Use Github Actions' default environment variables to get repo information
// https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables#default-environment-variables
const [repoOwner, repoName] = process.env.GITHUB_REPOSITORY.split('/');

const MAX_RETRIES = 10;
let errCount = 0;
let shouldRetry;

do {
    shouldRetry = false;
    exec('npm version prerelease -m "Update version to %s"', (err, stdout, stderr) => {
        console.log(stdout);
        if (err) {
            console.log(stderr);

            // It is possible that two PRs were merged in rapid succession.
            // In this case, both PRs will attempt to update to the same npm version.
            // This will cause the deploy to fail with an exit code 128, saying the git tag for that version already exists.
            if (errCount < MAX_RETRIES) {
                console.log(
                    'Err: npm version conflict, attempting to automatically resolve',
                    `retryCount: ${++errCount}`,
                );
                shouldRetry = true;
                const currentPatchVersion = require('../../../package.json').version.slice(0, -4);

                // Get the highest build version git tag from the repo
                console.log('Fetching tags from github...');
                const octokit = github.getOctokit(core.getInput('githubToken'));
                octokit.repos.listTags({
                    owner: repoOwner,
                    repo: repoName,
                })
                    .then(tags => {
                        const highestBuildNumber = Math.max(...(tags.filter(tag =>
                            tag.name.startsWith(currentPatchVersion)
                        )));
                        console.log('Highest build number from current patch version:', highestBuildNumber);

                        const newBuildNumber = `${currentPatchVersion}-${highestBuildNumber + 1}`;
                        console.log(`Setting npm version for this PR to ${newBuildNumber}`);
                        exec(`npm version ${newBuildNumber} -m "Update version to ${newBuildNumber}"`, (err, stdout, stderr) => {
                            console.log(stdout);
                            if (err) {
                                console.log(stderr);
                            }
                        });
                    })
            } else {
                core.setFailed(err);
            }
        }
    });
} while (shouldRetry);
