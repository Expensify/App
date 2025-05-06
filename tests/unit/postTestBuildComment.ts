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
const desktopLink = 'https://expensify.app/DESKTOP_LINK';

const androidQRCode = `![Android](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${androidLink})`;
const desktopQRCode = `![Desktop](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${desktopLink})`;
const iOSQRCode = `![iOS](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${iOSLink})`;
const webQRCode = `![Web](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${webLink})`;

const message = `:test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS, Desktop, and Web. Happy testing! :test_tube::test_tube:
| Android :robot:  | iOS :apple: |
| ------------- | ------------- |
| Android :robot::arrows_counterclockwise:  | iOS :apple::arrows_counterclockwise: |
| ${androidLink}  | ${iOSLink}  |
| ${androidQRCode}  | ${iOSQRCode}  |
| Desktop :computer: | Web :spider_web: |
| ${desktopLink}  | ${webLink}  |
| ${desktopQRCode}  | ${webQRCode}  |

---

:eyes: [View the workflow run that generated this build](https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/1234) :eyes:
`;

const onlyAndroidMessage = `:test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS, Desktop, and Web. Happy testing! :test_tube::test_tube:
| Android :robot:  | iOS :apple: |
| ------------- | ------------- |
| Android :robot::arrows_counterclockwise:  | iOS :apple::arrows_counterclockwise: |
| N/A  | N/A  |
| N/A  | N/A  |
| Desktop :computer: | Web :spider_web: |
| N/A  | N/A  |
| N/A  | N/A  |

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
        when(core.getInput).calledWith('PR_NUMBER', {required: true}).mockReturnValue('12');
        when(core.getInput).calledWith('ANDROID', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('ANDROID', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('IOS', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('WEB', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('DESKTOP', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('ANDROID_LINK').mockReturnValue(androidLink);
        when(core.getInput).calledWith('IOS_LINK').mockReturnValue(iOSLink);
        when(core.getInput).calledWith('WEB_LINK').mockReturnValue('https://expensify.app/WEB_LINK');
        when(core.getInput).calledWith('DESKTOP_LINK').mockReturnValue('https://expensify.app/DESKTOP_LINK');
        createCommentMock.mockResolvedValue({} as CreateCommentResponse);
        mockListComments.mockResolvedValue({
            data: [
                {
                    body: ':test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS, Desktop, and Web. Happy testing!',
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    node_id: 'IC_abcd',
                },
            ],
        });
        await ghAction();
        expect(mockGraphql).toBeCalledTimes(1);
        expect(mockGraphql).toBeCalledWith(`
            mutation {
              minimizeComment(input: {classifier: OUTDATED, subjectId: "IC_abcd"}) {
                minimizedComment {
                  minimizedReason
                }
              }
            }
        `);
        expect(createCommentMock).toBeCalledTimes(1);
        expect(createCommentMock).toBeCalledWith(CONST.APP_REPO, 12, message);
    });

    test('Test GH action when input is not complete', async () => {
        when(core.getInput).calledWith('REPO', {required: true}).mockReturnValue(CONST.APP_REPO);
        when(core.getInput).calledWith('PR_NUMBER', {required: true}).mockReturnValue('12');
        when(core.getInput).calledWith('ANDROID', {required: false}).mockReturnValue('');
        when(core.getInput).calledWith('IOS', {required: false}).mockReturnValue('');
        when(core.getInput).calledWith('WEB', {required: false}).mockReturnValue('');
        when(core.getInput).calledWith('DESKTOP', {required: false}).mockReturnValue('');
        when(core.getInput).calledWith('ANDROID_LINK').mockReturnValue('https://expensify.app/ANDROID_LINK');
        createCommentMock.mockResolvedValue({} as CreateCommentResponse);
        mockListComments.mockResolvedValue({
            data: [
                {
                    body: ':test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS, Desktop, and Web. Happy testing!',
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    node_id: 'IC_abcd',
                },
            ],
        });
        await ghAction();
        expect(mockGraphql).toBeCalledTimes(1);
        expect(mockGraphql).toBeCalledWith(`
            mutation {
              minimizeComment(input: {classifier: OUTDATED, subjectId: "IC_abcd"}) {
                minimizedComment {
                  minimizedReason
                }
              }
            }
        `);
        expect(createCommentMock).toBeCalledTimes(1);
        expect(createCommentMock).toBeCalledWith(CONST.APP_REPO, 12, onlyAndroidMessage);
    });
});
