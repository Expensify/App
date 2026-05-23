import * as core from '@actions/core';
import * as github from '@actions/github';
import isAuthorizedContributor from '@github/libs/ContributorAuthorization';

async function run(): Promise<void> {
    const prNumber = Number.parseInt(core.getInput('PR_NUMBER', {required: true}), 10);
    const prAuthor = core.getInput('PR_AUTHOR', {required: true});
    const authorAssociation = core.getInput('AUTHOR_ASSOCIATION', {required: true});
    const githubToken = core.getInput('GITHUB_TOKEN', {required: true});
    const orgToken = core.getInput('OS_BOTIFY_TOKEN', {required: true});

    const {owner, repo} = github.context.repo;

    const authorized = await isAuthorizedContributor({
        prNumber,
        prAuthor,
        authorAssociation,
        repoOwner: owner,
        repoName: repo,
        githubToken,
        orgToken,
    });

    core.setOutput('IS_AUTHORIZED', authorized ? 'true' : 'false');
}

if (require.main === module) {
    run().catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        core.setFailed(message);
    });
}

export default run;
