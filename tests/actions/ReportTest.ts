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
import markAllMessagesAsRead from '@libs/actions/Report/MarkAllMessageAsRead';
import {CONCIERGE_RESPONSE_DELAY_MS, resolveSuggestedFollowup} from '@libs/actions/Report/SuggestedFollowup';
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

jest.mock('react-native-fs', () => ({
    DocumentDirectoryPath: '/mock/documents',
    copyFile: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-blob-util', () => ({
    config: jest.fn(() => ({
        fetch: jest.fn(() =>
            Promise.resolve({
                path: jest.fn(() => '/mocked/path/to/file'),
            }),
        ),
    })),
    fs: {
        dirs: {
            DocumentDir: '/mocked/document/dir',
        },
    },
    fetch: jest.fn(() =>
        Promise.resolve({
            path: jest.fn(() => '/mocked/path/to/file'),
        }),
    ),
}));

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
    dismissModal: jest.fn(),
    dismissToSuperWideRHP: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isActiveRoute: jest.fn(() => false),
    getTopmostReportId: jest.fn(() => undefined),
    getTopmostSuperWideRHPReportID: jest.fn(() => undefined),
    goBack: jest.fn(),
    popToSidebar: jest.fn(),
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

// Define introSelected to use across all openReport tests
const TEST_INTRO_SELECTED: OnyxTypes.IntroSelected = {
    choice: CONST.ONBOARDING_CHOICES.SUBMIT,
    isInviteOnboardingComplete: false,
};

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

    it('should create attachment only actions when adding multiple attachments without a comment', async () => {
        global.fetch = TestHelper.getGlobalFetchMock({
            headers: new Headers({
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'image/jpeg',
            }),
        });
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
        Report.addAttachmentWithComment({
            report: REPORT,
            notifyReportID: REPORT_ID,
            ancestors: [],
            attachments: [fileA, fileB],
            currentUserAccountID: 1,
            timezone: CONST.DEFAULT_TIME_ZONE,
            shouldPlaySound,
        });
        const relevant = (await relevantPromise) as OnyxTypes.AnyRequest[];

        expect(playSoundMock).toHaveBeenCalledTimes(1);
        expect(playSoundMock).toHaveBeenCalledWith(SOUNDS.DONE);
        expect(relevant.at(0)?.command).toBe(WRITE_COMMANDS.ADD_ATTACHMENT);
        expect(relevant.slice(1).every((r) => r.command === WRITE_COMMANDS.ADD_ATTACHMENT)).toBe(true);
        expect(relevant.some((r) => r.command === WRITE_COMMANDS.ADD_TEXT_AND_ATTACHMENT)).toBe(false);
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

        Report.addComment({
            report: REPORT,
            notifyReportID: REPORT_ID,
            ancestors: [],
            text: 'reactions with comment',
            timezoneParam: CONST.DEFAULT_TIME_ZONE,
            currentUserAccountID: TEST_USER_ACCOUNT_ID,
        });

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

        Report.deleteReportComment(REPORT, newReportAction, [], undefined, undefined, '');

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

        Report.addComment({
            report: REPORT,
            notifyReportID: REPORT_ID,
            ancestors: [],
            text: 'Attachment with comment',
            timezoneParam: CONST.DEFAULT_TIME_ZONE,
            currentUserAccountID: TEST_USER_ACCOUNT_ID,
        });

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

        Report.deleteReportComment(REPORT, reportAction, [], undefined, undefined, '');

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
});
