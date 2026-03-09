/* eslint-disable @typescript-eslint/naming-convention */
import type {components as OctokitComponents} from '@octokit/openapi-types/types';
import dedent from '@libs/StringUtils/dedent';
import CONST from './CONST';
import GithubUtils from './GithubUtils';

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

async function getDeployChecklist(): Promise<DeployChecklistData> {
    const {data} = await GithubUtils.octokit.issues.listForRepo({
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        labels: CONST.LABELS.STAGING_DEPLOY,
        state: 'open',
    });

    if (!data.length) {
        throw new Error(`Unable to find ${CONST.LABELS.STAGING_DEPLOY} issue.`);
    }

    if (data.length > 1) {
        throw new Error(`Found more than one ${CONST.LABELS.STAGING_DEPLOY} issue.`);
    }

    const issue = data.at(0);
    if (!issue) {
        throw new Error(`Found an undefined ${CONST.LABELS.STAGING_DEPLOY} issue.`);
    }

    return getDeployChecklistData(issue);
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
 * Accepts PR numbers directly (not URLs) to avoid unnecessary roundtripping.
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

    const verifiedAppPRs = new Set([...verifiedPRList, ...noQAPRNumbers]);
    const verifiedMobileExpensifyPRs = new Set(verifiedPRListMobileExpensify);
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
        dedent(`
            **Deployer verifications:**
            - [${check(isSentryChecked)}] I checked [Sentry](https://expensify.sentry.io/releases/new.expensify%40${tag}/?project=app&environment=staging) for **this release version** and verified that this release does not introduce any new crashes. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).
            - [${check(isSentryChecked)}] I checked [Sentry](https://expensify.sentry.io/releases/new.expensify%40${previousTag}/?project=app&environment=production) for **the previous release version** and verified that the release did not introduce any new crashes. Because mobile deploys use a phased rollout, completing this checklist will deploy the previous release version to 100% of users. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).
            - [${check(isGHStatusChecked)}] I checked [GitHub Status](https://www.githubstatus.com/) and verified there is no reported incident with Actions.
        `).trimEnd(),
    );

    // Footer
    sections.push('cc @Expensify/applauseleads\n');

    const issueBody = sections.join('\n');
    const issueAssignees = [...new Set(internalQAPRMap.values())].filter((login): login is string => login !== undefined);
    return {issueBody, issueAssignees};
}

export {getDeployChecklist, getDeployChecklistData, generateDeployChecklistBodyAndAssignees, parseChecklistSection};
export type {ChecklistItem, DeployChecklistBody, DeployChecklistParams, DeployChecklistData};
