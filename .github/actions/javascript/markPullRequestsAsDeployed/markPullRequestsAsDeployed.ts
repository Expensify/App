/* eslint-disable @typescript-eslint/naming-convention, import/no-import-module-exports */
import * as core from '@actions/core';
import {context} from '@actions/github';
import * as ActionUtils from '@github/libs/ActionUtils';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';

type PlatformResult = 'success' | 'cancelled' | 'skipped' | 'failure';

/**
 * Return a nicely formatted message for the table based on the result of the GitHub action job
 */
function getDeployTableMessage(platformResult: PlatformResult): string {
    switch (platformResult) {
        case 'success':
            return `${platformResult} ✅`;
        case 'cancelled':
            return `${platformResult} 🔪`;
        case 'skipped':
            return `${platformResult} 🚫`;
        case 'failure':
        default:
            return `${platformResult} ❌`;
    }
}

/**
 * Comment Single PR
 */
async function commentPR(PR: number, message: string) {
    try {
        await GithubUtils.createComment(context.repo.repo, PR, message);
        console.log(`Comment created on #${PR} successfully 🎉`);
    } catch (err) {
        console.log(`Unable to write comment on #${PR} 😞`);
        if (err instanceof Error) {
            core.setFailed(err.message);
        }
    }
}

const workflowURL = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;

async function run() {
    const prList = ActionUtils.getJSONInput('PR_LIST', {required: true}).map((num: string) => Number.parseInt(num, 10));
    const isProd = ActionUtils.getJSONInput('IS_PRODUCTION_DEPLOY', {required: true});
    const version = core.getInput('DEPLOY_VERSION', {required: true});

    const androidResult = getDeployTableMessage(core.getInput('ANDROID', {required: true}) as PlatformResult);
    const desktopResult = getDeployTableMessage(core.getInput('DESKTOP', {required: true}) as PlatformResult);
    const iOSResult = getDeployTableMessage(core.getInput('IOS', {required: true}) as PlatformResult);
    const webResult = getDeployTableMessage(core.getInput('WEB', {required: true}) as PlatformResult);

    function getDeployMessage(deployer: string, deployVerb: string, prTitle?: string): string {
        let message = `🚀 [${deployVerb}](${workflowURL}) to ${isProd ? 'production' : 'staging'}`;
        message += ` by https://github.com/${deployer} in version: ${version} 🚀`;
        message += `\n\nplatform | result\n---|---\n🤖 android 🤖|${androidResult}\n🖥 desktop 🖥|${desktopResult}`;
        message += `\n🍎 iOS 🍎|${iOSResult}\n🕸 web 🕸|${webResult}`;

        if (deployVerb === 'Cherry-picked' && !/no ?qa/gi.test(prTitle ?? '')) {
            // eslint-disable-next-line max-len
            message +=
                '\n\n@Expensify/applauseleads please QA this PR and check it off on the [deploy checklist](https://github.com/Expensify/App/issues?q=is%3Aopen+is%3Aissue+label%3AStagingDeployCash) if it passes.';
        }

        return message;
    }

    if (isProd) {
        // Find the previous deploy checklist
        const {data: deployChecklists} = await GithubUtils.octokit.issues.listForRepo({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            labels: CONST.LABELS.STAGING_DEPLOY,
            state: 'closed',
        });
        const previousChecklistID = deployChecklists[0].number;

        // who closed the last deploy checklist?
        const deployer = await GithubUtils.getActorWhoClosedIssue(previousChecklistID);

        // Create comment on each pull request (one at a time to avoid throttling issues)
        const deployMessage = getDeployMessage(deployer, 'Deployed');
        for (const pr of prList) {
            await commentPR(pr, deployMessage);
        }
        return;
    }

    // First find out if this is a normal staging deploy or a CP by looking at the commit message on the tag
    const {data: recentTags} = await GithubUtils.octokit.repos.listTags({
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        per_page: 100,
    });
    const currentTag = recentTags.find((tag) => tag.name === version);
    if (!currentTag) {
        const err = `Could not find tag matching ${version}`;
        console.error(err);
        core.setFailed(err);
        return;
    }
    const {data: commit} = await GithubUtils.octokit.git.getCommit({
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        commit_sha: currentTag.commit.sha,
    });
    const isCP = /[\S\s]*\(cherry picked from commit .*\)/.test(commit.message);

    for (const prNumber of prList) {
        /*
         * Determine who the deployer for the PR is. The "deployer" for staging deploys is:
         *   1. For regular staging deploys, the person who merged the PR.
         *   2. For CPs, the person who committed the cherry-picked commit (not necessarily the author of the commit).
         */
        const {data: pr} = await GithubUtils.octokit.pulls.get({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            pull_number: prNumber,
        });
        const deployer = isCP ? commit.committer.name : pr.merged_by?.login;

        const title = pr.title;
        const deployMessage = deployer ? getDeployMessage(deployer, isCP ? 'Cherry-picked' : 'Deployed', title) : '';
        await commentPR(prNumber, deployMessage);
    }
}

if (require.main === module) {
    run();
}

module.exports = run;
