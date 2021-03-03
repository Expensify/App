const {exec} = require('child_process');

// const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');
const functions = require('./functions');

// Use Github Actions' default environment variables to get repo information
// https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables#default-environment-variables
// const [repoOwner, repoName] = process.env.GITHUB_REPOSITORY.split('/');

const MAX_RETRIES = 10;
let errCount = 0;
let shouldRetry;

do {
    shouldRetry = false;
    // eslint-disable-next-line no-loop-func
    exec('npm version prerelease -m "Update version to %s"', (err, stdout, stderr) => {
        console.log(stdout);
        if (err) {
            console.log(stderr);

            // It's possible that two PRs were merged in rapid succession.
            // In this case, both PRs will attempt to update to the same npm version.
            // This will cause the deploy to fail with an exit code 128
            // saying the git tag for that version already exists.
            if (errCount < MAX_RETRIES) {
                console.log(
                    'Err: npm version conflict, attempting to automatically resolve',
                    `retryCount: ${++errCount}`,
                );
                shouldRetry = true;

                // const { version } = JSON.parse(fs.readFileSync('./package.json'));

                // const currentPatchVersion = `v${version.slice(0, -4)}`;
                // console.log('Current patch version:', currentPatchVersion);

                console.log('Fetching tags from github...');
                const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', {required: true}));
                octokit.repos.listTags({
                    owner: github.context.repo.owner,
                    repo: github.context.repo.repo,
                })
                    .then((response) => {
                        const tags = response.data.map(tag => tag.name);

                        // tags come from latest to oldest
                        const highestVersion = tags[0];
                        console.log(`Highest version found: ${highestVersion}.`);

                        let semanticVersionLevel = core.getInput('SEMVER_LEVEL', {require: true});

                        // SEMVER_LEVEL defaults to BUILD
                        // it actually would fall to build anyway, but I think it is better to make it explicity
                        if (!semanticVersionLevel || !Object.values(functions.semanticVersionLevels)
                            .find(v => v === semanticVersionLevel)) {
                            // eslint-disable-next-line max-len, semi
                            console.log(`Invalid input for 'SEMVER_LEVEL': ${semanticVersionLevel},defaulting to: ${functions.semanticVersionLevels.build}`)
                            semanticVersionLevel = functions.semanticVersionLevels.build;
                        }
                        const newVersion = functions.incrementVersion(highestVersion, semanticVersionLevel);

                        core.setOutput('VERSION', newVersion);

                        functions.execUpdateToNewVersion(newVersion);
                    })
                    .catch(exception => core.setFailed(exception));
            } else {
                core.setFailed(err);
            }
        }
    });
} while (shouldRetry);
