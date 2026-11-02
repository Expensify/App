#!/usr/bin/env bun
import CONST from '@github/libs/CONST';
import {getDeployChecklist, getDeployChecklistData, NoOpenDeployChecklistError} from '@github/libs/DeployChecklistUtils';
import GithubUtils from '@github/libs/GithubUtils';

import CLI from 'expensify-common/CLI';

// GitHub REST API request fields are snake_case (per_page, commit_sha, pull_number), which this rule would otherwise flag.
/* eslint-disable @typescript-eslint/naming-convention */

// GitHub limits list and compare responses to 100 entries per page.
const GITHUB_PAGE_SIZE = 100;

/**
 * When a deploy-blocker fix is cherry-picked to staging, QA needs to retest the blocker.
 * The deployer used to file that retest request in Slack by hand. This script does it for them.
 *
 * It fires only when all three are true:
 *   1. The cherry-pick is included in a staging deploy on all platforms.
 *   2. The cherry-picked PR is on the current StagingDeployCash checklist.
 *   3. An issue linked in that PR's body is an unresolved deploy blocker on that same checklist.
 */

// Slack workflow webhook trigger. Empty values are rejected by Slack, so blanks are sent as this instead.
const EMPTY = 'N/A';

// The employee whitelist in Salt is what maps a GitHub login to a Slack member ID.
const WHITELIST_REPO = 'Salt';
const WHITELIST_PATH = 'www/files/www-whitelist.php';

// Each whitelist entry lists 'github' a few lines above 'slack', so keep the match bounded to one entry.
const WHITELIST_ENTRY_REGEX = /'github'\s*=>\s*'([^']+)'[\s\S]{0,400}?'slack'\s*=>\s*'([^']+)'/g;

const RETEST_MARKER_PREFIX = '<!-- retest-requested:';
const CHERRY_PICK_RETEST_MARKER_PREFIX = '<!-- retest-requested-cp:';
const RETEST_MARKER_SUFFIX = ' -->';
const RETEST_MARKER_REGEX = new RegExp(`${RETEST_MARKER_PREFIX}([^\\s]+)${RETEST_MARKER_SUFFIX}`);

// Marker left on a PR after we file its retest request, so a re-run of the deploy doesn't file a duplicate.
const getRetestMarker = (tag: string) => `${RETEST_MARKER_PREFIX}${tag}${RETEST_MARKER_SUFFIX}`;

// A later deploy can include the same cherry-pick, so its commit needs a marker independent of the deploy tag.
const getCherryPickRetestMarker = (sha: string) => `${CHERRY_PICK_RETEST_MARKER_PREFIX}${sha}${RETEST_MARKER_SUFFIX}`;

const DEPLOYER_CHANNEL_ID = 'C07J32337';
const RETESTS_CHANNEL_ID = 'C09V78U42D8';
const SLACK_HISTORY_PAGE_SIZE = 100;
const CHERRY_PICK_REQUEST_HISTORY_MAX_PAGES = 20;
const RETEST_MESSAGE_HISTORY_MAX_PAGES = 1;
const RETEST_MESSAGE_LOOKUP_ATTEMPTS = 6;
const RETEST_MESSAGE_LOOKUP_DELAY_MS = 5000;

type RetestHit = {
    prNumber: number;
    prURL: string;
    prAuthor: string;
    cherryPickSHA: string;
    // A single PR can fix more than one deploy blocker, so all of them go in one retest request.
    blockerIssueURLs: string[];
    prTitle: string;
    // Who asked for the cherry-pick, so QA knows who to chase for clarifications.
    author: string;
};

type CherryPick = {
    sourceSHA: string;
    cherryPickSHA: string;
    actor: string;
};

type DeployedCommit = {
    sha: string;
    message: string;
};

type SlackMessage = {
    text?: string;
    ts: string;
    thread_ts?: string;
};

type SlackResponse = {
    ok: boolean;
    error?: string;
};

type SlackHistoryResponse = SlackResponse & {
    messages?: SlackMessage[];
    response_metadata?: {
        next_cursor?: string;
    };
};

type SlackPermalinkResponse = SlackResponse & {
    permalink?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isSlackResponse(value: unknown): value is SlackResponse {
    return isRecord(value) && typeof value.ok === 'boolean' && (value.error === undefined || typeof value.error === 'string');
}

function isSlackMessage(value: unknown): value is SlackMessage {
    return (
        isRecord(value) &&
        typeof value.ts === 'string' &&
        (value.text === undefined || typeof value.text === 'string') &&
        (value.thread_ts === undefined || typeof value.thread_ts === 'string')
    );
}

function isSlackHistoryResponse(value: unknown): value is SlackHistoryResponse {
    if (!isRecord(value)) {
        return false;
    }
    const messages = value.messages;
    const metadata = value.response_metadata;
    return (
        (messages === undefined || (Array.isArray(messages) && messages.every(isSlackMessage))) &&
        (metadata === undefined || (isRecord(metadata) && (metadata.next_cursor === undefined || typeof metadata.next_cursor === 'string')))
    );
}

function isSlackPermalinkResponse(value: unknown): value is SlackPermalinkResponse {
    return isRecord(value) && (value.permalink === undefined || typeof value.permalink === 'string');
}

/** Use the same release boundary as the checklist so canceled deploys cannot hide earlier cherry-picks. */
async function getPreviousChecklistTag(checklistNumber: number): Promise<string> {
    let foundCurrentChecklist = false;
    for (let page = 1; ; page++) {
        const {data: checklists} = await GithubUtils.octokit.issues.listForRepo({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            labels: CONST.LABELS.STAGING_DEPLOY,
            state: 'all',
            sort: 'created',
            direction: 'desc',
            per_page: GITHUB_PAGE_SIZE,
            page,
        });
        for (const checklist of checklists) {
            if (foundCurrentChecklist) {
                const previousChecklist = getDeployChecklistData(checklist);
                if (!previousChecklist.version) {
                    throw new Error(`Previous deploy checklist #${checklist.number} has no release version.`);
                }
                return previousChecklist.tag;
            }
            foundCurrentChecklist = checklist.number === checklistNumber;
        }
        if (checklists.length < GITHUB_PAGE_SIZE) {
            break;
        }
    }
    throw new Error(`Could not find the deploy checklist before #${checklistNumber}.`);
}

/** Fetch every commit in the release; GitHub truncates unpaginated comparisons at 250 commits. */
async function getDeployedCommits(previousTag: string, deploySHA: string): Promise<DeployedCommit[]> {
    const commits: DeployedCommit[] = [];
    for (let page = 1; ; page++) {
        const {data: comparison} = await GithubUtils.octokit.repos.compareCommits({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            base: previousTag,
            head: deploySHA,
            per_page: GITHUB_PAGE_SIZE,
            page,
        });
        commits.push(...comparison.commits.map((commit) => ({sha: commit.sha, message: commit.commit.message})));
        if (comparison.commits.length < GITHUB_PAGE_SIZE) {
            return commits;
        }
    }
}

/**
 * A cherry-pick commit carries two trailers we care about:
 *   1. `(cherry picked from commit <sha>)` from `git cherry-pick -x`, which points at the PR's original merge commit.
 *   2. `(cherry-picked to <target> by <login>)` amended by the cherry-pick workflow, which names who asked for it.
 * They live in the same message, so each cherry-pick keeps its own requester.
 */
function getCherryPicks(commits: DeployedCommit[]): CherryPick[] {
    const cherryPicksBySourceSHA = new Map<string, CherryPick>();
    for (const {sha, message} of commits) {
        const actor = message.match(/\(cherry-picked to .* by (.+?)\)/)?.[1] ?? '';
        for (const match of message.matchAll(/cherry picked from commit ([0-9a-f]{7,40})/g)) {
            // Reinsert repeated sources so PRs associated with multiple commits use the latest pick and requester.
            cherryPicksBySourceSHA.delete(match[1]);
            cherryPicksBySourceSHA.set(match[1], {sourceSHA: match[1], cherryPickSHA: sha, actor});
        }
    }
    return [...cherryPicksBySourceSHA.values()];
}

/** Resolve the original App PRs that produced the cherry-picked commits, keeping who requested each one. */
async function getCherryPicksByPullRequest(cherryPicks: CherryPick[]): Promise<Map<number, CherryPick>> {
    const cherryPickByPR = new Map<number, CherryPick>();
    for (const cherryPick of cherryPicks) {
        const {data: pulls} = await GithubUtils.octokit.repos.listPullRequestsAssociatedWithCommit({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            commit_sha: cherryPick.sourceSHA,
        });
        for (const pull of pulls) {
            cherryPickByPR.set(pull.number, cherryPick);
        }
    }
    return cherryPickByPR;
}

/** Map every GitHub login in the employee whitelist to its Slack member ID. */
async function getSlackIDsByGithubLogin(): Promise<Map<string, string>> {
    const slackIDs = new Map<string, string>();
    try {
        const {data} = await GithubUtils.octokit.repos.getContent({
            owner: CONST.GITHUB_OWNER,
            repo: WHITELIST_REPO,
            path: WHITELIST_PATH,
        });
        if (!('content' in data)) {
            return slackIDs;
        }
        const whitelist = Buffer.from(data.content, 'base64').toString('utf8');
        for (const match of whitelist.matchAll(WHITELIST_ENTRY_REGEX)) {
            slackIDs.set(match[1], match[2]);
        }
    } catch (error) {
        // Losing the mention is not worth failing the deploy over, so fall back to the plain GitHub login.
        console.log('Could not read the employee whitelist, falling back to GitHub logins.', error);
    }
    return slackIDs;
}

/**
 * Give Slack the raw member ID for a GitHub login.
 * The retest workflow wraps this into a mention itself, so sending anything pre-formatted would break it.
 * People outside the whitelist (open source contributors) keep their plain login so QA can still identify them.
 */
function getSlackAuthor(githubLogin: string, slackIDsByGithubLogin: Map<string, string>): string {
    if (!githubLogin) {
        return EMPTY;
    }
    return slackIDsByGithubLogin.get(githubLogin) ?? githubLogin;
}

/** Keep each automated retest distinguishable while it is being posted to Slack. */
function getRetestRequestReference(hit: RetestHit, deployTag: string): string {
    return `Retest ID: ${deployTag} / App PR #${hit.prNumber}`;
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

/** Find the original tag so reruns can avoid duplicate requests and locate the existing Slack message. */
async function getRequestedRetestTag(prNumber: number, cherryPickSHA: string, deployTag: string): Promise<string | undefined> {
    const comments = await GithubUtils.getAllComments(prNumber);
    for (const comment of comments) {
        const tag = comment?.match(RETEST_MARKER_REGEX)?.[1];
        if (!comment || !tag) {
            continue;
        }
        if (comment.includes(getCherryPickRetestMarker(cherryPickSHA))) {
            return tag;
        }
        if (comment.includes(CHERRY_PICK_RETEST_MARKER_PREFIX)) {
            continue;
        }
        if (tag === deployTag) {
            return tag;
        }

        // Older comments only record the tag; check that the tagged deploy contained this exact pick.
        const {data: comparison} = await GithubUtils.octokit.repos.compareCommits({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            base: cherryPickSHA,
            head: tag,
            per_page: 1,
        });
        if (comparison.status === 'ahead' || comparison.status === 'identical') {
            return tag;
        }
    }
    return undefined;
}

/** Map a hit to the flat string payload the Slack workflow webhook expects. */
function buildRetestPayload(hit: RetestHit, deployTag: string): Record<string, string> {
    return {
        isDb: 'dbTrue',
        whereToRetest: 'Staging',
        notes: `Auto-filed after cherry-pick to staging: "${hit.prTitle}"\n\n${getRetestRequestReference(hit, deployTag)}`,
        ghIssueLink: hit.blockerIssueURLs.join(' '),
        adhocLink: EMPTY,
        requesterName: hit.prAuthor || EMPTY,
        author: hit.author || EMPTY,
        cpLink: hit.prURL,
        platforms: 'Android, iOS, Web',
    };
}

/** POST the retest request to the Slack workflow webhook. */
async function fireRetestRequest(hit: RetestHit, deployTag: string, webhookURL: string): Promise<void> {
    const payload = buildRetestPayload(hit, deployTag);

    const response = await fetch(webhookURL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        throw new Error(`Slack webhook returned ${response.status} ${response.statusText}: ${await response.text()}`);
    }
}

function isTopLevelSlackMessage(message: SlackMessage): boolean {
    return !message.thread_ts || message.thread_ts === message.ts;
}

/** Match the Cherry Pick Request that caused this staging deployment. */
function isCherryPickRequest(message: SlackMessage, hit: RetestHit): boolean {
    const text = message.text ?? '';
    return isTopLevelSlackMessage(message) && text.includes('Cherry Pick Request') && text.includes(hit.prURL) && /\*?Where\*?:\*?\s*staging(?:\s+and\s+production)?\b/i.test(text);
}

/** Call a Slack Web API method without ever including the token in an error message. */
async function callSlackAPI(method: string, token: string, params: Record<string, string>): Promise<SlackResponse> {
    const response = await fetch(`https://slack.com/api/${method}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(params),
    });
    if (!response.ok) {
        throw new Error(`Slack ${method} returned ${response.status} ${response.statusText}`);
    }

    const result: unknown = await response.json();
    if (!isSlackResponse(result)) {
        throw new Error(`Slack ${method} returned an invalid response.`);
    }
    if (!result.ok) {
        throw new Error(`Slack ${method} failed: ${result.error ?? 'unknown error'}`);
    }
    return result;
}

/** Search a channel from newest to oldest, stopping once a matching Slack message is found. */
async function findSlackMessage(
    channelID: string,
    token: string,
    predicate: (message: SlackMessage) => boolean,
    maxPages = CHERRY_PICK_REQUEST_HISTORY_MAX_PAGES,
): Promise<SlackMessage | undefined> {
    let cursor: string | undefined;
    for (let page = 0; page < maxPages; page++) {
        const params: Record<string, string> = {
            channel: channelID,
            limit: String(SLACK_HISTORY_PAGE_SIZE),
        };
        if (cursor) {
            params.cursor = cursor;
        }
        const result = await callSlackAPI('conversations.history', token, params);
        if (!isSlackHistoryResponse(result)) {
            throw new Error('Slack conversations.history returned an invalid response.');
        }
        const match = result.messages?.find(predicate);
        if (match) {
            return match;
        }
        cursor = result.response_metadata?.next_cursor;
        if (!cursor) {
            return undefined;
        }
    }
    return undefined;
}

/** Slack Workflow Builder posts asynchronously, so wait briefly for the retest request to appear. */
async function findRetestRequestMessage(hit: RetestHit, deployTag: string, token: string): Promise<SlackMessage | undefined> {
    const reference = getRetestRequestReference(hit, deployTag);
    for (let attempt = 1; attempt <= RETEST_MESSAGE_LOOKUP_ATTEMPTS; attempt++) {
        const message = await findSlackMessage(
            RETESTS_CHANNEL_ID,
            token,
            (candidate) => isTopLevelSlackMessage(candidate) && candidate.text?.includes(reference) === true,
            RETEST_MESSAGE_HISTORY_MAX_PAGES,
        );
        if (message) {
            return message;
        }
        if (attempt < RETEST_MESSAGE_LOOKUP_ATTEMPTS) {
            await new Promise((resolve) => {
                setTimeout(resolve, RETEST_MESSAGE_LOOKUP_DELAY_MS);
            });
        }
    }
    return undefined;
}

async function getSlackPermalink(channelID: string, messageTS: string, token: string): Promise<string | undefined> {
    const result = await callSlackAPI('chat.getPermalink', token, {
        channel: channelID,
        message_ts: messageTS,
    });
    if (!isSlackPermalinkResponse(result)) {
        throw new Error('Slack chat.getPermalink returned an invalid response.');
    }
    return result.permalink;
}

/** Check the existing Cherry Pick Request replies before adding the retest link on a deploy re-run. */
async function isRetestRequestLinked(cherryPickRequest: SlackMessage, retestPermalink: string, token: string): Promise<boolean> {
    const result = await callSlackAPI('conversations.replies', token, {
        channel: DEPLOYER_CHANNEL_ID,
        ts: cherryPickRequest.ts,
        limit: String(SLACK_HISTORY_PAGE_SIZE),
    });
    if (!isSlackHistoryResponse(result)) {
        throw new Error('Slack conversations.replies returned an invalid response.');
    }
    return result.messages?.some((message) => message.text?.includes(retestPermalink)) ?? false;
}

function buildRetestLinkReply(threadTS: string, retestPermalink: string): Record<string, string> {
    return {
        thread_ts: threadTS,
        text: `🔁 Automated retest request: <${retestPermalink}|Open retest request>.`,
    };
}

/** Add the retest request link to the Cherry Pick Request that triggered the deploy. */
async function postRetestRequestLink(hit: RetestHit, deployTag: string, token: string, deployerWebhookURL: string): Promise<void> {
    const retestRequest = await findRetestRequestMessage(hit, deployTag, token);
    if (!retestRequest) {
        console.warn(`Could not find the retest request for PR #${hit.prNumber} on ${deployTag}.`);
        return;
    }

    const retestPermalink = await getSlackPermalink(RETESTS_CHANNEL_ID, retestRequest.ts, token);
    if (!retestPermalink) {
        console.warn(`Could not get a permalink for the retest request for PR #${hit.prNumber} on ${deployTag}.`);
        return;
    }

    const cherryPickRequest = await findSlackMessage(DEPLOYER_CHANNEL_ID, token, (candidate) => isCherryPickRequest(candidate, hit));
    if (!cherryPickRequest) {
        console.warn(`Could not find the Cherry Pick Request thread for PR #${hit.prNumber}.`);
        return;
    }

    if (await isRetestRequestLinked(cherryPickRequest, retestPermalink, token)) {
        console.log(`The Cherry Pick Request thread for PR #${hit.prNumber} already links to its retest request.`);
        return;
    }

    const response = await fetch(deployerWebhookURL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(buildRetestLinkReply(cherryPickRequest.ts, retestPermalink)),
    });
    if (!response.ok) {
        throw new Error(`Slack deployer webhook returned ${response.status} ${response.statusText}: ${await response.text()}`);
    }
    console.log(`Added the retest request link to the Cherry Pick Request thread for PR #${hit.prNumber}.`);
}

async function run(): Promise<void> {
    // Gate 1 (staging deployed on all platforms) is enforced by the job's `if:` in deploy.yml.
    const cli = new CLI({
        namedArgs: {
            'deploy-sha': {description: 'The deploy commit SHA on the staging branch', required: true},
            'deploy-tag': {description: 'The staging release tag for this deploy', required: true},
        },
    } as const);
    const deploySHA = cli.namedArgs['deploy-sha'];
    const deployTag = cli.namedArgs['deploy-tag'];

    // The webhook stays in the env, not a CLI arg: it's a secret, and argv is visible via `ps` and can leak into logs.
    const webhookURL = process.env.SLACK_RETEST_WEBHOOK;
    if (!webhookURL) {
        throw new Error('SLACK_RETEST_WEBHOOK is required');
    }
    const slackToken = process.env.SLACK_RETEST_USER_TOKEN;
    const deployerWebhookURL = process.env.SLACK_WEBHOOK;

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
    const blockerIssueByNumber = new Map(checklist.deployBlockers.filter((item) => !item.isChecked).map((item) => [item.number, item.url]));
    if (checklistPRNumbers.size === 0 || blockerIssueByNumber.size === 0) {
        console.log('No checklist pull requests or unresolved deploy blockers, nothing to file.');
        return;
    }

    const previousTag = await getPreviousChecklistTag(checklist.number);
    const commits = await getDeployedCommits(previousTag, deploySHA);
    const cherryPicks = getCherryPicks(commits);
    if (cherryPicks.length === 0) {
        console.log('No cherry-pick source commits found in this deploy, nothing to do.');
        return;
    }

    const cherryPickByPR = await getCherryPicksByPullRequest(cherryPicks);
    if (cherryPickByPR.size === 0) {
        console.log('No original PRs resolved from cherry-pick source commits, nothing to do.');
        return;
    }

    let slackIDsByGithubLogin: Map<string, string> | undefined;
    const hits: RetestHit[] = [];
    for (const [prNumber, cherryPick] of cherryPickByPR) {
        // Gate 2: the cherry-picked PR must be on the current checklist.
        if (!checklistPRNumbers.has(prNumber)) {
            continue;
        }

        const {data: pull} = await GithubUtils.octokit.pulls.get({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            pull_number: prNumber,
        });

        // Gate 3: the PR body must link at least one unresolved deploy blocker on the checklist.
        // A PR can fix several blockers, so collect every match into one request.
        const blockerIssueURLs = getLinkedIssueNumbers(pull.body)
            .filter((issueNumber) => blockerIssueByNumber.has(issueNumber))
            .map((issueNumber) => blockerIssueByNumber.get(issueNumber) ?? '');
        if (blockerIssueURLs.length === 0) {
            continue;
        }

        slackIDsByGithubLogin ??= await getSlackIDsByGithubLogin();
        hits.push({
            prNumber,
            prURL: pull.html_url,
            prAuthor: pull.user?.login ?? '',
            cherryPickSHA: cherryPick.cherryPickSHA,
            blockerIssueURLs,
            prTitle: pull.title,
            author: getSlackAuthor(cherryPick.actor, slackIDsByGithubLogin),
        });
    }

    if (hits.length === 0) {
        console.log('No cherry-picked deploy-blocker fixes matched, nothing to file.');
        return;
    }

    for (const hit of hits) {
        const requestedTag = await getRequestedRetestTag(hit.prNumber, hit.cherryPickSHA, deployTag);
        if (!requestedTag) {
            await fireRetestRequest(hit, deployTag, webhookURL);
            const blockerList = hit.blockerIssueURLs.join(', ');
            await GithubUtils.createComment(
                CONST.APP_REPO,
                hit.prNumber,
                `${getRetestMarker(deployTag)}\n${getCherryPickRetestMarker(hit.cherryPickSHA)}\n🔁 Filed a Staging retest request for deploy blockers ${blockerList} after this PR was cherry-picked to staging.`,
            );
            console.log(`Filed retest request for PR #${hit.prNumber} (blockers ${blockerList}).`);
        } else {
            console.log(`Retest for PR #${hit.prNumber} was already filed on ${requestedTag}.`);
            // Searching old Slack history on every deploy can delay new requests; the original deploy can retry its link.
            if (requestedTag !== deployTag) {
                continue;
            }
        }

        if (!slackToken || !deployerWebhookURL) {
            console.warn(`Cannot add the retest request link for PR #${hit.prNumber}: ${!slackToken ? 'SLACK_RETEST_USER_TOKEN' : 'SLACK_WEBHOOK'} is not configured.`);
            continue;
        }
        try {
            await postRetestRequestLink(hit, deployTag, slackToken, deployerWebhookURL);
        } catch (error) {
            // The retest has already been filed. Keep a Slack lookup or reply failure from marking the deploy unsuccessful.
            console.warn(`Could not add the retest request link to the Cherry Pick Request thread for PR #${hit.prNumber}.`, error);
        }
    }
}

if (require.main === module) {
    run().catch((error: unknown) => {
        console.error(error);
        process.exit(1);
    });
}

export default run;
export {
    getCherryPicks,
    getDeployedCommits,
    getPreviousChecklistTag,
    getRequestedRetestTag,
    getLinkedIssueNumbers,
    buildRetestPayload,
    buildRetestLinkReply,
    getRetestMarker,
    getCherryPickRetestMarker,
    getRetestRequestReference,
    getSlackAuthor,
    isCherryPickRequest,
};
export type {RetestHit, SlackMessage};
