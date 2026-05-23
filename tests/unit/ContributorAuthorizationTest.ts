/**
 * @jest-environment node
 */
import type {RestEndpointMethods} from '@octokit/plugin-rest-endpoint-methods';
import {RequestError} from '@octokit/request-error';
import {isAuthorizedContributor, isContributorPlusMember, loginsMatch, stripHtmlComments} from '../../.github/libs/ContributorAuthorization';

function createRequestError(status: number): RequestError {
    return new RequestError('Not Found', status, {
        method: 'GET',
        url: 'https://api.github.com',
        request: {headers: {}, method: 'GET', url: 'https://api.github.com'},
    });
}

function createMockOctokit(overrides: {
    getMembershipForUserInOrg?: jest.Mock;
    pullsGet?: jest.Mock;
    issuesGet?: jest.Mock;
    listReviews?: jest.Mock;
    listRequestedReviewers?: jest.Mock;
}): RestEndpointMethods {
    return {
        teams: {
            getMembershipForUserInOrg: overrides.getMembershipForUserInOrg ?? jest.fn(),
        },
        pulls: {
            get: overrides.pullsGet ?? jest.fn(),
            listReviews: overrides.listReviews ?? jest.fn(),
            listRequestedReviewers: overrides.listRequestedReviewers ?? jest.fn(),
        },
        issues: {
            get: overrides.issuesGet ?? jest.fn(),
        },
    } as unknown as RestEndpointMethods;
}

const defaultParams = {
    prNumber: 123,
    prAuthor: 'externalUser',
    authorAssociation: 'NONE',
    repoOwner: 'Expensify',
    repoName: 'App',
};

describe('ContributorAuthorization', () => {
    describe('loginsMatch', () => {
        test('matches case-insensitively', () => {
            expect(loginsMatch('FooBar', 'foobar')).toBe(true);
            expect(loginsMatch('FooBar', 'FooBar2')).toBe(false);
        });
    });

    describe('stripHtmlComments', () => {
        test('removes HTML comments from PR body', () => {
            const body = 'Hello <!-- hidden --> world';
            expect(stripHtmlComments(body)).toBe('Hello  world');
        });
    });

    describe('isContributorPlusMember', () => {
        test('returns true when team membership exists', async () => {
            const orgOctokit = createMockOctokit({
                getMembershipForUserInOrg: jest.fn().mockResolvedValue({data: {state: 'active'}}),
            });

            await expect(isContributorPlusMember('plusUser', orgOctokit)).resolves.toBe(true);
        });

        test('returns false when membership is 404', async () => {
            const orgOctokit = createMockOctokit({
                getMembershipForUserInOrg: jest.fn().mockRejectedValue(createRequestError(404)),
            });

            await expect(isContributorPlusMember('externalUser', orgOctokit)).resolves.toBe(false);
        });
    });

    describe('isAuthorizedContributor', () => {
        test('authorizes MEMBER association without API calls', async () => {
            const githubOctokit = createMockOctokit({});
            const orgOctokit = createMockOctokit({});

            await expect(
                isAuthorizedContributor({
                    ...defaultParams,
                    prAuthor: 'memberUser',
                    authorAssociation: 'MEMBER',
                    githubOctokit,
                    orgOctokit,
                }),
            ).resolves.toBe(true);

            expect(githubOctokit.pulls.get).not.toHaveBeenCalled();
            expect(orgOctokit.teams.getMembershipForUserInOrg).not.toHaveBeenCalled();
        });

        test('authorizes Contributor+ team member', async () => {
            const githubOctokit = createMockOctokit({});
            const orgOctokit = createMockOctokit({
                getMembershipForUserInOrg: jest.fn().mockResolvedValue({data: {state: 'active'}}),
            });

            await expect(
                isAuthorizedContributor({
                    ...defaultParams,
                    githubOctokit,
                    orgOctokit,
                }),
            ).resolves.toBe(true);

            expect(githubOctokit.pulls.get).not.toHaveBeenCalled();
        });

        test('authorizes when linked issue assignee matches author', async () => {
            const githubOctokit = createMockOctokit({
                getMembershipForUserInOrg: undefined,
                pullsGet: jest.fn().mockResolvedValue({
                    data: {
                        body: 'Fixes https://github.com/Expensify/App/issues/9999',
                    },
                }),
                issuesGet: jest.fn().mockResolvedValue({
                    data: {
                        assignees: [{login: 'externalUser'}],
                    },
                }),
            });
            const orgOctokit = createMockOctokit({
                getMembershipForUserInOrg: jest.fn().mockRejectedValue(createRequestError(404)),
            });

            await expect(
                isAuthorizedContributor({
                    ...defaultParams,
                    githubOctokit,
                    orgOctokit,
                }),
            ).resolves.toBe(true);
        });

        test('authorizes when linked PR author matches', async () => {
            const githubOctokit = createMockOctokit({
                pullsGet: jest
                    .fn()
                    .mockResolvedValueOnce({
                        data: {
                            body: 'See https://github.com/Expensify/App/pull/5555',
                        },
                    })
                    .mockResolvedValueOnce({
                        data: {
                            user: {login: 'externalUser'},
                        },
                    }),
                listReviews: jest.fn().mockResolvedValue({data: []}),
                listRequestedReviewers: jest.fn().mockResolvedValue({data: {users: []}}),
            });
            const orgOctokit = createMockOctokit({
                getMembershipForUserInOrg: jest.fn().mockRejectedValue(createRequestError(404)),
            });

            await expect(
                isAuthorizedContributor({
                    ...defaultParams,
                    githubOctokit,
                    orgOctokit,
                }),
            ).resolves.toBe(true);
        });

        test('returns false when no authorization path matches', async () => {
            const githubOctokit = createMockOctokit({
                pullsGet: jest.fn().mockResolvedValue({
                    data: {
                        body: 'No links here',
                    },
                }),
            });
            const orgOctokit = createMockOctokit({
                getMembershipForUserInOrg: jest.fn().mockRejectedValue(createRequestError(404)),
            });

            await expect(
                isAuthorizedContributor({
                    ...defaultParams,
                    githubOctokit,
                    orgOctokit,
                }),
            ).resolves.toBe(false);
        });
    });
});
