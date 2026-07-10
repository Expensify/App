import ghAction from '@github/actions/javascript/postOrReplaceComment/postOrReplaceComment';
import CONST from '@github/libs/CONST';
import type {CreateCommentResponse, InternalOctokit} from '@github/libs/GithubUtils';
import GithubUtils from '@github/libs/GithubUtils';

import * as core from '@actions/core';
import {context} from '@actions/github';
import {afterAll, beforeAll, beforeEach, describe, expect, jest, test} from 'bun:test';

// `jest-when` relies on Jest's internal `expect` matchers state (`global[Symbol.for('$$jest-matchers-object')]`),
// which bun:test's `expect` doesn't set up, so it throws under bun:test. This is a minimal local replacement
// supporting the `when(mockFn).calledWith(...args).mockReturnValue(value)` subset used below: later registrations
// for the same args take precedence, matching jest-when's overriding behavior across tests that don't reset mocks.
type MockFn = {mockImplementation: (impl: (...args: never[]) => unknown) => void};
const whenMatchers = new WeakMap<MockFn, Array<{args: unknown[]; value: unknown}>>();
function when<F extends MockFn>(mockFn: F) {
    let matchers = whenMatchers.get(mockFn);
    if (!matchers) {
        matchers = [];
        whenMatchers.set(mockFn, matchers);
        mockFn.mockImplementation((...args: unknown[]) => {
            const match = [...(matchers ?? [])].reverse().find((m) => Bun.deepEquals(m.args, args));
            if (!match) {
                throw new Error(`when(): no matching call registered for args: ${JSON.stringify(args)}`);
            }
            return match.value;
        });
    }
    return {
        calledWith: (...args: unknown[]) => ({
            mockReturnValue: (value: unknown) => matchers?.push({args, value}),
        }),
    };
}

const mockGetInput = jest.fn();
const createCommentMock = jest.spyOn(GithubUtils, 'createComment');
const mockListComments = jest.fn();
const mockGraphql = jest.fn();

function mockImplementation<T, TData>(endpoint: (params: Record<string, T>) => Promise<{data: TData}>, params: Record<string, T>) {
    return endpoint(params).then((response) => response.data);
}

// `GithubUtils.octokit`/`.paginate`/`.graphql` are getters derived from `internalOctokit` with no setter, so they
// can't be reassigned (or spied on with a getter-spy the way Jest's Babel-transpiled CJS interop allowed) directly;
// set the backing field instead.
GithubUtils.internalOctokit = {
    rest: {
        issues: {
            listComments: mockListComments as unknown as typeof GithubUtils.octokit.issues.listComments,
        },
    },
    paginate: mockImplementation,
    graphql: mockGraphql,
} as unknown as InternalOctokit;

// `@actions/github`'s `context` is a plain mutable object instance (not a live binding itself), and its constructor
// is a no-op without GITHUB_EVENT_PATH set, so it's safe to mutate directly below without mocking the module.
// `context.repo` is derived from `GITHUB_REPOSITORY`/`GITHUB_REPOSITORY_OWNER`, which tests/setupBunScripts.ts
// already sets to Expensify/App, matching what this test expects.
context.runId = 1234;

const androidLink = 'https://expensify.app/ANDROID_LINK';
const iOSLink = 'https://expensify.app/IOS_LINK';
const webLink = 'https://expensify.app/WEB_LINK';
const testBuildCommentPrefix = ':test_tube::test_tube: Use the links below to test this adhoc build';

const androidQRCode = `![Android](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${androidLink})`;
const iOSQRCode = `![iOS](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${iOSLink})`;
const webQRCode = `![Web](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${webLink})`;

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

:eyes: [View the workflow run that generated this build](https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/1234) :eyes:
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

:eyes: [View the workflow run that generated this build](https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/1234) :eyes:
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

:eyes: [View the workflow run that generated this build](https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/1234) :eyes:
`;

describe('postOrReplaceComment action tests', () => {
    beforeAll(() => {
        // Mock core module. Real ESM module namespace exports are read-only live bindings, so `core.getInput` can't
        // be reassigned directly (unlike Jest's Babel-transpiled CJS interop); spy on it instead.
        jest.spyOn(core, 'getInput').mockImplementation(mockGetInput);
    });

    beforeEach(() => jest.clearAllMocks());

    afterAll(() => {
        // `bun test` runs all files in one process sharing GithubUtils' module-level state, unlike Jest's per-file
        // module registry; reset it so later test files re-initialize their own octokit mock from scratch.
        GithubUtils.internalOctokit = undefined;
        // `createCommentMock` spies on the `GithubUtils.createComment` static method itself (rather than the
        // octokit call it wraps), and its last `mockResolvedValue` would otherwise leak into every later test file
        // that calls `GithubUtils.createComment`, silently short-circuiting it instead of hitting their own
        // octokit mocks.
        createCommentMock.mockRestore();
    });

    function expectPreviousCommentToBeHidden() {
        expect(mockGraphql).toHaveBeenCalledTimes(1);
        expect(mockGraphql).toHaveBeenCalledWith(
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
        when(mockGetInput).calledWith('REPO', {required: true}).mockReturnValue(CONST.APP_REPO);
        when(mockGetInput).calledWith('APP_PR_NUMBER', {required: false}).mockReturnValue('12');
        when(mockGetInput).calledWith('MOBILE_EXPENSIFY_PR_NUMBER', {required: false}).mockReturnValue('13');
        when(mockGetInput).calledWith('COMMENT_PREFIX', {required: true}).mockReturnValue(testBuildCommentPrefix);
        when(mockGetInput).calledWith('COMMENT_BODY', {required: false}).mockReturnValue('');
        when(mockGetInput).calledWith('ANDROID', {required: false}).mockReturnValue('success');
        when(mockGetInput).calledWith('IOS', {required: false}).mockReturnValue('success');
        when(mockGetInput).calledWith('WEB', {required: false}).mockReturnValue('success');
        when(mockGetInput).calledWith('ANDROID_LINK').mockReturnValue(androidLink);
        when(mockGetInput).calledWith('IOS_LINK').mockReturnValue(iOSLink);
        when(mockGetInput).calledWith('WEB_LINK').mockReturnValue('https://expensify.app/WEB_LINK');
        createCommentMock.mockResolvedValue({} as CreateCommentResponse);
        mockListComments.mockResolvedValue({
            data: [
                {
                    body: ':test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS, and Web. Happy testing!',
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    node_id: 'IC_abcd',
                },
            ],
        });
        await ghAction();
        expectPreviousCommentToBeHidden();
        expect(createCommentMock).toHaveBeenCalledTimes(1);
        expect(createCommentMock).toHaveBeenCalledWith(CONST.APP_REPO, 12, message);
    });

    test('Test GH action when only App PR number is provided', async () => {
        when(mockGetInput).calledWith('REPO', {required: true}).mockReturnValue(CONST.APP_REPO);
        when(mockGetInput).calledWith('APP_PR_NUMBER', {required: false}).mockReturnValue('12');
        when(mockGetInput).calledWith('MOBILE_EXPENSIFY_PR_NUMBER', {required: false}).mockReturnValue('');
        when(mockGetInput).calledWith('COMMENT_PREFIX', {required: true}).mockReturnValue(testBuildCommentPrefix);
        when(mockGetInput).calledWith('COMMENT_BODY', {required: false}).mockReturnValue('');
        when(mockGetInput).calledWith('ANDROID', {required: false}).mockReturnValue('success');
        when(mockGetInput).calledWith('IOS', {required: false}).mockReturnValue('skipped');
        when(mockGetInput).calledWith('WEB', {required: false}).mockReturnValue('skipped');
        when(mockGetInput).calledWith('ANDROID_LINK').mockReturnValue('https://expensify.app/ANDROID_LINK');
        createCommentMock.mockResolvedValue({} as CreateCommentResponse);
        mockListComments.mockResolvedValue({
            data: [
                {
                    body: ':test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS, and Web. Happy testing!',
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    node_id: 'IC_abcd',
                },
            ],
        });
        await ghAction();
        expectPreviousCommentToBeHidden();
        expect(createCommentMock).toHaveBeenCalledTimes(1);
        expect(createCommentMock).toHaveBeenCalledWith(CONST.APP_REPO, 12, onlyAppMessage);
    });

    test('Test GH action when only Mobile-Expensify PR number is provided', async () => {
        when(mockGetInput).calledWith('REPO', {required: true}).mockReturnValue(CONST.MOBILE_EXPENSIFY_REPO);
        when(mockGetInput).calledWith('APP_PR_NUMBER', {required: false}).mockReturnValue('');
        when(mockGetInput).calledWith('MOBILE_EXPENSIFY_PR_NUMBER', {required: false}).mockReturnValue('13');
        when(mockGetInput).calledWith('COMMENT_PREFIX', {required: true}).mockReturnValue(testBuildCommentPrefix);
        when(mockGetInput).calledWith('COMMENT_BODY', {required: false}).mockReturnValue('');
        when(mockGetInput).calledWith('ANDROID', {required: false}).mockReturnValue('success');
        when(mockGetInput).calledWith('IOS', {required: false}).mockReturnValue('success');
        when(mockGetInput).calledWith('ANDROID_LINK').mockReturnValue(androidLink);
        when(mockGetInput).calledWith('IOS_LINK').mockReturnValue(iOSLink);
        when(mockGetInput).calledWith('WEB', {required: false}).mockReturnValue('skipped');
        createCommentMock.mockResolvedValue({} as CreateCommentResponse);
        mockListComments.mockResolvedValue({
            data: [
                {
                    body: ':test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS. Happy testing!',
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    node_id: 'IC_abcd',
                },
            ],
        });
        await ghAction();
        expectPreviousCommentToBeHidden();
        expect(createCommentMock).toHaveBeenCalledTimes(1);
        expect(createCommentMock).toHaveBeenCalledWith(CONST.MOBILE_EXPENSIFY_REPO, 13, onlyMobileExpensifyMessage);
    });
});
