/**
 * @jest-environment node
 */
import * as core from '@actions/core';
import type {RestEndpointMethods} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types';
import {when} from 'jest-when';
import ghAction from '@github/actions/javascript/postTestBuildComment/postTestBuildComment';
import CONST from '@github/libs/CONST';
import type {CreateCommentResponse} from '@github/libs/GithubUtils';
import GithubUtils from '@github/libs/GithubUtils';
import asMutable from '@src/types/utils/asMutable';

const mockGetInput = jest.fn();
const createCommentMock = jest.spyOn(GithubUtils, 'createComment');
const mockListComments = jest.fn();
const mockGraphql = jest.fn();
jest.spyOn(GithubUtils, 'octokit', 'get').mockReturnValue({
    issues: {
        listComments: mockListComments as unknown as typeof GithubUtils.octokit.issues.listComments,
    },
} as RestEndpointMethods);

function mockImplementation<T, TData>(endpoint: (params: Record<string, T>) => Promise<{data: TData}>, params: Record<string, T>) {
    return endpoint(params).then((response) => response.data);
}

Object.defineProperty(GithubUtils, 'paginate', {
    get: () => mockImplementation,
});

Object.defineProperty(GithubUtils, 'graphql', {
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

describe('Post test build comments action tests', () => {
    beforeAll(() => {
        // Mock core module
        asMutable(core).getInput = mockGetInput;
    });

    beforeEach(() => jest.clearAllMocks());

    test('Test GH action', async () => {
        when(core.getInput).calledWith('REPO', {required: true}).mockReturnValue(CONST.APP_REPO);
        when(core.getInput).calledWith('APP_PR_NUMBER', {required: false}).mockReturnValue('12');
        when(core.getInput).calledWith('MOBILE_EXPENSIFY_PR_NUMBER', {required: false}).mockReturnValue('13');
        when(core.getInput).calledWith('ANDROID', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('IOS', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('WEB', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('ANDROID_LINK').mockReturnValue(androidLink);
        when(core.getInput).calledWith('IOS_LINK').mockReturnValue(iOSLink);
        when(core.getInput).calledWith('WEB_LINK').mockReturnValue('https://expensify.app/WEB_LINK');
        createCommentMock.mockResolvedValue({} as CreateCommentResponse);
        mockListComments.mockResolvedValue({
            data: [
                {
                    body: ':test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS, and Web. Happy testing!',
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    node_id: 'IC_abcd',
                },
            ],
        });
        await ghAction();
        expect(mockGraphql).toHaveBeenCalledTimes(1);
        expect(mockGraphql).toHaveBeenCalledWith(`
            mutation {
              minimizeComment(input: {classifier: OUTDATED, subjectId: "IC_abcd"}) {
                minimizedComment {
                  minimizedReason
                }
              }
            }
        `);
        expect(createCommentMock).toHaveBeenCalledTimes(1);
        expect(createCommentMock).toHaveBeenCalledWith(CONST.APP_REPO, 12, message);
    });

    test('Test GH action when only App PR number is provided', async () => {
        when(core.getInput).calledWith('REPO', {required: true}).mockReturnValue(CONST.APP_REPO);
        when(core.getInput).calledWith('APP_PR_NUMBER', {required: false}).mockReturnValue('12');
        when(core.getInput).calledWith('MOBILE_EXPENSIFY_PR_NUMBER', {required: false}).mockReturnValue('');
        when(core.getInput).calledWith('ANDROID', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('IOS', {required: false}).mockReturnValue('skipped');
        when(core.getInput).calledWith('WEB', {required: false}).mockReturnValue('skipped');
        when(core.getInput).calledWith('ANDROID_LINK').mockReturnValue('https://expensify.app/ANDROID_LINK');
        createCommentMock.mockResolvedValue({} as CreateCommentResponse);
        mockListComments.mockResolvedValue({
            data: [
                {
                    body: ':test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS, and Web. Happy testing!',
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    node_id: 'IC_abcd',
                },
            ],
        });
        await ghAction();
        expect(mockGraphql).toHaveBeenCalledTimes(1);
        expect(mockGraphql).toHaveBeenCalledWith(`
            mutation {
              minimizeComment(input: {classifier: OUTDATED, subjectId: "IC_abcd"}) {
                minimizedComment {
                  minimizedReason
                }
              }
            }
        `);
        expect(createCommentMock).toHaveBeenCalledTimes(1);
        expect(createCommentMock).toHaveBeenCalledWith(CONST.APP_REPO, 12, onlyAppMessage);
    });

    test('Test GH action when only Mobile-Expensify PR number is provided', async () => {
        when(core.getInput).calledWith('REPO', {required: true}).mockReturnValue(CONST.MOBILE_EXPENSIFY_REPO);
        when(core.getInput).calledWith('APP_PR_NUMBER', {required: false}).mockReturnValue('');
        when(core.getInput).calledWith('MOBILE_EXPENSIFY_PR_NUMBER', {required: false}).mockReturnValue('13');
        when(core.getInput).calledWith('ANDROID', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('IOS', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('ANDROID_LINK').mockReturnValue(androidLink);
        when(core.getInput).calledWith('IOS_LINK').mockReturnValue(iOSLink);
        when(core.getInput).calledWith('WEB', {required: false}).mockReturnValue('skipped');
        createCommentMock.mockResolvedValue({} as CreateCommentResponse);
        mockListComments.mockResolvedValue({
            data: [
                {
                    body: ':test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS. Happy testing!',
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    node_id: 'IC_abcd',
                },
            ],
        });
        await ghAction();
        expect(mockGraphql).toHaveBeenCalledTimes(1);
        expect(mockGraphql).toHaveBeenCalledWith(`
            mutation {
              minimizeComment(input: {classifier: OUTDATED, subjectId: "IC_abcd"}) {
                minimizedComment {
                  minimizedReason
                }
              }
            }
        `);
        expect(createCommentMock).toHaveBeenCalledTimes(1);
        expect(createCommentMock).toHaveBeenCalledWith(CONST.MOBILE_EXPENSIFY_REPO, 13, onlyMobileExpensifyMessage);
    });
});
