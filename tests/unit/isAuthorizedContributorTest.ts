import {RequestError} from '@octokit/request-error';
import {afterAll, afterEach, beforeEach, describe, expect, jest, test} from 'bun:test';

import type {InternalOctokit} from '../../.github/libs/GithubUtils';

import {isAuthorizedContributor, isContributorPlusMember, isInternalExpensifyEngineer} from '../../.github/actions/javascript/isAuthorizedContributor/isAuthorizedContributor';
import GithubUtils from '../../.github/libs/GithubUtils';

function createRequestError(status: number): RequestError {
    return new RequestError('Not Found', status, {
        request: {
            method: 'GET',
            url: 'https://api.github.com',
            headers: {},
        },
    });
}

const mockGetMembershipForUserInOrg = jest.fn();
const mockPullsGet = jest.fn();
const mockIssuesGet = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(GithubUtils, 'initOctokitWithToken').mockImplementation(() => {});

    const mockOctokit = {
        rest: {
            teams: {
                getMembershipForUserInOrg: mockGetMembershipForUserInOrg,
            },
            pulls: {
                get: mockPullsGet,
            },
            issues: {
                get: mockIssuesGet,
            },
        },
    } as unknown as InternalOctokit;

    GithubUtils.internalOctokit = mockOctokit;
});

afterEach(() => {
    jest.restoreAllMocks();
});

afterAll(() => {
    // `bun test` runs all files in one process sharing GithubUtils' module-level state, unlike Jest's per-file
    // module registry; reset it so later test files re-initialize their own octokit mock from scratch.
    GithubUtils.internalOctokit = undefined;
});

const defaultParams = {
    prNumber: 123,
    actor: 'externalUser',
    actorAssociation: 'NONE',
    repoOwner: 'Expensify',
    repoName: 'App',
    githubToken: 'github-token',
    orgToken: 'org-token',
};

describe('isAuthorizedContributor', () => {
    describe('isContributorPlusMember', () => {
        test('returns true when team membership exists', async () => {
            mockGetMembershipForUserInOrg.mockResolvedValue({data: {state: 'active'}});

            await expect(isContributorPlusMember('plusUser', 'org-token')).resolves.toBe(true);
        });

        test('returns false when membership is 404', async () => {
            mockGetMembershipForUserInOrg.mockRejectedValue(createRequestError(404));

            await expect(isContributorPlusMember('externalUser', 'org-token')).resolves.toBe(false);
        });
    });

    describe('isInternalExpensifyEngineer', () => {
        test('returns true for an engineering team member', async () => {
            mockGetMembershipForUserInOrg.mockResolvedValue({data: {state: 'active'}});

            await expect(isInternalExpensifyEngineer('engineerUser', 'org-token')).resolves.toBe(true);
        });

        test('returns false when not on the engineering team (404)', async () => {
            mockGetMembershipForUserInOrg.mockRejectedValue(createRequestError(404));

            await expect(isInternalExpensifyEngineer('externalUser', 'org-token')).resolves.toBe(false);
        });

        test('returns false for a Contributor+ member who is not on the engineering team', async () => {
            mockGetMembershipForUserInOrg.mockImplementation((params: Record<string, unknown>) =>
                params.team_slug === 'engineering' ? Promise.reject(createRequestError(404)) : Promise.resolve({data: {state: 'active'}}),
            );

            await expect(isInternalExpensifyEngineer('contributorPlusUser', 'org-token')).resolves.toBe(false);
        });
    });

    describe('isAuthorizedContributor', () => {
        test('authorizes MEMBER association without API calls', async () => {
            await expect(
                isAuthorizedContributor({
                    ...defaultParams,
                    actor: 'memberUser',
                    actorAssociation: 'MEMBER',
                }),
            ).resolves.toBe(true);

            expect(mockPullsGet).not.toHaveBeenCalled();
            expect(mockGetMembershipForUserInOrg).not.toHaveBeenCalled();
        });

        test('authorizes Contributor+ team member', async () => {
            mockGetMembershipForUserInOrg.mockResolvedValue({data: {state: 'active'}});

            await expect(isAuthorizedContributor({...defaultParams})).resolves.toBe(true);

            expect(mockPullsGet).not.toHaveBeenCalled();
        });

        test('authorizes when linked issue assignee matches author', async () => {
            mockGetMembershipForUserInOrg.mockRejectedValue(createRequestError(404));
            mockPullsGet.mockResolvedValue({
                data: {
                    body: 'Fixes https://github.com/Expensify/App/issues/9999',
                },
            });
            mockIssuesGet.mockResolvedValue({
                data: {
                    assignees: [{login: 'ExternalUser'}],
                },
            });

            await expect(isAuthorizedContributor({...defaultParams})).resolves.toBe(true);
        });

        test('returns false when no authorization path matches', async () => {
            mockGetMembershipForUserInOrg.mockRejectedValue(createRequestError(404));
            mockPullsGet.mockResolvedValue({
                data: {
                    body: 'No links here',
                },
            });

            await expect(isAuthorizedContributor({...defaultParams})).resolves.toBe(false);
        });
    });
});
