import type {Mock} from 'bun:test';
import {afterEach, beforeEach, describe, expect, jest, test} from 'bun:test';

import {RequestError} from '@octokit/request-error';

import {isAuthorizedContributor, isContributorPlusMember, isInternalExpensifyEngineer} from '../../.github/actions/javascript/isAuthorizedContributor/isAuthorizedContributor';
import GithubUtils from '../../.github/libs/GithubUtils';
import createMock from '../utils/createMock';
import materializeOctokitNamespace from '../utils/materializeOctokitNamespace';

function createRequestError(status: number): RequestError {
    return new RequestError('Not Found', status, {
        request: {
            method: 'GET',
            url: 'https://api.github.com',
            headers: {},
        },
    });
}

type OctokitRest = typeof GithubUtils.octokit;
type GetMembershipForUserInOrg = OctokitRest['teams']['getMembershipForUserInOrg'];
type PullsGet = OctokitRest['pulls']['get'];
type IssuesGet = OctokitRest['issues']['get'];
type MembershipResponse = Awaited<ReturnType<GetMembershipForUserInOrg>>;
type PullResponse = Awaited<ReturnType<PullsGet>>;
type IssueResponse = Awaited<ReturnType<IssuesGet>>;

// Narrowed to the call signature: octokit's methods also carry `defaults`/`endpoint` statics, which a mock
// implementation has no way to supply, and this test only ever calls the endpoint.
let mockGetMembershipForUserInOrg: Mock<(...args: Parameters<GetMembershipForUserInOrg>) => ReturnType<GetMembershipForUserInOrg>>;
let mockPullsGet: Mock<PullsGet>;
let mockIssuesGet: Mock<IssuesGet>;

beforeEach(() => {
    jest.clearAllMocks();

    GithubUtils.initOctokitWithToken('test-token');
    const mockOctokit = GithubUtils.octokit;
    mockOctokit.teams = materializeOctokitNamespace(mockOctokit.teams);
    mockOctokit.pulls = materializeOctokitNamespace(mockOctokit.pulls);
    mockOctokit.issues = materializeOctokitNamespace(mockOctokit.issues);
    mockGetMembershipForUserInOrg = jest.spyOn(mockOctokit.teams, 'getMembershipForUserInOrg');
    mockPullsGet = jest.spyOn(mockOctokit.pulls, 'get');
    mockIssuesGet = jest.spyOn(mockOctokit.issues, 'get');

    // `octokit` is a getter over `internalOctokit.rest`, already populated by initOctokitWithToken above, so it
    // resolves to mockOctokit without being stubbed. Bun's spyOn cannot wrap accessor properties in any case.
    jest.spyOn(GithubUtils, 'initOctokitWithToken').mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
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
            mockGetMembershipForUserInOrg.mockResolvedValue(createMock<MembershipResponse>({data: {state: 'active'}}));

            await expect(isContributorPlusMember('plusUser', 'org-token')).resolves.toBe(true);
        });

        test('returns false when membership is 404', async () => {
            mockGetMembershipForUserInOrg.mockRejectedValue(createRequestError(404));

            await expect(isContributorPlusMember('externalUser', 'org-token')).resolves.toBe(false);
        });
    });

    describe('isInternalExpensifyEngineer', () => {
        test('returns true for an engineering team member', async () => {
            mockGetMembershipForUserInOrg.mockResolvedValue(createMock<MembershipResponse>({data: {state: 'active'}}));

            await expect(isInternalExpensifyEngineer('engineerUser', 'org-token')).resolves.toBe(true);
        });

        test('returns false when not on the engineering team (404)', async () => {
            mockGetMembershipForUserInOrg.mockRejectedValue(createRequestError(404));

            await expect(isInternalExpensifyEngineer('externalUser', 'org-token')).resolves.toBe(false);
        });

        test('returns false for a Contributor+ member who is not on the engineering team', async () => {
            mockGetMembershipForUserInOrg.mockImplementation((params) =>
                params?.team_slug === 'engineering' ? Promise.reject(createRequestError(404)) : Promise.resolve(createMock<MembershipResponse>({data: {state: 'active'}})),
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
            mockGetMembershipForUserInOrg.mockResolvedValue(createMock<MembershipResponse>({data: {state: 'active'}}));

            await expect(isAuthorizedContributor({...defaultParams})).resolves.toBe(true);

            expect(mockPullsGet).not.toHaveBeenCalled();
        });

        test('authorizes when linked issue assignee matches author', async () => {
            mockGetMembershipForUserInOrg.mockRejectedValue(createRequestError(404));
            mockPullsGet.mockResolvedValue(
                createMock<PullResponse>({
                    data: {
                        body: 'Fixes https://github.com/Expensify/App/issues/9999',
                    },
                }),
            );
            mockIssuesGet.mockResolvedValue(
                createMock<IssueResponse>({
                    data: {
                        assignees: [{login: 'ExternalUser'}],
                    },
                }),
            );

            await expect(isAuthorizedContributor({...defaultParams})).resolves.toBe(true);
        });

        test('returns false when no authorization path matches', async () => {
            mockGetMembershipForUserInOrg.mockRejectedValue(createRequestError(404));
            mockPullsGet.mockResolvedValue(
                createMock<PullResponse>({
                    data: {
                        body: 'No links here',
                    },
                }),
            );

            await expect(isAuthorizedContributor({...defaultParams})).resolves.toBe(false);
        });
    });
});
