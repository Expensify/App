import * as core from '@actions/core';
import * as github from '@actions/github';
import {RequestError} from '@octokit/request-error';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';

const AUTHORIZED_ASSOCIATIONS = new Set(['MEMBER', 'OWNER', 'CONTRIBUTOR']);
const CONTRIBUTOR_PLUS_TEAM_SLUG = 'contributor-plus';

const ISSUE_URL_PATTERN = /https:\/\/github\.com\/(Expensify\/[^/]+)\/issues\/(\d+)/g;
const PULL_URL_PATTERN = /https:\/\/github\.com\/(Expensify\/[^/]+)\/pull\/(\d+)/g;

type IsAuthorizedContributorParams = {
    prNumber: number;
    prAuthor: string;
    authorAssociation: string;
    repoOwner: string;
    repoName: string;
    githubToken: string;
    orgToken: string;
};

type ExpensifyRepoLink = {
    repoFullName: string;
    number: number;
    owner: string;
    repo: string;
};

function parseExpensifyLink(match: RegExpMatchArray): ExpensifyRepoLink | null {
    const repoFullName = match[1];
    const numberString = match[2];
    if (!repoFullName || !numberString) {
        return null;
    }

    const [owner, repo] = repoFullName.split('/');
    return {
        repoFullName,
        number: Number.parseInt(numberString, 10),
        owner,
        repo,
    };
}

function logVerificationError(repoFullName: string, number: number, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`Could not verify ${repoFullName}#${number}: ${message}`);
}

async function isContributorPlusMember(username: string, orgToken: string): Promise<boolean> {
    GithubUtils.initOctokitWithToken(orgToken);

    try {
        await GithubUtils.octokit.teams.getMembershipForUserInOrg({
            org: CONST.GITHUB_OWNER,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            team_slug: CONTRIBUTOR_PLUS_TEAM_SLUG,
            username,
        });
        console.log(`${username} is a Contributor+ member. Authorized.`);
        return true;
    } catch (error: unknown) {
        if (error instanceof RequestError && error.status === 404) {
            console.log(`${username} is not a Contributor+ member.`);
            return false;
        }
        throw error;
    }
}

async function isAuthorizedViaLinkedIssues(prBody: string, prAuthor: string): Promise<boolean> {
    for (const match of prBody.matchAll(ISSUE_URL_PATTERN)) {
        const link = parseExpensifyLink(match);
        if (!link) {
            continue;
        }

        const {repoFullName, number, owner, repo} = link;

        try {
            const {data: issue} = await GithubUtils.octokit.issues.get({
                owner,
                repo,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                issue_number: number,
            });

            if (issue.assignees?.some((assignee) => assignee.login?.toLowerCase() === prAuthor.toLowerCase())) {
                console.log(`${prAuthor} is assigned to ${repoFullName}#${number}. Authorized.`);
                return true;
            }

            console.log(`${prAuthor} is NOT assigned to ${repoFullName}#${number}.`);
        } catch (error: unknown) {
            logVerificationError(repoFullName, number, error);
        }
    }

    return false;
}

async function isAuthorizedViaLinkedPullRequests(prBody: string, prAuthor: string): Promise<boolean> {
    for (const match of prBody.matchAll(PULL_URL_PATTERN)) {
        const link = parseExpensifyLink(match);
        if (!link) {
            continue;
        }

        const {repoFullName, number, owner, repo} = link;

        try {
            const {data: linkedPR} = await GithubUtils.octokit.pulls.get({
                owner,
                repo,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                pull_number: number,
            });

            if (linkedPR.user?.login?.toLowerCase() === prAuthor.toLowerCase()) {
                console.log(`${prAuthor} is the author of ${repoFullName}#${number}. Authorized.`);
                return true;
            }

            const {data: reviews} = await GithubUtils.octokit.pulls.listReviews({
                owner,
                repo,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                pull_number: number,
            });

            if (reviews.some((review) => review.user?.login?.toLowerCase() === prAuthor.toLowerCase())) {
                console.log(`${prAuthor} is a reviewer of ${repoFullName}#${number}. Authorized.`);
                return true;
            }

            const {data: requestedReviewers} = await GithubUtils.octokit.pulls.listRequestedReviewers({
                owner,
                repo,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                pull_number: number,
            });

            if (requestedReviewers.users.some((user) => user.login.toLowerCase() === prAuthor.toLowerCase())) {
                console.log(`${prAuthor} is a requested reviewer of ${repoFullName}#${number}. Authorized.`);
                return true;
            }

            console.log(`${prAuthor} is not author or reviewer of ${repoFullName}#${number}.`);
        } catch (error: unknown) {
            logVerificationError(repoFullName, number, error);
        }
    }

    return false;
}

/**
 * Returns whether a PR author is authorized to contribute per Expensify external contributor rules.
 */
async function isAuthorizedContributor({prNumber, prAuthor, authorAssociation, repoOwner, repoName, githubToken, orgToken}: IsAuthorizedContributorParams): Promise<boolean> {
    if (AUTHORIZED_ASSOCIATIONS.has(authorAssociation)) {
        console.log(`${prAuthor} is ${authorAssociation}. Authorized.`);
        return true;
    }

    if (await isContributorPlusMember(prAuthor, orgToken)) {
        return true;
    }

    console.log(`${prAuthor} has association "${authorAssociation}". Checking linked issues/PRs...`);

    GithubUtils.initOctokitWithToken(githubToken);

    const {data: pr} = await GithubUtils.octokit.pulls.get({
        owner: repoOwner,
        repo: repoName,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        pull_number: prNumber,
    });

    const prBody = pr.body ?? '';
    const authorizedViaLinks = (await isAuthorizedViaLinkedIssues(prBody, prAuthor)) || (await isAuthorizedViaLinkedPullRequests(prBody, prAuthor));

    if (!authorizedViaLinks) {
        console.log(`No valid authorization found for ${prAuthor}.`);
    }

    return authorizedViaLinks;
}

async function run(): Promise<void> {
    const prNumber = Number.parseInt(core.getInput('PR_NUMBER', {required: true}), 10);
    const prAuthor = core.getInput('PR_AUTHOR', {required: true});
    const authorAssociation = core.getInput('AUTHOR_ASSOCIATION', {required: true});
    const githubToken = core.getInput('GITHUB_TOKEN', {required: true});
    const orgToken = core.getInput('OS_BOTIFY_TOKEN', {required: true});

    const {owner, repo} = github.context.repo;

    const authorized = await isAuthorizedContributor({
        prNumber,
        prAuthor,
        authorAssociation,
        repoOwner: owner,
        repoName: repo,
        githubToken,
        orgToken,
    });

    core.setOutput('IS_AUTHORIZED', authorized ? 'true' : 'false');
}

if (require.main === module) {
    run().catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        core.setFailed(message);
    });
}

export {isAuthorizedContributor, isContributorPlusMember};
export default run;
