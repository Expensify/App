/* eslint-disable @typescript-eslint/naming-convention */
import {afterEach, beforeAll, beforeEach, describe, expect, it} from '@jest/globals';
import {renderHook} from '@testing-library/react-native';
import {addSeconds, format, subMinutes} from 'date-fns';
import {toZonedTime} from 'date-fns-tz';
import type {Mock} from 'jest-mock';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import type {SearchQueryJSON} from '@components/Search/types';
import useAncestors from '@hooks/useAncestors';
import {getOnboardingMessages} from '@libs/actions/Welcome/OnboardingFlow';
import {WRITE_COMMANDS} from '@libs/API/types';
import HttpUtils from '@libs/HttpUtils';
import Navigation from '@libs/Navigation/Navigation';
import {buildNextStepNew} from '@libs/NextStepUtils';
import {getOriginalMessage} from '@libs/ReportActionsUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as PersistedRequests from '@src/libs/actions/PersistedRequests';
import * as Report from '@src/libs/actions/Report';
import * as User from '@src/libs/actions/User';
import DateUtils from '@src/libs/DateUtils';
import Log from '@src/libs/Log';
import * as SequentialQueue from '@src/libs/Network/SequentialQueue';
import * as ReportUtils from '@src/libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Message} from '@src/types/onyx/ReportAction';
import createCollection from '../utils/collections/createCollection';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import getIsUsingFakeTimers from '../utils/getIsUsingFakeTimers';
import getOnyxValue from '../utils/getOnyxValue';
import PusherHelper from '../utils/PusherHelper';
import * as TestHelper from '../utils/TestHelper';
import type {MockFetch} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForNetworkPromises from '../utils/waitForNetworkPromises';

jest.mock('@libs/NextStepUtils', () => ({
    buildNextStepNew: jest.fn(),
    buildOptimisticNextStep: jest.fn(),
}));

const MOCKED_POLICY_EXPENSE_CHAT_REPORT_ID = '1234';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
jest.mock('@libs/ReportUtils', () => {
    const actual = jest.requireActual<typeof ReportUtils>('@libs/ReportUtils');
    const mockGenerateReportID = jest.fn().mockReturnValue('9876');
    return {
        ...actual,
        generateReportID: mockGenerateReportID,
        buildOptimisticChatReport: jest.fn().mockImplementation((params: Record<string, unknown>) => {
            const optimisticReportID = typeof params.optimisticReportID === 'string' ? params.optimisticReportID : undefined;
            const mockReportID = optimisticReportID ?? mockGenerateReportID();
            return {
                reportID: mockReportID,
                type: 'chat',
                participants: {},
            };
        }),
        getPolicyExpenseChat: jest.fn().mockImplementation(() => ({reportID: MOCKED_POLICY_EXPENSE_CHAT_REPORT_ID, hasOutstandingChildRequest: false})),
    } as typeof actual;
});
/* eslint-enable @typescript-eslint/no-unsafe-assignment */

const currentHash = 12345;
jest.mock('@src/libs/SearchQueryUtils', () => ({
    getCurrentSearchQueryJSON: jest.fn().mockImplementation(() => ({
        hash: currentHash,
        query: 'test',
        type: 'expense',
        status: '',
        flatFilters: [],
    })),
}));

const UTC = 'UTC';
jest.mock('@src/libs/actions/Report', () => {
    const originalModule = jest.requireActual<Report>('@src/libs/actions/Report');

    return {
        ...originalModule,
        showReportActionNotification: jest.fn(),
    };
});

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    default: () => ({
        didScreenTransitionEnd: true,
    }),
}));

jest.mock('@libs/Sound', () => ({
    __esModule: true,
    default: jest.fn(),
    SOUNDS: {DONE: 'DONE'},
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn().mockReturnValue(''),
    dismissModalWithReport: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isActiveRoute: jest.fn(() => false),
    getTopmostReportId: jest.fn(() => undefined),
    goBack: jest.fn(),
    navigationRef: {
        getRootState: jest.fn(() => ({routes: []})),
        isReady: jest.fn(() => true),
        current: {
            getRootState: jest.fn(() => ({routes: []})),
        },
    },
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@libs/actions/Welcome', () => ({
    ...jest.requireActual('@libs/actions/Welcome'),
    onServerDataReady: jest.fn(() => Promise.resolve()),
}));

const originalXHR = HttpUtils.xhr;
OnyxUpdateManager();
describe('actions/Report', () => {
    beforeAll(() => {
        PusherHelper.setup();
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        HttpUtils.xhr = originalXHR;
        const promise = Onyx.clear().then(() => {
            jest.useRealTimers();
            waitForBatchedUpdates();
        });

        if (getIsUsingFakeTimers()) {
            // flushing pending timers
            // Onyx.clear() promise is resolved in batch which happens after the current microtasks cycle
            setImmediate(jest.runOnlyPendingTimers);
        }
        global.fetch = TestHelper.getGlobalFetchMock();

        // Clear the queue before each test to avoid test pollution
        SequentialQueue.resetQueue();

        return promise;
    });

    afterEach(() => {
        jest.clearAllMocks();
        PusherHelper.teardown();
    });

    it('should store a new report action in Onyx when onyxApiUpdate event is handled via Pusher', () => {
        global.fetch = TestHelper.getGlobalFetchMock();

        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@test.com';
        const REPORT_ID = '1';
        const REPORT: OnyxTypes.Report = createRandomReport(1, undefined);
        let reportActionID: string | undefined;
        const REPORT_ACTION = {
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            actorAccountID: TEST_USER_ACCOUNT_ID,
            automatic: false,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            message: [{type: 'COMMENT', html: 'Testing a comment', text: 'Testing a comment', translationKey: ''}],
            person: [{type: 'TEXT', style: 'strong', text: 'Test User'}],
            shouldShow: true,
        };

        let reportActions: OnyxEntry<OnyxTypes.ReportActions>;
        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
            callback: (val) => (reportActions = val),
        });

        // Set up Onyx with some test user data
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)
            .then(() => {
                User.subscribeToUserEvents();
                return waitForBatchedUpdates();
            })
            .then(() => TestHelper.setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID))
            .then(() => {
                // This is a fire and forget response, but once it completes we should be able to verify that we
                // have an "optimistic" report action in Onyx.
                Report.addComment(REPORT, REPORT_ID, [], 'Testing a comment', CONST.DEFAULT_TIME_ZONE);
                return waitForBatchedUpdates();
            })
            .then(() => {
                const resultAction: OnyxEntry<OnyxTypes.ReportAction> = Object.values(reportActions ?? {}).at(0);
                reportActionID = resultAction?.reportActionID;

                expect(reportActionID).not.toBeUndefined();
                expect(resultAction?.message).toEqual(REPORT_ACTION.message);
                expect(resultAction?.person).toEqual(REPORT_ACTION.person);
                expect(resultAction?.pendingAction).toBeUndefined();

                if (!reportActionID) {
                    return;
                }

                // We subscribed to the Pusher channel above and now we need to simulate a reportComment action
                // Pusher event so we can verify that action was handled correctly and merged into the reportActions.
                PusherHelper.emitOnyxUpdate([
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`,
                        value: {
                            reportID: REPORT_ID,
                            participants: {
                                [TEST_USER_ACCOUNT_ID]: {
                                    notificationPreference: 'always',
                                },
                            },
                            lastVisibleActionCreated: '2022-11-22 03:48:27.267',
                            lastMessageText: 'Testing a comment',
                            lastActorAccountID: TEST_USER_ACCOUNT_ID,
                        },
                    },
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                        value: {
                            [reportActionID]: {pendingAction: null},
                        },
                    },
                ]);

                // Once a reportComment event is emitted to the Pusher channel we should see the comment get processed
                // by the Pusher callback and added to the storage so we must wait for promises to resolve again and
                // then verify the data is in Onyx.
                return waitForBatchedUpdates();
            })
            .then(() => {
                // Verify there is only one action and our optimistic comment has been removed
                expect(Object.keys(reportActions ?? {}).length).toBe(1);

                const resultAction = reportActionID ? reportActions?.[reportActionID] : undefined;

                // Verify that our action is no longer in the loading state
                expect(resultAction?.pendingAction).toBeUndefined();
            });
    });

    it('clearCreateChatError should not delete the report if it is not optimistic report', () => {
        const REPORT: OnyxTypes.Report = {...createRandomReport(1, undefined), errorFields: {createChat: {error: 'error'}}};
        const REPORT_METADATA: OnyxTypes.ReportMetadata = {isOptimisticReport: false};

        Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT.reportID}`, REPORT);
        Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${REPORT.reportID}`, REPORT_METADATA);

        return waitForBatchedUpdates()
            .then(() => {
                Report.clearCreateChatError(REPORT);
                return waitForBatchedUpdates();
            })
            .then(
                () =>
                    new Promise<void>((resolve) => {
                        const connection = Onyx.connect({
                            key: `${ONYXKEYS.COLLECTION.REPORT}${REPORT.reportID}`,
                            callback: (report) => {
                                Onyx.disconnect(connection);
                                resolve();

                                // The report should exist but the create chat error field should be cleared.
                                expect(report?.reportID).toBeDefined();
                                expect(report?.errorFields?.createChat).toBeUndefined();
                            },
                        });
                    }),
            );
    });

    it('should update pins in Onyx when togglePinned is called', () => {
        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@test.com';
        const REPORT_ID = '1';

        let reportIsPinned: boolean;
        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`,
            callback: (val) => (reportIsPinned = val?.isPinned ?? false),
        });

        // Set up Onyx with some test user data
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)
            .then(() => {
                Report.togglePinnedState(REPORT_ID, false);
                return waitForBatchedUpdates();
            })
            .then(() => {
                // Test that Onyx immediately updated the report pin state.
                expect(reportIsPinned).toEqual(true);
            });
    });

    it('Should not leave duplicate comments when logger sends packet because of calling process queue while processing the queue', () => {
        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@test.com';
        const REPORT_ID = '1';
        const REPORT: OnyxTypes.Report = createRandomReport(1, undefined);
        const LOGGER_MAX_LOG_LINES = 50;

        // GIVEN a test user with initial data
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)
            .then(() => TestHelper.setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID))
            .then(() => {
                global.fetch = TestHelper.getGlobalFetchMock();

                // WHEN we add enough logs to send a packet
                for (let i = 0; i <= LOGGER_MAX_LOG_LINES; i++) {
                    Log.info('Test log info');
                }

                // And leave a comment on a report
                Report.addComment(REPORT, REPORT_ID, [], 'Testing a comment', CONST.DEFAULT_TIME_ZONE);

                // Then we should expect that there is on persisted request
                expect(PersistedRequests.getAll().length).toBe(1);

                // When we wait for the queue to run
                return waitForBatchedUpdates();
            })
            .then(() => {
                // THEN only ONE call to AddComment will happen
                const URL_ARGUMENT_INDEX = 0;
                const addCommentCalls = (global.fetch as jest.Mock).mock.calls.filter((callArguments: string[]) => callArguments.at(URL_ARGUMENT_INDEX)?.includes('AddComment'));
                expect(addCommentCalls.length).toBe(1);
            });
    });

    it('should be updated correctly when new comments are added, deleted or marked as unread', () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        const REPORT_ID = '1';
        let report: OnyxEntry<OnyxTypes.Report>;
        let reportActionCreatedDate: string;
        let currentTime: string;
        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`,
            callback: (val) => (report = val),
        });

        let reportActions: OnyxTypes.ReportActions;
        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
            callback: (val) => (reportActions = val ?? {}),
        });

        const {result: ancestors, rerender} = renderHook(() => useAncestors(report));

        const USER_1_LOGIN = 'user@test.com';
        const USER_1_ACCOUNT_ID = 1;
        const USER_2_ACCOUNT_ID = 2;
        const setPromise = Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportName: 'Test', reportID: REPORT_ID})
            .then(() => TestHelper.signInWithTestUser(USER_1_ACCOUNT_ID, USER_1_LOGIN))
            .then(waitForNetworkPromises)
            .then(() => {
                // Given a test user that is subscribed to Pusher events
                User.subscribeToUserEvents();
                return waitForBatchedUpdates();
            })
            .then(() => TestHelper.setPersonalDetails(USER_1_LOGIN, USER_1_ACCOUNT_ID))
            .then(() => {
                // When a Pusher event is handled for a new report comment that includes a mention of the current user
                reportActionCreatedDate = DateUtils.getDBTime();
                PusherHelper.emitOnyxUpdate([
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`,
                        value: {
                            reportID: REPORT_ID,
                            participants: {
                                [USER_1_ACCOUNT_ID]: {
                                    notificationPreference: 'always',
                                },
                            },
                            lastMessageText: 'Comment 1',
                            lastActorAccountID: USER_2_ACCOUNT_ID,
                            lastVisibleActionCreated: reportActionCreatedDate,
                            lastMentionedTime: reportActionCreatedDate,
                            lastReadTime: DateUtils.subtractMillisecondsFromDateTime(reportActionCreatedDate, 1),
                        },
                    },
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                        value: {
                            1: {
                                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                                actorAccountID: USER_2_ACCOUNT_ID,
                                automatic: false,
                                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                                message: [{type: 'COMMENT', html: 'Comment 1', text: 'Comment 1'}],
                                person: [{type: 'TEXT', style: 'strong', text: 'Test User'}],
                                shouldShow: true,
                                created: reportActionCreatedDate,
                                reportActionID: '1',
                            },
                        },
                    },
                ]);
                return waitForNetworkPromises();
            })
            .then(() => {
                // Then the report will be unread
                expect(ReportUtils.isUnread(report, undefined, undefined)).toBe(true);

                // And show a green dot for unread mentions in the LHN
                expect(ReportUtils.isUnreadWithMention(report)).toBe(true);

                // When the user visits the report
                currentTime = DateUtils.getDBTime();
                Report.openReport(REPORT_ID);
                Report.readNewestAction(REPORT_ID);
                waitForBatchedUpdates();
                return waitForBatchedUpdates();
            })
            .then(() => {
                // The report will be read
                expect(ReportUtils.isUnread(report, undefined, undefined)).toBe(false);
                expect(toZonedTime(report?.lastReadTime ?? '', UTC).getTime()).toBeGreaterThanOrEqual(toZonedTime(currentTime, UTC).getTime());

                // And no longer show the green dot for unread mentions in the LHN
                expect(ReportUtils.isUnreadWithMention(report)).toBe(false);

                // When the user manually marks a message as "unread"
                Report.markCommentAsUnread(REPORT_ID, reportActions['1'], USER_1_ACCOUNT_ID);
                return waitForBatchedUpdates();
            })
            .then(() => {
                // Then the report will be unread and show the green dot for unread mentions in LHN
                expect(ReportUtils.isUnread(report, undefined, undefined)).toBe(true);
                expect(ReportUtils.isUnreadWithMention(report)).toBe(true);
                expect(report?.lastReadTime).toBe(DateUtils.subtractMillisecondsFromDateTime(reportActionCreatedDate, 1));

                // When a new comment is added by the current user

                currentTime = DateUtils.getDBTime();
                Report.addComment(report, REPORT_ID, [], 'Current User Comment 1', CONST.DEFAULT_TIME_ZONE);
                return waitForBatchedUpdates();
            })
            .then(() => {
                // The report will be read, the green dot for unread mentions will go away, and the lastReadTime updated
                expect(ReportUtils.isUnread(report, undefined, undefined)).toBe(false);
                expect(ReportUtils.isUnreadWithMention(report)).toBe(false);
                expect(toZonedTime(report?.lastReadTime ?? '', UTC).getTime()).toBeGreaterThanOrEqual(toZonedTime(currentTime, UTC).getTime());
                expect(report?.lastMessageText).toBe('Current User Comment 1');

                // When another comment is added by the current user
                currentTime = DateUtils.getDBTime();
                Report.addComment(report, REPORT_ID, [], 'Current User Comment 2', CONST.DEFAULT_TIME_ZONE);
                return waitForBatchedUpdates();
            })
            .then(() => {
                // The report will be read and the lastReadTime updated
                expect(ReportUtils.isUnread(report, undefined, undefined)).toBe(false);
                expect(toZonedTime(report?.lastReadTime ?? '', UTC).getTime()).toBeGreaterThanOrEqual(toZonedTime(currentTime, UTC).getTime());
                expect(report?.lastMessageText).toBe('Current User Comment 2');

                // When another comment is added by the current user
                currentTime = DateUtils.getDBTime();
                Report.addComment(report, REPORT_ID, [], 'Current User Comment 3', CONST.DEFAULT_TIME_ZONE);
                return waitForBatchedUpdates();
            })
            .then(() => {
                // The report will be read and the lastReadTime updated
                expect(ReportUtils.isUnread(report, undefined, undefined)).toBe(false);
                expect(toZonedTime(report?.lastReadTime ?? '', UTC).getTime()).toBeGreaterThanOrEqual(toZonedTime(currentTime, UTC).getTime());
                expect(report?.lastMessageText).toBe('Current User Comment 3');

                const USER_1_BASE_ACTION = {
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    actorAccountID: USER_1_ACCOUNT_ID,
                    automatic: false,
                    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
                    person: [{type: 'TEXT', style: 'strong', text: 'Test User'}],
                    shouldShow: true,
                    created: DateUtils.getDBTime(Date.now() - 3),
                    reportID: REPORT_ID,
                };

                const optimisticReportActions: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                    value: {
                        200: {
                            ...USER_1_BASE_ACTION,
                            message: [{type: 'COMMENT', html: 'Current User Comment 1', text: 'Current User Comment 1'}],
                            created: DateUtils.getDBTime(Date.now() - 2),
                            reportActionID: '200',
                        },

                        300: {
                            ...USER_1_BASE_ACTION,
                            message: [{type: 'COMMENT', html: 'Current User Comment 2', text: 'Current User Comment 2'}],
                            created: DateUtils.getDBTime(Date.now() - 1),
                            reportActionID: '300',
                        },

                        400: {
                            ...USER_1_BASE_ACTION,
                            message: [{type: 'COMMENT', html: 'Current User Comment 3', text: 'Current User Comment 3'}],
                            created: DateUtils.getDBTime(),
                            reportActionID: '400',
                        },
                    },
                };

                reportActionCreatedDate = DateUtils.getDBTime();

                const optimisticReportActionsValue = optimisticReportActions.value as Record<string, OnyxTypes.ReportAction>;

                if (optimisticReportActionsValue?.[400]) {
                    optimisticReportActionsValue[400].created = reportActionCreatedDate;
                }

                // When we emit the events for these pending created actions to update them to not pending
                PusherHelper.emitOnyxUpdate([
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`,
                        value: {
                            reportID: REPORT_ID,
                            participants: {
                                [USER_1_ACCOUNT_ID]: {
                                    notificationPreference: 'always',
                                },
                            },
                            lastMessageText: 'Current User Comment 3',
                            lastActorAccountID: 1,
                            lastVisibleActionCreated: reportActionCreatedDate,
                            lastReadTime: reportActionCreatedDate,
                        },
                    },
                    optimisticReportActions,
                ]);

                return waitForNetworkPromises();
            })
            .then(() => {
                rerender(report);
                // If the user deletes a comment that is before the last read
                Report.deleteReportComment(REPORT_ID, {...reportActions[200]}, ancestors.current, undefined, undefined, USER_1_LOGIN);
                return waitForBatchedUpdates();
            })
            .then(() => {
                // Then no change will occur
                expect(report?.lastReadTime).toBe(reportActionCreatedDate);
                expect(ReportUtils.isUnread(report, undefined, undefined)).toBe(false);

                // When the user manually marks a message as "unread"
                Report.markCommentAsUnread(REPORT_ID, reportActions[400], USER_1_ACCOUNT_ID);
                return waitForBatchedUpdates();
            })
            .then(() => {
                // Then we should expect the report to be to be unread
                expect(ReportUtils.isUnread(report, undefined, undefined)).toBe(true);
                expect(report?.lastReadTime).toBe(DateUtils.subtractMillisecondsFromDateTime(reportActions[400].created, 1));

                rerender(report);
                // If the user deletes the last comment after the lastReadTime the lastMessageText will reflect the new last comment
                Report.deleteReportComment(REPORT_ID, {...reportActions[400]}, ancestors.current, undefined, undefined, USER_1_LOGIN);
                return waitForBatchedUpdates();
            })
            .then(() => {
                expect(ReportUtils.isUnread(report, undefined, undefined)).toBe(false);
                expect(report?.lastMessageText).toBe('Current User Comment 2');
            });
        waitForBatchedUpdates(); // flushing onyx.set as it will be batched
        return setPromise;
    });

    it('Should properly update comment with links', async () => {
        /* This tests a variety of scenarios when a user edits a comment.
         * We should generate a link when editing a message unless the link was
         * already in the comment and the user deleted it on purpose.
         */

        global.fetch = TestHelper.getGlobalFetchMock();

        const TEST_USER_LOGIN = 'test@expensify.com';

        // User edits comment to add link
        // We should generate link
        let originalCommentMarkdown = 'Original Comment';
        let afterEditCommentText = 'Original Comment www.google.com';
        let newCommentHTML = Report.handleUserDeletedLinksInHtml(afterEditCommentText, originalCommentMarkdown, TEST_USER_LOGIN);
        let expectedOutput = 'Original Comment <a href="https://www.google.com" target="_blank" rel="noreferrer noopener">www.google.com</a>';
        expect(newCommentHTML).toBe(expectedOutput);

        // User deletes www.google.com link from comment but keeps link text
        // We should not generate link
        originalCommentMarkdown = 'Comment [www.google.com](https://www.google.com)';
        afterEditCommentText = 'Comment www.google.com';
        newCommentHTML = Report.handleUserDeletedLinksInHtml(afterEditCommentText, originalCommentMarkdown, TEST_USER_LOGIN);
        expectedOutput = 'Comment www.google.com';
        expect(newCommentHTML).toBe(expectedOutput);

        // User Delete only () part of link but leaves the []
        // We should not generate link
        originalCommentMarkdown = 'Comment [www.google.com](https://www.google.com)';
        afterEditCommentText = 'Comment [www.google.com]';
        newCommentHTML = Report.handleUserDeletedLinksInHtml(afterEditCommentText, originalCommentMarkdown, TEST_USER_LOGIN);
        expectedOutput = 'Comment [www.google.com]';
        expect(newCommentHTML).toBe(expectedOutput);

        // User Generates multiple links in one edit
        // We should generate both links
        originalCommentMarkdown = 'Comment';
        afterEditCommentText = 'Comment www.google.com www.facebook.com';
        newCommentHTML = Report.handleUserDeletedLinksInHtml(afterEditCommentText, originalCommentMarkdown, TEST_USER_LOGIN);
        expectedOutput =
            'Comment <a href="https://www.google.com" target="_blank" rel="noreferrer noopener">www.google.com</a> ' +
            '<a href="https://www.facebook.com" target="_blank" rel="noreferrer noopener">www.facebook.com</a>';
        expect(newCommentHTML).toBe(expectedOutput);

        // Comment has two links but user deletes only one of them
        // Should not generate link again for the deleted one
        originalCommentMarkdown = 'Comment [www.google.com](https://www.google.com)  [www.facebook.com](https://www.facebook.com)';
        afterEditCommentText = 'Comment www.google.com  [www.facebook.com](https://www.facebook.com)';
        newCommentHTML = Report.handleUserDeletedLinksInHtml(afterEditCommentText, originalCommentMarkdown, TEST_USER_LOGIN);
        expectedOutput = 'Comment www.google.com  <a href="https://www.facebook.com" target="_blank" rel="noreferrer noopener">www.facebook.com</a>';
        expect(newCommentHTML).toBe(expectedOutput);

        // User edits and replaces comment with a link containing underscores
        // We should generate link
        originalCommentMarkdown = 'Comment';
        afterEditCommentText = 'https://www.facebook.com/hashtag/__main/?__eep__=6';
        newCommentHTML = Report.handleUserDeletedLinksInHtml(afterEditCommentText, originalCommentMarkdown, TEST_USER_LOGIN);
        expectedOutput = '<a href="https://www.facebook.com/hashtag/__main/?__eep__=6" target="_blank" rel="noreferrer noopener">https://www.facebook.com/hashtag/__main/?__eep__=6</a>';
        expect(newCommentHTML).toBe(expectedOutput);

        // User edits and deletes the link containing underscores
        // We should not generate link
        originalCommentMarkdown = '[https://www.facebook.com/hashtag/__main/?__eep__=6](https://www.facebook.com/hashtag/__main/?__eep__=6)';
        afterEditCommentText = 'https://www.facebook.com/hashtag/__main/?__eep__=6';
        newCommentHTML = Report.handleUserDeletedLinksInHtml(afterEditCommentText, originalCommentMarkdown, TEST_USER_LOGIN);
        expectedOutput = 'https://www.facebook.com/hashtag/__main/?__eep__=6';
        expect(newCommentHTML).toBe(expectedOutput);

        // User edits and replaces comment with a link containing asterisks
        // We should generate link
        originalCommentMarkdown = 'Comment';
        afterEditCommentText = 'http://example.com/foo/*/bar/*/test.txt';
        newCommentHTML = Report.handleUserDeletedLinksInHtml(afterEditCommentText, originalCommentMarkdown, TEST_USER_LOGIN);
        expectedOutput = '<a href="http://example.com/foo/*/bar/*/test.txt" target="_blank" rel="noreferrer noopener">http://example.com/foo/*/bar/*/test.txt</a>';
        expect(newCommentHTML).toBe(expectedOutput);

        // User edits and deletes the link containing asterisks
        // We should not generate link
        originalCommentMarkdown = '[http://example.com/foo/*/bar/*/test.txt](http://example.com/foo/*/bar/*/test.txt)';
        afterEditCommentText = 'http://example.com/foo/*/bar/*/test.txt';
        newCommentHTML = Report.handleUserDeletedLinksInHtml(afterEditCommentText, originalCommentMarkdown, TEST_USER_LOGIN);
        expectedOutput = 'http://example.com/foo/*/bar/*/test.txt';
        expect(newCommentHTML).toBe(expectedOutput);

        // User edits comment to add mention
        // We should generate mention-user tag
        const privateDomainAccount = {
            accountID: 2,
            login: 'user@expensify.com',
            email: 'user@expensify.com',
        };
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [privateDomainAccount.accountID]: privateDomainAccount,
        });
        originalCommentMarkdown = 'Comment';
        afterEditCommentText = 'Comment @user';
        newCommentHTML = Report.handleUserDeletedLinksInHtml(afterEditCommentText, originalCommentMarkdown, TEST_USER_LOGIN);
        expectedOutput = 'Comment <mention-user>@user@expensify.com</mention-user>';
        expect(newCommentHTML).toBe(expectedOutput);
    });

    it('should show a notification for report action updates with shouldNotify', () => {
        const TEST_USER_ACCOUNT_ID = 1;
        const REPORT_ID = '1';
        const REPORT_ACTION = {
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        };

        // Setup user and pusher listeners
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID)
            .then(waitForBatchedUpdates)
            .then(() => {
                User.subscribeToUserEvents();
                return waitForBatchedUpdates();
            })
            .then(() => {
                // Simulate a Pusher Onyx update with a report action with shouldNotify
                PusherHelper.emitOnyxUpdate([
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                        value: {
                            1: REPORT_ACTION,
                        },
                        shouldNotify: true,
                    },
                ]);
                return SequentialQueue.getCurrentRequest().then(waitForBatchedUpdates);
            })
            .then(() => {
                // Ensure we show a notification for this new report action
                expect(Report.showReportActionNotification).toBeCalledWith(REPORT_ID, REPORT_ACTION);
            });
    });

    it('should properly toggle reactions on a message', () => {
        global.fetch = TestHelper.getGlobalFetchMock();

        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@test.com';
        const REPORT_ID = '1';
        const REPORT: OnyxTypes.Report = createRandomReport(1, undefined);
        const EMOJI_CODE = '👍';
        const EMOJI_SKIN_TONE = 2;
        const EMOJI_NAME = '+1';
        const EMOJI = {
            code: EMOJI_CODE,
            name: EMOJI_NAME,
            types: ['👍🏿', '👍🏾', '👍🏽', '👍🏼', '👍🏻'],
        };

        let reportActions: OnyxTypes.ReportActions;
        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
            callback: (val) => (reportActions = val ?? {}),
        });
        const reportActionsReactions: OnyxCollection<OnyxTypes.ReportActionReactions> = {};
        Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS,
            callback: (val, key) => {
                reportActionsReactions[key] = val ?? {};
            },
        });
        let reportAction: OnyxTypes.ReportAction | undefined;
        let reportActionID: string | undefined;

        // Set up Onyx with some test user data
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)
            .then(() => {
                User.subscribeToUserEvents();
                return waitForBatchedUpdates();
            })
            .then(() => TestHelper.setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID))
            .then(() => {
                // This is a fire and forget response, but once it completes we should be able to verify that we
                // have an "optimistic" report action in Onyx.
                Report.addComment(REPORT, REPORT_ID, [], 'Testing a comment', CONST.DEFAULT_TIME_ZONE);
                return waitForBatchedUpdates();
            })
            .then(() => {
                reportAction = Object.values(reportActions).at(0);
                reportActionID = reportAction?.reportActionID;

                if (reportAction) {
                    // Add a reaction to the comment
                    Report.toggleEmojiReaction(REPORT_ID, reportAction, EMOJI, reportActionsReactions[0], CONST.EMOJI_DEFAULT_SKIN_TONE, TEST_USER_ACCOUNT_ID);
                }
                return waitForBatchedUpdates();
            })
            .then(() => {
                reportAction = Object.values(reportActions).at(0);

                // Expect the reaction to exist in the reportActionsReactions collection
                expect(reportActionsReactions).toHaveProperty(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`);

                // Expect the reaction to have the emoji on it
                const reportActionReaction = reportActionsReactions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`];
                expect(reportActionReaction).toHaveProperty(EMOJI.name);

                // Expect the emoji to have the user accountID
                const reportActionReactionEmoji = reportActionReaction?.[EMOJI.name];
                expect(reportActionReactionEmoji?.users).toHaveProperty(`${TEST_USER_ACCOUNT_ID}`);

                if (reportAction) {
                    // Now we remove the reaction
                    Report.toggleEmojiReaction(REPORT_ID, reportAction, EMOJI, reportActionReaction, CONST.EMOJI_DEFAULT_SKIN_TONE, TEST_USER_ACCOUNT_ID);
                }
                return waitForBatchedUpdates();
            })
            .then(() => {
                // Expect the reaction to have null where the users reaction used to be
                expect(reportActionsReactions).toHaveProperty(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`);
                const reportActionReaction = reportActionsReactions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`];
                expect(reportActionReaction?.[EMOJI.name].users[TEST_USER_ACCOUNT_ID]).toBeUndefined();
            })
            .then(() => {
                reportAction = Object.values(reportActions).at(0);

                if (reportAction) {
                    // Add the same reaction to the same report action with a different skin tone
                    Report.toggleEmojiReaction(REPORT_ID, reportAction, EMOJI, reportActionsReactions[0], CONST.EMOJI_DEFAULT_SKIN_TONE, TEST_USER_ACCOUNT_ID);
                }
                return waitForBatchedUpdates()
                    .then(() => {
                        reportAction = Object.values(reportActions).at(0);

                        const reportActionReaction = reportActionsReactions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`];
                        if (reportAction) {
                            Report.toggleEmojiReaction(REPORT_ID, reportAction, EMOJI, reportActionReaction, EMOJI_SKIN_TONE, TEST_USER_ACCOUNT_ID);
                        }
                        return waitForBatchedUpdates();
                    })
                    .then(() => {
                        reportAction = Object.values(reportActions).at(0);

                        // Expect the reaction to exist in the reportActionsReactions collection
                        expect(reportActionsReactions).toHaveProperty(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`);

                        // Expect the reaction to have the emoji on it
                        const reportActionReaction = reportActionsReactions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`];
                        expect(reportActionReaction).toHaveProperty(EMOJI.name);

                        // Expect the emoji to have the user accountID
                        const reportActionReactionEmoji = reportActionReaction?.[EMOJI.name];
                        expect(reportActionReactionEmoji?.users).toHaveProperty(`${TEST_USER_ACCOUNT_ID}`);

                        // Expect two different skin tone reactions
                        const reportActionReactionEmojiUserSkinTones = reportActionReactionEmoji?.users[TEST_USER_ACCOUNT_ID].skinTones;
                        expect(reportActionReactionEmojiUserSkinTones).toHaveProperty('-1');
                        expect(reportActionReactionEmojiUserSkinTones).toHaveProperty('2');

                        if (reportAction) {
                            // Now we remove the reaction, and expect that both variations are removed
                            Report.toggleEmojiReaction(REPORT_ID, reportAction, EMOJI, reportActionReaction, CONST.EMOJI_DEFAULT_SKIN_TONE, TEST_USER_ACCOUNT_ID);
                        }
                        return waitForBatchedUpdates();
                    })
                    .then(() => {
                        // Expect the reaction to have null where the users reaction used to be
                        expect(reportActionsReactions).toHaveProperty(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`);
                        const reportActionReaction = reportActionsReactions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`];
                        expect(reportActionReaction?.[EMOJI.name].users[TEST_USER_ACCOUNT_ID]).toBeUndefined();
                    });
            });
    });

    it("shouldn't add the same reaction twice when changing preferred skin color and reaction doesn't support skin colors", () => {
        global.fetch = TestHelper.getGlobalFetchMock();

        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@test.com';
        const REPORT_ID = '1';
        const REPORT: OnyxTypes.Report = createRandomReport(1, undefined);
        const EMOJI_CODE = '😄';
        const EMOJI_NAME = 'smile';
        const EMOJI = {
            code: EMOJI_CODE,
            name: EMOJI_NAME,
        };

        let reportActions: OnyxTypes.ReportActions = {};
        Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
            callback: (val) => (reportActions = val ?? {}),
        });
        const reportActionsReactions: OnyxCollection<OnyxTypes.ReportActionReactions> = {};
        Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS,
            callback: (val, key) => {
                reportActionsReactions[key] = val ?? {};
            },
        });

        let resultAction: OnyxTypes.ReportAction | undefined;

        // Set up Onyx with some test user data
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)
            .then(() => {
                User.subscribeToUserEvents();
                return waitForBatchedUpdates();
            })
            .then(() => TestHelper.setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID))
            .then(() => {
                // This is a fire and forget response, but once it completes we should be able to verify that we
                // have an "optimistic" report action in Onyx.
                Report.addComment(REPORT, REPORT_ID, [], 'Testing a comment', CONST.DEFAULT_TIME_ZONE);
                return waitForBatchedUpdates();
            })
            .then(() => {
                resultAction = Object.values(reportActions).at(0);

                if (resultAction) {
                    // Add a reaction to the comment
                    Report.toggleEmojiReaction(REPORT_ID, resultAction, EMOJI, {}, CONST.EMOJI_DEFAULT_SKIN_TONE, TEST_USER_ACCOUNT_ID);
                }
                return waitForBatchedUpdates();
            })
            .then(() => {
                resultAction = Object.values(reportActions).at(0);

                // Now we toggle the reaction while the skin tone has changed.
                // As the emoji doesn't support skin tones, the emoji
                // should get removed instead of added again.
                const reportActionReaction = reportActionsReactions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${resultAction?.reportActionID}`];
                if (resultAction) {
                    Report.toggleEmojiReaction(REPORT_ID, resultAction, EMOJI, reportActionReaction, 2, TEST_USER_ACCOUNT_ID);
                }
                return waitForBatchedUpdates();
            })
            .then(() => {
                // Expect the reaction to have null where the users reaction used to be
                expect(reportActionsReactions).toHaveProperty(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${resultAction?.reportActionID}`);
                const reportActionReaction = reportActionsReactions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${resultAction?.reportActionID}`];
                expect(reportActionReaction?.[EMOJI.name].users[TEST_USER_ACCOUNT_ID]).toBeUndefined();
            });
    });

    it('should send only one OpenReport, replacing any extra ones with same reportIDs', async () => {
        global.fetch = TestHelper.getGlobalFetchMock();

        const REPORT_ID = '1';

        await Onyx.set(ONYXKEYS.NETWORK, {isOffline: true});
        await waitForBatchedUpdates();

        for (let i = 0; i < 5; i++) {
            Report.openReport(REPORT_ID, undefined, ['test@user.com'], {
                reportID: REPORT_ID,
            });
        }

        expect(PersistedRequests.getAll().length).toBe(1);

        await Onyx.set(ONYXKEYS.NETWORK, {isOffline: false});
        await waitForBatchedUpdates();

        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.OPEN_REPORT, 1);
    });

    it('openReport legacy preview fallback stores action under correct Onyx key and preserves existing actions', async () => {
        global.fetch = TestHelper.getGlobalFetchMock();

        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@user.com';
        const SELF_DM_ID = '555';
        const CHILD_REPORT_ID = '9999';
        const TXN_ID = 'txn_123';

        // Sign in and set personal details
        await TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
        await TestHelper.setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID);

        // Seed a self-DM report
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${SELF_DM_ID}`, {
            reportID: SELF_DM_ID,
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
        } as OnyxTypes.Report);

        // Seed an existing action in self DM to ensure MERGE does not overwrite
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${SELF_DM_ID}`, {
            123: {
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                message: [{type: 'COMMENT', html: 'Existing', text: 'Existing'}],
                reportActionID: '123',
                created: DateUtils.getDBTime(),
            },
        } as unknown as OnyxTypes.ReportActions);

        // Seed a legacy transaction (no parentReportActionID)
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TXN_ID}`, {
            transactionID: TXN_ID,
            amount: -101,
            currency: CONST.CURRENCY.USD,
            comment: {comment: 'Legacy expense'},
        } as unknown as OnyxTypes.Transaction);

        // Get the transaction object from Onyx
        const transaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${TXN_ID}` as const);
        expect(transaction).toBeTruthy();

        // Call openReport with transaction object to trigger the legacy preview flow
        Report.openReport(CHILD_REPORT_ID, undefined, [], undefined, undefined, false, [], undefined, false, transaction ?? undefined, undefined, SELF_DM_ID);
        await waitForBatchedUpdates();

        // Validate the correct Onyx key received the new action and existing one is preserved
        const selfDMActions = (await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${SELF_DM_ID}` as const)) as OnyxTypes.ReportActions | undefined;
        expect(selfDMActions).toBeTruthy();
        // Existing action still present
        expect(selfDMActions?.['123']).toBeTruthy();

        // Derive the created parentReportActionID from the self DM actions by finding the one that links to the child report
        const entries = Object.entries(selfDMActions ?? {}) as Array<[string, OnyxTypes.ReportAction]>;
        const createdEntry = entries.find((tuple): tuple is [string, OnyxTypes.ReportAction] => tuple?.[1]?.childReportID === CHILD_REPORT_ID);
        expect(createdEntry).toBeDefined();
        // Type guard for TS; the expect above will fail the test if undefined
        if (!createdEntry) {
            return;
        }
        const [parentReportActionID, createdAction] = createdEntry;
        expect(createdAction.childReportID).toBe(CHILD_REPORT_ID);

        // Ensure we did not create a stray concatenated key like reportActions_<selfDMReportID><generatedActionID>
        const wrongKeyValue = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${SELF_DM_ID}${parentReportActionID}` as const);
        expect(wrongKeyValue).toBeUndefined();

        // The API call should include moneyRequestPreviewReportActionID matching the created action
        TestHelper.expectAPICommandToHaveBeenCalledWith(WRITE_COMMANDS.OPEN_REPORT, 0, {
            reportID: CHILD_REPORT_ID,
            moneyRequestPreviewReportActionID: parentReportActionID,
        });
    });

    it('should replace duplicate OpenReport commands with the same reportID', async () => {
        global.fetch = TestHelper.getGlobalFetchMock();

        const REPORT_ID = '1';

        await Onyx.set(ONYXKEYS.NETWORK, {isOffline: true});
        await waitForBatchedUpdates();

        for (let i = 0; i < 8; i++) {
            let reportID = REPORT_ID;
            if (i > 4) {
                reportID = `${i}`;
            }
            Report.openReport(reportID, undefined, ['test@user.com'], {
                reportID: REPORT_ID,
            });
        }

        expect(PersistedRequests.getAll().length).toBe(4);

        await Onyx.set(ONYXKEYS.NETWORK, {isOffline: false});
        await waitForBatchedUpdates();

        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.OPEN_REPORT, 4);
    });

    it('should remove AddComment and UpdateComment without sending any request when DeleteComment is set', async () => {
        global.fetch = TestHelper.getGlobalFetchMock();

        const TEST_USER_ACCOUNT_ID = 1;
        const REPORT_ID = '1';
        const REPORT: OnyxTypes.Report = createRandomReport(1, undefined);
        const TEN_MINUTES_AGO = subMinutes(new Date(), 10);
        const created = format(addSeconds(TEN_MINUTES_AGO, 10), CONST.DATE.FNS_DB_FORMAT_STRING);

        Onyx.set(ONYXKEYS.NETWORK, {isOffline: true});

        Report.addComment(REPORT, REPORT_ID, [], 'Testing a comment', CONST.DEFAULT_TIME_ZONE);

        // Need the reportActionID to delete the comments
        const newComment = PersistedRequests.getAll().at(0);
        const reportActionID = newComment?.data?.reportActionID as string | undefined;
        const newReportAction = TestHelper.buildTestReportComment(created, TEST_USER_ACCOUNT_ID, reportActionID);
        const originalReport = {
            reportID: REPORT_ID,
        };

        const {result: ancestors, rerender} = renderHook(() => useAncestors(originalReport));
        Report.editReportComment(originalReport, newReportAction, ancestors.current, 'Testing an edited comment', undefined, undefined, '');

        await waitForBatchedUpdates();

        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.PERSISTED_REQUESTS,
                callback: (persistedRequests) => {
                    Onyx.disconnect(connection);

                    expect(persistedRequests?.at(0)?.command).toBe(WRITE_COMMANDS.ADD_COMMENT);
                    expect(persistedRequests?.at(1)?.command).toBeUndefined();

                    resolve();
                },
            });
        });

        // Checking the Report Action exists before deleting it
        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                callback: (reportActions) => {
                    Onyx.disconnect(connection);

                    const reportAction = reportActionID ? reportActions?.[reportActionID] : null;
                    expect(reportAction).not.toBeNull();
                    expect(reportAction?.reportActionID).toBe(reportActionID);
                    resolve();
                },
            });
        });

        rerender(originalReport);
        Report.deleteReportComment(REPORT_ID, newReportAction, ancestors.current, undefined, undefined, '');

        await waitForBatchedUpdates();
        expect(PersistedRequests.getAll().length).toBe(0);

        // Checking the Report Action doesn't exist after deleting it
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
            callback: (reportActions) => {
                Onyx.disconnect(connection);
                const reportAction = reportActionID ? reportActions?.[reportActionID] : undefined;
                expect(reportAction).toBeUndefined();
            },
        });

        Onyx.set(ONYXKEYS.NETWORK, {isOffline: false});
        await waitForBatchedUpdates();

        // Checking no requests were or will be made
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.ADD_COMMENT, 0);
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.UPDATE_COMMENT, 0);
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.DELETE_COMMENT, 0);
    });

    it('should remove AddComment and UpdateComment without sending any request when DeleteComment is set with currentUserEmail', async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        const TEST_USER_ACCOUNT_ID = 1;
        const REPORT_ID = '1';
        const REPORT: OnyxTypes.Report = createRandomReport(1, undefined);
        const created = format(addSeconds(subMinutes(new Date(), 10), 10), CONST.DATE.FNS_DB_FORMAT_STRING);

        Onyx.set(ONYXKEYS.NETWORK, {isOffline: true});
        Report.addComment(REPORT, REPORT_ID, [], 'Testing a comment', CONST.DEFAULT_TIME_ZONE);

        const reportActionID = PersistedRequests.getAll().at(0)?.data?.reportActionID as string | undefined;
        const newReportAction = TestHelper.buildTestReportComment(created, TEST_USER_ACCOUNT_ID, reportActionID);
        const originalReport = {reportID: REPORT_ID};
        const {result: ancestors, rerender} = renderHook(() => useAncestors(originalReport));

        const currentUserEmail = 'test@test.com';
        Report.editReportComment(originalReport, newReportAction, ancestors.current, 'Testing an edited comment', undefined, undefined, currentUserEmail);
        await waitForBatchedUpdates();

        const persistedRequests = await getOnyxValue(ONYXKEYS.PERSISTED_REQUESTS);
        expect(persistedRequests?.at(0)?.command).toBe(WRITE_COMMANDS.ADD_COMMENT);

        rerender(originalReport);
        Report.deleteReportComment(REPORT_ID, newReportAction, ancestors.current, undefined, undefined, currentUserEmail);
        await waitForBatchedUpdates();

        expect(PersistedRequests.getAll().length).toBe(0);
        Onyx.set(ONYXKEYS.NETWORK, {isOffline: false});
        await waitForBatchedUpdates();

        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.ADD_COMMENT, 0);
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.UPDATE_COMMENT, 0);
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.DELETE_COMMENT, 0);
    });

    it('should send DeleteComment request and remove UpdateComment accordingly', async () => {
        global.fetch = TestHelper.getGlobalFetchMock();

        const TEST_USER_ACCOUNT_ID = 1;
        const REPORT_ID = '1';
        const REPORT: OnyxTypes.Report = createRandomReport(1, undefined);
        const TEN_MINUTES_AGO = subMinutes(new Date(), 10);
        const created = format(addSeconds(TEN_MINUTES_AGO, 10), CONST.DATE.FNS_DB_FORMAT_STRING);

        await Onyx.set(ONYXKEYS.NETWORK, {isOffline: false});

        Report.addComment(REPORT, REPORT_ID, [], 'Testing a comment', CONST.DEFAULT_TIME_ZONE);

        // Need the reportActionID to delete the comments
        const newComment = PersistedRequests.getAll().at(1);
        const reportActionID = newComment?.data?.reportActionID as string | undefined;
        const reportAction = TestHelper.buildTestReportComment(created, TEST_USER_ACCOUNT_ID, reportActionID);

        await Onyx.set(ONYXKEYS.NETWORK, {isOffline: true});

        const originalReport = {
            reportID: REPORT_ID,
        };
        const {result: ancestors, rerender} = renderHook(() => useAncestors(originalReport));

        Report.editReportComment(originalReport, reportAction, ancestors.current, 'Testing an edited comment', undefined, undefined, '');

        await waitForBatchedUpdates();

        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.PERSISTED_REQUESTS,
                callback: (persistedRequests) => {
                    Onyx.disconnect(connection);
                    expect(persistedRequests?.at(0)?.command).toBe(WRITE_COMMANDS.UPDATE_COMMENT);
                    resolve();
                },
            });
        });

        rerender(originalReport);
        Report.deleteReportComment(REPORT_ID, reportAction, ancestors.current, undefined, undefined, '');

        await waitForBatchedUpdates();
        expect(PersistedRequests.getAll().length).toBe(1);

        Onyx.set(ONYXKEYS.NETWORK, {isOffline: false});
        await waitForBatchedUpdates();

        // Checking no requests were or will be made
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.ADD_COMMENT, 1);
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.UPDATE_COMMENT, 0);
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.DELETE_COMMENT, 1);
    });

    it('should send DeleteComment request after AddComment is rollback', async () => {
        global.fetch = jest.fn().mockRejectedValue(new TypeError(CONST.ERROR.FAILED_TO_FETCH));

        const mockedXhr = jest.fn();
        mockedXhr.mockImplementation(originalXHR);

        HttpUtils.xhr = mockedXhr;
        await waitForBatchedUpdates();
        const TEST_USER_ACCOUNT_ID = 1;
        const REPORT_ID = '1';
        const REPORT: OnyxTypes.Report = createRandomReport(1, undefined);
        const TEN_MINUTES_AGO = subMinutes(new Date(), 10);
        const created = format(addSeconds(TEN_MINUTES_AGO, 10), CONST.DATE.FNS_DB_FORMAT_STRING);

        Report.addComment(REPORT, REPORT_ID, [], 'Testing a comment', CONST.DEFAULT_TIME_ZONE);
        await waitForNetworkPromises();

        expect(PersistedRequests.getAll().length).toBe(1);
        expect(PersistedRequests.getAll().at(0)?.isRollback).toBeTruthy();
        const newComment = PersistedRequests.getAll().at(1);
        const reportActionID = newComment?.data?.reportActionID as string | undefined;
        const reportAction = TestHelper.buildTestReportComment(created, TEST_USER_ACCOUNT_ID, reportActionID);

        await waitForBatchedUpdates();
        HttpUtils.xhr = mockedXhr
            .mockImplementationOnce(() =>
                Promise.resolve({
                    jsonCode: CONST.JSON_CODE.EXP_ERROR,
                }),
            )
            .mockImplementation(() =>
                Promise.resolve({
                    jsonCode: CONST.JSON_CODE.SUCCESS,
                }),
            );

        Report.deleteReportComment(REPORT_ID, reportAction, [], undefined, undefined, '');

        jest.runOnlyPendingTimers();
        await waitForBatchedUpdates();

        const httpCalls = (HttpUtils.xhr as Mock).mock.calls;

        const addCommentCalls = httpCalls.filter(([command]) => command === 'AddComment');
        const deleteCommentCalls = httpCalls.filter(([command]) => command === 'DeleteComment');

        if (httpCalls.length === 3) {
            expect(addCommentCalls).toHaveLength(2);
            expect(deleteCommentCalls).toHaveLength(1);
        }
    });

    it('should send not DeleteComment request and remove AddAttachment accordingly', async () => {
        global.fetch = TestHelper.getGlobalFetchMock();

        const TEST_USER_ACCOUNT_ID = 1;
        const REPORT_ID = '1';
        const TEN_MINUTES_AGO = subMinutes(new Date(), 10);
        const created = format(addSeconds(TEN_MINUTES_AGO, 10), CONST.DATE.FNS_DB_FORMAT_STRING);

        await Onyx.set(ONYXKEYS.NETWORK, {isOffline: true});

        const file = new File([''], 'test.txt', {type: 'text/plain'});
        const REPORT: OnyxTypes.Report = createRandomReport(1, undefined);
        Report.addAttachmentWithComment(REPORT, REPORT_ID, [], file);

        // Need the reportActionID to delete the comments
        const newComment = PersistedRequests.getAll().at(0);
        const reportActionID = newComment?.data?.reportActionID as string | undefined;
        const newReportAction = TestHelper.buildTestReportComment(created, TEST_USER_ACCOUNT_ID, reportActionID);

        // wait for Onyx.connect execute the callback and start processing the queue
        await waitForBatchedUpdates();

        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.PERSISTED_REQUESTS,
                callback: (persistedRequests) => {
                    Onyx.disconnect(connection);
                    expect(persistedRequests?.at(0)?.command).toBe(WRITE_COMMANDS.ADD_ATTACHMENT);
                    resolve();
                },
            });
        });

        // Checking the Report Action exists before deleting it
        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                callback: (reportActions) => {
                    Onyx.disconnect(connection);
                    const reportAction = reportActionID ? reportActions?.[reportActionID] : null;
                    expect(reportAction).not.toBeNull();
                    expect(reportAction?.reportActionID).toBe(reportActionID);
                    resolve();
                },
            });
        });

        Report.deleteReportComment(REPORT_ID, newReportAction, [], undefined, undefined, '');

        await waitForBatchedUpdates();
        expect(PersistedRequests.getAll().length).toBe(0);

        // Checking the Report Action doesn't exist after deleting it
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
            callback: (reportActions) => {
                Onyx.disconnect(connection);
                const reportAction = reportActionID ? reportActions?.[reportActionID] : undefined;
                expect(reportAction).toBeUndefined();
            },
        });

        Onyx.set(ONYXKEYS.NETWORK, {isOffline: false});
        await waitForBatchedUpdates();

        // Checking no requests were or will be made
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.ADD_ATTACHMENT, 0);
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.DELETE_COMMENT, 0);
    });

    it('should send not DeleteComment request and remove AddTextAndAttachment accordingly', async () => {
        global.fetch = TestHelper.getGlobalFetchMock();

        const TEST_USER_ACCOUNT_ID = 1;
        const REPORT_ID = '1';
        const TEN_MINUTES_AGO = subMinutes(new Date(), 10);
        const created = format(addSeconds(TEN_MINUTES_AGO, 10), CONST.DATE.FNS_DB_FORMAT_STRING);
        const file = new File([''], 'test.txt', {type: 'text/plain'});

        await Onyx.set(ONYXKEYS.NETWORK, {isOffline: true});

        const REPORT: OnyxTypes.Report = createRandomReport(1, undefined);
        Report.addAttachmentWithComment(REPORT, REPORT_ID, [], file, 'Attachment with comment');

        // Need the reportActionID to delete the comments
        const newComment = PersistedRequests.getAll().at(0);
        const reportActionID = newComment?.data?.reportActionID as string | undefined;
        const newReportAction = TestHelper.buildTestReportComment(created, TEST_USER_ACCOUNT_ID, reportActionID);

        // wait for Onyx.connect execute the callback and start processing the queue
        await waitForBatchedUpdates();

        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.PERSISTED_REQUESTS,
                callback: (persistedRequests) => {
                    Onyx.disconnect(connection);
                    expect(persistedRequests?.at(0)?.command).toBe(WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT);
                    resolve();
                },
            });
        });

        // Checking the Report Action exists before deleting it
        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                callback: (reportActions) => {
                    Onyx.disconnect(connection);
                    const reportAction = reportActionID ? reportActions?.[reportActionID] : null;
                    expect(reportAction).not.toBeNull();
                    expect(reportAction?.reportActionID).toBe(reportActionID);
                    resolve();
                },
            });
        });

        Report.deleteReportComment(REPORT_ID, newReportAction, [], undefined, undefined, '');

        await waitForBatchedUpdates();
        expect(PersistedRequests.getAll().length).toBe(0);

        // Checking the Report Action doesn't exist after deleting it
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
            callback: (reportActions) => {
                Onyx.disconnect(connection);
                const reportAction = reportActionID ? reportActions?.[reportActionID] : undefined;
                expect(reportAction).toBeUndefined();
            },
        });

        Onyx.set(ONYXKEYS.NETWORK, {isOffline: false});
        await waitForBatchedUpdates();

        // Checking no requests were or will be made
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT, 0);
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.DELETE_COMMENT, 0);
    });

    it('should post text + attachment as first action then attachment only for remaining attachments when adding multiple attachments with a comment', async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        const playSoundMock = playSound as jest.MockedFunction<typeof playSound>;
        await Onyx.set(ONYXKEYS.NETWORK, {isOffline: true});
        await waitForBatchedUpdates();

        const relevantPromise = new Promise((resolve) => {
            const conn = Onyx.connect({
                key: ONYXKEYS.PERSISTED_REQUESTS,
                callback: (persisted) => {
                    const relevant = (persisted ?? []).filter((r) => r?.command === WRITE_COMMANDS.ADD_ATTACHMENT || r?.command === WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT);
                    if (relevant.length >= 3) {
                        Onyx.disconnect(conn);
                        resolve(relevant);
                    }
                },
            });
        });

        const REPORT_ID = '1';
        const shouldPlaySound = true;
        const fileA = new File(['a'], 'a.txt', {type: 'text/plain'});
        const fileB = new File(['b'], 'b.txt', {type: 'text/plain'});
        const fileC = new File(['c'], 'c.txt', {type: 'text/plain'});

        const REPORT: OnyxTypes.Report = createRandomReport(1, undefined);
        Report.addAttachmentWithComment(REPORT, REPORT_ID, [], [fileA, fileB, fileC], 'Hello world', CONST.DEFAULT_TIME_ZONE, shouldPlaySound);
        const relevant = (await relevantPromise) as OnyxTypes.Request[];

        expect(playSoundMock).toHaveBeenCalledTimes(1);
        expect(playSoundMock).toHaveBeenCalledWith(SOUNDS.DONE);
        expect(relevant.at(0)?.command).toBe(WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT);
        expect(relevant.slice(1).every((r) => r.command === WRITE_COMMANDS.ADD_ATTACHMENT)).toBe(true);
    });

    it('should create attachment only actions when adding multiple attachments without a comment', async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        const playSoundMock = playSound as jest.MockedFunction<typeof playSound>;
        await Onyx.set(ONYXKEYS.NETWORK, {isOffline: true});
        await waitForBatchedUpdates();

        const relevantPromise = new Promise((resolve) => {
            const conn = Onyx.connect({
                key: ONYXKEYS.PERSISTED_REQUESTS,
                callback: (persisted) => {
                    const relevant = (persisted ?? []).filter((r) => r?.command === WRITE_COMMANDS.ADD_ATTACHMENT || r?.command === WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT);
                    if (relevant.length >= 2) {
                        Onyx.disconnect(conn);
                        resolve(relevant);
                    }
                },
            });
        });

        const REPORT_ID = '1';
        const shouldPlaySound = true;
        const fileA = new File(['a'], 'a.txt', {type: 'text/plain'});
        const fileB = new File(['b'], 'b.txt', {type: 'text/plain'});

        const REPORT: OnyxTypes.Report = createRandomReport(1, undefined);
        Report.addAttachmentWithComment(REPORT, REPORT_ID, [], [fileA, fileB], undefined, CONST.DEFAULT_TIME_ZONE, shouldPlaySound);
        const relevant = (await relevantPromise) as OnyxTypes.Request[];

        expect(playSoundMock).toHaveBeenCalledTimes(1);
        expect(playSoundMock).toHaveBeenCalledWith(SOUNDS.DONE);
        expect(relevant.at(0)?.command).toBe(WRITE_COMMANDS.ADD_ATTACHMENT);
        expect(relevant.slice(1).every((r) => r.command === WRITE_COMMANDS.ADD_ATTACHMENT)).toBe(true);
        expect(relevant.some((r) => r.command === WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT)).toBe(false);
    });

    it('should create attachment only action & not play sound when adding attachment without a comment & shouldPlaySound not passed', async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        const playSoundMock = playSound as jest.MockedFunction<typeof playSound>;
        await Onyx.set(ONYXKEYS.NETWORK, {isOffline: true});
        await waitForBatchedUpdates();

        const relevantPromise = new Promise((resolve) => {
            const conn = Onyx.connect({
                key: ONYXKEYS.PERSISTED_REQUESTS,
                callback: (persisted) => {
                    const relevant = (persisted ?? []).filter((r) => r?.command === WRITE_COMMANDS.ADD_ATTACHMENT);
                    if (relevant.length >= 1) {
                        Onyx.disconnect(conn);
                        resolve(relevant);
                    }
                },
            });
        });

        const REPORT_ID = '1';
        const file = new File(['a'], 'a.txt', {type: 'text/plain'});

        const REPORT: OnyxTypes.Report = createRandomReport(1, undefined);
        Report.addAttachmentWithComment(REPORT, REPORT_ID, [], file);
        const relevant = (await relevantPromise) as OnyxTypes.Request[];

        expect(playSoundMock).toHaveBeenCalledTimes(0);
        expect(relevant.at(0)?.command).toBe(WRITE_COMMANDS.ADD_ATTACHMENT);
    });

    it('should not send DeleteComment request and remove any Reactions accordingly', async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        jest.doMock('@libs/EmojiUtils', () => ({
            ...jest.requireActual('@libs/EmojiUtils'),
            hasAccountIDEmojiReacted: jest.fn(() => true),
        }));
        const TEST_USER_ACCOUNT_ID = 1;
        const REPORT_ID = '1';
        const REPORT: OnyxTypes.Report = createRandomReport(1, undefined);
        const TEN_MINUTES_AGO = subMinutes(new Date(), 10);
        const created = format(addSeconds(TEN_MINUTES_AGO, 10), CONST.DATE.FNS_DB_FORMAT_STRING);

        await Onyx.set(ONYXKEYS.NETWORK, {isOffline: true});
        await Promise.resolve();

        Report.addComment(REPORT, REPORT_ID, [], 'reactions with comment', CONST.DEFAULT_TIME_ZONE);

        // Need the reportActionID to delete the comments
        const newComment = PersistedRequests.getAll().at(0);
        const reportActionID = newComment?.data?.reportActionID as string | undefined;
        const newReportAction = TestHelper.buildTestReportComment(created, TEST_USER_ACCOUNT_ID, reportActionID);

        await waitForBatchedUpdates();

        Report.toggleEmojiReaction(REPORT_ID, newReportAction, {name: 'smile', code: '😄'}, {}, CONST.EMOJI_DEFAULT_SKIN_TONE, TEST_USER_ACCOUNT_ID);
        Report.toggleEmojiReaction(
            REPORT_ID,
            newReportAction,
            {name: 'smile', code: '😄'},
            {
                smile: {
                    createdAt: '2024-10-14 14:58:12',
                    oldestTimestamp: '2024-10-14 14:58:12',
                    users: {
                        [`${TEST_USER_ACCOUNT_ID}`]: {
                            id: `${TEST_USER_ACCOUNT_ID}`,
                            oldestTimestamp: '2024-10-14 14:58:12',
                            skinTones: {
                                '-1': '2024-10-14 14:58:12',
                            },
                        },
                    },
                },
            },
            CONST.EMOJI_DEFAULT_SKIN_TONE,
            TEST_USER_ACCOUNT_ID,
        );

        await waitForBatchedUpdates();

        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.PERSISTED_REQUESTS,
                callback: (persistedRequests) => {
                    Onyx.disconnect(connection);
                    expect(persistedRequests?.at(0)?.command).toBe(WRITE_COMMANDS.ADD_COMMENT);
                    expect(persistedRequests?.at(1)?.command).toBe(WRITE_COMMANDS.ADD_EMOJI_REACTION);
                    expect(persistedRequests?.at(2)?.command).toBe(WRITE_COMMANDS.REMOVE_EMOJI_REACTION);
                    resolve();
                },
            });
        });

        // Checking the Report Action exists before deleting it
        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                callback: (reportActions) => {
                    Onyx.disconnect(connection);
                    const reportAction = reportActionID ? reportActions?.[reportActionID] : null;
                    expect(reportAction).not.toBeNull();
                    expect(reportAction?.reportActionID).toBe(reportActionID);
                    resolve();
                },
            });
        });

        Report.deleteReportComment(REPORT_ID, newReportAction, [], undefined, undefined, '');

        await waitForBatchedUpdates();
        expect(PersistedRequests.getAll().length).toBe(0);

        // Checking the Report Action doesn't exist after deleting it
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
            callback: (reportActions) => {
                Onyx.disconnect(connection);
                const reportAction = reportActionID ? reportActions?.[reportActionID] : undefined;
                expect(reportAction).toBeUndefined();
            },
        });

        Onyx.set(ONYXKEYS.NETWORK, {isOffline: false});
        await waitForBatchedUpdates();

        // Checking no requests were or will be made
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.ADD_COMMENT, 0);
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.ADD_EMOJI_REACTION, 0);
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.REMOVE_EMOJI_REACTION, 0);
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.DELETE_COMMENT, 0);
    });

    it('should send DeleteComment request and remove any Reactions accordingly', async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        jest.doMock('@libs/EmojiUtils', () => ({
            ...jest.requireActual('@libs/EmojiUtils'),
            hasAccountIDEmojiReacted: jest.fn(() => true),
        }));
        const TEST_USER_ACCOUNT_ID = 1;
        const REPORT_ID = '1';
        const REPORT: OnyxTypes.Report = createRandomReport(1, undefined);
        const TEN_MINUTES_AGO = subMinutes(new Date(), 10);
        const created = format(addSeconds(TEN_MINUTES_AGO, 10), CONST.DATE.FNS_DB_FORMAT_STRING);

        Report.addComment(REPORT, REPORT_ID, [], 'Attachment with comment', CONST.DEFAULT_TIME_ZONE);

        // Need the reportActionID to delete the comments
        const newComment = PersistedRequests.getAll().at(0);
        const reportActionID = newComment?.data?.reportActionID as string | undefined;
        const reportAction = TestHelper.buildTestReportComment(created, TEST_USER_ACCOUNT_ID, reportActionID);
        await Onyx.set(ONYXKEYS.NETWORK, {isOffline: true});

        // wait for Onyx.connect execute the callback and start processing the queue
        await Promise.resolve();

        Report.toggleEmojiReaction(REPORT_ID, reportAction, {name: 'smile', code: '😄'}, {}, CONST.EMOJI_DEFAULT_SKIN_TONE, TEST_USER_ACCOUNT_ID);
        Report.toggleEmojiReaction(
            REPORT_ID,
            reportAction,
            {name: 'smile', code: '😄'},
            {
                smile: {
                    createdAt: '2024-10-14 14:58:12',
                    oldestTimestamp: '2024-10-14 14:58:12',
                    users: {
                        [`${TEST_USER_ACCOUNT_ID}`]: {
                            id: `${TEST_USER_ACCOUNT_ID}`,
                            oldestTimestamp: '2024-10-14 14:58:12',
                            skinTones: {
                                '-1': '2024-10-14 14:58:12',
                            },
                        },
                    },
                },
            },
            CONST.EMOJI_DEFAULT_SKIN_TONE,
            TEST_USER_ACCOUNT_ID,
        );

        await waitForBatchedUpdates();
        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.PERSISTED_REQUESTS,
                callback: (persistedRequests) => {
                    Onyx.disconnect(connection);
                    expect(persistedRequests?.at(0)?.command).toBe(WRITE_COMMANDS.ADD_EMOJI_REACTION);
                    expect(persistedRequests?.at(1)?.command).toBe(WRITE_COMMANDS.REMOVE_EMOJI_REACTION);
                    resolve();
                },
            });
        });

        Report.deleteReportComment(REPORT_ID, reportAction, [], undefined, undefined, '');

        await waitForBatchedUpdates();
        expect(PersistedRequests.getAll().length).toBe(1);

        Onyx.set(ONYXKEYS.NETWORK, {isOffline: false});
        await waitForBatchedUpdates();

        // Checking no requests were or will be made
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.ADD_COMMENT, 1);
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.ADD_EMOJI_REACTION, 0);
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.REMOVE_EMOJI_REACTION, 0);
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.DELETE_COMMENT, 1);
    });

    it('should create and delete thread processing all the requests', async () => {
        global.fetch = TestHelper.getGlobalFetchMock();

        const TEST_USER_ACCOUNT_ID = 1;
        const REPORT_ID = '1';
        const REPORT: OnyxTypes.Report = createRandomReport(1, undefined);
        const TEN_MINUTES_AGO = subMinutes(new Date(), 10);
        const created = format(addSeconds(TEN_MINUTES_AGO, 10), CONST.DATE.FNS_DB_FORMAT_STRING);

        await Onyx.set(ONYXKEYS.NETWORK, {isOffline: true});
        await waitForBatchedUpdates();

        Report.addComment(REPORT, REPORT_ID, [], 'Testing a comment', CONST.DEFAULT_TIME_ZONE);

        const newComment = PersistedRequests.getAll().at(0);
        const reportActionID = newComment?.data?.reportActionID as string | undefined;
        const reportAction = TestHelper.buildTestReportComment(created, TEST_USER_ACCOUNT_ID, reportActionID);

        Report.openReport(
            REPORT_ID,
            undefined,
            ['test@user.com'],
            {
                parentReportID: REPORT_ID,
                parentReportActionID: reportActionID,
                reportID: '2',
            },
            reportActionID,
        );

        await waitForBatchedUpdates();

        const {result: ancestors} = renderHook(() => useAncestors({reportID: REPORT_ID}));

        Report.deleteReportComment(REPORT_ID, reportAction, ancestors.current, undefined, undefined, '');

        expect(PersistedRequests.getAll().length).toBe(3);

        await waitForBatchedUpdates();

        const persistedRequests = await OnyxUtils.get(ONYXKEYS.PERSISTED_REQUESTS);
        expect(persistedRequests?.at(0)?.command).toBe(WRITE_COMMANDS.ADD_COMMENT);
        expect(persistedRequests?.at(1)?.command).toBe(WRITE_COMMANDS.OPEN_REPORT);
        expect(persistedRequests?.at(2)?.command).toBe(WRITE_COMMANDS.DELETE_COMMENT);

        Onyx.set(ONYXKEYS.NETWORK, {isOffline: false});
        await waitForBatchedUpdates();

        // Checking no requests were or will be made
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.ADD_COMMENT, 1);
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.OPEN_REPORT, 1);
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.DELETE_COMMENT, 1);
    });

    it('should update AddComment text with the UpdateComment text, sending just an AddComment request', async () => {
        global.fetch = TestHelper.getGlobalFetchMock();

        const TEST_USER_ACCOUNT_ID = 1;
        const REPORT_ID = '1';
        const REPORT: OnyxTypes.Report = createRandomReport(1, undefined);
        const TEN_MINUTES_AGO = subMinutes(new Date(), 10);
        const created = format(addSeconds(TEN_MINUTES_AGO, 10), CONST.DATE.FNS_DB_FORMAT_STRING);

        Onyx.set(ONYXKEYS.NETWORK, {isOffline: true});

        Report.addComment(REPORT, REPORT_ID, [], 'Testing a comment', CONST.DEFAULT_TIME_ZONE);
        // Need the reportActionID to delete the comments
        const newComment = PersistedRequests.getAll().at(0);
        const reportActionID = newComment?.data?.reportActionID as string | undefined;
        const reportAction = TestHelper.buildTestReportComment(created, TEST_USER_ACCOUNT_ID, reportActionID);
        const originalReport = {
            reportID: REPORT_ID,
        };
        Report.editReportComment(originalReport, reportAction, [], 'Testing an edited comment', undefined, undefined, '');

        await waitForBatchedUpdates();

        const persistedRequests = await OnyxUtils.get(ONYXKEYS.PERSISTED_REQUESTS);

        expect(persistedRequests?.at(0)?.command).toBe(WRITE_COMMANDS.ADD_COMMENT);

        await waitForBatchedUpdates();
        expect(PersistedRequests.getAll().length).toBe(1);

        Onyx.set(ONYXKEYS.NETWORK, {isOffline: false});
        await waitForBatchedUpdates();

        // Checking no requests were or will be made
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.ADD_COMMENT, 1);
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.UPDATE_COMMENT, 0);
    });

    it('it should only send the last sequential UpdateComment request to BE', async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        const reportID = '123';

        await Onyx.set(ONYXKEYS.NETWORK, {isOffline: true});

        const action: OnyxEntry<OnyxTypes.ReportAction> = {
            reportID,
            reportActionID: '722',
            actionName: 'ADDCOMMENT',
            created: '2024-10-21 10:37:59.881',
        };

        const originalReport = {
            reportID,
        };

        const {result: ancestors} = renderHook(() => useAncestors(originalReport));

        Report.editReportComment(originalReport, action, ancestors.current, 'value1', undefined, undefined, '');
        Report.editReportComment(originalReport, action, ancestors.current, 'value2', undefined, undefined, '');
        Report.editReportComment(originalReport, action, ancestors.current, 'value3', undefined, undefined, '');

        const requests = PersistedRequests?.getAll();

        expect(requests.length).toBe(1);
        expect(requests?.at(0)?.command).toBe(WRITE_COMMANDS.UPDATE_COMMENT);
        expect(requests?.at(0)?.data?.reportComment).toBe('value3');

        await Onyx.set(ONYXKEYS.NETWORK, {isOffline: false});

        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.UPDATE_COMMENT, 1);
    });

    it('should convert short mentions to full format when editing comments', async () => {
        global.fetch = TestHelper.getGlobalFetchMock();

        const TEST_USER_LOGIN = 'alice@expensify.com';
        const TEST_USER_ACCOUNT_ID = 1;
        const MENTIONED_USER_ACCOUNT_ID = 2;
        const MENTIONED_USER_LOGIN = 'bob@expensify.com';
        const REPORT_ID = '1';
        const REPORT: OnyxTypes.Report = createRandomReport(1, undefined);

        const TEN_MINUTES_AGO = subMinutes(new Date(), 10);
        const created = format(addSeconds(TEN_MINUTES_AGO, 10), CONST.DATE.FNS_DB_FORMAT_STRING);

        // Set up personal details with private domain users
        await TestHelper.setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID);
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [MENTIONED_USER_ACCOUNT_ID]: {
                accountID: MENTIONED_USER_ACCOUNT_ID,
                login: MENTIONED_USER_LOGIN,
                displayName: 'Bob',
            },
        });

        await Onyx.set(ONYXKEYS.NETWORK, {isOffline: true});

        Report.addComment(REPORT, REPORT.reportID, [], 'Initial comment', CONST.DEFAULT_TIME_ZONE);

        // Get the reportActionID to edit and delete the comment
        const newComment = PersistedRequests.getAll().at(0);
        const reportActionID = newComment?.data?.reportActionID as string | undefined;
        const newReportAction = TestHelper.buildTestReportComment(created, TEST_USER_ACCOUNT_ID, reportActionID);
        const originalReport = {
            reportID: REPORT_ID,
        };

        const {result: ancestors} = renderHook(() => useAncestors(originalReport));

        // Edit the comment to add a short mention
        Report.editReportComment(originalReport, newReportAction, ancestors.current, 'Initial comment with @bob', undefined, undefined, TEST_USER_LOGIN);

        await waitForBatchedUpdates();

        // Verify the mention was converted in the edited comment
        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                callback: (reportActions) => {
                    Onyx.disconnect(connection);

                    const reportAction = reportActionID ? reportActions?.[reportActionID] : null;
                    const message = reportAction?.message;
                    const editedMessage = Array.isArray(message) && message.length > 0 ? message.at(0)?.html : undefined;
                    // Verify the mention was converted to full mention with domain
                    expect(editedMessage).toContain('<mention-user>@bob@expensify.com</mention-user>');
                    expect(editedMessage).toBe('Initial comment with <mention-user>@bob@expensify.com</mention-user>');
                    resolve();
                },
            });
        });
        await Onyx.set(ONYXKEYS.NETWORK, {isOffline: false});
        await waitForBatchedUpdates();
    });

    it('it should only send the last sequential UpdateComment request to BE with currentUserLogin', async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        await Onyx.set(ONYXKEYS.NETWORK, {isOffline: true});

        const action: OnyxEntry<OnyxTypes.ReportAction> = {
            reportID: '123',
            reportActionID: '722',
            actionName: 'ADDCOMMENT',
            created: '2024-10-21 10:37:59.881',
        };
        const originalReport = {reportID: '123'};
        const {result: ancestors} = renderHook(() => useAncestors(originalReport));
        const currentUserEmail = 'user@test.com';

        Report.editReportComment(originalReport, action, ancestors.current, 'value1', undefined, undefined, currentUserEmail);
        Report.editReportComment(originalReport, action, ancestors.current, 'value2', undefined, undefined, currentUserEmail);
        Report.editReportComment(originalReport, action, ancestors.current, 'value3', undefined, undefined, currentUserEmail);

        const requests = PersistedRequests?.getAll();
        expect(requests.length).toBe(1);
        expect(requests?.at(0)?.command).toBe(WRITE_COMMANDS.UPDATE_COMMENT);
        expect(requests?.at(0)?.data?.reportComment).toBe('value3');

        await Onyx.set(ONYXKEYS.NETWORK, {isOffline: false});
        TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.UPDATE_COMMENT, 1);
    });

    it('should clears lastMentionedTime when all mentions to the current user are deleted', async () => {
        const reportID = '1';
        const mentionActionID = '1';
        const mentionActionID2 = '2';
        const currentUserAccountID = 123;

        const mentionAction = {
            ...createRandomReportAction(Number(mentionActionID)),
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            originalMessage: {
                mentionedAccountIDs: [currentUserAccountID],
            },
        } as OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT>;

        const mentionAction2 = {
            ...createRandomReportAction(Number(mentionActionID2)),
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            originalMessage: {
                mentionedAccountIDs: [currentUserAccountID],
            },
        } as OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT>;

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
            [mentionActionID]: mentionAction,
            [mentionActionID2]: mentionAction2,
        });

        let report = {
            ...createRandomReport(Number(reportID), undefined),
            lastMentionedTime: mentionAction2.created,
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);

        await waitForBatchedUpdates();

        const {result: ancestors} = renderHook(() => useAncestors(report));

        Report.deleteReportComment(reportID, mentionAction, ancestors.current, undefined, undefined, '');
        Report.deleteReportComment(reportID, mentionAction2, ancestors.current, undefined, undefined, '');

        await waitForBatchedUpdates();

        report = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

        expect(report?.lastMentionedTime).toBeUndefined();
    });

    it('should create new report and "create report" quick action, when createNewReport gets called', async () => {
        const accountID = 1234;
        const policyID = '5678';
        const mockFetchData = fetch as MockFetch;
        // Given a policy with harvesting is disabled
        const policy = {
            ...createRandomPolicy(Number(policyID)),
            isPolicyExpenseChatEnabled: true,
            type: CONST.POLICY.TYPE.TEAM,
            autoReporting: false,
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
            harvesting: {
                enabled: false,
            },
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);

        mockFetchData.pause();
        const {reportID} = Report.createNewReport({accountID}, true, false, policy);
        const parentReport = ReportUtils.getPolicyExpenseChat(accountID, policyID);

        const reportPreviewAction = await new Promise<OnyxEntry<OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>>>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReport?.reportID}`,
                callback: (reportActions) => {
                    Onyx.disconnect(connection);
                    const action = Object.values(reportActions ?? {}).at(0);
                    resolve(action as OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>);
                },
            });
        });
        expect(getOriginalMessage(reportPreviewAction)?.linkedReportID).toBe(reportID);
        expect(reportPreviewAction?.actorAccountID).toBe(accountID);

        await waitForBatchedUpdates();

        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.COLLECTION.REPORT,
                waitForCollectionCallback: true,
                callback: (reports) => {
                    Onyx.disconnect(connection);
                    const createdReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
                    const parentPolicyExpenseChat = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReport?.reportID}`];
                    // assert correctness of crucial onyx data
                    expect(createdReport?.reportID).toBe(reportID);
                    expect(parentPolicyExpenseChat?.hasOutstandingChildRequest).toBe(true);
                    expect(createdReport?.total).toBe(0);
                    expect(createdReport?.parentReportActionID).toBe(reportPreviewAction?.reportActionID);

                    resolve();
                },
            });
        });

        // When the request fails
        mockFetchData.fail();
        await mockFetchData.resume();
        await waitForBatchedUpdates();

        // Then the onyx data should be reverted to the state before the request
        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.COLLECTION.REPORT,
                waitForCollectionCallback: true,
                callback: (reports) => {
                    Onyx.disconnect(connection);
                    const parentPolicyExpenseChat = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReport?.reportID}`];
                    expect(parentPolicyExpenseChat?.hasOutstandingChildRequest).toBe(parentReport?.hasOutstandingChildRequest);

                    resolve();
                },
            });
        });
    });

    it('should set hasOnceLoadedReportActions for parent report metadata when creating a new report', async () => {
        const accountID = 1234;
        const policyID = '5678';
        const mockFetchData = fetch as MockFetch;
        const policy = {
            ...createRandomPolicy(Number(policyID)),
            isPolicyExpenseChatEnabled: true,
            type: CONST.POLICY.TYPE.TEAM,
            harvesting: {
                enabled: false,
            },
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);

        mockFetchData.pause();
        Report.createNewReport({accountID}, true, false, policy);
        const parentReport = ReportUtils.getPolicyExpenseChat(accountID, policyID);

        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${parentReport?.reportID}`,
                callback: (metadata) => {
                    if (!metadata?.hasOnceLoadedReportActions) {
                        return;
                    }
                    Onyx.disconnect(connection);
                    expect(metadata.hasOnceLoadedReportActions).toBe(true);
                    resolve();
                },
            });
        });
    });

    it('should not optimistic outstandingChildRequest when create report with harvesting is enabled', async () => {
        const accountID = 1234;
        const policyID = '5678';
        // Given a policy with harvesting is enabled
        const policy = {
            ...createRandomPolicy(Number(policyID)),
            isPolicyExpenseChatEnabled: true,
            type: CONST.POLICY.TYPE.TEAM,
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
            harvesting: {
                enabled: true,
            },
        };
        const parentReport = ReportUtils.getPolicyExpenseChat(accountID, policyID);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
        if (parentReport?.reportID) {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentReport?.reportID}`, parentReport);
        }

        // When create new report
        Report.createNewReport({accountID}, true, false, policy);

        // Then the parent report's hasOutstandingChildRequest property should remain unchanged
        await new Promise<void>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.COLLECTION.REPORT,
                waitForCollectionCallback: true,
                callback: (reports) => {
                    Onyx.disconnect(connection);
                    const parentPolicyExpenseChat = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReport?.reportID}`];
                    expect(parentPolicyExpenseChat?.hasOutstandingChildRequest).toBe(parentReport?.hasOutstandingChildRequest);

                    resolve();
                },
            });
        });
    });

    it('should add the report preview action to the chat snapshot when it is created', async () => {
        jest.spyOn(require('@src/libs/SearchQueryUtils'), 'getCurrentSearchQueryJSON').mockImplementationOnce(
            () =>
                ({
                    hash: currentHash,
                    query: 'test',
                    type: CONST.SEARCH.DATA_TYPES.CHAT,
                    status: '',
                    flatFilters: [],
                }) as unknown as SearchQueryJSON,
        );
        const accountID = 1234;
        const policyID = '5678';

        const policy = {
            ...createRandomPolicy(Number(policyID)),
            isPolicyExpenseChatEnabled: true,
            type: CONST.POLICY.TYPE.TEAM,
            autoReporting: false,
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
            harvesting: {
                enabled: false,
            },
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);

        const {reportID} = Report.createNewReport({accountID}, true, false, policy);
        const parentReport = ReportUtils.getPolicyExpenseChat(accountID, policyID);

        await waitForBatchedUpdates();

        await new Promise((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentHash}`,
                callback: (snapshot) => {
                    Onyx.disconnect(connection);
                    expect(snapshot?.data?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReport?.reportID}`]).toBeTruthy();
                    expect(snapshot?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReport?.reportID}`]).toBeTruthy();
                    expect(snapshot?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]).toBeTruthy();
                    resolve(null);
                },
            });
        });
    });

    describe('completeOnboarding', () => {
        const TEST_USER_LOGIN = 'test@gmail.com';
        const TEST_USER_ACCOUNT_ID = 1;
        global.fetch = TestHelper.getGlobalFetchMock();

        it('should set "isOptimisticAction" to false/null for all actions in admins report after completing onboarding setup', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: TEST_USER_LOGIN, accountID: TEST_USER_ACCOUNT_ID});
            await waitForBatchedUpdates();

            const adminsChatReportID = '7957055873634067';
            const onboardingPolicyID = 'A70D00C752416807';
            const engagementChoice = CONST.INTRO_CHOICES.MANAGE_TEAM;
            const {onboardingMessages} = getOnboardingMessages();

            Report.completeOnboarding({
                engagementChoice,
                onboardingMessage: onboardingMessages[engagementChoice],
                adminsChatReportID,
                onboardingPolicyID,
                companySize: CONST.ONBOARDING_COMPANY_SIZE.MICRO,
                userReportedIntegration: null,
            });

            await waitForBatchedUpdates();

            const reportActions: OnyxEntry<OnyxTypes.ReportActions> = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminsChatReportID}`,
                    callback: (id) => {
                        Onyx.disconnect(connection);
                        resolve(id);
                    },
                });
            });
            expect(reportActions).not.toBeNull();
            expect(reportActions).not.toBeUndefined();
            for (const action of Object.values(reportActions ?? {})) {
                expect(action.isOptimisticAction).toBeFalsy();
            }
        });
    });

    describe('markAllMessagesAsRead', () => {
        it('should mark all unread reports as read', async () => {
            // Given a collection of 10 unread and read reports, where even-index report is unread
            const currentTime = DateUtils.getDBTime();
            const reportCollections: Record<`${typeof ONYXKEYS.COLLECTION.REPORT}${string}`, OnyxTypes.Report> = createCollection<OnyxTypes.Report>(
                (item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`,
                (index) => {
                    if (index % 2 === 0) {
                        return {
                            ...createRandomReport(index, undefined),
                            lastMessageText: 'test',
                            lastReadTime: DateUtils.subtractMillisecondsFromDateTime(currentTime, 1),
                            lastVisibleActionCreated: currentTime,
                        };
                    }
                    return createRandomReport(index, undefined);
                },
                10,
            );
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, reportCollections);

            // When mark all reports as read
            Report.markAllMessagesAsRead(new Set<string>());

            await waitForBatchedUpdates();

            // Then all report should be read
            const isUnreadCollection = await Promise.all(
                Object.values(reportCollections).map((report) => {
                    return new Promise<boolean>((resolve) => {
                        const connection = Onyx.connect({
                            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
                            callback: (reportVal) => {
                                Onyx.disconnect(connection);
                                resolve(ReportUtils.isUnread(reportVal, undefined, undefined));
                            },
                        });
                    });
                }),
            );
            expect(isUnreadCollection.some(Boolean)).toBe(false);
        });
    });

    describe('updateDescription', () => {
        const currentUserAccountID = 1;
        it('should not call UpdateRoomDescription API if the description is not changed', async () => {
            global.fetch = TestHelper.getGlobalFetchMock();
            Report.updateDescription('1', '<h1>test</h1>', '# test', currentUserAccountID);

            await waitForBatchedUpdates();

            TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.UPDATE_ROOM_DESCRIPTION, 0);
        });

        it('should revert to correct previous description if UpdateRoomDescription API fails', async () => {
            const report: OnyxTypes.Report = {
                ...createRandomReport(1, undefined),
                description: '<h1>test</h1>',
            };
            const mockFetch = fetch as MockFetch;

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

            mockFetch?.fail?.();
            Report.updateDescription('1', '<h1>test</h1>', '# test1', currentUserAccountID);

            await waitForBatchedUpdates();
            let updateReport: OnyxEntry<OnyxTypes.Report>;

            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
                callback: (val) => (updateReport = val),
            });
            expect(updateReport?.description).toBe('<h1>test</h1>');
            expect(updateReport?.lastActorAccountID).toBe(currentUserAccountID);

            mockFetch.mockReset();
        });
    });

    describe('deleteAppReport', () => {
        const currentUserAccountID = 1;
        it('should only moves CREATE or TRACK type of IOU action to self DM', async () => {
            // Given an expense report with CREATE, TRACK, and PAY of IOU actions
            const reportID = '1';
            const firstIOUAction: OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> = {
                reportActionID: '1',
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                created: DateUtils.getDBTime(),
                message: [{type: 'COMMENT', html: 'Comment 1', text: 'Comment 1'}],
                originalMessage: {
                    amount: 100,
                    currency: CONST.CURRENCY.USD,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };
            const secondIOUAction: OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> = {
                reportActionID: '2',
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                created: DateUtils.getDBTime(),
                message: [{type: 'COMMENT', html: 'Comment 2', text: 'Comment 2'}],
                originalMessage: {
                    amount: 100,
                    currency: CONST.CURRENCY.USD,
                    type: CONST.IOU.REPORT_ACTION_TYPE.TRACK,
                },
            };
            const payAction: OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> = {
                reportActionID: '3',
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                created: DateUtils.getDBTime(),
                message: [{type: 'COMMENT', html: 'Comment 3', text: 'Comment 3'}],
                originalMessage: {
                    amount: 100,
                    currency: CONST.CURRENCY.USD,
                    type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [firstIOUAction.reportActionID]: firstIOUAction,
                [secondIOUAction.reportActionID]: secondIOUAction,
                [payAction.reportActionID]: payAction,
            });

            // When deleting the expense report
            Report.deleteAppReport(reportID, '', currentUserAccountID, {}, {}, {});
            await waitForBatchedUpdates();

            // Then only the IOU action with type of CREATE and TRACK is moved to the self DM
            const selfDMReportID = ReportUtils.findSelfDMReportID();
            const selfDMReportActions = await new Promise<OnyxEntry<OnyxTypes.ReportActions>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReportID}`,
                    callback: (val) => {
                        Onyx.disconnect(connection);
                        resolve(val);
                    },
                });
            });
            // The length is 3 to include the CREATED action
            expect(Object.keys(selfDMReportActions ?? {}).length).toBe(3);
        });

        it('should not reset the chatReport hasOutstandingChildRequest if there is another outstanding report', async () => {
            const fakePolicy: OnyxTypes.Policy = {
                ...createRandomPolicy(6),
                role: 'admin',
                ownerAccountID: currentUserAccountID,
                areRulesEnabled: true,
                preventSelfApproval: false,
                autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
                harvesting: {
                    enabled: false,
                },
            };
            const chatReport: OnyxTypes.Report = {...createRandomReport(11, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT), policyID: fakePolicy.id, hasOutstandingChildRequest: true};

            const expenseReport1: OnyxTypes.Report = {
                ...createRandomReport(5, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                managerID: currentUserAccountID,
                ownerAccountID: currentUserAccountID,
                policyID: fakePolicy.id,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                chatReportID: chatReport.reportID,
                parentReportID: chatReport.reportID,
            };
            const reportPreview1: OnyxTypes.ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                originalMessage: {
                    linkedReportID: expenseReport1.reportID,
                },
            };
            const expenseReport2: OnyxTypes.Report = {
                ...createRandomReport(6, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                managerID: currentUserAccountID,
                ownerAccountID: currentUserAccountID,
                policyID: fakePolicy.id,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                chatReportID: chatReport.reportID,
                parentReportID: chatReport.reportID,
            };
            const transaction: OnyxTypes.Transaction = {...createRandomTransaction(22), reportID: expenseReport2.reportID};
            const reportPreview2: OnyxTypes.ReportAction = {
                ...createRandomReportAction(22),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                originalMessage: {
                    linkedReportID: expenseReport2.reportID,
                },
            };
            const iouAction1: OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> = {
                reportActionID: '1',
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    amount: 100,
                    currency: CONST.CURRENCY.USD,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };

            await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport1.reportID}`, {
                [iouAction1.reportActionID]: iouAction1,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`, {
                [reportPreview1.reportActionID]: reportPreview1,
                [reportPreview2.reportActionID]: reportPreview2,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport1.reportID}`, expenseReport1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport2.reportID}`, expenseReport2);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);

            // When deleting the first expense report
            Report.deleteAppReport(
                expenseReport1.reportID,
                '',
                currentUserAccountID,
                {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
                },
                {},
                {},
            );
            await waitForBatchedUpdates();

            const report = await new Promise<OnyxEntry<OnyxTypes.Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
                    callback: (val) => {
                        Onyx.disconnect(connection);
                        resolve(val);
                    },
                });
            });

            // The hasOutstandingChildRequest should still remain true as there is a second outstanding report.
            expect(report?.hasOutstandingChildRequest).toBe(true);
        });
    });

    describe('changeReportPolicy', () => {
        it('should unarchive the expense report', async () => {
            // Given an archived expense report
            const expenseReport: OnyxTypes.Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: '1',
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${expenseReport.reportID}`, {
                private_isArchived: DateUtils.getDBTime(),
            });

            const newPolicy = createRandomPolicy(2);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${newPolicy.id}`, newPolicy);

            // When moving to another workspace
            Report.changeReportPolicy(expenseReport, newPolicy, 1, '', true, false, false);
            await waitForBatchedUpdates();

            // Then the expense report should not be archived anymore
            const isArchived = await new Promise<boolean>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${expenseReport.reportID}`,
                    callback: (val) => {
                        resolve(!!val?.private_isArchived);
                        Onyx.disconnect(connection);
                    },
                });
            });
            expect(isArchived).toBe(false);

            const snapshotData = await new Promise<OnyxEntry<OnyxTypes.SearchResults>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentHash}`,
                    callback: (val) => {
                        resolve(val);
                        Onyx.disconnect(connection);
                    },
                });
            });

            // Then the new policy data should also be populated on the current search snapshot.
            expect(snapshotData?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${newPolicy.id}`]).toBeDefined();
        });

        it('should update the chatReportID and parentReportID to the new policy expense chat report ID', async () => {
            // Given an expense report
            const expenseReport: OnyxTypes.Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: '1',
                chatReportID: '2',
                parentReportID: '2',
            };

            const newPolicy = createRandomPolicy(2);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${newPolicy.id}`, newPolicy);

            // When moving to another workspace
            Report.changeReportPolicy(expenseReport, newPolicy, 1, '', false, false, false);
            await waitForBatchedUpdates();

            // Then the expense report chatReportID and parentReportID should be updated to the new expense chat reportID
            const expenseReport2 = await new Promise<OnyxEntry<OnyxTypes.Report>>((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        resolve(report);
                    },
                });
            });
            expect(expenseReport2?.chatReportID).toBe(MOCKED_POLICY_EXPENSE_CHAT_REPORT_ID);
            expect(expenseReport2?.parentReportID).toBe(MOCKED_POLICY_EXPENSE_CHAT_REPORT_ID);
        });

        it('should update report currency and reset totals when changing to workspace with different currency', async () => {
            // Given an expense report with AUD currency and a transaction in USD
            const oldPolicy = {
                ...createRandomPolicy(1),
                outputCurrency: 'AUD',
            };
            const expenseReport: OnyxTypes.Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: oldPolicy.id,
                currency: 'AUD',
                total: -1503,
                nonReimbursableTotal: 0,
                unheldNonReimbursableTotal: 0,
            };
            const transaction: OnyxTypes.Transaction = {
                transactionID: '1',
                reportID: expenseReport.reportID,
                currency: 'USD',
                amount: -1000,
                convertedAmount: -1503,
                reimbursable: true,
                comment: {},
                created: '',
                merchant: '',
            };

            await Promise.all([
                Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${oldPolicy.id}`, oldPolicy),
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport),
                Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction),
            ]);

            // When moving to a workspace with AED currency
            const newPolicy = {
                ...createRandomPolicy(2),
                outputCurrency: 'AED',
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${newPolicy.id}`, newPolicy);

            Report.changeReportPolicy(expenseReport, newPolicy, 1, '', false, false, false);
            await waitForBatchedUpdates();

            const updatedReport = await new Promise<OnyxEntry<OnyxTypes.Report>>((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        resolve(report);
                    },
                });
            });

            // Report currency should update to destination
            expect(updatedReport?.currency).toBe('AED');
            // Total should be 0 (USD transaction doesn't match AED)
            expect(updatedReport?.total).toBe(0);

            // Transaction's convertedAmount should be cleared
            const updatedTransaction = await new Promise<OnyxEntry<OnyxTypes.Transaction>>((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
                    callback: (txn) => {
                        Onyx.disconnect(connection);
                        resolve(txn);
                    },
                });
            });
            expect(updatedTransaction?.convertedAmount).toBeFalsy();
        });

        it('should correctly calculate totals with refund transactions (positive amounts)', async () => {
            // Given an expense report with a mix of expense and refund transactions
            const oldPolicy = {
                ...createRandomPolicy(1),
                outputCurrency: 'USD',
            };
            const expenseReport: OnyxTypes.Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: oldPolicy.id,
                currency: 'USD',
                total: -500, // Net of -1000 expense + 500 refund
                nonReimbursableTotal: 0,
                unheldNonReimbursableTotal: 0,
            };
            // Regular expense (negative rawAmount)
            const expenseTransaction: OnyxTypes.Transaction = {
                transactionID: '1',
                reportID: expenseReport.reportID,
                currency: 'AUD',
                amount: -1000,
                reimbursable: true,
                comment: {},
                created: '',
                merchant: '',
            };
            // Refund transaction (positive rawAmount)
            const refundTransaction: OnyxTypes.Transaction = {
                transactionID: '2',
                reportID: expenseReport.reportID,
                currency: 'AUD',
                amount: 500, // Positive = refund
                reimbursable: true,
                comment: {},
                created: '',
                merchant: '',
            };

            await Promise.all([
                Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${oldPolicy.id}`, oldPolicy),
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport),
                Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${expenseTransaction.transactionID}`, expenseTransaction),
                Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${refundTransaction.transactionID}`, refundTransaction),
            ]);

            // When moving to a workspace with AUD currency (matching transaction currencies)
            const newPolicy = {
                ...createRandomPolicy(2),
                outputCurrency: 'AUD',
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${newPolicy.id}`, newPolicy);

            Report.changeReportPolicy(expenseReport, newPolicy, 1, '', false, false, false);
            await waitForBatchedUpdates();

            // Then the report total should correctly include expense (-1000) and refund (+500) = -500
            const updatedReport = await new Promise<OnyxEntry<OnyxTypes.Report>>((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        resolve(report);
                    },
                });
            });
            // Expense: -1000 → getAmount(true) = 1000 → total -= 1000 = -1000
            // Refund: +500 → getAmount(true) = -500 → total -= (-500) = -1000 + 500 = -500
            expect(updatedReport?.total).toBe(-500);
        });

        it('should only include matching currency transactions in total with mixed currencies', async () => {
            // Given an expense report with transactions in different currencies
            const oldPolicy = {
                ...createRandomPolicy(1),
                outputCurrency: 'USD',
            };
            const expenseReport: OnyxTypes.Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: oldPolicy.id,
                currency: 'USD',
                total: -3000,
                nonReimbursableTotal: 0,
                unheldNonReimbursableTotal: 0,
            };
            // AUD transaction - should be included when moving to AUD workspace
            const audTransaction: OnyxTypes.Transaction = {
                transactionID: '1',
                reportID: expenseReport.reportID,
                currency: 'AUD',
                amount: -1000,
                reimbursable: true,
                comment: {},
                created: '',
                merchant: '',
            };
            // USD transaction - should NOT be included when moving to AUD workspace
            const usdTransaction: OnyxTypes.Transaction = {
                transactionID: '2',
                reportID: expenseReport.reportID,
                currency: 'USD',
                amount: -2000,
                convertedAmount: -2000,
                reimbursable: true,
                comment: {},
                created: '',
                merchant: '',
            };

            await Promise.all([
                Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${oldPolicy.id}`, oldPolicy),
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport),
                Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${audTransaction.transactionID}`, audTransaction),
                Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${usdTransaction.transactionID}`, usdTransaction),
            ]);

            // When moving to a workspace with AUD currency
            const newPolicy = {
                ...createRandomPolicy(2),
                outputCurrency: 'AUD',
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${newPolicy.id}`, newPolicy);

            Report.changeReportPolicy(expenseReport, newPolicy, 1, '', false, false, false);
            await waitForBatchedUpdates();

            // Then only AUD transaction should contribute to total (-1000), USD is excluded
            const updatedReport = await new Promise<OnyxEntry<OnyxTypes.Report>>((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        resolve(report);
                    },
                });
            });
            expect(updatedReport?.total).toBe(-1000); // Only AUD transaction included
        });
    });

    describe('changeReportPolicyAndInviteSubmitter', () => {
        it('should unarchive the expense report', async () => {
            // Given an archived expense report
            const ownerAccountID = 1;
            const ownerEmail = 'owner@gmail.com';
            const adminEmail = 'admin@gmail.com';
            const expenseReport: OnyxTypes.Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: '1',
                ownerAccountID,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${expenseReport.reportID}`, {
                private_isArchived: DateUtils.getDBTime(),
            });
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [ownerAccountID]: {
                    login: ownerEmail,
                },
            });

            // When moving to another workspace
            Report.changeReportPolicyAndInviteSubmitter(
                expenseReport,
                createRandomPolicy(Number(2)),
                1,
                '',
                true,
                false,
                false,
                {
                    [adminEmail]: {role: CONST.POLICY.ROLE.ADMIN},
                },
                TestHelper.formatPhoneNumber,
                undefined,
            );
            await waitForBatchedUpdates();

            // Then the expense report should not be archived anymore
            const isArchived = await new Promise<boolean>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${expenseReport.reportID}`,
                    callback: (val) => {
                        resolve(!!val?.private_isArchived);
                        Onyx.disconnect(connection);
                    },
                });
            });
            expect(isArchived).toBe(false);
        });

        it('correctly implements RedBrickRoad error handling for ChangeReportPolicyAndInviteSubmitter when the request fails to add a new user to workspace', async () => {
            const ownerAccountID = 999;
            const ownerEmail = 'submitter@test.com';
            const adminEmail = 'admin@test.com';
            const mockFetch = TestHelper.getGlobalFetchMock() as MockFetch;

            const expenseReport: OnyxTypes.Report = {
                ...createRandomReport(1, undefined),
                reportID: 'expenseReport123',
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: 'oldPolicy123',
                ownerAccountID,
                total: 15000,
                currency: CONST.CURRENCY.USD,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };

            const newPolicy: OnyxTypes.Policy = {
                ...createRandomPolicy(2),
                id: 'newPolicy456',
                name: 'New Test Policy',
                role: CONST.POLICY.ROLE.ADMIN,
                type: CONST.POLICY.TYPE.TEAM,
                outputCurrency: CONST.CURRENCY.USD,
                isPolicyExpenseChatEnabled: true,
                employeeList: {
                    [adminEmail]: {
                        role: CONST.POLICY.ROLE.ADMIN,
                    },
                    // Note: submitter is NOT in the employee list, which will trigger the invitation
                },
            };

            const employeeList = {
                [adminEmail]: {
                    role: CONST.POLICY.ROLE.ADMIN,
                },
            };

            const submitter = {
                accountID: ownerAccountID,
                login: ownerEmail,
                email: ownerEmail,
            };

            global.fetch = mockFetch;
            mockFetch.pause?.();

            // Setup initial data
            await Promise.all([
                Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport),
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${newPolicy.id}`, newPolicy),
                Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ownerAccountID]: submitter}),
            ]);
            await waitForBatchedUpdates();

            // Call changeReportPolicyAndInviteSubmitter
            Report.changeReportPolicyAndInviteSubmitter(expenseReport, newPolicy, 1, '', true, false, false, employeeList, TestHelper.formatPhoneNumber, false);
            await waitForBatchedUpdates();

            // Simulate network failure
            mockFetch.fail?.();
            await (mockFetch.resume?.() as Promise<unknown>);

            // Verify error handling after failure - focus on workspace invitation error
            const policyData = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${newPolicy.id}`);

            // The submitter should have been added to the employee list with error
            const submitterEmployee = policyData?.employeeList?.[ownerEmail];
            expect(submitterEmployee).toBeTruthy();
            expect(submitterEmployee?.errors).toBeTruthy();
            expect(Object.values(submitterEmployee?.errors ?? {}).at(0)).toEqual(TestHelper.translateLocal('workspace.people.error.genericAdd'));

            // Cleanup
            mockFetch.succeed?.();
        });
    });

    describe('moveIOUReportToPolicy', () => {
        it('should create moved action on the expense report', async () => {
            const ownerAccountID = 1;
            const ownerEmail = 'owner@gmail.com';
            const adminEmail = 'admin@gmail.com';
            const iouReport: OnyxTypes.Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID,
            };
            const policy: OnyxTypes.Policy = {
                ...createRandomPolicy(1),
                role: CONST.POLICY.ROLE.ADMIN,
                employeeList: {[adminEmail]: {email: adminEmail, role: CONST.POLICY.ROLE.ADMIN}, [ownerEmail]: {email: ownerEmail, role: CONST.POLICY.ROLE.USER}},
            };

            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [ownerAccountID]: {
                    login: ownerEmail,
                },
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When moving iou to a workspace
            Report.moveIOUReportToPolicy(iouReport, policy);
            await waitForBatchedUpdates();

            // Then MOVED report action should be added to the expense report
            const reportActions = await new Promise<OnyxEntry<OnyxTypes.ReportActions>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
                    callback: (val) => {
                        resolve(val);
                        Onyx.disconnect(connection);
                    },
                });
            });
            expect(Object.values(reportActions ?? {}).at(0)?.actionName).toBe(CONST.REPORT.ACTIONS.TYPE.MOVED);
        });
    });

    describe('moveIOUReportToPolicyAndInviteSubmitter', () => {
        it('should create moved action on the expense report', async () => {
            const ownerAccountID = 1;
            const ownerEmail = 'owner@gmail.com';
            const iouReport: OnyxTypes.Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID,
            };
            const policy: OnyxTypes.Policy = {...createRandomPolicy(1), role: CONST.POLICY.ROLE.ADMIN};

            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [ownerAccountID]: {
                    login: ownerEmail,
                },
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When moving iou to a workspace and invite the submitter
            Report.moveIOUReportToPolicyAndInviteSubmitter(iouReport, policy, (phone: string) => phone);
            await waitForBatchedUpdates();

            // Then MOVED report action should be added to the expense report
            const reportActions = await new Promise<OnyxEntry<OnyxTypes.ReportActions>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
                    callback: (val) => {
                        resolve(val);
                        Onyx.disconnect(connection);
                    },
                });
            });
            expect(Object.values(reportActions ?? {}).at(0)?.actionName).toBe(CONST.REPORT.ACTIONS.TYPE.MOVED);
        });

        it('correctly implements RedBrickRoad error handling for MoveIOUReportToPolicyAndInviteSubmitter when the request fails to add a new user to workspace', async () => {
            const ownerAccountID = 999;
            const ownerEmail = 'submitter@test.com';
            const mockFetch = TestHelper.getGlobalFetchMock() as MockFetch;

            const iouReport: OnyxTypes.Report = {
                ...createRandomReport(1, undefined),
                reportID: 'iouReport123',
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID,
                total: 10000,
                currency: CONST.CURRENCY.USD,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };

            const policy: OnyxTypes.Policy = {
                ...createRandomPolicy(1, undefined),
                id: 'policy456',
                name: 'Test Policy for IOU Move',
                role: CONST.POLICY.ROLE.ADMIN,
                type: CONST.POLICY.TYPE.TEAM,
                outputCurrency: CONST.CURRENCY.USD,
                isPolicyExpenseChatEnabled: true,
                employeeList: {
                    'admin@test.com': {
                        role: CONST.POLICY.ROLE.ADMIN,
                    },
                    // Note: submitter is NOT in the employee list, which will trigger the invitation
                },
            };

            const submitter = {
                accountID: ownerAccountID,
                login: ownerEmail,
                email: ownerEmail,
            };

            global.fetch = mockFetch;
            mockFetch.pause?.();

            // Setup initial data
            await Promise.all([
                Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport),
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy),
                Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ownerAccountID]: submitter}),
            ]);
            await waitForBatchedUpdates();

            // Call moveIOUReportToPolicyAndInviteSubmitter
            const formatPhoneNumber = (phoneNumber: string) => phoneNumber;
            Report.moveIOUReportToPolicyAndInviteSubmitter(iouReport, policy, formatPhoneNumber);
            await waitForBatchedUpdates();

            // Simulate network failure
            mockFetch.fail?.();
            await (mockFetch.resume?.() as Promise<unknown>);

            // Verify error handling after failure - focus on workspace invitation error
            const policyData = await new Promise<OnyxEntry<OnyxTypes.Policy>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
                    callback: (val) => {
                        resolve(val);
                        Onyx.disconnect(connection);
                    },
                });
            });

            // The submitter should have been added to the employee list with error
            const submitterEmployee = policyData?.employeeList?.[ownerEmail];
            expect(submitterEmployee).toBeTruthy();
            expect(submitterEmployee?.errors).toBeTruthy();
            expect(Object.values(submitterEmployee?.errors ?? {}).at(0)).toEqual(TestHelper.translateLocal('workspace.people.error.genericAdd'));

            // Cleanup
            mockFetch.succeed?.();
        });
    });

    describe('buildOptimisticChangePolicyData', () => {
        it('should build the optimistic data next step for the change policy data', () => {
            const report: OnyxTypes.Report = {
                ...createRandomReport(1, undefined),
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                type: CONST.REPORT.TYPE.EXPENSE,
            };
            const policy = createRandomPolicy(Number(1));
            Report.buildOptimisticChangePolicyData(report, policy, 1, '', false, true, undefined);
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            expect(buildNextStepNew).toHaveBeenCalledWith({
                report,
                policy,
                currentUserAccountIDParam: 1,
                currentUserEmailParam: '',
                hasViolations: false,
                isASAPSubmitBetaEnabled: true,
                predictedNextStatus: CONST.REPORT.STATUS_NUM.SUBMITTED,
            });
        });

        it('should set pendingAction and clear convertedAmount when moving to workspace with different currency', async () => {
            const reportID = 'testReport123';
            const transactionID = 'testTransaction456';
            const transaction = {
                ...createRandomTransaction(1),
                transactionID,
                reportID,
                currency: 'AUD',
                convertedAmount: 15000, // Has a converted amount from old workspace
            };

            const report: OnyxTypes.Report = {
                ...createRandomReport(1, undefined),
                reportID,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                type: CONST.REPORT.TYPE.EXPENSE,
                currency: 'AUD', // Source report currency
            };

            const policy = {
                ...createRandomPolicy(Number(1)),
                outputCurrency: CONST.CURRENCY.USD, // Destination currency is different
            };

            // Set up the transaction in Onyx so getReportTransactions can find it
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await waitForBatchedUpdates();

            const {optimisticData, successData, failureData} = Report.buildOptimisticChangePolicyData(report, policy, 1, '', false, true, undefined);

            // Find the transaction optimistic data
            const transactionOptimisticData = optimisticData.find((data) => data.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            const transactionSuccessData = successData.find((data) => data.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            const transactionFailureData = failureData.find((data) => data.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);

            // Should have pendingAction set to UPDATE
            expect((transactionOptimisticData?.value as OnyxTypes.Transaction)?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            // Should have convertedAmount cleared
            expect((transactionOptimisticData?.value as OnyxTypes.Transaction)?.convertedAmount).toBeNull();

            // Success data should clear pendingAction
            expect((transactionSuccessData?.value as OnyxTypes.Transaction)?.pendingAction).toBeNull();

            // Failure data should restore original values
            expect((transactionFailureData?.value as OnyxTypes.Transaction)?.pendingAction).toBe(transaction.pendingAction ?? null);
            expect((transactionFailureData?.value as OnyxTypes.Transaction)?.convertedAmount).toBe(transaction.convertedAmount);
        });

        it('should NOT clear convertedAmount when source and destination currencies are the same', async () => {
            const reportID = 'testReport789';
            const transactionID = 'testTransaction012';
            const transaction = {
                ...createRandomTransaction(1),
                transactionID,
                reportID,
                currency: 'EUR',
                convertedAmount: 15000,
            };

            const report: OnyxTypes.Report = {
                ...createRandomReport(1, undefined),
                reportID,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                type: CONST.REPORT.TYPE.EXPENSE,
                currency: CONST.CURRENCY.USD, // Source report currency
            };

            const policy = {
                ...createRandomPolicy(Number(1)),
                outputCurrency: CONST.CURRENCY.USD, // Same as source
            };

            // Set up the transaction in Onyx
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await waitForBatchedUpdates();

            const {optimisticData} = Report.buildOptimisticChangePolicyData(report, policy, 1, '', false, true, undefined);

            // Should NOT find transaction optimistic data when currencies are the same
            const transactionOptimisticData = optimisticData.find((data) => data.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            expect(transactionOptimisticData).toBeUndefined();
        });

        it('should NOT clear convertedAmount when transaction matches destination currency', async () => {
            const reportID = 'testReport345';
            const transactionID = 'testTransaction678';
            const transaction = {
                ...createRandomTransaction(1),
                transactionID,
                reportID,
                currency: CONST.CURRENCY.USD, // Transaction is in destination currency
                convertedAmount: 15000,
            };

            const report: OnyxTypes.Report = {
                ...createRandomReport(1, undefined),
                reportID,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                type: CONST.REPORT.TYPE.EXPENSE,
                currency: 'AUD', // Source report currency is different
            };

            const policy = {
                ...createRandomPolicy(Number(1)),
                outputCurrency: CONST.CURRENCY.USD, // Matches transaction currency
            };

            // Set up the transaction in Onyx
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await waitForBatchedUpdates();

            const {optimisticData} = Report.buildOptimisticChangePolicyData(report, policy, 1, '', false, true, undefined);

            // Should NOT find transaction optimistic data when transaction matches destination currency
            const transactionOptimisticData = optimisticData.find((data) => data.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            expect(transactionOptimisticData).toBeUndefined();
        });

        it('should only clear convertedAmount for non-matching transactions in mixed currency scenario', async () => {
            const reportID = 'testReport999';
            const matchingTransactionID = 'matchingTransaction';
            const nonMatchingTransactionID = 'nonMatchingTransaction';

            // Transaction that matches destination currency (USD)
            const matchingTransaction = {
                ...createRandomTransaction(1),
                transactionID: matchingTransactionID,
                reportID,
                currency: CONST.CURRENCY.USD,
                convertedAmount: 10000,
            };

            // Transaction that doesn't match destination currency (AUD != USD)
            const nonMatchingTransaction = {
                ...createRandomTransaction(2),
                transactionID: nonMatchingTransactionID,
                reportID,
                currency: 'AUD',
                convertedAmount: 15000,
            };

            const report: OnyxTypes.Report = {
                ...createRandomReport(1, undefined),
                reportID,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                type: CONST.REPORT.TYPE.EXPENSE,
                currency: 'AUD', // Source report currency
            };

            const policy = {
                ...createRandomPolicy(Number(1)),
                outputCurrency: CONST.CURRENCY.USD, // Destination currency
            };

            // Set up both transactions in Onyx
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${matchingTransactionID}`, matchingTransaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${nonMatchingTransactionID}`, nonMatchingTransaction);
            await waitForBatchedUpdates();

            const {optimisticData} = Report.buildOptimisticChangePolicyData(report, policy, 1, '', false, true, undefined);

            // Should NOT find optimistic data for the matching transaction (USD matches USD destination)
            const matchingOptimisticData = optimisticData.find((data) => data.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${matchingTransactionID}`);
            expect(matchingOptimisticData).toBeUndefined();

            // Should find optimistic data for the non-matching transaction (AUD doesn't match USD destination)
            const nonMatchingOptimisticData = optimisticData.find((data) => data.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${nonMatchingTransactionID}`);
            expect(nonMatchingOptimisticData).toBeDefined();
            expect((nonMatchingOptimisticData?.value as OnyxTypes.Transaction)?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect((nonMatchingOptimisticData?.value as OnyxTypes.Transaction)?.convertedAmount).toBeNull();
        });
    });

    describe('searchInServer', () => {
        it('should return the same result with or without uppercase input.', () => {
            Report.searchInServer('test');
            Report.searchInServer('TEST');
            const upperCaseRequest = PersistedRequests.getAll().at(0);
            const lowerCaseRequest = PersistedRequests.getAll().at(1);
            expect(upperCaseRequest?.data?.searchInput).toBe(lowerCaseRequest?.data?.searchInput);
        });
    });

    it('should not overwrite testDriveModalDismissed when it is already true', async () => {
        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@test.com';

        await Onyx.set(ONYXKEYS.SESSION, {email: TEST_USER_LOGIN, accountID: TEST_USER_ACCOUNT_ID});
        await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {testDriveModalDismissed: true});
        await waitForBatchedUpdates();

        const adminsChatReportID = '7957055873634067';
        const onboardingPolicyID = 'A70D00C752416807';
        const engagementChoice = CONST.INTRO_CHOICES.MANAGE_TEAM;
        const {onboardingMessages} = getOnboardingMessages();

        Report.completeOnboarding({
            engagementChoice,
            onboardingMessage: onboardingMessages[engagementChoice],
            adminsChatReportID,
            onboardingPolicyID,
            companySize: CONST.ONBOARDING_COMPANY_SIZE.MICRO,
            userReportedIntegration: null,
        });

        await waitForBatchedUpdates();

        const onboarding = await new Promise<OnyxEntry<OnyxTypes.Onboarding>>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.NVP_ONBOARDING,
                callback: (data) => {
                    Onyx.disconnect(connection);
                    resolve(data);
                },
            });
        });

        // testDriveModalDismissed should remain true and not be overwritten to false
        expect(onboarding?.testDriveModalDismissed).toBe(true);
    });

    describe('setOptimisticTransactionThread', () => {
        it('should set optimistic transaction thread data with the provided parameters', async () => {
            const reportID = 'report12';
            const parentReportID = 'parentReport34';
            const parentReportActionID = 'parentAction56';
            const policyID = 'policy78';

            Report.setOptimisticTransactionThread(reportID, parentReportID, parentReportActionID, policyID);

            await waitForBatchedUpdates();

            const report = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

            expect(report).toMatchObject({
                reportID,
                policyID,
                parentReportID,
                parentReportActionID,
                chatReportID: parentReportID,
                type: CONST.REPORT.TYPE.CHAT,
            });
            expect(report?.lastReadTime).toBeTruthy();
            expect(report?.lastVisibleActionCreated).toBeTruthy();
        });

        it('should not set anything if no reportID was provided', async () => {
            const reportID = undefined;

            Report.setOptimisticTransactionThread(reportID);

            await waitForBatchedUpdates();

            const reportsCollectionAfter = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}`);

            expect(reportsCollectionAfter).toBeUndefined();
        });
    });

    describe('navigateToConciergeChat', () => {
        const CONCIERGE_REPORT_ID = '123456';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const mockNavigation: {navigate: jest.Mock; dismissModalWithReport: jest.Mock} = jest.requireMock('@libs/Navigation/Navigation');

        beforeEach(async () => {
            jest.clearAllMocks();
            mockNavigation.navigate.mockClear();
            mockNavigation.dismissModalWithReport.mockClear();
            await Onyx.clear();
            return waitForBatchedUpdates();
        });

        it('should navigate to concierge chat with provided conciergeReportID', async () => {
            await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, CONCIERGE_REPORT_ID);
            await waitForBatchedUpdates();

            Report.navigateToConciergeChat(CONCIERGE_REPORT_ID, false);

            await waitForBatchedUpdates();

            expect(mockNavigation.navigate).toHaveBeenCalled();
        });

        it('should navigate with shouldDismissModal=true when provided', async () => {
            await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, CONCIERGE_REPORT_ID);
            await waitForBatchedUpdates();

            Report.navigateToConciergeChat(CONCIERGE_REPORT_ID, true);

            await waitForBatchedUpdates();

            expect(mockNavigation.dismissModalWithReport).toHaveBeenCalled();
        });

        it('should handle undefined conciergeReportID gracefully', async () => {
            // Don't set CONCIERGE_REPORT_ID to simulate undefined state
            await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
            await waitForBatchedUpdates();

            // When conciergeReportID is undefined, the function uses onServerDataReady()
            // which is async. We're testing that it doesn't throw and handles the case properly.
            expect(() => {
                Report.navigateToConciergeChat(undefined, false);
            }).not.toThrow();
        });

        it('should navigate with reportActionID when provided', async () => {
            const reportActionID = 'action789';
            await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, CONCIERGE_REPORT_ID);
            await waitForBatchedUpdates();

            Report.navigateToConciergeChat(CONCIERGE_REPORT_ID, true, undefined, undefined, reportActionID);

            await waitForBatchedUpdates();

            expect(mockNavigation.dismissModalWithReport).toHaveBeenCalledWith({
                reportID: CONCIERGE_REPORT_ID,
                reportActionID,
            });
        });

        it('should navigate with linkToOptions when provided', async () => {
            const linkToOptions = {forceReplace: true};
            await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, CONCIERGE_REPORT_ID);
            await waitForBatchedUpdates();

            Report.navigateToConciergeChat(CONCIERGE_REPORT_ID, false, undefined, linkToOptions);

            await waitForBatchedUpdates();

            expect(mockNavigation.navigate).toHaveBeenCalledWith(expect.any(String), linkToOptions);
        });

        it('should respect checkIfCurrentPageActive callback when creating new concierge chat', async () => {
            const checkIfCurrentPageActive = jest.fn(() => false);
            const navigateToAndOpenReportSpy = jest.spyOn(Report, 'navigateToAndOpenReport');

            // Don't set CONCIERGE_REPORT_ID to simulate undefined state
            await waitForBatchedUpdates();

            Report.navigateToConciergeChat(undefined, false, checkIfCurrentPageActive);

            await waitForBatchedUpdates();

            // Should not navigate if checkIfCurrentPageActive returns false
            expect(navigateToAndOpenReportSpy).not.toHaveBeenCalled();
        });

        it('should handle null conciergeReportID gracefully', async () => {
            await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, null);
            await waitForBatchedUpdates();

            // When conciergeReportID is undefined (or null passed as undefined),
            // it should handle it gracefully
            expect(() => {
                Report.navigateToConciergeChat(undefined, false);
            }).not.toThrow();
        });

        it('should handle empty string conciergeReportID gracefully', async () => {
            await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, '');
            await waitForBatchedUpdates();

            // Empty string is falsy in JavaScript, so it should trigger the undefined path
            expect(() => {
                Report.navigateToConciergeChat('', false);
            }).not.toThrow();
        });

        it('should work with all optional parameters provided', async () => {
            const reportActionID = 'action123';
            const linkToOptions = {forceReplace: true};
            const checkIfCurrentPageActive = jest.fn(() => true);

            await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, CONCIERGE_REPORT_ID);
            await waitForBatchedUpdates();

            Report.navigateToConciergeChat(CONCIERGE_REPORT_ID, true, checkIfCurrentPageActive, linkToOptions, reportActionID);

            await waitForBatchedUpdates();

            expect(mockNavigation.dismissModalWithReport).toHaveBeenCalledWith({
                reportID: CONCIERGE_REPORT_ID,
                reportActionID,
            });
        });

        it('should prioritize provided conciergeReportID over Onyx value', async () => {
            const onyxConciergeReportID = 'onyx-report-id';
            const providedConciergeReportID = 'provided-report-id';

            await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, onyxConciergeReportID);
            await waitForBatchedUpdates();

            Report.navigateToConciergeChat(providedConciergeReportID, false);

            await waitForBatchedUpdates();

            // Should use the provided ID, not the Onyx ID
            expect(mockNavigation.navigate).toHaveBeenCalledWith(expect.stringContaining(providedConciergeReportID), undefined);
        });
    });

    describe('navigateToAndOpenChildReport', () => {
        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@domain.com';
        const PARENT_REPORT_ID = '1';
        const CHILD_REPORT_ID = '2';
        const REPORT_ACTION_ID = 1;
        const MOCK_NEW_THREAD_REPORT_ID = '9876';

        it('should accept a child report ID and navigate to it', async () => {
            const PARENT_REPORT = createRandomReport(1, undefined);
            const EXISTING_CHILD_REPORT = createRandomReport(2, undefined);
            const PARENT_REPORT_ACTION: OnyxTypes.ReportAction = {
                ...createRandomReportAction(REPORT_ACTION_ID),
                reportActionID: '1',
                actorAccountID: TEST_USER_ACCOUNT_ID,
            };

            await TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${CHILD_REPORT_ID}`, EXISTING_CHILD_REPORT);
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${PARENT_REPORT_ID}`, PARENT_REPORT);
            await waitForBatchedUpdates();

            Report.navigateToAndOpenChildReport(EXISTING_CHILD_REPORT, PARENT_REPORT_ACTION, PARENT_REPORT);
            await waitForBatchedUpdates();

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(EXISTING_CHILD_REPORT.reportID));
        });

        it('should work with undefined child report ID (new thread scenario)', async () => {
            const PARENT_REPORT = createRandomReport(1, undefined);
            const PARENT_REPORT_ACTION: OnyxTypes.ReportAction = {
                ...createRandomReportAction(REPORT_ACTION_ID),
                reportActionID: '1',
                actorAccountID: TEST_USER_ACCOUNT_ID,
            };

            await TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
            await TestHelper.setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID);
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${PARENT_REPORT_ID}`, PARENT_REPORT);
            await waitForBatchedUpdates();

            Report.navigateToAndOpenChildReport(undefined, PARENT_REPORT_ACTION, PARENT_REPORT);
            await waitForBatchedUpdates();

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(MOCK_NEW_THREAD_REPORT_ID));
        });

        it('should work with empty parent report action', async () => {
            const PARENT_REPORT = createRandomReport(1, undefined);
            const EXISTING_CHILD_REPORT = createRandomReport(2, undefined);

            await TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${CHILD_REPORT_ID}`, EXISTING_CHILD_REPORT);
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${PARENT_REPORT_ID}`, PARENT_REPORT);
            await waitForBatchedUpdates();

            Report.navigateToAndOpenChildReport(EXISTING_CHILD_REPORT, {} as OnyxTypes.ReportAction, PARENT_REPORT);
            await waitForBatchedUpdates();

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(EXISTING_CHILD_REPORT.reportID));
        });

        it('should create optimistic report when childReportID is provided but report does not exist', async () => {
            const PARENT_REPORT = createRandomReport(1, undefined);
            const PARENT_REPORT_ACTION: OnyxTypes.ReportAction = {
                ...createRandomReportAction(REPORT_ACTION_ID),
                reportActionID: '1',
                actorAccountID: TEST_USER_ACCOUNT_ID,
            };

            await TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
            await TestHelper.setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID);
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${PARENT_REPORT_ID}`, PARENT_REPORT);
            await waitForBatchedUpdates();

            Report.navigateToAndOpenChildReport(undefined, PARENT_REPORT_ACTION, PARENT_REPORT);
            await waitForBatchedUpdates();

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(MOCK_NEW_THREAD_REPORT_ID));
        });
    });

    describe('explain', () => {
        beforeEach(() => {
            jest.spyOn(global, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
                cb(0);
                return 0;
            });
        });
        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@domain.com';
        const PARENT_REPORT_ID = '1';
        const CHILD_REPORT_ID = '2';
        const REPORT_ACTION_ID = 1;

        it('should return early if originalReportID is not provided', () => {
            const REPORT_ACTION: OnyxTypes.ReportAction = {
                ...createRandomReportAction(REPORT_ACTION_ID),
                reportActionID: '1',
                actorAccountID: TEST_USER_ACCOUNT_ID,
            };

            const result = Report.explain(REPORT_ACTION, undefined, TestHelper.translateLocal, CONST.DEFAULT_TIME_ZONE);

            expect(result).toBeUndefined();
        });

        it('should return early if reportAction is not provided', () => {
            const result = Report.explain(undefined, PARENT_REPORT_ID, TestHelper.translateLocal, CONST.DEFAULT_TIME_ZONE);

            expect(result).toBeUndefined();
        });

        it('should accept report action and original report ID', async () => {
            const EXISTING_CHILD_REPORT = createRandomReport(2, undefined);
            const REPORT_ACTION: OnyxTypes.ReportAction = {
                ...createRandomReportAction(REPORT_ACTION_ID),
                reportActionID: '1',
                actorAccountID: TEST_USER_ACCOUNT_ID,
                childReportID: CHILD_REPORT_ID,
            };

            await TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${CHILD_REPORT_ID}`, EXISTING_CHILD_REPORT);
            await waitForBatchedUpdates();

            Report.explain(REPORT_ACTION, PARENT_REPORT_ID, TestHelper.translateLocal, CONST.DEFAULT_TIME_ZONE);
            await waitForBatchedUpdates();

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(EXISTING_CHILD_REPORT.reportID));
        });

        it('should work with new explain thread scenario', async () => {
            const PARENT_REPORT = createRandomReport(1, undefined);
            const REPORT_ACTION: OnyxTypes.ReportAction = {
                ...createRandomReportAction(REPORT_ACTION_ID),
                reportActionID: '1',
                actorAccountID: TEST_USER_ACCOUNT_ID,
            };

            await TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
            await TestHelper.setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID);
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${PARENT_REPORT_ID}`, PARENT_REPORT);
            await waitForBatchedUpdates();

            Report.explain(REPORT_ACTION, PARENT_REPORT_ID, TestHelper.translateLocal, CONST.DEFAULT_TIME_ZONE);
            await waitForBatchedUpdates();

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute('9876'));
        });

        it('should handle explain with default timezone parameter', async () => {
            const EXISTING_CHILD_REPORT = createRandomReport(2, undefined);
            const REPORT_ACTION: OnyxTypes.ReportAction = {
                ...createRandomReportAction(REPORT_ACTION_ID),
                reportActionID: '1',
                actorAccountID: TEST_USER_ACCOUNT_ID,
                childReportID: CHILD_REPORT_ID,
            };

            await TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${CHILD_REPORT_ID}`, EXISTING_CHILD_REPORT);
            await waitForBatchedUpdates();

            Report.explain(REPORT_ACTION, PARENT_REPORT_ID, TestHelper.translateLocal);
            await waitForBatchedUpdates();

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(EXISTING_CHILD_REPORT.reportID));
        });
    });

    describe('buildOptimisticResolvedFollowups', () => {
        it('should return null when reportAction is undefined', () => {
            const result = Report.buildOptimisticResolvedFollowups(undefined);
            expect(result).toBeNull();
        });

        it('should return null when reportAction has no followup-list', () => {
            const reportAction = {
                reportActionID: '123',
                message: [{html: '<p>Hello world</p>', text: 'Hello world', type: CONST.REPORT.MESSAGE.TYPE.COMMENT}],
            } as OnyxTypes.ReportAction;

            const result = Report.buildOptimisticResolvedFollowups(reportAction);
            expect(result).toBeNull();
        });

        it('should return null when followup-list is already resolved (has selected attribute)', () => {
            const reportAction = {
                reportActionID: '123',
                message: [
                    {
                        html: '<p>Message</p><followup-list selected><followup><followup-text>Question?</followup-text></followup></followup-list>',
                        text: 'Message',
                        type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                    },
                ],
            } as OnyxTypes.ReportAction;

            const result = Report.buildOptimisticResolvedFollowups(reportAction);
            expect(result).toBeNull();
        });

        it('should return updated action with resolved followup-list when unresolved followups exist', () => {
            const reportAction = {
                reportActionID: '123',
                actorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
                message: [
                    {
                        html: '<p>Here is some help</p><followup-list><followup><followup-text>How do I set up QuickBooks?</followup-text></followup></followup-list>',
                        text: 'Here is some help',
                        type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                    },
                ],
            } as OnyxTypes.ReportAction;

            const result = Report.buildOptimisticResolvedFollowups(reportAction);

            expect(result).not.toBeNull();

            expect(result?.reportActionID).toBe('123');
            expect((result?.message as Message[]).at(0)?.html).toContain('<followup-list selected>');
            expect((result?.message as Message[]).at(0)?.html).not.toMatch(/<followup-list>/);
        });

        it('should handle followup-list with attributes before adding selected', () => {
            const reportAction = {
                reportActionID: '456',
                message: [
                    {
                        html: '<p>Help</p><followup-list class="test"><followup><followup-text>Question 1</followup-text></followup><followup><followup-text>Question 2</followup-text></followup></followup-list>',
                        text: 'Help',
                        type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                    },
                ],
            } as OnyxTypes.ReportAction;

            const result = Report.buildOptimisticResolvedFollowups(reportAction);

            expect(result).not.toBeNull();
            expect((result?.message as Message[]).at(0)?.html).toContain('<followup-list selected>');
        });
    });

    describe('resolveSuggestedFollowup', () => {
        const REPORT_ID = '12345';
        const REPORT_ACTION_ID = '67890';
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.CHAT,
        } as OnyxTypes.Report;

        it('should do nothing when reportAction has no unresolved followups', async () => {
            const htmlMessage = '<p>Just a regular message</p>';
            const reportAction = {
                reportActionID: REPORT_ACTION_ID,
                message: [
                    {
                        html: htmlMessage,
                        text: 'Just a regular message',
                        type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                    },
                ],
            } as OnyxTypes.ReportAction;

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await waitForBatchedUpdates();

            Report.resolveSuggestedFollowup(report, undefined, reportAction, 'test question', CONST.DEFAULT_TIME_ZONE);
            await waitForBatchedUpdates();

            // The report action should remain unchanged (no followup-list to resolve)
            const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}` as const);
            expect((reportActions?.[REPORT_ACTION_ID]?.message as Message[])?.at(0)?.html).toBe(htmlMessage);
        });

        it('should optimistically resolve followups and post comment when unresolved followups exist', async () => {
            const reportAction = {
                reportActionID: REPORT_ACTION_ID,
                actorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
                message: [
                    {
                        html: '<p>Here is help</p><followup-list><followup><followup-text>How do I set up QuickBooks?</followup-text></followup></followup-list>',
                        text: 'Here is help',
                        type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                    },
                ],
            } as OnyxTypes.ReportAction;

            // Set up initial Onyx state
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [REPORT_ACTION_ID]: reportAction,
            });
            await waitForBatchedUpdates();

            Report.resolveSuggestedFollowup(report, undefined, reportAction, 'How do I set up QuickBooks?', CONST.DEFAULT_TIME_ZONE);
            await waitForBatchedUpdates();

            // Verify the followup-list was marked as selected
            const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}` as const);
            const updatedHtml = (reportActions?.[REPORT_ACTION_ID]?.message as Message[])?.at(0)?.html;
            expect(updatedHtml).toContain('<followup-list selected>');

            // Verify addComment was called (which triggers ADD_COMMENT API call)
            TestHelper.expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.ADD_COMMENT, 1);
        });
    });
});
