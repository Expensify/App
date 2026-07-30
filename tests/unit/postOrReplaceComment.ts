import ghAction from '@github/actions/javascript/postOrReplaceComment/postOrReplaceComment';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';

import asMutable from '@src/types/utils/asMutable';

/**
 * @jest-environment node
 */
import * as core from '@actions/core';
import {request} from '@octokit/request';
import {when} from 'jest-when';

import createMock from '../utils/createMock';

const mockGetInput = jest.fn();
const createCommentMock = jest.spyOn(GithubUtils, 'createComment');
type InternalOctokit = NonNullable<typeof GithubUtils.internalOctokit>;
type CreateCommentResponse = Awaited<ReturnType<InternalOctokit['rest']['issues']['createComment']>>;
type ListCommentsMethod = InternalOctokit['rest']['issues']['listComments'];
type ListCommentsResponse = Awaited<ReturnType<ListCommentsMethod>>;
type ListCommentsMap = (response: ListCommentsResponse, done: () => void) => ListCommentsResponse['data'];
type GraphqlMethod = InternalOctokit['graphql'];
type PaginateIterator = InternalOctokit['paginate']['iterator'];
const mockListComments = Object.assign(jest.fn<ReturnType<ListCommentsMethod>, Parameters<ListCommentsMethod>>(), {
    defaults: request.defaults,
    endpoint: request.endpoint.defaults({url: ''}),
});
const mockGraphql = jest.fn<ReturnType<GraphqlMethod>, Parameters<GraphqlMethod>>();
const mockPaginate = Object.assign(
    jest.fn<Promise<ListCommentsResponse['data']>, [ListCommentsMethod, Parameters<ListCommentsMethod>[0], ListCommentsMap]>((endpoint, params, map) =>
        endpoint(params).then((response) => map(response, () => {})),
    ),
    {
        iterator: jest.fn<ReturnType<PaginateIterator>, Parameters<PaginateIterator>>(),
    },
);
jest.spyOn(GithubUtils, 'octokit', 'get').mockReturnValue(
    createMock<InternalOctokit['rest']>({
        issues: {
            listComments: mockListComments,
        },
    }),
);

Object.defineProperty(GithubUtils, 'paginate', {
    configurable: true,
    get: () => mockPaginate,
});

Object.defineProperty(GithubUtils, 'graphql', {
    configurable: true,
    get: () => mockGraphql,
});

jest.mock('@actions/github', () => ({
    context: {
        repo: {
            owner: process.env.GITHUB_REPOSITORY_OWNER,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            repo: process.env.GITHUB_REPOSITORY.split('/').at(1)!,
        },
        runId: 1234,
    },
}));

const androidLink = 'https://expensify.app/ANDROID_LINK';
const iOSLink = 'https://expensify.app/IOS_LINK';
const webLink = 'https://expensify.app/WEB_LINK';
const testBuildCommentPrefix = ':test_tube::test_tube: Use the links below to test this adhoc build';

const androidQRCode = `![Android](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${androidLink})`;
const iOSQRCode = `![iOS](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${iOSLink})`;
const webQRCode = `![Web](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${webLink})`;

const message = `:test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS, and Web. Happy testing! :test_tube::test_tube:
Built from App PR Expensify/App#12 Mobile-Expensify PR Expensify/Mobile-Expensify#13.
| Android :robot:  | iOS :apple: |
| ------------- | ------------- |
| ${androidLink}  | ${iOSLink}  |
| ${androidQRCode}  | ${iOSQRCode}  |

| Web :spider_web: |
| ------------- |
| ${webLink}  |
| ${webQRCode}  |

---

:eyes: [View the workflow run that generated this build](https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/1234) :eyes:
`;

const onlyAppMessage = `:test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS, and Web. Happy testing! :test_tube::test_tube:
Built from App PR Expensify/App#12.
| Android :robot:  | iOS :apple: |
| ------------- | ------------- |
| ${androidLink}  | ⏩ SKIPPED ⏩  |
| ${androidQRCode}  | The build for iOS was skipped  |

| Web :spider_web: |
| ------------- |
| ⏩ SKIPPED ⏩  |
| The build for Web was skipped  |

---

:eyes: [View the workflow run that generated this build](https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/1234) :eyes:
`;

const onlyMobileExpensifyMessage = `:test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS. Happy testing! :test_tube::test_tube:
Built from Mobile-Expensify PR Expensify/Mobile-Expensify#13.
| Android :robot:  | iOS :apple: |
| ------------- | ------------- |
| ${androidLink}  | ${iOSLink}  |
| ${androidQRCode}  | ${iOSQRCode}  |

| Web :spider_web: |
| ------------- |
| ⏩ SKIPPED ⏩  |
| The build for Web was skipped  |

---

:eyes: [View the workflow run that generated this build](https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/1234) :eyes:
`;

describe('postOrReplaceComment action tests', () => {
    beforeAll(() => {
        // Mock core module
        asMutable(core).getInput = mockGetInput;
    });

    beforeEach(() => jest.clearAllMocks());

    function expectPreviousCommentToBeHidden() {
        expect(mockGraphql).toHaveBeenCalledTimes(1);
        expect(mockGraphql).toHaveBeenCalledWith(
            `
            mutation MinimizeComment($subjectId: ID!) {
              minimizeComment(input: {classifier: OUTDATED, subjectId: $subjectId}) {
                minimizedComment {
                  minimizedReason
                }
              }
            }
        `,
            {
                subjectId: 'IC_abcd',
            },
        );
    }

    test('Test GH action', async () => {
        when(core.getInput).calledWith('REPO', {required: true}).mockReturnValue(CONST.APP_REPO);
        when(core.getInput).calledWith('APP_PR_NUMBER', {required: false}).mockReturnValue('12');
        when(core.getInput).calledWith('MOBILE_EXPENSIFY_PR_NUMBER', {required: false}).mockReturnValue('13');
        when(core.getInput).calledWith('COMMENT_PREFIX', {required: true}).mockReturnValue(testBuildCommentPrefix);
        when(core.getInput).calledWith('COMMENT_BODY', {required: false}).mockReturnValue('');
        when(core.getInput).calledWith('ANDROID', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('IOS', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('WEB', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('ANDROID_LINK').mockReturnValue(androidLink);
        when(core.getInput).calledWith('IOS_LINK').mockReturnValue(iOSLink);
        when(core.getInput).calledWith('WEB_LINK').mockReturnValue('https://expensify.app/WEB_LINK');
        createCommentMock.mockResolvedValue(createMock<CreateCommentResponse>({}));
        mockListComments.mockResolvedValue(
            createMock<Awaited<ReturnType<ListCommentsMethod>>>({
                data: [
                    {
                        body: ':test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS, and Web. Happy testing!',
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        node_id: 'IC_abcd',
                    },
                ],
            }),
        );
        await ghAction();
        expectPreviousCommentToBeHidden();
        expect(createCommentMock).toHaveBeenCalledTimes(1);
        expect(createCommentMock).toHaveBeenCalledWith(CONST.APP_REPO, 12, message);
    });

    test('Test GH action when only App PR number is provided', async () => {
        when(core.getInput).calledWith('REPO', {required: true}).mockReturnValue(CONST.APP_REPO);
        when(core.getInput).calledWith('APP_PR_NUMBER', {required: false}).mockReturnValue('12');
        when(core.getInput).calledWith('MOBILE_EXPENSIFY_PR_NUMBER', {required: false}).mockReturnValue('');
        when(core.getInput).calledWith('COMMENT_PREFIX', {required: true}).mockReturnValue(testBuildCommentPrefix);
        when(core.getInput).calledWith('COMMENT_BODY', {required: false}).mockReturnValue('');
        when(core.getInput).calledWith('ANDROID', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('IOS', {required: false}).mockReturnValue('skipped');
        when(core.getInput).calledWith('WEB', {required: false}).mockReturnValue('skipped');
        when(core.getInput).calledWith('ANDROID_LINK').mockReturnValue('https://expensify.app/ANDROID_LINK');
        createCommentMock.mockResolvedValue(createMock<CreateCommentResponse>({}));
        mockListComments.mockResolvedValue(
            createMock<Awaited<ReturnType<ListCommentsMethod>>>({
                data: [
                    {
                        body: ':test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS, and Web. Happy testing!',
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        node_id: 'IC_abcd',
                    },
                ],
            }),
        );
        await ghAction();
        expectPreviousCommentToBeHidden();
        expect(createCommentMock).toHaveBeenCalledTimes(1);
        expect(createCommentMock).toHaveBeenCalledWith(CONST.APP_REPO, 12, onlyAppMessage);
    });

    test('Test GH action when only Mobile-Expensify PR number is provided', async () => {
        when(core.getInput).calledWith('REPO', {required: true}).mockReturnValue(CONST.MOBILE_EXPENSIFY_REPO);
        when(core.getInput).calledWith('APP_PR_NUMBER', {required: false}).mockReturnValue('');
        when(core.getInput).calledWith('MOBILE_EXPENSIFY_PR_NUMBER', {required: false}).mockReturnValue('13');
        when(core.getInput).calledWith('COMMENT_PREFIX', {required: true}).mockReturnValue(testBuildCommentPrefix);
        when(core.getInput).calledWith('COMMENT_BODY', {required: false}).mockReturnValue('');
        when(core.getInput).calledWith('ANDROID', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('IOS', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('ANDROID_LINK').mockReturnValue(androidLink);
        when(core.getInput).calledWith('IOS_LINK').mockReturnValue(iOSLink);
        when(core.getInput).calledWith('WEB', {required: false}).mockReturnValue('skipped');
        createCommentMock.mockResolvedValue(createMock<CreateCommentResponse>({}));
        mockListComments.mockResolvedValue(
            createMock<Awaited<ReturnType<ListCommentsMethod>>>({
                data: [
                    {
                        body: ':test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS. Happy testing!',
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        node_id: 'IC_abcd',
                    },
                ],
            }),
        );
        await ghAction();
        expectPreviousCommentToBeHidden();
        expect(createCommentMock).toHaveBeenCalledTimes(1);
        expect(createCommentMock).toHaveBeenCalledWith(CONST.MOBILE_EXPENSIFY_REPO, 13, onlyMobileExpensifyMessage);
    });
});
