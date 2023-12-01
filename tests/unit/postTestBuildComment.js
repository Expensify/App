const {when} = require('jest-when');

const core = require('@actions/core');
const GithubUtils = require('../../.github/libs/GithubUtils');

const mockGetInput = jest.fn();
const mockCreateComment = jest.fn();
const mockListComments = jest.fn();
const mockGraphql = jest.fn();
jest.spyOn(GithubUtils, 'octokit', 'get').mockReturnValue({
    issues: {
        listComments: mockListComments,
    },
});
jest.spyOn(GithubUtils, 'paginate', 'get').mockReturnValue((endpoint, params) => endpoint(params).then(({data}) => data));
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

const ghAction = require('../../.github/actions/javascript/postTestBuildComment/postTestBuildComment');

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
        core.getInput = mockGetInput;
        GithubUtils.createComment = mockCreateComment;
    });

    test('Test GH action', async () => {
        when(core.getInput).calledWith('PR_NUMBER', {required: true}).mockReturnValue(12);
        when(core.getInput).calledWith('ANDROID', {required: true}).mockReturnValue('success');
        when(core.getInput).calledWith('IOS', {required: true}).mockReturnValue('success');
        when(core.getInput).calledWith('WEB', {required: true}).mockReturnValue('success');
        when(core.getInput).calledWith('DESKTOP', {required: true}).mockReturnValue('success');
        when(core.getInput).calledWith('ANDROID_LINK').mockReturnValue('https://expensify.app/ANDROID_LINK');
        when(core.getInput).calledWith('IOS_LINK').mockReturnValue('https://expensify.app/IOS_LINK');
        when(core.getInput).calledWith('WEB_LINK').mockReturnValue('https://expensify.app/WEB_LINK');
        when(core.getInput).calledWith('DESKTOP_LINK').mockReturnValue('https://expensify.app/DESKTOP_LINK');
        GithubUtils.createComment.mockResolvedValue(true);
        mockListComments.mockResolvedValue({
            data: [
                {
                    body: ':test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS, Desktop, and Web. Happy testing!',
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
        expect(GithubUtils.createComment).toBeCalledTimes(1);
        expect(GithubUtils.createComment).toBeCalledWith('App', 12, message);
    });
});
