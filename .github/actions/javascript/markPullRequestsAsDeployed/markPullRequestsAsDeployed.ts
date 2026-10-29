/* eslint-disable @typescript-eslint/naming-convention */
import * as ActionUtils from '@github/libs/ActionUtils';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';

import PromisePool from '@scripts/utils/PromisePool';

import * as core from '@actions/core';
import {context} from '@actions/github';

/**
 * Return a nicely formatted message for the table based on the result of the GitHub action job
 */
function getDeployTableMessage(platformResult: string): string {
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

function parseDeployList(input: unknown): number[] {
    if (!Array.isArray(input) || input.some((item) => typeof item !== 'string' && typeof item !== 'number')) {
        throw new TypeError('Deploy pull request list must be an array of strings or numbers');
    }

    return input.map((item) => Number.parseInt(String(item), 10));
}

async function commentPR(PR: number, message: string, repo: string = context.repo.repo) {
    try {
        await GithubUtils.createComment(repo, PR, message);
        console.log(`Comment created on ${repo}#${PR} successfully 🎉`);
    } catch (err) {
        console.log(`Unable to write comment on ${repo}#${PR} 😞`);
        if (err instanceof Error) {
            core.setFailed(err.message);
        }
    }
}

const workflowURL = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;

/**
 * Process deploy checklist comments for a list of PRs
 */
async function commentOnDeployChecklistPRs(
    prList: number[],
    repoName: string,
    recentTags: Awaited<ReturnType<typeof GithubUtils.octokit.repos.listTags>>['data'],
    version: string,
    getDeployMessage: (deployer: string, deployVerb: string, prTitle?: string) => string,
) {
    if (prList.length === 0) {
        return;
    }

    // CP labels persist after release, so only the current staging tag can identify a cherry-pick.
    const deploymentTag = recentTags.find((tag) => tag.name === `${version}-staging`);
    const deploymentCommit = deploymentTag
        ? (
              await GithubUtils.octokit.git.getCommit({
                  owner: CONST.GITHUB_OWNER,
                  repo: repoName,
                  commit_sha: deploymentTag.commit.sha,
              })
          ).data
        : undefined;
    const cherryPickedPR = deploymentCommit?.message.match(/Merge pull request #(\d+)[\S\s]*\(cherry picked from commit .*\)/)?.at(1);
    const cpActor = deploymentCommit?.message.match(/.*\(cherry-picked to .* by (.*)\)/)?.at(1);
    const pool = new PromisePool<void>(8);
    const commentPromises = prList.map((prNumber) =>
        pool.add(async () => {
            try {
                const {data: pr} = await GithubUtils.octokit.pulls.get({
                    owner: CONST.GITHUB_OWNER,
                    repo: repoName,
                    pull_number: prNumber,
                });

                const isCP = cherryPickedPR === String(prNumber);
                let deployer = pr.merged_by?.login;
                if (isCP && cpActor) {
                    deployer = cpActor;
                }

                const title = pr.title;
                const deployMessage = deployer ? getDeployMessage(deployer, isCP ? 'Cherry-picked' : 'Deployed', title) : '';
                await commentPR(prNumber, deployMessage, repoName);
            } catch (error) {
                // Preserve the former direct `.status` access ordering for nullish rejections.
                if (error === null || error === undefined) {
                    throw new TypeError(`Cannot read properties of ${String(error)} (reading 'status')`);
                }
                if ((typeof error === 'object' || typeof error === 'function') && 'status' in error && error.status === 404) {
                    console.log(`Unable to comment on ${repoName} PR #${prNumber}. GitHub responded with 404.`);
                } else if (repoName === CONST.MOBILE_EXPENSIFY_REPO && process.env.GITHUB_REPOSITORY !== `${CONST.GITHUB_OWNER}/${CONST.APP_REPO}`) {
                    console.warn(`Unable to comment on ${repoName} PR #${prNumber} from forked repository. This is expected.`);
                } else {
                    throw error;
                }
            }
        }),
    );

    await Promise.all(commentPromises);
}

async function run() {
    const prList = parseDeployList(ActionUtils.getJSONInput('PR_LIST', {required: true}));
    const mobileExpensifyPRListInput = ActionUtils.getJSONInput('MOBILE_EXPENSIFY_PR_LIST', {required: false});
    const mobileExpensifyPRList = Array.isArray(mobileExpensifyPRListInput) ? parseDeployList(mobileExpensifyPRListInput) : [];
    const isProd = !!ActionUtils.getJSONInput('IS_PRODUCTION_DEPLOY', {
        required: true,
    });
    const version = core.getInput('DEPLOY_VERSION', {required: true});

    const androidResult = getDeployTableMessage(core.getInput('ANDROID', {required: true}));
    const iOSResult = getDeployTableMessage(core.getInput('IOS', {required: true}));
    const webResult = getDeployTableMessage(core.getInput('WEB', {required: true}));

    const date = core.getInput('DATE');
    const note = core.getInput('NOTE');
    const androidSentryUrl = core.getInput('ANDROID_SENTRY_URL');
    const iosSentryUrl = core.getInput('IOS_SENTRY_URL');

    function getDeployMessage(deployer: string, deployVerb: string): string {
        let message = `🚀 [${deployVerb}](${workflowURL}) to ${isProd ? 'production' : 'staging'}`;
        message += ` by https://github.com/${deployer} in version: ${version} `;
        if (date) {
            message += `on ${date}`;
        }
        message += `🚀`;
        message += `\n\nplatform | result\n---|---`;
        message += `\n🕸 web 🕸|${webResult}`;
        message += `\n🤖 android 🤖|${androidResult}\n🍎 iOS 🍎|${iOSResult}`;

        if (note) {
            message += `\n\n_Note:_ ${note}`;
        }

        if (androidSentryUrl || iosSentryUrl) {
            message += `\n\n**Bundle Size Analysis (Sentry):**`;
            if (androidSentryUrl) {
                message += `\n- [Android](${androidSentryUrl})`;
            }
            if (iosSentryUrl) {
                message += `\n- [iOS](${iosSentryUrl})`;
            }
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
        const previousChecklistID = deployChecklists.at(0)?.number;
        if (!previousChecklistID) {
            throw new Error('Could not find the previous checklist ID');
        }

        // who closed the last deploy checklist?
        const deployer = await GithubUtils.getActorWhoClosedIssue(previousChecklistID);

        // Create comment on each pull request (up to 8 at a time via PromisePool to avoid throttling issues)
        const deployMessage = getDeployMessage(deployer, 'Deployed');
        const pool = new PromisePool<void>(8);
        await Promise.all(prList.map((pr) => pool.add(() => commentPR(pr, deployMessage))));
        console.log(`✅ Added production deploy comment on ${prList.length} App PRs`);

        // Comment on Mobile-Expensify PRs as well
        await Promise.all(mobileExpensifyPRList.map((pr) => pool.add(() => commentPR(pr, deployMessage, CONST.MOBILE_EXPENSIFY_REPO))));
        if (mobileExpensifyPRList.length > 0) {
            console.log(`✅ Added production deploy comment on ${mobileExpensifyPRList.length} Mobile-Expensify PRs`);
        }
        return;
    }

    const {data: appRecentTags} = await GithubUtils.octokit.repos.listTags({
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        per_page: 100,
    });

    // Only fetch Mobile-Expensify tags if there are Mobile-Expensify PRs
    let mobileExpensifyRecentTags: typeof appRecentTags = [];
    if (mobileExpensifyPRList.length > 0) {
        try {
            const response = await GithubUtils.octokit.repos.listTags({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.MOBILE_EXPENSIFY_REPO,
                per_page: 100,
            });
            mobileExpensifyRecentTags = response.data;
        } catch (error) {
            if (process.env.GITHUB_REPOSITORY !== `${CONST.GITHUB_OWNER}/${CONST.APP_REPO}`) {
                console.warn('Unable to fetch Mobile-Expensify tags from forked repository. This is expected.');
            } else {
                console.error('Failed to fetch Mobile-Expensify tags:', error);
            }
        }
    }

    // Comment on the PRs
    await commentOnDeployChecklistPRs(prList, CONST.APP_REPO, appRecentTags, version, getDeployMessage);
    console.log(`✅ Added staging deploy comment ${prList.length} App PRs`);

    if (mobileExpensifyPRList.length > 0) {
        await commentOnDeployChecklistPRs(mobileExpensifyPRList, CONST.MOBILE_EXPENSIFY_REPO, mobileExpensifyRecentTags, version, getDeployMessage);
        console.log(`✅ Completed staging deploy comment on ${mobileExpensifyPRList.length} Mobile-Expensify PRs`);
    }
}

if (import.meta.main) {
    run();
}

export default run;
