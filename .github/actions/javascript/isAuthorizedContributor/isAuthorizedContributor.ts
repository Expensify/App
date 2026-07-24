import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';
import isTeamMember from '@github/libs/isTeamMember';

import * as core from '@actions/core';
import * as github from '@actions/github';

const AUTHORIZED_ASSOCIATIONS = new Set(['MEMBER', 'OWNER', 'CONTRIBUTOR', 'COLLABORATOR']);
const CONTRIBUTOR_PLUS_TEAM_SLUG = 'contributor-plus';

// Internal Expensify engineers belong to this team. We can't rely on author_association, which only reports MEMBER for publicly visible org members.
const ENGINEERING_TEAM_SLUG = 'engineering';

const ISSUE_URL_PATTERN = /https:\/\/github\.com\/(Expensify\/[^/]+)\/issues\/(\d+)/g;

type IsAuthorizedContributorParams = {
    prNumber: number;
    actor: string;
    actorAssociation: string;
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
    const isMember = await isTeamMember(GithubUtils.octokit, CONST.GITHUB_OWNER, CONTRIBUTOR_PLUS_TEAM_SLUG, username);
    console.log(isMember ? `${username} is a Contributor+ member. Authorized.` : `${username} is not a Contributor+ member.`);
    return isMember;
}

/**
 * Returns whether a user is an internal Expensify engineer (member of the engineering org team).
 */
async function isInternalExpensifyEngineer(username: string, orgToken: string): Promise<boolean> {
    GithubUtils.initOctokitWithToken(orgToken);
    return isTeamMember(GithubUtils.octokit, CONST.GITHUB_OWNER, ENGINEERING_TEAM_SLUG, username);
}

async function isAuthorizedViaLinkedIssues(prBody: string, actor: string): Promise<boolean> {
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

            if (issue.assignees?.some((assignee) => assignee.login?.toLowerCase() === actor.toLowerCase())) {
                console.log(`${actor} is assigned to ${repoFullName}#${number}. Authorized.`);
                return true;
            }

            console.log(`${actor} is NOT assigned to ${repoFullName}#${number}.`);
        } catch (error: unknown) {
            logVerificationError(repoFullName, number, error);
        }
    }

    return false;
}

/**
 * Returns whether a PR author is authorized to contribute per Expensify external contributor rules.
 */
async function isAuthorizedContributor({prNumber, actor, actorAssociation, repoOwner, repoName, githubToken, orgToken}: IsAuthorizedContributorParams): Promise<boolean> {
    if (AUTHORIZED_ASSOCIATIONS.has(actorAssociation)) {
        console.log(`${actor} is ${actorAssociation}. Authorized.`);
        return true;
    }

    if (await isContributorPlusMember(actor, orgToken)) {
        return true;
    }

    console.log(`${actor} has association "${actorAssociation}". Checking linked issues...`);

    GithubUtils.initOctokitWithToken(githubToken);

    const {data: pr} = await GithubUtils.octokit.pulls.get({
        owner: repoOwner,
        repo: repoName,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        pull_number: prNumber,
    });

    const prBody = pr.body ?? '';
    const isAuthorized = await isAuthorizedViaLinkedIssues(prBody, actor);

    if (!isAuthorized) {
        console.log(`No valid authorization found for ${actor}.`);
    }

    return isAuthorized;
}

async function run(): Promise<void> {
    const prNumber = Number.parseInt(core.getInput('PR_NUMBER', {required: true}), 10);
    const actor = core.getInput('ACTOR', {required: true});
    const actorAssociation = core.getInput('ACTOR_ASSOCIATION', {required: true});
    const githubToken = core.getInput('GITHUB_TOKEN', {required: true});
    const orgToken = core.getInput('OS_BOTIFY_TOKEN', {required: true});

    const {owner, repo} = github.context.repo;

    const isAuthorized = await isAuthorizedContributor({
        prNumber,
        actor,
        actorAssociation,
        repoOwner: owner,
        repoName: repo,
        githubToken,
        orgToken,
    });

    core.setOutput('IS_AUTHORIZED', isAuthorized);

    const isInternal = await isInternalExpensifyEngineer(actor, orgToken);
    core.setOutput('IS_INTERNAL', isInternal);
}

if (require.main === module) {
    run().catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        core.setFailed(message);
    });
}

export {isAuthorizedContributor, isContributorPlusMember, isInternalExpensifyEngineer};
export default run;
