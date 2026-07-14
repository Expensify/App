#!/usr/bin/env bun
import CONST from '@github/libs/CONST';
import {getDeployChecklist, NoOpenDeployChecklistError} from '@github/libs/DeployChecklistUtils';
import GithubUtils from '@github/libs/GithubUtils';

// GitHub REST API request fields are snake_case (per_page, commit_sha, pull_number), which this rule would otherwise flag.
/* eslint-disable @typescript-eslint/naming-convention */

// Tags come back paginated; the request size and the "last page" check must stay in sync.
const TAGS_PER_PAGE = 100;

/**
 * When a deploy-blocker fix is cherry-picked to staging, QA needs to retest the blocker.
 * The deployer used to file that retest request in Slack by hand. This script does it for them.
 *
 * It fires only when all three are true:
 *   1. The deploy was triggered by a cherry-pick to staging.
 *   2. The cherry-picked PR is on the current StagingDeployCash checklist.
 *   3. An issue linked in that PR's body is listed as a deploy blocker on that same checklist.
 */

// Slack workflow webhook trigger. Empty values are rejected by Slack, so blanks are sent as this instead.
const EMPTY = 'N/A';

// Marker left on a PR after we file its retest request, so a re-run of the deploy doesn't file a duplicate.
const getRetestMarker = (tag: string) => `<!-- retest-requested:${tag} -->`;

type RetestHit = {
    prNumber: number;
    prURL: string;
    prAuthor: string;
    blockerIssueURL: string;
    prTitle: string;
};

/**
 * List the commit messages deployed since the previous staging release.
 * We look at the whole range, not just HEAD, because a cherry-pick pushes several commits
 * (version bumps plus the actual picked commit) and the picked commit isn't always HEAD.
 */
async function getDeployedCommitMessages(deploySHA: string, deployTag: string): Promise<string[]> {
    let previousStagingTag: string | null = null;
    for (let page = 1; !previousStagingTag; page++) {
        const {data: tags} = await GithubUtils.octokit.repos.listTags({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            per_page: TAGS_PER_PAGE,
            page,
        });
        if (tags.length === 0) {
            break;
        }
        previousStagingTag = tags.find((tag) => tag.name !== deployTag && tag.name.endsWith('-staging'))?.name ?? null;
        if (tags.length < TAGS_PER_PAGE) {
            break;
        }
    }

    if (!previousStagingTag) {
        const {data: headCommit} = await GithubUtils.octokit.git.getCommit({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            commit_sha: deploySHA,
        });
        return [headCommit.message];
    }

    const {data: comparison} = await GithubUtils.octokit.repos.compareCommits({
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        base: previousStagingTag,
        head: deploySHA,
    });
    return comparison.commits.map((commit) => commit.commit.message);
}

/**
 * `git cherry-pick -x` records `(cherry picked from commit <sha>)` in each new commit.
 * For the picked PR, that source SHA is the PR's original merge commit on main,
 * so we can resolve it back to the original pull request.
 */
function getCherryPickSourceSHAs(commitMessages: string[]): string[] {
    const shas = new Set<string>();
    for (const message of commitMessages) {
        for (const match of message.matchAll(/cherry picked from commit ([0-9a-f]{7,40})/g)) {
            shas.add(match[1]);
        }
    }
    return [...shas];
}

/** Resolve the original App PRs that produced the given merge commits. */
async function getPullRequestsForSHAs(shas: string[]): Promise<number[]> {
    const prNumbers = new Set<number>();
    for (const sha of shas) {
        const {data: pulls} = await GithubUtils.octokit.repos.listPullRequestsAssociatedWithCommit({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            commit_sha: sha,
        });
        for (const pull of pulls) {
            prNumbers.add(pull.number);
        }
    }
    return [...prNumbers];
}

/** Pull every App issue number linked anywhere in a PR body. */
function getLinkedIssueNumbers(prBody: string | null): number[] {
    if (!prBody) {
        return [];
    }
    const issueNumbers = new Set<number>();
    const issueURLRegex = new RegExp(`${CONST.APP_REPO_URL}/issues/(\\d+)`, 'g');
    for (const match of prBody.matchAll(issueURLRegex)) {
        issueNumbers.add(Number.parseInt(match[1], 10));
    }
    return [...issueNumbers];
}

/** Has a retest request for this staging deploy already been filed on this PR? */
async function alreadyFiled(prNumber: number, deployTag: string): Promise<boolean> {
    const comments = await GithubUtils.getAllComments(prNumber);
    const marker = getRetestMarker(deployTag);
    return comments.some((comment) => comment?.includes(marker));
}

/** Map a hit to the flat string payload the Slack workflow webhook expects. */
function buildRetestPayload(hit: RetestHit): Record<string, string> {
    return {
        isDb: 'dbTrue',
        whereToRetest: 'Staging',
        notes: `Auto-filed after cherry-pick to staging: "${hit.prTitle}"`,
        ghIssueLink: hit.blockerIssueURL,
        adhocLink: EMPTY,
        requesterName: hit.prAuthor || EMPTY,
        cpLink: hit.prURL,
        platforms: 'Android, iOS, Web',
    };
}

/** POST the retest request to the Slack workflow webhook. */
async function fireRetestRequest(hit: RetestHit, webhookURL: string): Promise<void> {
    const payload = buildRetestPayload(hit);

    const response = await fetch(webhookURL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error(`Slack webhook returned ${response.status} ${response.statusText}: ${await response.text()}`);
    }
}

async function run(): Promise<void> {
    const deploySHA = process.env.DEPLOY_SHA;
    const deployTag = process.env.DEPLOY_TAG;
    const webhookURL = process.env.SLACK_RETEST_WEBHOOK;
    if (!deploySHA || !deployTag) {
        throw new Error('DEPLOY_SHA and DEPLOY_TAG are required');
    }
    if (!webhookURL) {
        throw new Error('SLACK_RETEST_WEBHOOK is required');
    }

    const commitMessages = await getDeployedCommitMessages(deploySHA, deployTag);
    const sourceSHAs = getCherryPickSourceSHAs(commitMessages);
    if (sourceSHAs.length === 0) {
        console.log('No cherry-pick source commits found in this deploy, nothing to do.');
        return;
    }

    const candidatePRNumbers = await getPullRequestsForSHAs(sourceSHAs);
    if (candidatePRNumbers.length === 0) {
        console.log('No original PRs resolved from cherry-pick source commits, nothing to do.');
        return;
    }

    let checklist;
    try {
        checklist = await getDeployChecklist();
    } catch (error) {
        if (error instanceof NoOpenDeployChecklistError) {
            console.log('No open deploy checklist, nothing to retest against.');
            return;
        }
        throw error;
    }

    const checklistPRNumbers = new Set(checklist.PRList.map((item) => item.number));
    const blockerIssueByNumber = new Map(checklist.deployBlockers.map((item) => [item.number, item.url]));

    const hits: RetestHit[] = [];
    for (const prNumber of candidatePRNumbers) {
        // Gate 2: the cherry-picked PR must be on the current checklist.
        if (!checklistPRNumbers.has(prNumber)) {
            continue;
        }

        const {data: pull} = await GithubUtils.octokit.pulls.get({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            pull_number: prNumber,
        });

        // Gate 3: a linked issue in the PR body must be a deploy blocker on the checklist.
        const blockerIssueNumber = getLinkedIssueNumbers(pull.body).find((issueNumber) => blockerIssueByNumber.has(issueNumber));
        if (!blockerIssueNumber) {
            continue;
        }

        if (await alreadyFiled(prNumber, deployTag)) {
            console.log(`Retest for PR #${prNumber} on ${deployTag} was already filed, skipping.`);
            continue;
        }

        hits.push({
            prNumber,
            prURL: pull.html_url,
            prAuthor: pull.user?.login ?? '',
            blockerIssueURL: blockerIssueByNumber.get(blockerIssueNumber) ?? '',
            prTitle: pull.title,
        });
    }

    if (hits.length === 0) {
        console.log('No cherry-picked deploy-blocker fixes matched, nothing to file.');
        return;
    }

    for (const hit of hits) {
        await fireRetestRequest(hit, webhookURL);
        await GithubUtils.createComment(
            CONST.APP_REPO,
            hit.prNumber,
            `${getRetestMarker(deployTag)}\n🔁 Filed a Staging retest request for deploy blocker ${hit.blockerIssueURL} after this PR was cherry-picked to staging.`,
        );
        console.log(`Filed retest request for PR #${hit.prNumber} (blocker ${hit.blockerIssueURL}).`);
    }
}

if (require.main === module) {
    run().catch((error: unknown) => {
        console.error(error);
        process.exit(1);
    });
}

export default run;
export {getCherryPickSourceSHAs, getLinkedIssueNumbers, buildRetestPayload, getRetestMarker};
export type {RetestHit};
