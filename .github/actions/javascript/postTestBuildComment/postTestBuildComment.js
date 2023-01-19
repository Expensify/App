const core = require('@actions/core');
const {context} = require('@actions/github');
const GithubUtils = require('../../../libs/GithubUtils');

/**
 * @returns {String}
 */
function getTestBuildMessage() {
    console.log('Input for android', core.getInput('ANDROID', {required: true}));
    const androidSuccess = core.getInput('ANDROID', {required: true}) === 'success';
    const desktopSuccess = core.getInput('DESKTOP', {required: true}) === 'success';
    const iOSSuccess = core.getInput('IOS', {required: true}) === 'success';
    const webSuccess = core.getInput('WEB', {required: true}) === 'success';

    const androidLink = androidSuccess ? core.getInput('ANDROID_LINK') : '❌ FAILED ❌';
    const desktopLink = desktopSuccess ? core.getInput('DESKTOP_LINK') : '❌ FAILED ❌';
    const iOSLink = iOSSuccess ? core.getInput('IOS_LINK') : '❌ FAILED ❌';
    const webLink = webSuccess ? core.getInput('WEB_LINK') : '❌ FAILED ❌';

    const androidQRCode = androidSuccess
        ? `![Android](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${androidLink})`
        : "The QR code can't be generated, because the android build failed";
    const desktopQRCode = desktopSuccess
        ? `![Desktop](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${desktopLink})`
        : "The QR code can't be generated, because the Desktop build failed";
    const iOSQRCode = iOSSuccess
        ? `![iOS](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${iOSLink})`
        : "The QR code can't be generated, because the iOS build failed";
    const webQRCode = webSuccess
        ? `![Web](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${webLink})`
        : "The QR code can't be generated, because the web build failed";

    const message = `:test_tube::test_tube: Use the links below to test this build in android and iOS. Happy testing! :test_tube::test_tube:
| android :robot:  | iOS :apple: |
| ------------- | ------------- |
| ${androidLink}  | ${iOSLink}  |
| ${androidQRCode}  | ${iOSQRCode}  |
| desktop :computer: | web :spider_web: |
| ${desktopLink}  | ${webLink}  |
| ${desktopQRCode}  | ${webQRCode}  |`;

    return message;
}

/**
 * Comment on a single PR
 *
 * @param {Number} PR
 * @param {String} message
 * @returns {Promise<void>}
 */
function commentPR(PR, message) {
    console.log(`Posting test build comment on #${PR}`);
    return GithubUtils.createComment(context.repo.repo, PR, message)
        .then(() => console.log(`Comment created on #${PR} successfully 🎉`))
        .catch((err) => {
            console.log(`Unable to write comment on #${PR} 😞`);
            core.setFailed(err.message);
        });
}

const run = function () {
    const PR_NUMBER = core.getInput('PR_NUMBER', {required: true});
    return commentPR(PR_NUMBER, getTestBuildMessage()).then(() => Promise.resolve());
};

if (require.main === module) {
    run();
}

module.exports = run;
