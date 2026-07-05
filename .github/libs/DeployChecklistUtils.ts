import type {components as OctokitComponents} from '@octokit/openapi-types/types';

import {createRequire} from 'module';

import CONST from './CONST.js';
import GithubUtils from './GithubUtils.js';

// `expensify-common`'s CJS build exports `Str` via an `Object.defineProperty` getter that
// `cjs-module-lexer` can't statically analyze, so a plain `import {Str} from 'expensify-common'`
// isn't visible to Node's native ESM loader here (unlike in the app's Metro/webpack-bundled
// `src/`, which resolves it via Babel instead). It also lacks a real `default` export despite
// setting `__esModule: true`, so `import ExpensifyCommon from 'expensify-common'` resolves to
// `undefined` under Babel/Jest's CJS interop even though it works under native ESM. A raw
// `require` sidesteps both interop layers and behaves identically in both environments. Typed
// minimally for the one method used below rather than importing `expensify-common/str`'s type,
// which resolves inconsistently between `tsc` and `ts-node`'s on-the-fly checking.
const {Str} = createRequire(import.meta.url)('expensify-common') as unknown as {Str: {dedent: (str: string) => string}};

/** Milliseconds to wait before each subsequent `listForRepo` attempt. */
const LIST_RETRY_DELAYS_MS = [2000, 5000] as const;

/**
 * HTTP statuses that indicate a definitively-permanent failure of `listForRepo` -
 * retrying cannot help (auth, missing resource, validation). Note that `403` is
 * intentionally absent because GitHub returns secondary-rate-limit and abuse
 * detection responses as `403` and those should be retried with backoff.
 */
const NON_RETRYABLE_LIST_STATUSES = new Set([401, 404, 422]);

/**
 * Duck-type check for "this error is a permanent failure from `listForRepo`".
 * We avoid `instanceof RequestError` because the bundled action ends up with
 * multiple copies of that class (one from `@octokit/request-error` directly,
 * one nested via `@actions/github` -> `@octokit/core`) and `instanceof`
 * compares identity, so it can miss real errors thrown by octokit.
 */
function isPermanentListError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null || !('status' in error)) {
        return false;
    }
    const status = (error as {status?: unknown}).status;
    return typeof status === 'number' && NON_RETRYABLE_LIST_STATUSES.has(status);
}

/**
 * Thrown by `getDeployChecklist` when GitHub successfully confirms there is no open
 * StagingDeployCash issue and the most recent checklist is closed - i.e. we're in the
 * legitimate window between deploy cycles. Callers that need to distinguish "benign
 * empty" from "could not resolve" should catch this specific subclass.
 */
class NoOpenDeployChecklistError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NoOpenDeployChecklistError';
    }
}

type OctokitIssueItem = OctokitComponents['schemas']['issue'];

type ChecklistItem = {
    url: string;
    number: number;
    isChecked: boolean;
};

type DeployChecklistBody = {
    issueBody: string;
    issueAssignees: string[];
};

type DeployChecklistParams = {
    tag: string;
    PRList: number[];
    PRListMobileExpensify?: number[];
    verifiedPRList?: number[];
    verifiedPRListMobileExpensify?: number[];
    deployBlockers?: number[];
    resolvedDeployBlockers?: number[];
    resolvedInternalQAPRs?: number[];
    isSentryChecked?: boolean;
    isGHStatusChecked?: boolean;
    previousTag?: string;
    chronologicalSection?: string;
};

type DeployChecklistData = {
    title: string;
    url: string;
    number: number;
    labels: OctokitIssueItem['labels'];
    PRList: ChecklistItem[];
    PRListMobileExpensify: ChecklistItem[];
    deployBlockers: ChecklistItem[];
    internalQAPRList: ChecklistItem[];
    isSentryChecked: boolean;
    isGHStatusChecked: boolean;
    version: string;
    tag: string;
};

/**
 * Generic checklist section parser. Extracts a section from the issue body,
 * parses checkbox items within it, and returns ChecklistItems sorted by number.
 */
function parseChecklistSection(issueBody: string | null | undefined, sectionRegex: RegExp, itemRegex: RegExp, urlTransform?: (url: string) => string): ChecklistItem[] {
    const sectionMatch = issueBody?.match(sectionRegex) ?? null;
    if (sectionMatch?.length !== 2) {
        return [];
    }
    const items = [...sectionMatch[1].matchAll(itemRegex)].map((match) => {
        const rawUrl = match[2];
        return {
            url: urlTransform ? urlTransform(rawUrl) : rawUrl,
            number: Number.parseInt(match[3], 10),
            isChecked: match[1] === 'x',
        };
    });
    return items.sort((a, b) => a.number - b.number);
}

function getDeployChecklistPRList(issue: OctokitIssueItem): ChecklistItem[] {
    const result = parseChecklistSection(issue.body, /pull requests:\*\*\r?\n((?:-.*\r?\n)+)\r?\n\r?\n?/, new RegExp(`- \\[([ x])] (${CONST.PULL_REQUEST_REGEX.source})`, 'g'));
    if (result.length === 0) {
        console.log('Hmmm...The open deploy checklist does not list any pull requests, continuing...');
    }
    return result;
}

function getDeployChecklistPRListMobileExpensify(issue: OctokitIssueItem): ChecklistItem[] {
    return parseChecklistSection(issue.body, /Mobile-Expensify PRs:\*\*\r?\n((?:-.*\r?\n)+)/, new RegExp(`- \\[([ x])]\\s(${CONST.ISSUE_OR_PULL_REQUEST_REGEX.source})`, 'g'));
}

function getDeployChecklistDeployBlockers(issue: OctokitIssueItem): ChecklistItem[] {
    return parseChecklistSection(issue.body, /Deploy Blockers:\*\*\r?\n((?:-.*\r?\n)+)/, new RegExp(`- \\[([ x])]\\s(${CONST.ISSUE_OR_PULL_REQUEST_REGEX.source})`, 'g'));
}

function getDeployChecklistInternalQA(issue: OctokitIssueItem): ChecklistItem[] {
    return parseChecklistSection(
        issue.body,
        /Internal QA:\*\*\r?\n((?:- \[[ x]].*\r?\n)+)/,
        new RegExp(`- \\[([ x])]\\s(${CONST.PULL_REQUEST_REGEX.source})`, 'g'),
        (url) => url.split('-').at(0)?.trim() ?? '',
    );
}

/**
 * Calls `issues.listForRepo` with simple retry-on-throw. Retries 1 + `LIST_RETRY_DELAYS_MS.length`
 * times total, sleeping the corresponding delay between attempts. Empty results are NOT retried -
 * the caller must decide whether an empty list is legitimate. Permanent statuses listed in
 * `NON_RETRYABLE_LIST_STATUSES` short-circuit and re-throw on the first attempt.
 */
async function listForRepoWithRetry(params: Parameters<typeof GithubUtils.octokit.issues.listForRepo>[0]): Promise<OctokitIssueItem[]> {
    let lastError: unknown;
    const maxAttempts = LIST_RETRY_DELAYS_MS.length + 1;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const {data} = await GithubUtils.octokit.issues.listForRepo(params);
            return data;
        } catch (error) {
            lastError = error;
            if (isPermanentListError(error)) {
                console.warn(`listForRepo failed with permanent status ${(error as {status?: number}).status}; not retrying`, error);
                throw error;
            }
            const delay = LIST_RETRY_DELAYS_MS.at(attempt - 1);
            if (delay === undefined) {
                throw error;
            }
            console.warn(`listForRepo attempt ${attempt}/${maxAttempts} failed; retrying in ${delay}ms`, error);
            await new Promise((resolve) => {
                setTimeout(resolve, delay);
            });
        }
    }
    throw lastError;
}

async function getDeployChecklist(): Promise<DeployChecklistData> {
    const openIssues = await listForRepoWithRetry({
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        labels: CONST.LABELS.STAGING_DEPLOY,
        state: 'open',
    });

    if (openIssues.length > 1) {
        throw new Error(`Found more than one open ${CONST.LABELS.STAGING_DEPLOY} issue: #${openIssues.map((issue) => issue.number).join(', #')}.`);
    }

    if (openIssues.length === 1) {
        const issue = openIssues.at(0);
        if (!issue) {
            throw new Error(`Found an undefined ${CONST.LABELS.STAGING_DEPLOY} issue.`);
        }
        return getDeployChecklistData(issue);
    }

    // The filtered open list was empty. Cross-check against state:'all' to tell
    // a legitimate between-cycles window apart from an API inconsistency. Any open
    // issue anywhere in the response - not just the most recent - blocks the deploy,
    // so a stale older issue that got reopened cannot slip through.
    const allIssues = await listForRepoWithRetry({
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        labels: CONST.LABELS.STAGING_DEPLOY,
        state: 'all',
    });
    if (allIssues.length === 0) {
        // The label has been in continuous use; an empty state:'all' result is pathological.
        throw new Error(`No ${CONST.LABELS.STAGING_DEPLOY} issues found at all (state:'all' returned empty). Refusing to deploy.`);
    }
    const openIssuesInAll = allIssues.filter((issue) => issue.state === 'open');
    if (openIssuesInAll.length > 0) {
        throw new Error(
            `Inconsistent GitHub response: state:open returned empty but state:all reports open ${CONST.LABELS.STAGING_DEPLOY} issue(s) #${openIssuesInAll.map((issue) => issue.number).join(', #')}. Refusing to deploy.`,
        );
    }
    const mostRecent = allIssues.at(0);
    throw new NoOpenDeployChecklistError(`No open ${CONST.LABELS.STAGING_DEPLOY} issue (most recent #${mostRecent?.number} is closed).`);
}

function getDeployChecklistData(issue: OctokitIssueItem): DeployChecklistData {
    try {
        const versionRegex = new RegExp('([0-9]+)\\.([0-9]+)\\.([0-9]+)(?:-([0-9]+))?', 'g');
        const version = (issue.body?.match(versionRegex)?.[0] ?? '').replaceAll('`', '');

        return {
            title: issue.title,
            url: issue.url,
            number: GithubUtils.getIssueOrPullRequestNumberFromURL(issue.url),
            labels: issue.labels,
            PRList: getDeployChecklistPRList(issue),
            PRListMobileExpensify: getDeployChecklistPRListMobileExpensify(issue),
            deployBlockers: getDeployChecklistDeployBlockers(issue),
            internalQAPRList: getDeployChecklistInternalQA(issue),
            isSentryChecked: issue.body ? /-\s\[x]\sI checked \[Sentry]/.test(issue.body) : false,
            isGHStatusChecked: issue.body ? /-\s\[x]\sI checked \[GitHub Status]/.test(issue.body) : false,
            version,
            tag: `${version}-staging`,
        };
    } catch (exception) {
        throw new Error(`Unable to find ${CONST.LABELS.STAGING_DEPLOY} issue with correct data.`);
    }
}

/**
 * Generate the issue body and assignees for a deploy checklist.
 * Accepts PR numbers directly (not URLs) to avoid unnecessary round-tripping.
 */
async function generateDeployChecklistBodyAndAssignees({
    tag,
    PRList,
    PRListMobileExpensify = [],
    verifiedPRList = [],
    verifiedPRListMobileExpensify = [],
    deployBlockers = [],
    resolvedDeployBlockers = [],
    resolvedInternalQAPRs = [],
    isSentryChecked = false,
    isGHStatusChecked = false,
    previousTag = '',
    chronologicalSection = '',
}: DeployChecklistParams): Promise<DeployChecklistBody> {
    const data = await GithubUtils.fetchAllPullRequests(PRList);

    const internalQAPRs = Array.isArray(data) ? data.filter((pr) => pr.labels.some((item) => item.name === CONST.LABELS.INTERNAL_QA)) : [];
    const mergerResults = await Promise.all(internalQAPRs.map((pr) => GithubUtils.getPullRequestMergerLogin(pr.number).then((mergerLogin) => ({number: pr.number, mergerLogin}))));

    const internalQAPRMap = new Map<number, string | undefined>();
    for (const {number, mergerLogin} of mergerResults) {
        internalQAPRMap.set(number, mergerLogin);
    }
    console.log('Found the following Internal QA PRs:', Object.fromEntries(internalQAPRMap));

    const noQAPRNumbers = Array.isArray(data) ? data.filter((PR) => /\[No\s?QA]/i.test(PR.title)).map((item) => item.number) : [];
    console.log('Found the following NO QA PRs:', noQAPRNumbers);

    const mobileExpensifyData = PRListMobileExpensify.length > 0 ? await GithubUtils.fetchAllPullRequests(PRListMobileExpensify, CONST.MOBILE_EXPENSIFY_REPO) : [];
    const noQAMobileExpensifyPRNumbers = Array.isArray(mobileExpensifyData) ? mobileExpensifyData.filter((PR) => /\[No\s?QA]/i.test(PR.title)).map((item) => item.number) : [];
    console.log('Found the following NO QA Mobile-Expensify PRs:', noQAMobileExpensifyPRNumbers);

    const verifiedAppPRs = new Set([...verifiedPRList, ...noQAPRNumbers]);
    const verifiedMobileExpensifyPRs = new Set([...verifiedPRListMobileExpensify, ...noQAMobileExpensifyPRNumbers]);
    const resolvedInternalQAPRSet = new Set(resolvedInternalQAPRs);
    const resolvedDeployBlockerSet = new Set(resolvedDeployBlockers);

    const internalQAPRNumbers = new Set(internalQAPRMap.keys());
    const sortedPRList = [...new Set(PRList.filter((n) => !internalQAPRNumbers.has(n)))].sort((a, b) => a - b);
    const sortedPRListMobileExpensify = [...new Set(PRListMobileExpensify)].sort((a, b) => a - b);
    const sortedDeployBlockers = [...new Set(deployBlockers)].sort((a, b) => a - b);

    const sections: string[] = [];

    // Header
    let header = `**Release Version:** \`${tag}\`\n**Compare Changes:** https://github.com/${process.env.GITHUB_REPOSITORY}/compare/production...staging\n`;
    if (sortedPRListMobileExpensify.length > 0) {
        header += `**Mobile-Expensify Changes:** https://github.com/${CONST.GITHUB_OWNER}/${CONST.MOBILE_EXPENSIFY_REPO}/compare/production...staging\n`;
    }
    sections.push(header);

    // PR list
    if (sortedPRList.length > 0) {
        const items = sortedPRList
            .map((prNumber) => {
                const url = GithubUtils.getPullRequestURLFromNumber(prNumber, CONST.APP_REPO_URL);
                return `${verifiedAppPRs.has(prNumber) ? '- [x]' : '- [ ]'} ${url}`;
            })
            .join('\n');
        sections.push(`**This release contains changes from the following pull requests:**\n${items}\n`);
    }

    // Mobile-Expensify PR list
    if (sortedPRListMobileExpensify.length > 0) {
        const items = sortedPRListMobileExpensify
            .map((prNumber) => {
                const url = GithubUtils.getPullRequestURLFromNumber(prNumber, CONST.MOBILE_EXPENSIFY_URL);
                return `${verifiedMobileExpensifyPRs.has(prNumber) ? '- [x]' : '- [ ]'} ${url}`;
            })
            .join('\n');
        sections.push(`**Mobile-Expensify PRs:**\n${items}\n`);
    }

    // Internal QA PR list
    if (internalQAPRMap.size > 0) {
        console.log('Found the following verified Internal QA PRs:', resolvedInternalQAPRs);
        const items = [...internalQAPRMap.entries()]
            .map(([prNumber, merger]) => {
                const url = GithubUtils.getPullRequestURLFromNumber(prNumber, CONST.APP_REPO_URL);
                return `${resolvedInternalQAPRSet.has(prNumber) ? '- [x]' : '- [ ]'} ${url} - @${merger}`;
            })
            .join('\n');
        sections.push(`**Internal QA:**\n${items}\n`);
    }

    // Deploy blockers
    if (sortedDeployBlockers.length > 0) {
        const items = sortedDeployBlockers
            .map((number) => {
                const url = `${CONST.APP_REPO_URL}/issues/${number}`;
                return `${resolvedDeployBlockerSet.has(number) ? '- [x] ' : '- [ ] '}${url}`;
            })
            .join('\n');
        sections.push(`**Deploy Blockers:**\n${items}\n`);
    }

    // Chronological section
    if (chronologicalSection) {
        sections.push(chronologicalSection);
    }

    // Deployer verifications
    const check = (checked: boolean) => (checked ? 'x' : ' ');
    sections.push(
        Str.dedent(
            `
            **Deployer verifications:**
            - [${check(isSentryChecked)}] I checked [Sentry](https://expensify.sentry.io/releases/new.expensify%40${tag}/?project=4510228107427840&environment=staging) for **this release version** and verified that this release does not introduce any new crashes. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).
            - [${check(isSentryChecked)}] I checked [Sentry](https://expensify.sentry.io/releases/new.expensify%40${previousTag}/?project=4510228107427840&environment=production) for **the previous release version** and verified that the release did not introduce any new crashes. Because mobile deploys use a phased rollout, completing this checklist will deploy the previous release version to 100% of users. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).
            - [${check(isGHStatusChecked)}] I checked [GitHub Status](https://www.githubstatus.com/) and verified there is no reported incident with Actions.
        `,
        ).trimEnd(),
    );

    // Footer
    sections.push('cc @Expensify/applauseleads\n');

    const issueBody = sections.join('\n');
    const issueAssignees = [...new Set(internalQAPRMap.values())].filter((login): login is string => login !== undefined);
    return {issueBody, issueAssignees};
}

export {getDeployChecklist, getDeployChecklistData, generateDeployChecklistBodyAndAssignees, NoOpenDeployChecklistError, parseChecklistSection};
export type {ChecklistItem, DeployChecklistBody, DeployChecklistParams, DeployChecklistData};
