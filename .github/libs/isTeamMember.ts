import type {Api} from '@octokit/plugin-rest-endpoint-methods';

/* eslint-disable @typescript-eslint/naming-convention */
import * as core from '@actions/core';
import {RequestError} from '@octokit/request-error';

// @octokit/plugin-rest-endpoint-methods no longer exports its `RestEndpointMethods` type directly, only `Api`
// (which wraps it as `{rest: RestEndpointMethods}`), so it's derived here instead.
type RestEndpointMethods = Api['rest'];

/**
 * Whether a user is a member of the given org team.
 * The octokit must be authenticated with a token that has read:org scope, otherwise concealed (private) members are reported as non-members.
 */
async function isTeamMember(octokit: RestEndpointMethods, org: string, teamSlug: string, username: string): Promise<boolean> {
    try {
        await octokit.teams.getMembershipForUserInOrg({
            org,
            team_slug: teamSlug,
            username,
        });
        return true;
    } catch (error: unknown) {
        if (error instanceof RequestError && error.status === 404) {
            return false;
        }

        const message = error instanceof Error ? error.message : String(error);
        core.warning(`Could not verify ${teamSlug} membership for ${username}. Assuming they are not a member: ${message}`);
        return false;
    }
}

export default isTeamMember;
