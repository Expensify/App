import {RequestError} from '@octokit/request-error';
import CONST from './CONST';
import GithubUtils from './GithubUtils';

const AUTHORIZED_ASSOCIATIONS = new Set(['MEMBER', 'OWNER', 'CONTRIBUTOR']);

const ISSUE_URL_PATTERN = /https:\/\/github\.com\/(Expensify\/[^/]+)\/issues\/(\d+)/g;
const PULL_URL_PATTERN = /https:\/\/github\.com\/(Expensify\/[^/]+)\/pull\/(\d+)/g;

type ContributorAuthorizationParams = {
    prNumber: number;
    prAuthor: string;
    authorAssociation: string;
    repoOwner: string;
    repoName: string;
    githubToken: string;
    orgToken: string;
};

function loginsMatch(loginA: string, loginB: string): boolean {
    return loginA.toLowerCase() === loginB.toLowerCase();
}

function stripHtmlComments(body: string): string {
    return body.replaceAll(/<!--[\s\S]*?-->/g, '');
}

function parseRepoFullName(fullName: string): {owner: string; repo: string} {
    const [owner, repo] = fullName.split('/');
    return {owner, repo};
}

async function isContributorPlusMember(username: string, orgToken: string): Promise<boolean> {
    GithubUtils.initOctokitWithToken(orgToken);

    try {
        await GithubUtils.octokit.teams.getMembershipForUserInOrg({
            org: CONST.GITHUB_OWNER,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            team_slug: CONST.CONTRIBUTOR_PLUS_TEAM_SLUG,
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

async function isAuthorizedViaLinkedIssues(cleanBody: string, prAuthor: string): Promise<boolean> {
    const issueMatches = [...cleanBody.matchAll(ISSUE_URL_PATTERN)];

    for (const match of issueMatches) {
        const repoFullName = match[1];
        const issueNumberString = match[2];
        if (!repoFullName || !issueNumberString) {
            continue;
        }

        const issueNumber = Number.parseInt(issueNumberString, 10);
        const {owner, repo} = parseRepoFullName(repoFullName);

        try {
            const {data: issue} = await GithubUtils.octokit.issues.get({
                owner,
                repo,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                issue_number: issueNumber,
            });

            const isAssignee = issue.assignees?.some((assignee) => {
                const login = assignee.login;
                return login !== undefined && loginsMatch(login, prAuthor);
            });

            if (isAssignee) {
                console.log(`${prAuthor} is assigned to ${repoFullName}#${issueNumber}. Authorized.`);
                return true;
            }

            console.log(`${prAuthor} is NOT assigned to ${repoFullName}#${issueNumber}.`);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.log(`Could not verify ${repoFullName}#${issueNumber}: ${message}`);
        }
    }

    return false;
}

async function isAuthorizedViaLinkedPullRequests(cleanBody: string, prAuthor: string): Promise<boolean> {
    const pullMatches = [...cleanBody.matchAll(PULL_URL_PATTERN)];

    for (const match of pullMatches) {
        const repoFullName = match[1];
        const pullNumberString = match[2];
        if (!repoFullName || !pullNumberString) {
            continue;
        }

        const pullNumber = Number.parseInt(pullNumberString, 10);
        const {owner, repo} = parseRepoFullName(repoFullName);

        try {
            const {data: linkedPR} = await GithubUtils.octokit.pulls.get({
                owner,
                repo,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                pull_number: pullNumber,
            });

            const linkedAuthorLogin = linkedPR.user?.login;
            if (linkedAuthorLogin && loginsMatch(linkedAuthorLogin, prAuthor)) {
                console.log(`${prAuthor} is the author of ${repoFullName}#${pullNumber}. Authorized.`);
                return true;
            }

            const {data: reviews} = await GithubUtils.octokit.pulls.listReviews({
                owner,
                repo,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                pull_number: pullNumber,
            });

            const isReviewer = reviews.some((review) => {
                const login = review.user?.login;
                return login !== undefined && loginsMatch(login, prAuthor);
            });

            if (isReviewer) {
                console.log(`${prAuthor} is a reviewer of ${repoFullName}#${pullNumber}. Authorized.`);
                return true;
            }

            const {data: requestedReviewers} = await GithubUtils.octokit.pulls.listRequestedReviewers({
                owner,
                repo,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                pull_number: pullNumber,
            });

            const isRequestedReviewer = requestedReviewers.users.some((user) => loginsMatch(user.login, prAuthor));

            if (isRequestedReviewer) {
                console.log(`${prAuthor} is a requested reviewer of ${repoFullName}#${pullNumber}. Authorized.`);
                return true;
            }

            console.log(`${prAuthor} is not author or reviewer of ${repoFullName}#${pullNumber}.`);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.log(`Could not verify ${repoFullName}#${pullNumber}: ${message}`);
        }
    }

    return false;
}

/**
 * Returns whether a PR author is authorized to contribute per Expensify external contributor rules.
 */
async function isAuthorizedContributor({prNumber, prAuthor, authorAssociation, repoOwner, repoName, githubToken, orgToken}: ContributorAuthorizationParams): Promise<boolean> {
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

    const cleanBody = stripHtmlComments(pr.body ?? '');

    if (await isAuthorizedViaLinkedIssues(cleanBody, prAuthor)) {
        return true;
    }

    if (await isAuthorizedViaLinkedPullRequests(cleanBody, prAuthor)) {
        return true;
    }

    console.log(`No valid authorization found for ${prAuthor}.`);
    return false;
}

export {isAuthorizedContributor, isContributorPlusMember, stripHtmlComments, loginsMatch, AUTHORIZED_ASSOCIATIONS};
export default isAuthorizedContributor;
