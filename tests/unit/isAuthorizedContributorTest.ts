/**
 * @jest-environment node
 */
import {RequestError} from '@octokit/request-error';
import {isAuthorizedContributor, isContributorPlusMember} from '../../.github/actions/javascript/isAuthorizedContributor/isAuthorizedContributor';
import type {InternalOctokit} from '../../.github/libs/GithubUtils';
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
const mockListReviews = jest.fn();
const mockListRequestedReviewers = jest.fn();

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
                listReviews: mockListReviews,
                listRequestedReviewers: mockListRequestedReviewers,
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

const defaultParams = {
    prNumber: 123,
    prAuthor: 'externalUser',
    authorAssociation: 'NONE',
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

    describe('isAuthorizedContributor', () => {
        test('authorizes MEMBER association without API calls', async () => {
            await expect(
                isAuthorizedContributor({
                    ...defaultParams,
                    prAuthor: 'memberUser',
                    authorAssociation: 'MEMBER',
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

        test('authorizes when linked PR author matches', async () => {
            mockGetMembershipForUserInOrg.mockRejectedValue(createRequestError(404));
            mockPullsGet
                .mockResolvedValueOnce({
                    data: {
                        body: 'See https://github.com/Expensify/App/pull/5555',
                    },
                })
                .mockResolvedValueOnce({
                    data: {
                        user: {login: 'externalUser'},
                    },
                });
            mockListReviews.mockResolvedValue({data: []});
            mockListRequestedReviewers.mockResolvedValue({data: {users: []}});

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
