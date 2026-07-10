import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';

import type {TupleToUnion} from 'type-fest';

import * as core from '@actions/core';
import {context} from '@actions/github';
import {pathToFileURL} from 'url';

function getTestBuildMessage(appPr?: number, mobileExpensifyPr?: number): string {
    const inputs = ['ANDROID', 'IOS', 'WEB'] as const;
    const names = {
        [inputs[0]]: 'Android',
        [inputs[1]]: 'iOS',
        [inputs[2]]: 'Web',
    };

    const result = inputs.reduce(
        (acc, platform) => {
            const input = core.getInput(platform, {required: false});

            if (!input) {
                acc[platform] = {link: 'N/A', qrCode: 'N/A'};
                return acc;
            }

            let link = '';
            let qrCode = '';
            switch (input) {
                case 'success':
                    link = core.getInput(`${platform}_LINK`);
                    qrCode = `![${names[platform]}](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${link})`;
                    break;
                case 'skipped':
                    link = '⏩ SKIPPED ⏩';
                    qrCode = `The build for ${names[platform]} was skipped`;
                    break;
                default:
                    link = '❌ FAILED ❌';
                    qrCode = `The QR code can't be generated, because the ${names[platform]} build failed`;
            }

            acc[platform] = {
                link,
                qrCode,
            };
            return acc;
        },
        {} as Record<TupleToUnion<typeof inputs>, {link: string; qrCode: string}>,
    );

    const message = `:test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS${appPr ? ', and Web' : ''}. Happy testing! :test_tube::test_tube:
Built from${appPr ? ` App PR Expensify/App#${appPr}` : ''}${mobileExpensifyPr ? ` Mobile-Expensify PR Expensify/Mobile-Expensify#${mobileExpensifyPr}` : ''}.
| Android :robot:  | iOS :apple: |
| ------------- | ------------- |
| ${result.ANDROID.link}  | ${result.IOS.link}  |
| ${result.ANDROID.qrCode}  | ${result.IOS.qrCode}  |

| Web :spider_web: |
| ------------- |
| ${result.WEB.link}  |
| ${result.WEB.qrCode}  |

---

:eyes: [View the workflow run that generated this build](https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}) :eyes:
`;

    return message;
}

/** Comment on a single PR */
async function commentPR(REPO: string, PR: number, message: string) {
    console.log(`Posting comment on #${PR}`);
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

async function hidePreviousComment(repo: string, issueNumber: number, commentPrefix: string): Promise<void> {
    const comments = await GithubUtils.paginate(
        GithubUtils.octokit.issues.listComments,
        {
            owner: CONST.GITHUB_OWNER,
            repo,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            issue_number: issueNumber,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            per_page: 100,
        },
        (response) => response.data,
    );
    const previousComment = comments.findLast((comment) => comment.body?.startsWith(commentPrefix));

    if (!previousComment) {
        return;
    }

    await GithubUtils.graphql(
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
            subjectId: previousComment.node_id,
        },
    );
}

async function run() {
    const APP_PR_NUMBER = Number(core.getInput('APP_PR_NUMBER', {required: false}));
    const MOBILE_EXPENSIFY_PR_NUMBER = Number(core.getInput('MOBILE_EXPENSIFY_PR_NUMBER', {required: false}));
    const REPO = String(core.getInput('REPO', {required: true}));
    const COMMENT_BODY = core.getInput('COMMENT_BODY', {required: false});
    const COMMENT_PREFIX = core.getInput('COMMENT_PREFIX', {required: true});

    if (REPO !== CONST.APP_REPO && REPO !== CONST.MOBILE_EXPENSIFY_REPO) {
        core.setFailed(`Invalid repository used to place output comment: ${REPO}`);
        return;
    }

    if ((REPO === CONST.APP_REPO && !APP_PR_NUMBER) || (REPO === CONST.MOBILE_EXPENSIFY_REPO && !MOBILE_EXPENSIFY_PR_NUMBER)) {
        core.setFailed(`Please provide ${REPO} pull request number`);
        return;
    }

    const destinationPRNumber = REPO === CONST.APP_REPO ? APP_PR_NUMBER : MOBILE_EXPENSIFY_PR_NUMBER;
    await hidePreviousComment(REPO, destinationPRNumber, COMMENT_PREFIX);
    await commentPR(REPO, destinationPRNumber, COMMENT_BODY || getTestBuildMessage(APP_PR_NUMBER, MOBILE_EXPENSIFY_PR_NUMBER));
}

if (import.meta.url === pathToFileURL(process.argv.at(1) ?? '').href) {
    run();
}

export default run;
