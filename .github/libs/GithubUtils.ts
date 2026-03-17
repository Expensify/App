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
import {RequestError} from '@octokit/request-error';
import CONST from './CONST';

type OctokitOptions = {method: string; url: string; request: {retryCount: number}};

type OctokitIssueItem = OctokitComponents['schemas']['issue'];

type ListForRepoMethod = RestEndpointMethods['issues']['listForRepo'];

type OctokitCommit = OctokitComponents['schemas']['commit'];

type CommitType = {
    commit: string;
    subject: string;
    authorName: string;
    date: string;
};

type OctokitArtifact = OctokitComponents['schemas']['artifact'];

type OctokitPR = OctokitComponents['schemas']['pull-request-simple'];

type CreateCommentResponse = RestEndpointMethodTypes['issues']['createComment']['response'];

type ListCommentsResponse = RestEndpointMethodTypes['issues']['listComments']['response'];

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
        const token = process.env.GITHUB_TOKEN ?? core.getInput('GITHUB_TOKEN', {required: true});
        if (!token) {
            console.error('GitHubUtils could not find GITHUB_TOKEN');
            process.exit(1);
        }

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
            .then((prList) => prList?.filter((pr) => pullRequestNumbers.includes(pr.number)) ?? [])
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

    static async getPullRequestMergeBaseSHA(pullRequestNumber: number): Promise<string> {
        const {data: pullRequest} = await this.octokit.pulls.get({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            pull_number: pullRequestNumber,
        });
        const {data: comparison} = await this.octokit.repos.compareCommits({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            base: pullRequest.base.ref,
            head: pullRequest.head.sha,
        });
        return comparison.merge_base_commit.sha;
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

    static getAllCommentDetails(issueNumber: number): Promise<ListCommentsResponse['data']> {
        return this.paginate(
            this.octokit.issues.listComments,
            {
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                issue_number: issueNumber,
                per_page: 100,
            },
            (response) => response.data,
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
    /* eslint-disable rulesdir/no-default-id-values */
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
     * List workflow runs for the repository.
     */
    static async listWorkflowRunsForRepo(
        options: {
            per_page?: number;
            status?:
                | 'completed'
                | 'action_required'
                | 'cancelled'
                | 'failure'
                | 'neutral'
                | 'skipped'
                | 'stale'
                | 'success'
                | 'timed_out'
                | 'in_progress'
                | 'queued'
                | 'requested'
                | 'waiting';
        } = {},
    ) {
        return this.octokit.actions.listWorkflowRunsForRepo({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            per_page: options.per_page ?? 50,
            ...(options.status && {status: options.status}),
        });
    }

    /**
     * Get the workflow run URL for a specific commit SHA and workflow file.
     * Returns the HTML URL of the matching run, or undefined if not found.
     */
    static async getWorkflowRunURLForCommit(commitSha: string, workflowFile: string): Promise<string | undefined> {
        try {
            const response = await this.octokit.actions.listWorkflowRuns({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                workflow_id: workflowFile,
                head_sha: commitSha,
                per_page: 1,
            });
            return response.data.workflow_runs.at(0)?.html_url;
        } catch (error) {
            console.warn(`Failed to find workflow run for commit ${commitSha}:`, error);
            return undefined;
        }
    }

    /**
     * Generate the URL of an New Expensify pull request given the PR number.
     */
    static getPullRequestURLFromNumber(value: number, repositoryURL: string): string {
        return `${repositoryURL}/pull/${value}`;
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

    /**
     * Get the contents of a file from the API at a given ref as a string.
     */
    static async getFileContents(path: string, ref: string = CONST.DEFAULT_BASE_REF): Promise<string> {
        const {data} = await this.octokit.repos.getContent({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            path,
            ref,
        });
        if (Array.isArray(data)) {
            throw new Error(`Provided path ${path} refers to a directory, not a file`);
        }
        if (!('content' in data)) {
            throw new Error(`Provided path ${path} is invalid`);
        }
        return Buffer.from(data.content, 'base64').toString('utf8');
    }

    static async getPullRequestChangedSVGFileNames(pullRequestNumber: number): Promise<string[]> {
        const files = this.paginate(
            this.octokit.pulls.listFiles,
            {
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                pull_number: pullRequestNumber,
                per_page: 100,
            },
            (response) => response.data.filter((file) => file.filename.endsWith('.svg') && (file.status === 'added' || file.status === 'modified')).map((file) => file.filename),
        );

        return files;
    }

    /**
     * Get commits between two tags via the GitHub API
     */
    static async getCommitHistoryBetweenTags(fromTag: string, toTag: string, repositoryName: string): Promise<CommitType[]> {
        console.log('Getting pull requests merged between the following tags:', fromTag, toTag);
        core.startGroup('Fetching paginated commits:');

        try {
            let allCommits: OctokitCommit[] = [];
            let page = 1;
            const perPage = 250;
            let hasMorePages = true;

            while (hasMorePages) {
                core.info(`📄 Fetching page ${page} of commits...`);

                const response = await this.octokit.repos.compareCommits({
                    owner: CONST.GITHUB_OWNER,
                    repo: repositoryName,
                    base: fromTag,
                    head: toTag,
                    per_page: perPage,
                    page,
                });

                // Check if we got a proper response with commits
                if (response.data?.commits && Array.isArray(response.data.commits)) {
                    if (page === 1) {
                        core.info(`📊 Total commits: ${response.data.total_commits ?? 'unknown'}`);
                    }
                    core.info(`✅ compareCommits API returned ${response.data.commits.length} commits for page ${page}`);

                    allCommits = allCommits.concat(response.data.commits);

                    // Check if we got fewer commits than requested or if we've reached the total
                    const totalCommits = response.data.total_commits;
                    if (response.data.commits.length < perPage || (totalCommits && allCommits.length >= totalCommits)) {
                        hasMorePages = false;
                    } else {
                        page++;
                    }
                } else {
                    core.warning('⚠️ GitHub API returned unexpected response format');
                    hasMorePages = false;
                }
            }

            core.info(`🎉 Successfully fetched ${allCommits.length} total commits`);
            core.endGroup();
            console.log('');
            return allCommits.map(
                (commit): CommitType => ({
                    commit: commit.sha,
                    subject: commit.commit.message,
                    authorName: commit.commit.author?.name ?? 'Unknown',
                    date: commit.commit.committer?.date ?? '',
                }),
            );
        } catch (error) {
            if (error instanceof RequestError && error.status === 404) {
                core.error(
                    `❓❓ Failed to get commits with the GitHub API. The base tag ('${fromTag}') or head tag ('${toTag}') likely doesn't exist on the remote repository. If this is the case, create or push them.`,
                );
            }
            core.endGroup();
            console.log('');
            throw error;
        }
    }

    static async getPullRequestDiff(pullRequestNumber: number): Promise<string> {
        if (!this.internalOctokit) {
            this.initOctokit();
        }
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        const response = await (this.internalOctokit as InternalOctokit).request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            pull_number: pullRequestNumber,
            mediaType: {
                format: 'diff',
            },
        });
        return response.data as unknown as string;
    }
}

export default GithubUtils;
export type {OctokitIssueItem, ListForRepoMethod, InternalOctokit, CreateCommentResponse, ListCommentsResponse, CommitType};
