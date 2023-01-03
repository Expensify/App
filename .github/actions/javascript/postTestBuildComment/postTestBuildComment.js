const core = require('@actions/core');
const {context} = require('@actions/github');
const GithubUtils = require('../../../libs/GithubUtils');

const PR_NUMBER = core.getInput('PR_NUMBER', {required: true});

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
    ? `![iOS](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${desktopLink})`
    : "The QR code can't be generated, because the iOS build failed";
const iOSQRCode = iOSSuccess
    ? `![iOS](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${iOSLink})`
    : "The QR code can't be generated, because the desktop build failed";
const webQRCode = webSuccess
    ? `![iOS](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${webLink})`
    : "The QR code can't be generated, because the web build failed";

/**
 * @returns {String}
 */
function getTestBuildMessage() {
    let message = ':test_tube::test_tube: Use the links below to test this build in android and iOS. Happy testing! :test_tube::test_tube:';
    message += '\n| android :robot:  | iOS :apple: |';
    message += '\n| ------------- | ------------- |';
    message += `\n| ${androidLink}  | ${iOSLink}  |`;
    message += `\n| ${androidQRCode}  | ${iOSQRCode}  |`;
    message += '\n| desktop :computer: | web :spider_web: |';
    message += `\n| ${desktopLink}  | ${webLink}  |`;
    message += `\n| ${desktopQRCode}  | ${webQRCode}  |`;

    return message;
}

/**
 * Comment Single PR
 *
 * @param {Number} PR
 * @param {String} message
 * @returns {Promise<void>}
 */
function commentPR(PR, message) {
    return GithubUtils.createComment(context.repo.repo, PR, message)
        .then(() => console.log(`Comment created on #${PR} successfully 🎉`))
        .catch((err) => {
            console.log(`Unable to write comment on #${PR} 😞`);
            core.setFailed(err.message);
        });
}

const run = function () {
    return commentPR(PR_NUMBER, getTestBuildMessage()).then(() => Promise.resolve());
};

if (require.main === module) {
    run();
}

module.exports = run;
