import type {Mock} from 'bun:test';
import {beforeAll, beforeEach, describe, expect, jest, test} from 'bun:test';

import ghAction from '@github/actions/javascript/postOrReplaceComment/postOrReplaceComment';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';

import * as core from '@actions/core';
import {context} from '@actions/github';
import * as GitHubEnvironment from '@actions/github/lib/utils';

import createMock from '../utils/createMock';
import materializeOctokitNamespace from '../utils/materializeOctokitNamespace';

const mockGetInput = jest.fn<typeof core.getInput>();
const createCommentMock = jest.spyOn(GithubUtils, 'createComment');
type InternalOctokit = NonNullable<typeof GithubUtils.internalOctokit>;
type CreateCommentResponse = Awaited<ReturnType<InternalOctokit['rest']['issues']['createComment']>>;
type ListCommentsMethod = InternalOctokit['rest']['issues']['listComments'];
type ListCommentsResponse = Awaited<ReturnType<ListCommentsMethod>>;
type ListCommentsEndpoint = ListCommentsMethod['endpoint'];
type GraphqlMethod = InternalOctokit['graphql'];

let internalOctokit: InternalOctokit;
let listCommentsSpy: Mock<ListCommentsEndpoint>;
let graphqlSpy: Mock<GraphqlMethod>;

// `context` is a plain object instance, so the fields this action reads can be assigned directly rather than
// mocking the module. `context.repo` derives from GITHUB_REPOSITORY, which tests/tooling/setup.ts defaults to
// Expensify/App, and `runId` is fixed here so the expected messages below don't depend on the environment.
context.runId = 1234;

/**
 * Stubs `core.getInput` for one test. Reading an input the test didn't declare throws rather than silently
 * returning the empty string, so a new `getInput` call in the action can't quietly change what these tests assert.
 */
function mockInputs(inputs: Record<string, string>) {
    mockGetInput.mockImplementation((name: string) => {
        if (!(name in inputs)) {
            throw new Error(`Unexpected core.getInput('${name}'): add it to this test's inputs.`);
        }
        return inputs[name];
    });
}

const previousCommentsResponse = createMock<ListCommentsResponse>({
    data: [
        {
            body: ':test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS, and Web. Happy testing!',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            node_id: 'IC_abcd',
        },
    ],
});
const commentsResponseHeaderEntries: Array<Parameters<Headers['append']>> = [['content-type', 'application/json']];
const commentsResponseHeaders = createMock<Headers>({
    get: (name) => (name === 'content-type' ? 'application/json' : null),
    [Symbol.iterator]: () => commentsResponseHeaderEntries[Symbol.iterator](),
});
const commentsFetchResponse = createMock<Response>({
    status: 200,
    url: 'https://api.github.com/repos/Expensify/App/issues/12/comments',
    headers: commentsResponseHeaders,
    // @octokit/request reads the body with `text()` and parses it itself, rather than calling `json()`.
    text: () => Promise.resolve(JSON.stringify(previousCommentsResponse.data)),
});
const fetchComments: typeof globalThis.fetch = Object.assign(() => Promise.resolve(commentsFetchResponse), {preconnect: () => {}});

beforeAll(() => {
    const getOctokitOptions = GitHubEnvironment.getOctokitOptions;
    const getOctokitOptionsSpy = jest.spyOn(GitHubEnvironment, 'getOctokitOptions').mockImplementation((token, options) => {
        const octokitOptions = getOctokitOptions(token, options);
        return {
            ...octokitOptions,
            request: {
                ...octokitOptions.request,
                fetch: fetchComments,
            },
        };
    });

    try {
        GithubUtils.initOctokitWithToken('fake_token');
    } finally {
        getOctokitOptionsSpy.mockRestore();
    }

    const initializedOctokit = GithubUtils.internalOctokit;
    if (!initializedOctokit) {
        throw new Error('Expected GithubUtils to initialize an Octokit client.');
    }

    internalOctokit = initializedOctokit;
    internalOctokit.rest.issues = materializeOctokitNamespace(internalOctokit.rest.issues);
    listCommentsSpy = jest.spyOn(internalOctokit.rest.issues.listComments, 'endpoint');
    jest.spyOn(internalOctokit, 'paginate');
    graphqlSpy = jest.spyOn(internalOctokit, 'graphql');
    graphqlSpy.mockResolvedValue({});
});

const androidLink = 'https://expensify.app/ANDROID_LINK';
const iOSLink = 'https://expensify.app/IOS_LINK';
const webLink = 'https://expensify.app/WEB_LINK';
const testBuildCommentPrefix = ':test_tube::test_tube: Use the links below to test this adhoc build';

const androidQRCode = `![Android](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${androidLink})`;
const iOSQRCode = `![iOS](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${iOSLink})`;
const webQRCode = `![Web](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${webLink})`;

const repository = `${context.repo.owner}/${context.repo.repo}`;

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

:eyes: [View the workflow run that generated this build](https://github.com/${repository}/actions/runs/1234) :eyes:
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

:eyes: [View the workflow run that generated this build](https://github.com/${repository}/actions/runs/1234) :eyes:
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

:eyes: [View the workflow run that generated this build](https://github.com/${repository}/actions/runs/1234) :eyes:
`;

describe('postOrReplaceComment action tests', () => {
    beforeAll(() => {
        // Real ESM module namespace exports are read-only live bindings, so `core.getInput` can't be reassigned
        // directly the way Jest's Babel-transpiled CJS interop allowed; spy on it instead.
        jest.spyOn(core, 'getInput').mockImplementation(mockGetInput);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    function expectPreviousCommentToBeHidden() {
        expect(listCommentsSpy).toHaveBeenCalledTimes(1);
        expect(graphqlSpy).toHaveBeenCalledTimes(1);
        expect(graphqlSpy).toHaveBeenCalledWith(
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
                subjectId: 'IC_abcd',
            },
        );
    }

    test('Test GH action', async () => {
        mockInputs({
            REPO: CONST.APP_REPO,
            APP_PR_NUMBER: '12',
            MOBILE_EXPENSIFY_PR_NUMBER: '13',
            COMMENT_PREFIX: testBuildCommentPrefix,
            COMMENT_BODY: '',
            ANDROID: 'success',
            IOS: 'success',
            WEB: 'success',
            ANDROID_LINK: androidLink,
            IOS_LINK: iOSLink,
            WEB_LINK: webLink,
        });
        createCommentMock.mockResolvedValue(createMock<CreateCommentResponse>({}));
        await ghAction();
        expectPreviousCommentToBeHidden();
        expect(createCommentMock).toHaveBeenCalledTimes(1);
        expect(createCommentMock).toHaveBeenCalledWith(CONST.APP_REPO, 12, message);
    });

    test('Test GH action when only App PR number is provided', async () => {
        mockInputs({
            REPO: CONST.APP_REPO,
            APP_PR_NUMBER: '12',
            MOBILE_EXPENSIFY_PR_NUMBER: '',
            COMMENT_PREFIX: testBuildCommentPrefix,
            COMMENT_BODY: '',
            ANDROID: 'success',
            IOS: 'skipped',
            WEB: 'skipped',
            ANDROID_LINK: androidLink,
        });
        createCommentMock.mockResolvedValue(createMock<CreateCommentResponse>({}));
        await ghAction();
        expectPreviousCommentToBeHidden();
        expect(createCommentMock).toHaveBeenCalledTimes(1);
        expect(createCommentMock).toHaveBeenCalledWith(CONST.APP_REPO, 12, onlyAppMessage);
    });

    test('Test GH action when only Mobile-Expensify PR number is provided', async () => {
        mockInputs({
            REPO: CONST.MOBILE_EXPENSIFY_REPO,
            APP_PR_NUMBER: '',
            MOBILE_EXPENSIFY_PR_NUMBER: '13',
            COMMENT_PREFIX: testBuildCommentPrefix,
            COMMENT_BODY: '',
            ANDROID: 'success',
            IOS: 'success',
            WEB: 'skipped',
            ANDROID_LINK: androidLink,
            IOS_LINK: iOSLink,
        });
        createCommentMock.mockResolvedValue(createMock<CreateCommentResponse>({}));
        await ghAction();
        expectPreviousCommentToBeHidden();
        expect(createCommentMock).toHaveBeenCalledTimes(1);
        expect(createCommentMock).toHaveBeenCalledWith(CONST.MOBILE_EXPENSIFY_REPO, 13, onlyMobileExpensifyMessage);
    });
});
