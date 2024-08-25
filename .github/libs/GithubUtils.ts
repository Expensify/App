/* eslint-disable @typescript-eslint/naming-convention, import/no-import-module-exports */
import * as core from '@actions/core';
import {getOctokitOptions, GitHub} from '@actions/github/lib/utils';
import type {Octokit as OctokitCore} from '@octokit/core';
import type {graphql} from '@octokit/graphql/dist-types/types';
import type {components as OctokitComponents} from '@octokit/openapi-types/types';
import type {PaginateInterface} from '@octokit/plugin-paginate-rest';
import {paginateRest} from '@octokit/plugin-paginate-rest';
import type {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods';
import type {RestEndpointMethods} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types';
import type {Api} from '@octokit/plugin-rest-endpoint-methods/dist-types/types';
import {throttling} from '@octokit/plugin-throttling';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import arrayDifference from '@src/utils/arrayDifference';
import CONST from './CONST';

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

type StagingDeployCashBody = {
    issueBody: string;
    issueAssignees: Array<string | undefined>;
};

type OctokitArtifact = OctokitComponents['schemas']['artifact'];

type OctokitPR = OctokitComponents['schemas']['pull-request-simple'];

type CreateCommentResponse = RestEndpointMethodTypes['issues']['createComment']['response'];

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

type InternalOctokit = OctokitCore & Api & {paginate: PaginateInterface};

class GithubUtils {
    static internalOctokit: InternalOctokit | undefined;

    /**
     * Initialize internal octokit.
     * NOTE: When using GithubUtils in CI, you don't need to call this manually.
     */
    static initOctokitWithToken(token: string) {
        const Octokit = GitHub.plugin(throttling, paginateRest);

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
     * Default initialize method assuming running in CI, getting the token from an input.
     *
     * @private
     */
    static initOctokit() {
        const token = core.getInput('GITHUB_TOKEN', {required: true});
        this.initOctokitWithToken(token);
    }

    /**
     * Either give an existing instance of Octokit rest or create a new one
     *
     * @readonly
     * @static
     */
    static get octokit(): RestEndpointMethods {
        if (!this.internalOctokit) {
            this.initOctokit();
        }

        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        return (this.internalOctokit as InternalOctokit).rest;
    }

    /**
     * Get the graphql instance from internal octokit.
     * @readonly
     * @static
     */
    static get graphql(): graphql {
        if (!this.internalOctokit) {
            this.initOctokit();
        }

        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        return (this.internalOctokit as InternalOctokit).graphql;
    }

    /**
     * Either give an existing instance of Octokit paginate or create a new one
     *
     * @readonly
     * @static
     */
    static get paginate(): PaginateInterface {
        if (!this.internalOctokit) {
            this.initOctokit();
        }

        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        return (this.internalOctokit as InternalOctokit).paginate;
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
                    throw new Error(`Unable to find ${CONST.LABELS.STAGING_DEPLOY} issue.`);
                }

                if (data.length > 1) {
                    throw new Error(`Found more than one ${CONST.LABELS.STAGING_DEPLOY} issue.`);
                }

                const issue = data.at(0);

                if (!issue) {
                    throw new Error(`Found an undefined ${CONST.LABELS.STAGING_DEPLOY} issue.`);
                }

                return this.getStagingDeployCashData(issue);
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
        let PRListSection: RegExpMatchArray | string | null = issue.body?.match(/pull requests:\*\*\r?\n((?:-.*\r?\n)+)\r?\n\r?\n?/) ?? null;
        if (PRListSection?.length !== 2) {
            // No PRs, return an empty array
            console.log('Hmmm...The open StagingDeployCash does not list any pull requests, continuing...');
            return [];
        }

        PRListSection = PRListSection[1];
        const PRList = [...PRListSection.matchAll(new RegExp(`- \\[([ x])] (${CONST.PULL_REQUEST_REGEX.source})`, 'g'))].map((match) => ({
            url: match[2],
            number: Number.parseInt(match[3], 10),
            isVerified: match[1] === 'x',
        }));

        return PRList.sort((a, b) => a.number - b.number);
    }

    /**
     * Parse DeployBlocker section of the StagingDeployCash issue body.
     *
     * @private
     */
    static getStagingDeployCashDeployBlockers(issue: OctokitIssueItem): StagingDeployCashBlocker[] {
        let deployBlockerSection: RegExpMatchArray | string | null = issue.body?.match(/Deploy Blockers:\*\*\r?\n((?:-.*\r?\n)+)/) ?? null;
        if (deployBlockerSection?.length !== 2) {
            return [];
        }

        deployBlockerSection = deployBlockerSection[1];
        const deployBlockers = [...deployBlockerSection.matchAll(new RegExp(`- \\[([ x])]\\s(${CONST.ISSUE_OR_PULL_REQUEST_REGEX.source})`, 'g'))].map((match) => ({
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
        let internalQASection: RegExpMatchArray | string | null = issue.body?.match(/Internal QA:\*\*\r?\n((?:- \[[ x]].*\r?\n)+)/) ?? null;
        if (internalQASection?.length !== 2) {
            return [];
        }
        internalQASection = internalQASection[1];
        const internalQAPRs = [...internalQASection.matchAll(new RegExp(`- \\[([ x])]\\s(${CONST.PULL_REQUEST_REGEX.source})`, 'g'))].map((match) => ({
            url: match[2].split('-').at(0)?.trim() ?? '',
            number: Number.parseInt(match[3], 10),
            isResolved: match[1] === 'x',
        }));

        return internalQAPRs.sort((a, b) => a.number - b.number);
    }

    /**
     * Generate the issue body and assignees for a StagingDeployCash.
     */
    static generateStagingDeployCashBodyAndAssignees(
        tag: string,
        PRList: string[],
        verifiedPRList: string[] = [],
        deployBlockers: string[] = [],
        resolvedDeployBlockers: string[] = [],
        resolvedInternalQAPRs: string[] = [],
        isTimingDashboardChecked = false,
        isFirebaseChecked = false,
        isGHStatusChecked = false,
    ): Promise<void | StagingDeployCashBody> {
        return this.fetchAllPullRequests(PRList.map((pr) => this.getPullRequestNumberFromURL(pr)))
            .then((data) => {
                const internalQAPRs = Array.isArray(data) ? data.filter((pr) => !isEmptyObject(pr.labels.find((item) => item.name === CONST.LABELS.INTERNAL_QA))) : [];
                return Promise.all(internalQAPRs.map((pr) => this.getPullRequestMergerLogin(pr.number).then((mergerLogin) => ({url: pr.html_url, mergerLogin})))).then((results) => {
                    // The format of this map is following:
                    // {
                    //    'https://github.com/Expensify/App/pull/9641': 'PauloGasparSv',
                    //    'https://github.com/Expensify/App/pull/9642': 'mountiny'
                    // }
                    const internalQAPRMap = results.reduce<Record<string, string | undefined>>((acc, {url, mergerLogin}) => {
                        acc[url] = mergerLogin;
                        return acc;
                    }, {});
                    console.log('Found the following Internal QA PRs:', internalQAPRMap);

                    const noQAPRs = Array.isArray(data) ? data.filter((PR) => /\[No\s?QA]/i.test(PR.title)).map((item) => item.html_url) : [];
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
                    if (sortedPRList.length > 0) {
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
                            const merger = internalQAPRMap[URL];
                            const mergerMention = `@${merger}`;
                            issueBody += `${resolvedInternalQAPRs.includes(URL) ? '- [x]' : '- [ ]'} `;
                            issueBody += `${URL}`;
                            issueBody += ` - ${mergerMention}`;
                            issueBody += '\r\n';
                        });
                        issueBody += '\r\n\r\n';
                    }

                    // Deploy blockers
                    if (deployBlockers.length > 0) {
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
                    const issueAssignees = [...new Set(Object.values(internalQAPRMap))];
                    const issue = {issueBody, issueAssignees};
                    return issue;
                });
            })
            .catch((err) => console.warn('Error generating StagingDeployCash issue body! Continuing...', err));
    }

    /**
     * Fetch all pull requests given a list of PR numbers.
     */
    static fetchAllPullRequests(pullRequestNumbers: number[]): Promise<OctokitPR[] | void> {
        const oldestPR = pullRequestNumbers.sort((a, b) => a - b).at(0);
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

    static getPullRequestMergerLogin(pullRequestNumber: number): Promise<string | undefined> {
        return this.octokit.pulls
            .get({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                pull_number: pullRequestNumber,
            })
            .then(({data: pullRequest}) => pullRequest.merged_by?.login);
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
     */
    static createComment(repo: string, number: number, messageBody: string): Promise<CreateCommentResponse> {
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
            .then((response) => response.data.workflow_runs.at(0)?.id ?? -1);
    }

    /**
     * Generate the URL of an New Expensify pull request given the PR number.
     */
    static getPullRequestURLFromNumber(value: number): string {
        return `${CONST.APP_REPO_URL}/pull/${value}`;
    }

    /**
     * Parse the pull request number from a URL.
     *
     * @throws {Error} If the URL is not a valid Github Pull Request.
     */
    static getPullRequestNumberFromURL(URL: string): number {
        const matches = URL.match(CONST.PULL_REQUEST_REGEX);
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
        const matches = URL.match(CONST.ISSUE_REGEX);
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
        const matches = URL.match(CONST.ISSUE_OR_PULL_REQUEST_REGEX);
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
            .then((closedEvents) => closedEvents.at(-1)?.actor?.login ?? '');
    }

    /**
     * Returns a single artifact by name. If none is found, it returns undefined.
     */
    static getArtifactByName(artifactName: string): Promise<OctokitArtifact | undefined> {
        return this.octokit.actions
            .listArtifactsForRepo({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                per_page: 1,
                name: artifactName,
            })
            .then((response) => response.data.artifacts.at(0));
    }

    /**
     * Given an artifact ID, returns the download URL to a zip file containing the artifact.
     */
    static getArtifactDownloadURL(artifactId: number): Promise<string> {
        return this.octokit.actions
            .downloadArtifact({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                artifact_id: artifactId,
                archive_format: 'zip',
            })
            .then((response) => response.url);
    }
}

export default GithubUtils;
export type {ListForRepoMethod, InternalOctokit, CreateCommentResponse, StagingDeployCashData};
