import {describe, expect, jest, test} from 'bun:test';

import {RequestError} from '@octokit/request-error';

import isTeamMember, {getTeamMembership} from '../../.github/libs/isTeamMember';

type Octokit = Parameters<typeof getTeamMembership>[0];

function createRequestError(status: number): RequestError {
    return new RequestError('Request failed', status, {request: {method: 'GET', url: 'https://api.github.com', headers: {}}});
}

function createOctokit(getMembershipForUserInOrg: () => Promise<unknown>): Octokit {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a partial octokit is enough for this endpoint
    return {teams: {getMembershipForUserInOrg}} as unknown as Octokit;
}

describe('getTeamMembership', () => {
    test('returns true for a member', async () => {
        // Given GitHub finds the membership
        const octokit = createOctokit(jest.fn(() => Promise.resolve({data: {state: 'active'}})));

        // When the membership is checked
        // Then the user is a member
        expect(await getTeamMembership(octokit, 'Expensify', 'applause', 'tester')).toBe(true);
    });

    test('returns false when GitHub says the user is not on the team', async () => {
        // Given GitHub answers 404, which is how it reports a non-member
        const octokit = createOctokit(jest.fn(() => Promise.reject(createRequestError(404))));

        // When the membership is checked
        // Then the user is not a member
        expect(await getTeamMembership(octokit, 'Expensify', 'applause', 'new-account')).toBe(false);
    });

    test('returns undefined when GitHub fails', async () => {
        // Given GitHub errors for a reason other than the user being missing
        const octokit = createOctokit(jest.fn(() => Promise.reject(createRequestError(500))));

        // When the membership is checked
        // Then callers can tell a failed check apart from a non-member
        expect(await getTeamMembership(octokit, 'Expensify', 'applause', 'tester')).toBeUndefined();
    });
});

describe('isTeamMember', () => {
    test('treats a failed check as not a member', async () => {
        // Given GitHub errors while checking the membership
        const octokit = createOctokit(jest.fn(() => Promise.reject(createRequestError(500))));

        // When isTeamMember is called
        // Then existing callers still get a plain false
        expect(await isTeamMember(octokit, 'Expensify', 'engineering', 'tester')).toBe(false);
    });
});
