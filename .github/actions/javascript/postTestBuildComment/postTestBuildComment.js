const _ = require('underscore');
const core = require('@actions/core');
const {context} = require('@actions/github');
const CONST = require('../../../libs/CONST');
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
    const iOSQRCode = iOSSuccess ? `![iOS](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${iOSLink})` : "The QR code can't be generated, because the iOS build failed";
    const webQRCode = webSuccess ? `![Web](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${webLink})` : "The QR code can't be generated, because the web build failed";

    const message = `:test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS, Desktop, and Web. Happy testing! :test_tube::test_tube:
| Android :robot:  | iOS :apple: |
| ------------- | ------------- |
| ${androidLink}  | ${iOSLink}  |
| ${androidQRCode}  | ${iOSQRCode}  |
| Desktop :computer: | Web :spider_web: |
| ${desktopLink}  | ${webLink}  |
| ${desktopQRCode}  | ${webQRCode}  |

---

:eyes: [View the workflow run that generated this build](https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}) :eyes:
`;

    return message;
}

/**
 * Comment on a single PR
 *
 * @param {Number} PR
 * @param {String} message
 * @returns {Promise<void>}
 */
async function commentPR(PR, message) {
    console.log(`Posting test build comment on #${PR}`);
    try {
        await GithubUtils.createComment(context.repo.repo, PR, message);
        console.log(`Comment created on #${PR} successfully 🎉`);
    } catch (err) {
        console.log(`Unable to write comment on #${PR} 😞`);
        core.setFailed(err.message);
    }
}

async function run() {
    const PR_NUMBER = core.getInput('PR_NUMBER', {required: true});
    const comments = await GithubUtils.paginate(
        GithubUtils.octokit.issues.listComments,
        {
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            issue_number: PR_NUMBER,
            per_page: 100,
        },
        (response) => response.data,
    );
    const testBuildComment = _.find(comments, (comment) => comment.body.startsWith(':test_tube::test_tube: Use the links below to test this adhoc build'));
    if (testBuildComment) {
        console.log('Found previous build comment, hiding it', testBuildComment);
        await GithubUtils.graphql(`
            mutation {
              minimizeComment(input: {classifier: OUTDATED, subjectId: "${testBuildComment.node_id}"}) {
                minimizedComment {
                  minimizedReason
                }
              }
            }
        `);
    }
    await commentPR(PR_NUMBER, getTestBuildMessage());
}

if (require.main === module) {
    run();
}

module.exports = run;
