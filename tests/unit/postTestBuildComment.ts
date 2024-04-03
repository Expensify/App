import * as core from '@actions/core';
import type {RestEndpointMethods} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types';
import {when} from 'jest-when';
import ghAction from '@github/actions/javascript/postTestBuildComment/postTestBuildComment';
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

// @ts-expect-error -- it's a static getter
jest.spyOn(GithubUtils, 'paginate', 'get').mockReturnValue(<T, TData>(endpoint: (params: Record<string, T>) => Promise<{data: TData}>, params: Record<string, T>) =>
    endpoint(params).then((response) => response.data),
);

// @ts-expect-error -- it's a static getter
jest.spyOn(GithubUtils, 'graphql', 'get').mockReturnValue(mockGraphql);

jest.mock('@actions/github', () => ({
    context: {
        repo: {
            owner: 'Expensify',
            repo: 'App',
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
| ${androidLink}  | ${iOSLink}  |
| ${androidQRCode}  | ${iOSQRCode}  |
| Desktop :computer: | Web :spider_web: |
| ${desktopLink}  | ${webLink}  |
| ${desktopQRCode}  | ${webQRCode}  |

---

:eyes: [View the workflow run that generated this build](https://github.com/Expensify/App/actions/runs/1234) :eyes:
`;

describe('Post test build comments action tests', () => {
    beforeAll(() => {
        // Mock core module
        asMutable(core).getInput = mockGetInput;
    });

    test('Test GH action', async () => {
        when(core.getInput).calledWith('PR_NUMBER', {required: true}).mockReturnValue('12');
        when(core.getInput).calledWith('ANDROID', {required: true}).mockReturnValue('success');
        when(core.getInput).calledWith('IOS', {required: true}).mockReturnValue('success');
        when(core.getInput).calledWith('WEB', {required: true}).mockReturnValue('success');
        when(core.getInput).calledWith('DESKTOP', {required: true}).mockReturnValue('success');
        when(core.getInput).calledWith('ANDROID_LINK').mockReturnValue('https://expensify.app/ANDROID_LINK');
        when(core.getInput).calledWith('IOS_LINK').mockReturnValue('https://expensify.app/IOS_LINK');
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
        expect(createCommentMock).toBeCalledWith('App', 12, message);
    });
});
