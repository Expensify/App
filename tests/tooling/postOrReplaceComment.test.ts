import ghAction from '@github/actions/javascript/postOrReplaceComment/postOrReplaceComment';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';

import asMutable from '@src/types/utils/asMutable';

/**
 * @jest-environment node
 */
import * as core from '@actions/core';
import {context} from '@actions/github';
import * as GitHubEnvironment from '@actions/github/lib/utils';
import {when} from 'jest-when';

import createMock from '../utils/createMock';

const mockGetInput = jest.fn();
const createCommentMock = jest.spyOn(GithubUtils, 'createComment');
type InternalOctokit = NonNullable<typeof GithubUtils.internalOctokit>;
type CreateCommentResponse = Awaited<ReturnType<InternalOctokit['rest']['issues']['createComment']>>;
type ListCommentsMethod = InternalOctokit['rest']['issues']['listComments'];
type ListCommentsResponse = Awaited<ReturnType<ListCommentsMethod>>;
type ListCommentsEndpoint = ListCommentsMethod['endpoint'];
type GraphqlMethod = InternalOctokit['graphql'];

let internalOctokit: InternalOctokit;
let listCommentsSpy: jest.SpiedFunction<ListCommentsEndpoint>;
let graphqlSpy: jest.SpiedFunction<GraphqlMethod>;

jest.mock('@actions/github', () => {
    const repository = process.env.GITHUB_REPOSITORY;
    if (!repository) {
        throw new Error('GITHUB_REPOSITORY must be set in owner/repository format.');
    }

    const [owner, repo, ...extraParts] = repository.split('/');
    if (!owner || !repo || extraParts.length > 0 || /\s/.test(owner) || /\s/.test(repo)) {
        throw new Error(`GITHUB_REPOSITORY must be set in owner/repository format, received: ${repository}`);
    }

    return {
        context: {
            repo: {owner, repo},
            runId: 1234,
        },
    };
});

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
    json: () => Promise.resolve(previousCommentsResponse.data),
});
const fetchComments: typeof globalThis.fetch = () => Promise.resolve(commentsFetchResponse);

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
    listCommentsSpy = jest.spyOn(internalOctokit.rest.issues.listComments, 'endpoint');
    jest.spyOn(internalOctokit, 'paginate');
    graphqlSpy = jest.spyOn(internalOctokit, 'graphql');
    graphqlSpy.mockImplementation(() => Promise.resolve({}));
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
        // Mock core module
        asMutable(core).getInput = mockGetInput;
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
        when(core.getInput).calledWith('REPO', {required: true}).mockReturnValue(CONST.APP_REPO);
        when(core.getInput).calledWith('APP_PR_NUMBER', {required: false}).mockReturnValue('12');
        when(core.getInput).calledWith('MOBILE_EXPENSIFY_PR_NUMBER', {required: false}).mockReturnValue('13');
        when(core.getInput).calledWith('COMMENT_PREFIX', {required: true}).mockReturnValue(testBuildCommentPrefix);
        when(core.getInput).calledWith('COMMENT_BODY', {required: false}).mockReturnValue('');
        when(core.getInput).calledWith('ANDROID', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('IOS', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('WEB', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('ANDROID_LINK').mockReturnValue(androidLink);
        when(core.getInput).calledWith('IOS_LINK').mockReturnValue(iOSLink);
        when(core.getInput).calledWith('WEB_LINK').mockReturnValue('https://expensify.app/WEB_LINK');
        createCommentMock.mockResolvedValue(createMock<CreateCommentResponse>({}));
        await ghAction();
        expectPreviousCommentToBeHidden();
        expect(createCommentMock).toHaveBeenCalledTimes(1);
        expect(createCommentMock).toHaveBeenCalledWith(CONST.APP_REPO, 12, message);
    });

    test('Test GH action when only App PR number is provided', async () => {
        when(core.getInput).calledWith('REPO', {required: true}).mockReturnValue(CONST.APP_REPO);
        when(core.getInput).calledWith('APP_PR_NUMBER', {required: false}).mockReturnValue('12');
        when(core.getInput).calledWith('MOBILE_EXPENSIFY_PR_NUMBER', {required: false}).mockReturnValue('');
        when(core.getInput).calledWith('COMMENT_PREFIX', {required: true}).mockReturnValue(testBuildCommentPrefix);
        when(core.getInput).calledWith('COMMENT_BODY', {required: false}).mockReturnValue('');
        when(core.getInput).calledWith('ANDROID', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('IOS', {required: false}).mockReturnValue('skipped');
        when(core.getInput).calledWith('WEB', {required: false}).mockReturnValue('skipped');
        when(core.getInput).calledWith('ANDROID_LINK').mockReturnValue('https://expensify.app/ANDROID_LINK');
        createCommentMock.mockResolvedValue(createMock<CreateCommentResponse>({}));
        await ghAction();
        expectPreviousCommentToBeHidden();
        expect(createCommentMock).toHaveBeenCalledTimes(1);
        expect(createCommentMock).toHaveBeenCalledWith(CONST.APP_REPO, 12, onlyAppMessage);
    });

    test('Test GH action when only Mobile-Expensify PR number is provided', async () => {
        when(core.getInput).calledWith('REPO', {required: true}).mockReturnValue(CONST.MOBILE_EXPENSIFY_REPO);
        when(core.getInput).calledWith('APP_PR_NUMBER', {required: false}).mockReturnValue('');
        when(core.getInput).calledWith('MOBILE_EXPENSIFY_PR_NUMBER', {required: false}).mockReturnValue('13');
        when(core.getInput).calledWith('COMMENT_PREFIX', {required: true}).mockReturnValue(testBuildCommentPrefix);
        when(core.getInput).calledWith('COMMENT_BODY', {required: false}).mockReturnValue('');
        when(core.getInput).calledWith('ANDROID', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('IOS', {required: false}).mockReturnValue('success');
        when(core.getInput).calledWith('ANDROID_LINK').mockReturnValue(androidLink);
        when(core.getInput).calledWith('IOS_LINK').mockReturnValue(iOSLink);
        when(core.getInput).calledWith('WEB', {required: false}).mockReturnValue('skipped');
        createCommentMock.mockResolvedValue(createMock<CreateCommentResponse>({}));
        await ghAction();
        expectPreviousCommentToBeHidden();
        expect(createCommentMock).toHaveBeenCalledTimes(1);
        expect(createCommentMock).toHaveBeenCalledWith(CONST.MOBILE_EXPENSIFY_REPO, 13, onlyMobileExpensifyMessage);
    });
});
