const core = require('@actions/core');
const github = require('@actions/github');
const functions = require('./functions');

const MAX_RETRIES = 10;

const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', {required: true}));
let semanticVersionLevel = core.getInput('SEMVER_LEVEL', {require: true});

// SEMVER_LEVEL defaults to BUILD
if (!semanticVersionLevel || !Object.values(functions.semanticVersionLevels).find(v => v === semanticVersionLevel)) {
    console.log(
        `Invalid input for 'SEMVER_LEVEL': ${semanticVersionLevel}`,
        `Defaulting to: ${functions.semanticVersionLevels.build}`,
    );
    semanticVersionLevel = functions.semanticVersionLevels.build;
}

// eslint-disable-next-line no-shadow
const bumpVersion = async (core, github, semanticVersionLevel) => {
    console.log('Fetching tags from github...');
    const response = await octokit.repos.listTags({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
    });
    const tags = response.data.map(tag => tag.name);

    // tags come from latest to oldest
    const highestVersion = tags[0];
    console.log(`Highest version found: ${highestVersion}.`);

    const newVersion = functions.incrementVersion(highestVersion, semanticVersionLevel);

    core.setOutput('VERSION', newVersion);

    const {stdout} = await functions.execUpdateToNewVersion(newVersion);
    console.log(stdout);
};


// It's possible that two PRs were merged in rapid succession.
// In this case, both PRs will attempt to update to the same npm version.
// This will cause the deploy to fail with an exit code 128
// saying the git tag for that version already exists.
for (let retry = 0; retry < MAX_RETRIES; retry++) {
    try {
        bumpVersion(core, github, semanticVersionLevel);
        break;
    } catch (error) {
        console.log(
            'Err: npm version conflict, attempting to automatically resolve',
            `retryCount: ${retry}`,
        );
        console.log(error);
    }
}
