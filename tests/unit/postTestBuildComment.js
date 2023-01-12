const {when} = require('jest-when');

const core = require('@actions/core');
const GithubUtils = require('../../.github/libs/GithubUtils');

const mockGetInput = jest.fn();
const mockCreateComment = jest.fn();

jest.mock('@actions/github', () => ({
    context: {
        repo: {
            repo: 'repo',
        },
    },
}));

const ghAction = require('../../.github/actions/javascript/postTestBuildComment/postTestBuildComment');

const androidLink = 'https://expensify.app/ANDROID_LINK';
const iOSLink = 'https://expensify.app/IOS_LINK';
const webLink = 'https://expensify.app/WEB_LINK';
const desktopLink = 'https://expensify.app/DESKTOP_LINK';

const androidQRCode = `![Android](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${androidLink})`;
const desktopQRCode = `![iOS](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${desktopLink})`;
const iOSQRCode = `![iOS](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${iOSLink})`;
const webQRCode = `![iOS](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${webLink})`;

const message = `:test_tube::test_tube: Use the links below to test this build in android and iOS. Happy testing! :test_tube::test_tube:
| android :robot:  | iOS :apple: |
| ------------- | ------------- |
| ${androidLink}  | ${iOSLink}  |
| ${androidQRCode}  | ${iOSQRCode}  |
| desktop :computer: | web :spider_web: |
| ${desktopLink}  | ${webLink}  |
| ${desktopQRCode}  | ${webQRCode}  |`;

describe('Post test build comments action tests', () => {
    beforeAll(() => {
        // Mock core module
        core.getInput = mockGetInput;
        GithubUtils.createComment = mockCreateComment;
    });

    test('Test GH action', () => {
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
        ghAction();
        expect(GithubUtils.createComment).toBeCalledTimes(1);
        expect(GithubUtils.createComment).toBeCalledWith('repo', 12, message);
    });
});

