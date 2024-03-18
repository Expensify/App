/* eslint-disable @typescript-eslint/naming-convention, import/no-import-module-exports */
import * as core from '@actions/core';
import {getOctokitOptions, GitHub} from '@actions/github/lib/utils';
import type {Octokit as OctokitCore} from '@octokit/core';
import type {graphql} from '@octokit/graphql/dist-types/types';
import type {components as OctokitComponents} from '@octokit/openapi-types/types';
import type {PaginateInterface} from '@octokit/plugin-paginate-rest';
import {paginateRest} from '@octokit/plugin-paginate-rest';
import type {RestEndpointMethods} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types';
import type {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';
import type {Api} from '@octokit/plugin-rest-endpoint-methods/dist-types/types';
import {throttling} from '@octokit/plugin-throttling';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import arrayDifference from '@src/utils/arrayDifference';
import CONST from './CONST';

const GITHUB_BASE_URL_REGEX = new RegExp('https?://(?:github\\.com|api\\.github\\.com)');
const PULL_REQUEST_REGEX = new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/pull/([0-9]+).*`);
const ISSUE_REGEX = new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/issues/([0-9]+).*`);
const ISSUE_OR_PULL_REQUEST_REGEX = new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/(?:pull|issues)/([0-9]+).*`);

/**
 * The standard rate in ms at which we'll poll the GitHub API to check for status changes.
 * It's 10 seconds :)
 */
const POLL_RATE = 10000;

type OctokitOptions = {method: string; url: string; request: {retryCount: number}};

type ListForRepoResult = RestEndpointMethodTypes['issues']['listForRepo']['response'];

type OctokitIssueItem = OctokitComponents['schemas']['issue'];

type ListForRepoMethod = RestEndpointMethods['issues']['listForRepo'];

type StagingDeployCashPR = {
    url: string;
    number: number;
    isVerified: boolean;
};

type StagingDeployCashBlocker = {
    url: string;
    number: number;
    isResolved: boolean;
};

type OctokitArtifact = OctokitComponents['schemas']['artifact'];

type OctokitPR = OctokitComponents['schemas']['pull-request-simple'];

type StagingDeployCashData = {
    title: string;
    url: string;
    number: number;
    labels: OctokitIssueItem['labels'];
    PRList: StagingDeployCashPR[];
    deployBlockers: StagingDeployCashBlocker[];
    internalQAPRList: StagingDeployCashBlocker[];
    isTimingDashboardChecked: boolean;
    isFirebaseChecked: boolean;
    isGHStatusChecked: boolean;
    tag?: string;
};

class GithubUtils {
    static internalOctokit: OctokitCore & Api & {paginate: PaginateInterface};

    /**
     * Initialize internal octokit
     *
     * @private
     */
    static initOctokit() {
        const Octokit = GitHub.plugin(throttling, paginateRest);
        const token = core.getInput('GITHUB_TOKEN', {required: true});

        // Save a copy of octokit used in this class
        this.internalOctokit = new Octokit(
            getOctokitOptions(token, {
                throttle: {
                    retryAfterBaseValue: 2000,
                    onRateLimit: (retryAfter: number, options: OctokitOptions) => {
                        console.warn(`Request quota exhausted for request ${options.method} ${options.url}`);

                        // Retry five times when hitting a rate limit error, then give up
                        if (options.request.retryCount <= 5) {
                            console.log(`Retrying after ${retryAfter} seconds!`);
                            return true;
                        }
                    },
                    onAbuseLimit: (retryAfter: number, options: OctokitOptions) => {
                        // does not retry, only logs a warning
                        console.warn(`Abuse detected for request ${options.method} ${options.url}`);
                    },
                },
            }),
        );
    }

    /**
     * Either give an existing instance of Octokit rest or create a new one
     *
     * @readonly
     * @static
     * @memberof GithubUtils
     */
    static get octokit(): RestEndpointMethods {
        if (this.internalOctokit) {
            return this.internalOctokit.rest;
        }
        this.initOctokit();
        // @ts-expect-error -- by running this.initOctokit() above we can be sure that this.internalOctokit is defined
        return this.internalOctokit.rest as RestEndpointMethods;
    }

    /**
     * Get the graphql instance from internal octokit.
     * @readonly
     * @static
     * @memberof GithubUtils
     */
    static get graphql(): graphql {
        if (this.internalOctokit) {
            return this.internalOctokit.graphql;
        }
        this.initOctokit();
        // @ts-expect-error -- by running this.initOctokit() above we can be sure that this.internalOctokit is defined
        return this.internalOctokit.graphql as graphql;
    }

    /**
     * Either give an existing instance of Octokit paginate or create a new one
     *
     * @readonly
     * @static
     * @memberof GithubUtils
     */
    static get paginate(): PaginateInterface {
        if (this.internalOctokit) {
            return this.internalOctokit.paginate;
        }
        this.initOctokit();
        // @ts-expect-error -- by running this.initOctokit() above we can be sure that this.internalOctokit is defined
        return this.internalOctokit.paginate as PaginateInterface;
    }

    /**
     * Finds one open `StagingDeployCash` issue via GitHub octokit library.
     */
    static getStagingDeployCash(): Promise<StagingDeployCashData> {
        return this.octokit.issues
            .listForRepo({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                labels: CONST.LABELS.STAGING_DEPLOY,
                state: 'open',
            })
            .then(({data}: ListForRepoResult) => {
                if (!data.length) {
                    const error = new Error(`Unable to find ${CONST.LABELS.STAGING_DEPLOY} issue.`);
                    throw error;
                }

                if (data.length > 1) {
                    const error = new Error(`Found more than one ${CONST.LABELS.STAGING_DEPLOY} issue.`);
                    throw error;
                }

                return this.getStagingDeployCashData(data[0]);
            });
    }

    /**
     * Takes in a GitHub issue object and returns the data we want.
     */
    static getStagingDeployCashData(issue: OctokitIssueItem): StagingDeployCashData {
        try {
            const versionRegex = new RegExp('([0-9]+)\\.([0-9]+)\\.([0-9]+)(?:-([0-9]+))?', 'g');
            const tag = issue.body?.match(versionRegex)?.[0].replace(/`/g, '');

            return {
                title: issue.title,
                url: issue.url,
                number: this.getIssueOrPullRequestNumberFromURL(issue.url),
                labels: issue.labels,
                PRList: this.getStagingDeployCashPRList(issue),
                deployBlockers: this.getStagingDeployCashDeployBlockers(issue),
                internalQAPRList: this.getStagingDeployCashInternalQA(issue),
                isTimingDashboardChecked: issue.body ? /-\s\[x]\sI checked the \[App Timing Dashboard]/.test(issue.body) : false,
                isFirebaseChecked: issue.body ? /-\s\[x]\sI checked \[Firebase Crashlytics]/.test(issue.body) : false,
                isGHStatusChecked: issue.body ? /-\s\[x]\sI checked \[GitHub Status]/.test(issue.body) : false,
                tag,
            };
        } catch (exception) {
            throw new Error(`Unable to find ${CONST.LABELS.STAGING_DEPLOY} issue with correct data.`);
        }
    }

    /**
     * Parse the PRList and Internal QA section of the StagingDeployCash issue body.
     *
     * @private
     */
    static getStagingDeployCashPRList(issue: OctokitIssueItem): StagingDeployCashPR[] {
        let PRListSection: RegExpMatchArray | null | [] | string = issue.body?.match(/pull requests:\*\*\r?\n((?:-.*\r?\n)+)\r?\n\r?\n?/) ?? [];
        if (PRListSection?.length !== 2) {
            // No PRs, return an empty array
            console.log('Hmmm...The open StagingDeployCash does not list any pull requests, continuing...');
            return [];
        }

        PRListSection = PRListSection[1];
        const PRList = [...PRListSection.matchAll(new RegExp(`- \\[([ x])] (${PULL_REQUEST_REGEX.source})`, 'g'))].map((match) => ({
            url: match[2],
            number: Number.parseInt(match[3], 10),
            isVerified: match[1] === 'x',
        }));
        // eslint-disable-next-line no-nested-ternary
        return PRList.sort((a, b) => (a.number > b.number ? 1 : b.number > a.number ? -1 : 0));
    }

    /**
     * Parse DeployBlocker section of the StagingDeployCash issue body.
     *
     * @private
     */
    static getStagingDeployCashDeployBlockers(issue: OctokitIssueItem): StagingDeployCashBlocker[] {
        let deployBlockerSection: RegExpMatchArray | null | [] | string = issue.body?.match(/Deploy Blockers:\*\*\r?\n((?:-.*\r?\n)+)/) ?? [];
        if (deployBlockerSection.length !== 2) {
            return [];
        }

        deployBlockerSection = deployBlockerSection[1];
        const deployBlockers = [...deployBlockerSection.matchAll(new RegExp(`- \\[([ x])]\\s(${ISSUE_OR_PULL_REQUEST_REGEX.source})`, 'g'))].map((match) => ({
            url: match[2],
            number: Number.parseInt(match[3], 10),
            isResolved: match[1] === 'x',
        }));

        return deployBlockers.sort((a, b) => a.number - b.number);
    }

    /**
     * Parse InternalQA section of the StagingDeployCash issue body.
     *
     * @private
     */
    static getStagingDeployCashInternalQA(issue: OctokitIssueItem): StagingDeployCashBlocker[] {
        let internalQASection: RegExpMatchArray | [] | null | string = issue.body?.match(/Internal QA:\*\*\r?\n((?:- \[[ x]].*\r?\n)+)/) ?? [];
        if (internalQASection.length !== 2) {
            return [];
        }
        internalQASection = internalQASection[1];
        const internalQAPRs = [...internalQASection.matchAll(new RegExp(`- \\[([ x])]\\s(${PULL_REQUEST_REGEX.source})`, 'g'))].map((match) => ({
            url: match[2].split('-')[0].trim(),
            number: Number.parseInt(match[3], 10),
            isResolved: match[1] === 'x',
        }));

        return internalQAPRs.sort((a, b) => a.number - b.number);
    }

    /**
     * Generate the issue body for a StagingDeployCash.
     *
     * @param tag
     * @param PRList - The list of PR URLs which are included in this StagingDeployCash
     * @param [verifiedPRList] - The list of PR URLs which have passed QA.
     * @param [deployBlockers] - The list of DeployBlocker URLs.
     * @param [resolvedDeployBlockers] - The list of DeployBlockers URLs which have been resolved.
     * @param [resolvedInternalQAPRs] - The list of Internal QA PR URLs which have been resolved.
     * @param [isTimingDashboardChecked]
     * @param [isFirebaseChecked]
     * @param [isGHStatusChecked]
     */
    static generateStagingDeployCashBody(
        tag: string,
        PRList: string[],
        verifiedPRList: string[] = [],
        deployBlockers: string[] = [],
        resolvedDeployBlockers: string[] = [],
        resolvedInternalQAPRs: string[] = [],
        isTimingDashboardChecked = false,
        isFirebaseChecked = false,
        isGHStatusChecked = false,
    ): Promise<string | void> {
        return this.fetchAllPullRequests(PRList.map((pr) => this.getPullRequestNumberFromURL(pr)))
            .then((data) => {
                // The format of this map is following:
                // {
                //    'https://github.com/Expensify/App/pull/9641': [ 'PauloGasparSv', 'kidroca' ],
                //    'https://github.com/Expensify/App/pull/9642': [ 'mountiny', 'kidroca' ]
                // }
                const internalQAPRMap = Array.isArray(data)
                    ? data
                          .filter((pr) => !isEmptyObject(pr.labels.find((item) => item.name === CONST.LABELS.INTERNAL_QA)))
                          .reduce<Record<string, string[] | undefined>>((map, pr) => {
                              // eslint-disable-next-line no-param-reassign
                              map[pr.html_url] = pr.assignees?.map((assignee) => assignee.login).filter(Boolean);
                              return map;
                          }, {})
                    : {};

                console.log('Found the following Internal QA PRs:', internalQAPRMap);

                const noQAPRs = Array.isArray(data) ? data.filter((PR) => /\[No\s?QA]/i.test(PR.title)).map((pr) => pr.html_url) : [];
                console.log('Found the following NO QA PRs:', noQAPRs);
                const verifiedOrNoQAPRs = [...new Set([...verifiedPRList, ...noQAPRs])];

                const sortedPRList = [...new Set(arrayDifference(PRList, Object.keys(internalQAPRMap)))].sort(
                    (a, b) => GithubUtils.getPullRequestNumberFromURL(a) - GithubUtils.getPullRequestNumberFromURL(b),
                );
                const sortedDeployBlockers = [...new Set(deployBlockers)].sort(
                    (a, b) => GithubUtils.getIssueOrPullRequestNumberFromURL(a) - GithubUtils.getIssueOrPullRequestNumberFromURL(b),
                );

                // Tag version and comparison URL
                // eslint-disable-next-line max-len
                let issueBody = `**Release Version:** \`${tag}\`\r\n**Compare Changes:** https://github.com/Expensify/App/compare/production...staging\r\n`;

                // PR list
                if (!isEmptyObject(sortedPRList)) {
                    issueBody += '\r\n**This release contains changes from the following pull requests:**\r\n';
                    sortedPRList.forEach((URL) => {
                        issueBody += verifiedOrNoQAPRs.includes(URL) ? '- [x]' : '- [ ]';
                        issueBody += ` ${URL}\r\n`;
                    });
                    issueBody += '\r\n\r\n';
                }

                // Internal QA PR list
                if (!isEmptyObject(internalQAPRMap)) {
                    console.log('Found the following verified Internal QA PRs:', resolvedInternalQAPRs);
                    issueBody += '**Internal QA:**\r\n';
                    Object.keys(internalQAPRMap).forEach((URL) => {
                        const assignees = internalQAPRMap[URL];
                        const assigneeMentions = assignees?.reduce((memo, assignee) => `${memo} @${assignee}`, '');
                        issueBody += `${resolvedInternalQAPRs.includes(URL) ? '- [x]' : '- [ ]'} `;
                        issueBody += `${URL}`;
                        issueBody += ` -${assigneeMentions}`;
                        issueBody += '\r\n';
                    });
                    issueBody += '\r\n\r\n';
                }

                // Deploy blockers
                if (!isEmptyObject(deployBlockers)) {
                    issueBody += '**Deploy Blockers:**\r\n';
                    sortedDeployBlockers.forEach((URL) => {
                        issueBody += resolvedDeployBlockers.includes(URL) ? '- [x] ' : '- [ ] ';
                        issueBody += URL;
                        issueBody += '\r\n';
                    });
                    issueBody += '\r\n\r\n';
                }

                issueBody += '**Deployer verifications:**';
                // eslint-disable-next-line max-len
                issueBody += `\r\n- [${
                    isTimingDashboardChecked ? 'x' : ' '
                }] I checked the [App Timing Dashboard](https://graphs.expensify.com/grafana/d/yj2EobAGz/app-timing?orgId=1) and verified this release does not cause a noticeable performance regression.`;
                // eslint-disable-next-line max-len
                issueBody += `\r\n- [${
                    isFirebaseChecked ? 'x' : ' '
                }] I checked [Firebase Crashlytics](https://console.firebase.google.com/u/0/project/expensify-chat/crashlytics/app/android:com.expensify.chat/issues?state=open&time=last-seven-days&tag=all) and verified that this release does not introduce any new crashes. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).`;
                // eslint-disable-next-line max-len
                issueBody += `\r\n- [${isGHStatusChecked ? 'x' : ' '}] I checked [GitHub Status](https://www.githubstatus.com/) and verified there is no reported incident with Actions.`;

                issueBody += '\r\n\r\ncc @Expensify/applauseleads\r\n';
                return issueBody;
            })
            .catch((err) => console.warn('Error generating StagingDeployCash issue body! Continuing...', err));
    }

    /**
     * Fetch all pull requests given a list of PR numbers.
     */
    static fetchAllPullRequests(pullRequestNumbers: number[]): Promise<OctokitPR[] | void> {
        const oldestPR = pullRequestNumbers.sort()[0];
        return this.paginate(
            this.octokit.pulls.list,
            {
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                state: 'all',
                sort: 'created',
                direction: 'desc',
                per_page: 100,
            },
            ({data}, done) => {
                if (data.find((pr) => pr.number === oldestPR)) {
                    done();
                }
                return data;
            },
        )
            .then((prList) => prList.filter((pr) => pullRequestNumbers.includes(pr.number)))
            .catch((err) => console.error('Failed to get PR list', err));
    }

    static getPullRequestBody(pullRequestNumber: number): Promise<string | null> {
        return this.octokit.pulls
            .get({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                pull_number: pullRequestNumber,
            })
            .then(({data: pullRequestComment}) => pullRequestComment.body);
    }

    static getAllReviewComments(pullRequestNumber: number): Promise<string[]> {
        return this.paginate(
            this.octokit.pulls.listReviews,
            {
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                pull_number: pullRequestNumber,
                per_page: 100,
            },
            (response) => response.data.map((review) => review.body),
        );
    }

    static getAllComments(issueNumber: number): Promise<Array<string | undefined>> {
        return this.paginate(
            this.octokit.issues.listComments,
            {
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                issue_number: issueNumber,
                per_page: 100,
            },
            (response) => response.data.map((comment) => comment.body),
        );
    }

    /**
     * Create comment on pull request
     *
     * @param repo - The repo to search for a matching pull request or issue number
     * @param number - The pull request or issue number
     * @param messageBody - The comment message
     */
    static createComment(repo: string, number: number, messageBody: string): Promise<RestEndpointMethodTypes['issues']['createComment']['response']> {
        console.log(`Writing comment on #${number}`);
        return this.octokit.issues.createComment({
            owner: CONST.GITHUB_OWNER,
            repo,
            issue_number: number,
            body: messageBody,
        });
    }

    /**
     * Get the most recent workflow run for the given New Expensify workflow.
     */
    static getLatestWorkflowRunID(workflow: string | number): Promise<number> {
        console.log(`Fetching New Expensify workflow runs for ${workflow}...`);
        return this.octokit.actions
            .listWorkflowRuns({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                workflow_id: workflow,
            })
            .then((response) => response.data.workflow_runs[0]?.id);
    }

    /**
     * Generate the well-formatted body of a production release.
     */
    static getReleaseBody(pullRequests: number[]): string {
        return pullRequests.map((number) => `- ${this.getPullRequestURLFromNumber(number)}`).join('\r\n');
    }

    /**
     * Generate the URL of an New Expensify pull request given the PR number.
     */
    static getPullRequestURLFromNumber(value: number): string {
        // @ts-expect-error TODO: Remove this once CONST.js (https://github.com/Expensify/App/issues/25362) is migrated to TypeScript
        return `${CONST.APP_REPO_URL}/pull/${value}`;
    }

    /**
     * Parse the pull request number from a URL.
     *
     * @throws {Error} If the URL is not a valid Github Pull Request.
     */
    static getPullRequestNumberFromURL(URL: string): number {
        const matches = URL.match(PULL_REQUEST_REGEX);
        if (!Array.isArray(matches) || matches.length !== 2) {
            throw new Error(`Provided URL ${URL} is not a Github Pull Request!`);
        }
        return Number.parseInt(matches[1], 10);
    }

    /**
     * Parse the issue number from a URL.
     *
     * @throws {Error} If the URL is not a valid Github Issue.
     */
    static getIssueNumberFromURL(URL: string): number {
        const matches = URL.match(ISSUE_REGEX);
        if (!Array.isArray(matches) || matches.length !== 2) {
            throw new Error(`Provided URL ${URL} is not a Github Issue!`);
        }
        return Number.parseInt(matches[1], 10);
    }

    /**
     * Parse the issue or pull request number from a URL.
     *
     * @throws {Error} If the URL is not a valid Github Issue or Pull Request.
     */
    static getIssueOrPullRequestNumberFromURL(URL: string): number {
        const matches = URL.match(ISSUE_OR_PULL_REQUEST_REGEX);
        if (!Array.isArray(matches) || matches.length !== 2) {
            throw new Error(`Provided URL ${URL} is not a valid Github Issue or Pull Request!`);
        }
        return Number.parseInt(matches[1], 10);
    }

    /**
     * Return the login of the actor who closed an issue or PR. If the issue is not closed, return an empty string.
     */
    static getActorWhoClosedIssue(issueNumber: number): Promise<string> {
        return this.paginate(this.octokit.issues.listEvents, {
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            issue_number: issueNumber,
            per_page: 100,
        })
            .then((events) => events.filter((event) => event.event === 'closed'))
            .then((closedEvents) => closedEvents.slice(-1)[0].actor?.login ?? '');
    }

    static getArtifactByName(artefactName: string): Promise<OctokitArtifact | undefined> {
        return this.paginate(this.octokit.actions.listArtifactsForRepo, {
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            per_page: 100,
        }).then((artifacts: OctokitArtifact[]) => artifacts.find((artifact) => artifact.name === artefactName));
    }
}

export default GithubUtils;
module.exports = GithubUtils;
export {ISSUE_OR_PULL_REQUEST_REGEX, POLL_RATE};
export type {ListForRepoMethod};
