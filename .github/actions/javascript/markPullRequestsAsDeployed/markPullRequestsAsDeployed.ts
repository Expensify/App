/* eslint-disable @typescript-eslint/naming-convention, import/no-import-module-exports */
import * as core from '@actions/core';
import {context} from '@actions/github';
import type {RequestError} from '@octokit/types';
import memoize from 'lodash/memoize';
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

const getCommit = memoize(GithubUtils.octokit.git.getCommit);

/**
 * Process staging deploy comments for a list of PRs
 */
async function commentStagingDeployPRs(
    prList: number[],
    repoName: string,
    recentTags: Awaited<ReturnType<typeof GithubUtils.octokit.repos.listTags>>['data'],
    getDeployMessage: (deployer: string, deployVerb: string, prTitle?: string) => string,
) {
    for (const prNumber of prList) {
        try {
            const {data: pr} = await GithubUtils.octokit.pulls.get({
                owner: CONST.GITHUB_OWNER,
                repo: repoName,
                pull_number: prNumber,
            });

            // Find the deployer: either the merger, or for CPs, the tag creator
            const isCP = pr.labels.some(({name: labelName}) => labelName === CONST.LABELS.CP_STAGING);
            let deployer = pr.merged_by?.login;
            if (isCP) {
                for (const tag of recentTags) {
                    const {data: commit} = await getCommit({
                        owner: CONST.GITHUB_OWNER,
                        repo: repoName,
                        commit_sha: tag.commit.sha,
                    });
                    const prNumForCPMergeCommit = commit.message.match(/Merge pull request #(\d+)[\S\s]*\(cherry picked from commit .*\)/);
                    if (prNumForCPMergeCommit?.at(1) === String(prNumber)) {
                        const cpActor = commit.message.match(/.*\(cherry-picked to .* by (.*)\)/)?.at(1);
                        if (cpActor) {
                            deployer = cpActor;
                        }
                        break;
                    }
                }
            }

            const title = pr.title;
            const deployMessage = deployer ? getDeployMessage(deployer, isCP ? 'Cherry-picked' : 'Deployed', title) : '';
            await commentPR(prNumber, deployMessage, repoName);
        } catch (error) {
            if ((error as RequestError).status === 404) {
                console.log(`Unable to comment on ${repoName} PR #${prNumber}. GitHub responded with 404.`);
            } else if (repoName === CONST.MOBILE_EXPENSIFY_REPO && process.env.GITHUB_REPOSITORY !== `${CONST.GITHUB_OWNER}/${CONST.APP_REPO}`) {
                console.warn(`Unable to comment on ${repoName} PR #${prNumber} from forked repository. This is expected.`);
            } else {
                throw error;
            }
        }
    }
}

async function run() {
    const prList = (ActionUtils.getJSONInput('PR_LIST', {required: true}) as string[]).map((num) => Number.parseInt(num, 10));
    const mobileExpensifyPRListInput = ActionUtils.getJSONInput('MOBILE_EXPENSIFY_PR_LIST', {required: false});
    const mobileExpensifyPRList = Array.isArray(mobileExpensifyPRListInput) ? mobileExpensifyPRListInput.map((num: string) => Number.parseInt(num, 10)) : [];
    const isProd = ActionUtils.getJSONInput('IS_PRODUCTION_DEPLOY', {required: true}) as boolean;
    const version = core.getInput('DEPLOY_VERSION', {required: true});

    const androidResult = getDeployTableMessage(core.getInput('ANDROID', {required: true}) as PlatformResult);
    const iOSResult = getDeployTableMessage(core.getInput('IOS', {required: true}) as PlatformResult);
    const webResult = getDeployTableMessage(core.getInput('WEB', {required: true}) as PlatformResult);

    const date = core.getInput('DATE');
    const note = core.getInput('NOTE');

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

        // Create comment on each pull request (one at a time to avoid throttling issues)
        const deployMessage = getDeployMessage(deployer, 'Deployed');
        for (const pr of prList) {
            await commentPR(pr, deployMessage);
        }
        console.log(`✅ Added production deploy comment on ${prList.length} App PRs`);

        // Comment on Mobile-Expensify PRs as well
        for (const pr of mobileExpensifyPRList) {
            await commentPR(pr, deployMessage, CONST.MOBILE_EXPENSIFY_REPO);
        }
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
    await commentStagingDeployPRs(prList, CONST.APP_REPO, appRecentTags, getDeployMessage);
    console.log(`✅ Added staging deploy comment ${prList.length} App PRs`);

    if (mobileExpensifyPRList.length > 0) {
        await commentStagingDeployPRs(mobileExpensifyPRList, CONST.MOBILE_EXPENSIFY_REPO, mobileExpensifyRecentTags, getDeployMessage);
        console.log(`✅ Completed staging deploy comment on ${mobileExpensifyPRList.length} Mobile-Expensify PRs`);
    }
}

if (require.main === module) {
    run();
}

module.exports = run;
