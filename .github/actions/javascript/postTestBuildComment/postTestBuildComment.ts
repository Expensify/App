import * as core from '@actions/core';
import {context} from '@actions/github';
import type {TupleToUnion} from 'type-fest';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';

function getTestBuildMessage(): string {
    const inputs = ['ANDROID', 'DESKTOP', 'IOS', 'WEB'] as const;
    const names = {
        [inputs[0]]: 'Android',
        [inputs[1]]: 'Desktop',
        [inputs[2]]: 'iOS',
        [inputs[3]]: 'Web',
    };

    const result = inputs.reduce((acc, platform) => {
        const input = core.getInput(platform, {required: false});

        if (!input) {
            acc[platform] = {link: 'N/A', qrCode: 'N/A'};
            return acc;
        }

        const isSuccess = input === 'success';

        const link = isSuccess ? core.getInput(`${platform}_LINK`) : '❌ FAILED ❌';
        const qrCode = isSuccess
            ? `![${names[platform]}](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${link})`
            : `The QR code can't be generated, because the ${names[platform]} build failed`;

        acc[platform] = {
            link,
            qrCode,
        };
        return acc;
    }, {} as Record<TupleToUnion<typeof inputs>, {link: string; qrCode: string}>);

    const message = `:test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS, Desktop, and Web. Happy testing! :test_tube::test_tube:
| Android :robot:  | iOS :apple: |
| ------------- | ------------- |
| Android :robot::arrows_counterclockwise:  | iOS :apple::arrows_counterclockwise: |
| ${result.ANDROID.link}  | ${result.IOS.link}  |
| ${result.ANDROID.qrCode}  | ${result.IOS.qrCode}  |
| Desktop :computer: | Web :spider_web: |
| ${result.DESKTOP.link}  | ${result.WEB.link}  |
| ${result.DESKTOP.qrCode}  | ${result.WEB.qrCode}  |

---

:eyes: [View the workflow run that generated this build](https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}) :eyes:
`;

    return message;
}

/** Comment on a single PR */
async function commentPR(REPO: string, PR: number, message: string) {
    console.log(`Posting test build comment on #${PR}`);
    try {
        await GithubUtils.createComment(REPO, PR, message);
        console.log(`Comment created on #${PR} (${REPO}) successfully 🎉`);
    } catch (err) {
        console.log(`Unable to write comment on #${PR} 😞`);

        if (err instanceof Error) {
            core.setFailed(err.message);
        }
    }
}

async function run() {
    const PR_NUMBER = Number(core.getInput('PR_NUMBER', {required: true}));
    const REPO = String(core.getInput('REPO', {required: true}));

    if (REPO !== CONST.APP_REPO && REPO !== CONST.MOBILE_EXPENSIFY_REPO) {
        core.setFailed(`Invalid repository used to place output comment: ${REPO}`);
        return;
    }

    const comments = await GithubUtils.paginate(
        GithubUtils.octokit.issues.listComments,
        {
            owner: CONST.GITHUB_OWNER,
            repo: REPO,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            issue_number: PR_NUMBER,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            per_page: 100,
        },
        (response) => response.data,
    );
    const testBuildComment = comments.find((comment) => comment.body?.startsWith(':test_tube::test_tube: Use the links below to test this adhoc build'));
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
    await commentPR(REPO, PR_NUMBER, getTestBuildMessage());
}

if (require.main === module) {
    run();
}

export default run;
