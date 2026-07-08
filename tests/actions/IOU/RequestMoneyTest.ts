import type {SearchQueryJSON, SearchStatus} from '@components/Search/types';

import {clearAllRelatedReportActionErrors} from '@libs/actions/ClearReportActionErrors';
import {requestMoney, trackExpense} from '@libs/actions/IOU/TrackExpense';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {notifyNewAction} from '@libs/actions/Report';
import deleteReport from '@libs/actions/Report/DeleteReport';
import {subscribeToUserEvents} from '@libs/actions/User';
import type {ApiCommand} from '@libs/API/types';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as IsFileUploadable from '@libs/isFileUploadable';
import Navigation from '@libs/Navigation/Navigation';
import {rand64} from '@libs/NumberUtils';
import type * as PolicyUtils from '@libs/PolicyUtils';
import {getAllReportActions, getIOUActionForReportID, getOriginalMessage, isActionableTrackExpense, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {mintAndStampReceiptTraceId} from '@libs/telemetry/ReceiptObservability';

import type {IOUAction} from '@src/CONST';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as API from '@src/libs/API';
import DateUtils from '@src/libs/DateUtils';
import * as SearchQueryUtils from '@src/libs/SearchQueryUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, RecentlyUsedTags, Report} from '@src/types/onyx';
import type {OriginalMessageMovedTransaction} from '@src/types/onyx/OriginalMessage';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {Participant} from '@src/types/onyx/Report';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import type Transaction from '@src/types/onyx/Transaction';
import type {Receipt} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {format} from 'date-fns';
import Onyx from 'react-native-onyx';

import type {MockFetch} from '../../utils/TestHelper';

import currencyList from '../../unit/currencyList.json';
import createPersonalDetails from '../../utils/collections/personalDetails';
import {createRandomReport} from '../../utils/collections/reports';
import getOnyxValue from '../../utils/getOnyxValue';
import {getGlobalFetchMock, getOnyxData, setPersonalDetails, signInWithTestUser, translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';
import waitForNetworkPromises from '../../utils/waitForNetworkPromises';

const topMostReportID = '23423423';
jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    dismissToPreviousRHP: jest.fn(),
    dismissToSuperWideRHP: jest.fn(),
    navigateBackToLastSuperWideRHPScreen: jest.fn(),
    dismissModalWithReport: jest.fn(),
    goBack: jest.fn(),
    getTopmostReportId: jest.fn(() => topMostReportID),
    setNavigationActionToMicrotaskQueue: jest.fn(),
    removeScreenByKey: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getReportRouteByID: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(),
    getActiveRoute: jest.fn(),
    getIsFullscreenPreInsertedUnderRHP: jest.fn(() => false),
    clearFullscreenPreInsertedFlag: jest.fn(),
    revealRouteBeforeDismissingModal: jest.fn(),
    navigationRef: {
        getRootState: jest.fn(),
        isReady: jest.fn(() => true),
    },
}));

jest.mock('@react-navigation/native');

jest.mock('@src/libs/actions/Report', () => {
    const originalModule = jest.requireActual('@src/libs/actions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...originalModule,
        notifyNewAction: jest.fn(),
    };
});
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());
jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => jest.fn());
// In production, requestMoney defers its API.write() call until the target screen's
// content lays out (or a safety timeout fires). In tests there is no target component
// to flush the deferred write, so we bypass the deferral by executing the callback immediately.
jest.mock('@libs/deferredLayoutWrite', () => ({
    registerDeferredWrite: (_key: string, callback: () => void) => callback(),
    flushDeferredWrite: jest.fn(),
    cancelDeferredWrite: jest.fn(),
    hasDeferredWrite: () => false,
    getOptimisticWatchKey: () => undefined,
    deferOrExecuteWrite: (apiWrite: () => void) => apiWrite(),
    reserveDeferredWriteChannel: jest.fn(),
    resetForTesting: jest.fn(),
}));
jest.mock('@hooks/useCardFeedsForDisplay', () => jest.fn(() => ({defaultCardFeed: null, cardFeedsByPolicy: {}})));

const unapprovedCashHash = 71801560;
const unapprovedCashSimilarSearchHash = 1832274510;
jest.mock('@src/libs/SearchQueryUtils', () => {
    const actual = jest.requireActual('@src/libs/SearchQueryUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        getCurrentSearchQueryJSON: jest.fn().mockImplementation(() => ({
            hash: unapprovedCashHash,
            query: 'test',
            type: 'expense',
            status: ['drafts', 'outstanding'],
            filters: {operator: 'eq', left: 'reimbursable', right: 'yes'},
            flatFilters: [{key: 'reimbursable', filters: [{operator: 'eq', value: 'yes'}]}],
            inputQuery: '',
            recentSearchHash: 89,
            similarSearchHash: unapprovedCashSimilarSearchHash,
            sortBy: 'tag',
            sortOrder: 'asc',
        })),
        buildCannedSearchQuery: jest.fn(),
    };
});

jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<typeof PolicyUtils>('@libs/PolicyUtils'),
    isPaidGroupPolicy: jest.fn().mockReturnValue(true),
    isGroupPolicy: jest.fn().mockReturnValue(true),
    isPolicyOwner: jest.fn().mockImplementation((policy?: OnyxEntry<Policy>, currentUserAccountID?: number) => !!currentUserAccountID && policy?.ownerAccountID === currentUserAccountID),
}));

const CARLOS_EMAIL = 'cmartins@expensifail.com';
const CARLOS_ACCOUNT_ID = 1;
const CARLOS_PARTICIPANT: Participant = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, role: 'member'};
const JULES_EMAIL = 'jules@expensifail.com';
const JULES_ACCOUNT_ID = 2;
const JULES_PARTICIPANT: Participant = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, role: 'member'};
const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;
const RORY_PARTICIPANT: Participant = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, role: 'admin'};
const VIT_EMAIL = 'vit@expensifail.com';
const VIT_ACCOUNT_ID = 4;

OnyxUpdateManager();
describe('actions/IOU', () => {
    const currentUserPersonalDetails: CurrentUserPersonalDetails = {
        ...createPersonalDetails(RORY_ACCOUNT_ID),
        login: RORY_EMAIL,
        email: RORY_EMAIL,
        displayName: RORY_EMAIL,
        avatar: 'https://example.com/avatar.jpg',
    };

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}},
                [ONYXKEYS.CURRENCY_LIST]: currencyList,
            },
        });
        initOnyxDerivedValues();
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    let mockFetch: MockFetch;
    beforeEach(() => {
        jest.clearAllTimers();
        global.fetch = getGlobalFetchMock();
        mockFetch = fetch as MockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('requestMoney', () => {
        it('creates new chat if needed', () => {
            const amount = 10000;
            const comment = 'Giv money plz';
            const merchant = 'KFC';
            let iouReportID: string | undefined;
            let createdAction: OnyxEntry<ReportAction>;
            let iouAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>;
            let transactionID: string | undefined;
            let transactionThread: OnyxEntry<Report>;
            let transactionThreadCreatedAction: OnyxEntry<ReportAction>;
            mockFetch?.pause?.();
            requestMoney({
                report: {reportID: ''},
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                },
                transactionParams: {
                    amount,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant,
                    comment,
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                policyRecentlyUsedCurrencies: [],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
            });
            return waitForBatchedUpdates()
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);

                                    // A chat report, a transaction thread, and an iou report should be created
                                    const chatReports = Object.values(allReports ?? {}).filter((report) => report?.type === CONST.REPORT.TYPE.CHAT);
                                    const iouReports = Object.values(allReports ?? {}).filter((report) => report?.type === CONST.REPORT.TYPE.IOU);
                                    expect(Object.keys(chatReports).length).toBe(2);
                                    expect(Object.keys(iouReports).length).toBe(1);
                                    const chatReport = chatReports.at(0);
                                    const transactionThreadReport = chatReports.at(1);
                                    const iouReport = iouReports.at(0);
                                    iouReportID = iouReport?.reportID;
                                    transactionThread = transactionThreadReport;

                                    expect(iouReport?.participants).toEqual({
                                        [RORY_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
                                        [CARLOS_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
                                    });

                                    // They should be linked together
                                    expect(chatReport?.participants).toEqual({[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT});
                                    expect(chatReport?.iouReportID).toBe(iouReport?.reportID);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${iouReportID}`,
                                callback: (iouReportMetadata) => {
                                    Onyx.disconnect(connection);
                                    expect(iouReportMetadata?.isOptimisticReport).toBe(true);

                                    const loadingStateConnection = Onyx.connect({
                                        key: `${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${iouReportID}`,
                                        callback: (iouReportLoadingState) => {
                                            Onyx.disconnect(loadingStateConnection);
                                            expect(iouReportLoadingState?.hasOnceLoadedReportActions).toBe(true);
                                            resolve();
                                        },
                                    });
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                waitForCollectionCallback: false,
                                callback: (reportActionsForIOUReport) => {
                                    Onyx.disconnect(connection);

                                    // The IOU report should have a CREATED action and IOU action
                                    expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(2);
                                    const createdActions = Object.values(reportActionsForIOUReport ?? {}).filter(
                                        (reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED,
                                    );
                                    const iouActions = Object.values(reportActionsForIOUReport ?? {}).filter(
                                        (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => isMoneyRequestAction(reportAction),
                                    );
                                    expect(Object.values(createdActions).length).toBe(1);
                                    expect(Object.values(iouActions).length).toBe(1);
                                    createdAction = createdActions?.at(0);
                                    iouAction = iouActions?.at(0);
                                    const originalMessage = isMoneyRequestAction(iouAction) ? getOriginalMessage(iouAction) : undefined;

                                    // The CREATED action should not be created after the IOU action
                                    expect(Date.parse(createdAction?.created ?? '')).toBeLessThan(Date.parse(iouAction?.created ?? ''));

                                    // The action's reportID should be the IOU report
                                    expect(iouAction?.reportID).toBe(iouReportID);

                                    // The comment should be included in the IOU action
                                    expect(originalMessage?.comment).toBe(comment);

                                    // The amount in the IOU action should be correct
                                    expect(originalMessage?.amount).toBe(amount);

                                    // The IOU type should be correct
                                    expect(originalMessage?.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);

                                    // Both actions should be pending
                                    expect(createdAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    expect(iouAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread?.reportID}`,
                                waitForCollectionCallback: false,
                                callback: (reportActionsForTransactionThread) => {
                                    Onyx.disconnect(connection);

                                    // The transaction thread should have a CREATED action
                                    expect(Object.values(reportActionsForTransactionThread ?? {}).length).toBe(1);
                                    const createdActions = Object.values(reportActionsForTransactionThread ?? {}).filter(
                                        (reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED,
                                    );
                                    expect(Object.values(createdActions).length).toBe(1);
                                    transactionThreadCreatedAction = createdActions.at(0);

                                    expect(transactionThreadCreatedAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.TRANSACTION,
                                waitForCollectionCallback: true,
                                callback: (allTransactions) => {
                                    Onyx.disconnect(connection);

                                    // There should be one transaction
                                    expect(Object.values(allTransactions ?? {}).length).toBe(1);
                                    const transaction = Object.values(allTransactions ?? []).find((t) => !isEmptyObject(t));
                                    transactionID = transaction?.transactionID;

                                    // The transaction should be attached to the IOU report
                                    expect(transaction?.reportID).toBe(iouReportID);

                                    // Its amount should match the amount of the expense
                                    expect(transaction?.amount).toBe(amount);

                                    // The comment should be correct
                                    expect(transaction?.comment?.comment).toBe(comment);

                                    // It should be pending
                                    expect(transaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    // The transactionID on the iou action should match the one from the transactions collection
                                    expect(iouAction && getOriginalMessage(iouAction)?.IOUTransactionID).toBe(transactionID);

                                    expect(transaction?.merchant).toBe(merchant);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.SNAPSHOT,
                                waitForCollectionCallback: true,
                                callback: (snapshotData) => {
                                    Onyx.disconnect(connection);

                                    // Snapshot data shouldn't be updated optimistically for requestMoney when the current search query type is invoice.
                                    expect(snapshotData).toBeUndefined();
                                    resolve();
                                },
                            });
                        }),
                )
                .then(mockFetch?.resume)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                waitForCollectionCallback: false,
                                callback: (reportActionsForIOUReport) => {
                                    Onyx.disconnect(connection);
                                    expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(2);
                                    for (const reportAction of Object.values(reportActionsForIOUReport ?? {})) {
                                        expect(reportAction?.pendingAction).toBeFalsy();
                                    }
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                                waitForCollectionCallback: false,
                                callback: (transaction) => {
                                    Onyx.disconnect(connection);
                                    expect(transaction?.pendingAction).toBeFalsy();
                                    resolve();
                                },
                            });
                        }),
                );
        });

        it('updates existing chat report if there is one', () => {
            const amount = 10000;
            const comment = 'Giv money plz';
            let chatReport: Report = {
                reportID: '1234',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT},
            };
            const createdAction: ReportAction = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: DateUtils.getDBTime(),
            };
            let iouReportID: string | undefined;
            let iouAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>;
            let iouCreatedAction: OnyxEntry<ReportAction>;
            let transactionID: string | undefined;
            mockFetch?.pause?.();
            return Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport)
                .then(() =>
                    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`, {
                        [createdAction.reportActionID]: createdAction,
                    }),
                )
                .then(() => {
                    requestMoney({
                        report: chatReport,
                        participantParams: {
                            payeeEmail: RORY_EMAIL,
                            payeeAccountID: RORY_ACCOUNT_ID,
                            participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                        },
                        transactionParams: {
                            amount,
                            attendees: [],
                            currency: CONST.CURRENCY.USD,
                            created: '',
                            merchant: '(none)',
                            comment,
                        },
                        shouldGenerateTransactionThreadReport: true,
                        isASAPSubmitBetaEnabled: false,
                        transactionViolations: {},
                        currentUserAccountIDParam: 123,
                        currentUserEmailParam: 'existing@example.com',
                        policyRecentlyUsedCurrencies: [],
                        existingTransactionDraft: undefined,
                        draftTransactionIDs: [],
                        isSelfTourViewed: false,
                        quickAction: undefined,
                        betas: [CONST.BETAS.ALL],
                        personalDetails: {},
                    });
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);

                                    // The same chat report should be reused, a transaction thread and an IOU report should be created
                                    expect(Object.values(allReports ?? {}).length).toBe(3);
                                    expect(Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.CHAT)?.reportID).toBe(chatReport.reportID);
                                    chatReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.CHAT) ?? chatReport;
                                    const iouReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);
                                    iouReportID = iouReport?.reportID;

                                    expect(iouReport?.participants).toEqual({
                                        [RORY_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
                                        [CARLOS_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
                                    });

                                    // They should be linked together
                                    expect(chatReport.iouReportID).toBe(iouReportID);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                waitForCollectionCallback: false,
                                callback: (allIOUReportActions) => {
                                    Onyx.disconnect(connection);

                                    iouCreatedAction = Object.values(allIOUReportActions ?? {}).find((reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);
                                    iouAction = Object.values(allIOUReportActions ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                                        isMoneyRequestAction(reportAction),
                                    );
                                    const originalMessage = iouAction ? getOriginalMessage(iouAction) : null;

                                    // The CREATED action should not be created after the IOU action
                                    expect(Date.parse(iouCreatedAction?.created ?? '')).toBeLessThan(Date.parse(iouAction?.created ?? ''));

                                    // The action's reportID should be the IOU report
                                    expect(iouAction?.reportID).toBe(iouReportID);

                                    // The comment should be included in the IOU action
                                    expect(originalMessage?.comment).toBe(comment);

                                    // The amount in the IOU action should be correct
                                    expect(originalMessage?.amount).toBe(amount);

                                    // The IOU action type should be correct
                                    expect(originalMessage?.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);

                                    // The IOU action should be pending
                                    expect(iouAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.TRANSACTION,
                                waitForCollectionCallback: true,
                                callback: (allTransactions) => {
                                    Onyx.disconnect(connection);

                                    // There should be one transaction
                                    expect(Object.values(allTransactions ?? {}).length).toBe(1);
                                    const transaction = Object.values(allTransactions ?? {}).find((t) => !isEmptyObject(t));
                                    transactionID = transaction?.transactionID;
                                    const originalMessage = iouAction ? getOriginalMessage(iouAction) : null;

                                    // The transaction should be attached to the IOU report
                                    expect(transaction?.reportID).toBe(iouReportID);

                                    // Its amount should match the amount of the expense
                                    expect(transaction?.amount).toBe(amount);

                                    // The comment should be correct
                                    expect(transaction?.comment?.comment).toBe(comment);

                                    expect(transaction?.merchant).toBe(CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT);

                                    // It should be pending
                                    expect(transaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    // The transactionID on the iou action should match the one from the transactions collection
                                    expect(originalMessage?.IOUTransactionID).toBe(transactionID);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(mockFetch?.resume)
                .then(waitForBatchedUpdates)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                waitForCollectionCallback: false,
                                callback: (reportActionsForIOUReport) => {
                                    Onyx.disconnect(connection);
                                    expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(2);
                                    for (const reportAction of Object.values(reportActionsForIOUReport ?? {})) {
                                        expect(reportAction?.pendingAction).toBeFalsy();
                                    }
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                                callback: (transaction) => {
                                    Onyx.disconnect(connection);
                                    expect(transaction?.pendingAction).toBeFalsy();
                                    resolve();
                                },
                            });
                        }),
                );
        });

        it('updates existing IOU report if there is one', () => {
            const amount = 10000;
            const comment = 'Giv money plz';
            const chatReportID = '1234';
            const iouReportID = '5678';
            let chatReport: OnyxEntry<Report> = {
                reportID: chatReportID,
                type: CONST.REPORT.TYPE.CHAT,
                iouReportID,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT},
            };
            const createdAction: ReportAction = {
                reportActionID: rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: DateUtils.getDBTime(),
            };
            const existingTransaction: Transaction = {
                transactionID: rand64(),
                amount: 1000,
                comment: {
                    comment: 'Existing transaction',
                    attendees: [{email: 'text@expensify.com', displayName: 'Test User', avatarUrl: ''}],
                },
                created: DateUtils.getDBTime(),
                currency: CONST.CURRENCY.USD,
                merchant: '',
                reportID: '',
            };
            let iouReport: OnyxEntry<Report> = {
                reportID: iouReportID,
                chatReportID,
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: RORY_ACCOUNT_ID,
                managerID: CARLOS_ACCOUNT_ID,
                currency: CONST.CURRENCY.USD,
                total: existingTransaction.amount,
            };
            const iouAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> = {
                reportActionID: rand64(),
                reportID: iouReportID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: RORY_ACCOUNT_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUTransactionID: existingTransaction.transactionID,
                    amount: existingTransaction.amount,
                    currency: CONST.CURRENCY.USD,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    participantAccountIDs: [RORY_ACCOUNT_ID, CARLOS_ACCOUNT_ID],
                },
            };
            let newIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>;
            let newTransaction: OnyxEntry<Transaction>;
            mockFetch?.pause?.();
            return Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, chatReport)
                .then(() => Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, iouReport ?? null))
                .then(() =>
                    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`, {
                        [createdAction.reportActionID]: createdAction,
                        [iouAction.reportActionID]: iouAction,
                    }),
                )
                .then(() => Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${existingTransaction.transactionID}`, existingTransaction))
                .then(() => {
                    if (chatReport) {
                        requestMoney({
                            report: chatReport,
                            participantParams: {
                                payeeEmail: RORY_EMAIL,
                                payeeAccountID: RORY_ACCOUNT_ID,
                                participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                            },
                            transactionParams: {
                                amount,
                                attendees: [],
                                currency: CONST.CURRENCY.USD,
                                created: '',
                                merchant: '',
                                comment,
                            },
                            shouldGenerateTransactionThreadReport: true,
                            isASAPSubmitBetaEnabled: false,
                            transactionViolations: {},
                            currentUserAccountIDParam: 123,
                            currentUserEmailParam: 'existing@example.com',
                            policyRecentlyUsedCurrencies: [],
                            existingTransactionDraft: undefined,
                            draftTransactionIDs: [],
                            isSelfTourViewed: false,
                            quickAction: undefined,
                            betas: [CONST.BETAS.ALL],
                            personalDetails: {},
                        });
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);

                                    // No new reports should be created
                                    expect(Object.values(allReports ?? {}).length).toBe(3);
                                    expect(Object.values(allReports ?? {}).find((report) => report?.reportID === chatReportID)).toBeTruthy();
                                    expect(Object.values(allReports ?? {}).find((report) => report?.reportID === iouReportID)).toBeTruthy();

                                    chatReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.CHAT);
                                    iouReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);

                                    // The total on the iou report should be updated
                                    expect(iouReport?.total).toBe(11000);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                waitForCollectionCallback: false,
                                callback: (reportActionsForIOUReport) => {
                                    Onyx.disconnect(connection);

                                    expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(3);
                                    newIOUAction = Object.values(reportActionsForIOUReport ?? {}).find(
                                        (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                                            reportAction?.reportActionID !== createdAction.reportActionID && reportAction?.reportActionID !== iouAction?.reportActionID,
                                    );

                                    const newOriginalMessage = newIOUAction ? getOriginalMessage(newIOUAction) : null;

                                    // The action's reportID should be the IOU report
                                    expect(iouAction.reportID).toBe(iouReportID);

                                    // The comment should be included in the IOU action
                                    expect(newOriginalMessage?.comment).toBe(comment);

                                    // The amount in the IOU action should be correct
                                    expect(newOriginalMessage?.amount).toBe(amount);

                                    // The type of the IOU action should be correct
                                    expect(newOriginalMessage?.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);

                                    // The IOU action should be pending
                                    expect(newIOUAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.TRANSACTION,
                                waitForCollectionCallback: true,
                                callback: (allTransactions) => {
                                    Onyx.disconnect(connection);

                                    // There should be two transactions
                                    expect(Object.values(allTransactions ?? {}).length).toBe(2);

                                    newTransaction = Object.values(allTransactions ?? {}).find((transaction) => transaction?.transactionID !== existingTransaction.transactionID);

                                    expect(newTransaction?.reportID).toBe(iouReportID);
                                    expect(newTransaction?.amount).toBe(amount);
                                    expect(newTransaction?.comment?.comment).toBe(comment);
                                    expect(newTransaction?.merchant).toBe(CONST.TRANSACTION.DEFAULT_MERCHANT);
                                    expect(newTransaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    // The transactionID on the iou action should match the one from the transactions collection
                                    expect(isMoneyRequestAction(newIOUAction) ? getOriginalMessage(newIOUAction)?.IOUTransactionID : undefined).toBe(newTransaction?.transactionID);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(mockFetch?.resume)
                .then(waitForNetworkPromises)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                waitForCollectionCallback: false,
                                callback: (reportActionsForIOUReport) => {
                                    Onyx.disconnect(connection);
                                    expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(3);
                                    for (const reportAction of Object.values(reportActionsForIOUReport ?? {})) {
                                        expect(reportAction?.pendingAction).toBeFalsy();
                                    }
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.TRANSACTION,
                                waitForCollectionCallback: true,
                                callback: (allTransactions) => {
                                    Onyx.disconnect(connection);
                                    for (const transaction of Object.values(allTransactions ?? {})) {
                                        expect(transaction?.pendingAction).toBeFalsy();
                                    }
                                    resolve();
                                },
                            });
                        }),
                );
        });

        it('correctly implements RedBrickRoad error handling', () => {
            const amount = 10000;
            const comment = 'Giv money plz';
            let chatReportID: string | undefined;
            let iouReportID: string | undefined;
            let createdAction: OnyxEntry<ReportAction>;
            let iouAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>;
            let transactionID: string | undefined;
            let transactionThreadReport: OnyxEntry<Report>;
            let transactionThreadAction: OnyxEntry<ReportAction>;
            mockFetch?.pause?.();
            requestMoney({
                report: {reportID: ''},
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                },
                transactionParams: {
                    amount,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: '',
                    comment,
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                policyRecentlyUsedCurrencies: [],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
            });
            return (
                waitForBatchedUpdates()
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT,
                                    waitForCollectionCallback: true,
                                    callback: (allReports) => {
                                        Onyx.disconnect(connection);

                                        // A chat report, transaction thread and an iou report should be created
                                        const chatReports = Object.values(allReports ?? {}).filter((report) => report?.type === CONST.REPORT.TYPE.CHAT);
                                        const iouReports = Object.values(allReports ?? {}).filter((report) => report?.type === CONST.REPORT.TYPE.IOU);
                                        expect(Object.values(chatReports).length).toBe(2);
                                        expect(Object.values(iouReports).length).toBe(1);
                                        const chatReport = chatReports.at(0);
                                        chatReportID = chatReport?.reportID;
                                        transactionThreadReport = chatReports.at(1);

                                        const iouReport = iouReports.at(0);
                                        iouReportID = iouReport?.reportID;

                                        expect(chatReport?.participants).toStrictEqual({[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT});

                                        // They should be linked together
                                        expect(chatReport?.participants).toStrictEqual({[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT});
                                        expect(chatReport?.iouReportID).toBe(iouReport?.reportID);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActionsForIOUReport) => {
                                        Onyx.disconnect(connection);

                                        // The chat report should have a CREATED action and IOU action
                                        expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(2);
                                        const createdActions =
                                            Object.values(reportActionsForIOUReport ?? {}).filter((reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) ?? null;
                                        const iouActions =
                                            Object.values(reportActionsForIOUReport ?? {}).filter((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                                                isMoneyRequestAction(reportAction),
                                            ) ?? null;
                                        expect(Object.values(createdActions).length).toBe(1);
                                        expect(Object.values(iouActions).length).toBe(1);
                                        createdAction = createdActions.at(0);
                                        iouAction = iouActions.at(0);
                                        const originalMessage = getOriginalMessage(iouAction);

                                        // The CREATED action should not be created after the IOU action
                                        expect(Date.parse(createdAction?.created ?? '')).toBeLessThan(Date.parse(iouAction?.created ?? ''));

                                        // The action's reportID should be the IOU report
                                        expect(iouAction?.reportID).toBe(iouReportID);

                                        // The comment should be included in the IOU action
                                        expect(originalMessage?.comment).toBe(comment);

                                        // The amount in the IOU action should be correct
                                        expect(originalMessage?.amount).toBe(amount);

                                        // The type should be correct
                                        expect(originalMessage?.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);

                                        // Both actions should be pending
                                        expect(createdAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        expect(iouAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                                    waitForCollectionCallback: true,
                                    callback: (allTransactions) => {
                                        Onyx.disconnect(connection);

                                        // There should be one transaction
                                        expect(Object.values(allTransactions ?? {}).length).toBe(1);
                                        const transaction = Object.values(allTransactions ?? {}).find((t) => !isEmptyObject(t));
                                        transactionID = transaction?.transactionID;

                                        expect(transaction?.reportID).toBe(iouReportID);
                                        expect(transaction?.amount).toBe(amount);
                                        expect(transaction?.comment?.comment).toBe(comment);
                                        expect(transaction?.merchant).toBe(CONST.TRANSACTION.DEFAULT_MERCHANT);
                                        expect(transaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                        // The transactionID on the iou action should match the one from the transactions collection
                                        expect(iouAction && getOriginalMessage(iouAction)?.IOUTransactionID).toBe(transactionID);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then((): Promise<unknown> => {
                        mockFetch?.fail?.();
                        return mockFetch?.resume?.() as Promise<unknown>;
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActionsForIOUReport) => {
                                        Onyx.disconnect(connection);
                                        expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(2);
                                        iouAction = Object.values(reportActionsForIOUReport ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                                            isMoneyRequestAction(reportAction),
                                        );
                                        expect(iouAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                    waitForCollectionCallback: true,
                                    callback: (reportActionsForTransactionThread) => {
                                        Onyx.disconnect(connection);
                                        expect(Object.values(reportActionsForTransactionThread ?? {}).length).toBe(3);
                                        transactionThreadAction = Object.values(
                                            reportActionsForTransactionThread?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`] ?? {},
                                        ).find((reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);
                                        expect(transactionThreadAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                                    waitForCollectionCallback: false,
                                    callback: (transaction) => {
                                        Onyx.disconnect(connection);
                                        expect(transaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        expect(transaction?.errors).toBeTruthy();
                                        expect(Object.values(transaction?.errors ?? {}).at(0)).toEqual(translateLocal('iou.error.genericCreateFailureMessage'));
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // If the user clears the errors on the IOU action
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                if (iouReportID) {
                                    clearAllRelatedReportActionErrors(iouReportID, iouAction ?? null, iouReportID);
                                }
                                resolve();
                            }),
                    )

                    // Then the reportAction from chat report should be removed from Onyx
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActionsForReport) => {
                                        Onyx.disconnect(connection);
                                        iouAction = Object.values(reportActionsForReport ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                                            isMoneyRequestAction(reportAction),
                                        );
                                        expect(iouAction).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // Then the reportAction from iou report should be removed from Onyx
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActionsForReport) => {
                                        Onyx.disconnect(connection);
                                        iouAction = Object.values(reportActionsForReport ?? {}).find((reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
                                            isMoneyRequestAction(reportAction),
                                        );
                                        expect(iouAction).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // Then the reportAction from transaction report should be removed from Onyx
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActionsForReport) => {
                                        Onyx.disconnect(connection);
                                        expect(reportActionsForReport).toMatchObject({});
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // Along with the associated transaction
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                                    waitForCollectionCallback: false,
                                    callback: (transaction) => {
                                        Onyx.disconnect(connection);
                                        expect(transaction).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // If a user clears the errors on the CREATED action (which, technically are just errors on the report)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                if (chatReportID) {
                                    deleteReport(chatReportID);
                                }
                                if (transactionThreadReport?.reportID) {
                                    deleteReport(transactionThreadReport?.reportID);
                                }
                                resolve();
                            }),
                    )

                    // Then the report should be deleted
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT,
                                    waitForCollectionCallback: true,
                                    callback: (allReports) => {
                                        Onyx.disconnect(connection);
                                        for (const report of Object.values(allReports ?? {})) {
                                            expect(report).toBeFalsy();
                                        }
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // All reportActions should also be deleted
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                    waitForCollectionCallback: false,
                                    callback: (allReportActions) => {
                                        Onyx.disconnect(connection);
                                        for (const reportAction of Object.values(allReportActions ?? {})) {
                                            expect(reportAction).toBeFalsy();
                                        }
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // All transactions should also be deleted
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                                    waitForCollectionCallback: true,
                                    callback: (allTransactions) => {
                                        Onyx.disconnect(connection);
                                        for (const transaction of Object.values(allTransactions ?? {})) {
                                            expect(transaction).toBeFalsy();
                                        }
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // Cleanup
                    .then(mockFetch?.succeed)
            );
        });

        it('correctly implements RedBrickRoad error handling for ShareTrackedExpense when inviting new user to workspace', async () => {
            const amount = 5000;
            const comment = 'Shared tracked expense test';

            // Setup test data - create a self DM report and policy expense chat
            const selfDMReport: Report = {
                reportID: '1',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT},
            };

            const policy: Policy = {
                id: 'policy123',
                name: 'Test Policy',
                role: CONST.POLICY.ROLE.ADMIN,
                type: CONST.POLICY.TYPE.TEAM,
                owner: RORY_EMAIL,
                outputCurrency: CONST.CURRENCY.USD,
                isPolicyExpenseChatEnabled: true,
                employeeList: {
                    [CARLOS_EMAIL]: {
                        role: CONST.POLICY.ROLE.ADMIN,
                    },
                },
            };

            const policyExpenseChat: Report = {
                reportID: '2',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: policy.id,
                participants: {
                    [RORY_ACCOUNT_ID]: RORY_PARTICIPANT,
                    [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT,
                },
            };

            // New accountant that is NOT in the workspace employee list (this will trigger the invitation)
            const accountant = {
                accountID: 999,
                login: 'newaccountant@test.com',
                email: 'newaccountant@test.com',
            };

            mockFetch?.pause?.();

            // Setup initial data
            await Promise.all([
                Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport),
                Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`, policyExpenseChat),
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy),
                Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[accountant.accountID]: accountant}),
            ]);
            await waitForBatchedUpdates();

            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            // First create a tracked expense in self DM
            trackExpense({
                report: selfDMReport,
                isDraftPolicy: true,
                action: CONST.IOU.ACTION.CREATE,
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {accountID: RORY_ACCOUNT_ID},
                },
                transactionParams: {
                    amount,
                    currency: CONST.CURRENCY.USD,
                    created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                    merchant: 'Test Merchant',
                    comment,
                    billable: false,
                },
                isASAPSubmitBetaEnabled: false,
                currentUser: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                introSelected: undefined,
                quickAction: undefined,
                recentWaypoints,
                betas: [CONST.BETAS.ALL],
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                currentUserLocalCurrency: undefined,
                reportActionsList: undefined,
            });

            mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Capture the created tracked expense data
            let selfDMReportID: string | undefined;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.REPORT,
                waitForCollectionCallback: true,
                callback: (reports) => {
                    const selfDMReportOnyx = Object.values(reports ?? {}).find((report) => report?.reportID === selfDMReport.reportID);
                    selfDMReportID = selfDMReportOnyx?.reportID;
                },
            });

            const reportActions = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReportID}`);
            const actions = Object.values(reportActions ?? {});
            const linkedTrackedExpenseReportAction = actions.find((action) => action && isMoneyRequestAction(action));
            const actionableWhisperReportActionID = actions.find((action) => action && isActionableTrackExpense(action))?.reportActionID;

            let linkedTrackedExpenseReportID: string | undefined;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.TRANSACTION,
                waitForCollectionCallback: true,
                callback: (allTransactions) => {
                    const transaction = Object.values(allTransactions ?? {}).find((t) => !isEmptyObject(t));
                    linkedTrackedExpenseReportID = transaction?.reportID;
                },
            });

            // Now pause fetch and share the tracked expense with accountant
            mockFetch?.pause?.();
            trackExpense({
                report: policyExpenseChat,
                isDraftPolicy: false,
                action: CONST.IOU.ACTION.SHARE,
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {reportID: policyExpenseChat.reportID, isPolicyExpenseChat: true},
                },
                policyParams: {
                    policy,
                },
                transactionParams: {
                    amount,
                    currency: CONST.CURRENCY.USD,
                    created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                    merchant: 'Test Merchant',
                    comment,
                    billable: false,
                    actionableWhisperReportActionID,
                    linkedTrackedExpenseReportAction,
                    linkedTrackedExpenseReportID,
                },
                accountantParams: {
                    accountant,
                },
                isASAPSubmitBetaEnabled: false,
                currentUser: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                introSelected: undefined,
                quickAction: undefined,
                recentWaypoints,
                betas: [CONST.BETAS.ALL],
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                currentUserLocalCurrency: undefined,
                reportActionsList: undefined,
            });
            await waitForBatchedUpdates();

            // Simulate network failure
            mockFetch?.fail?.();
            await (mockFetch?.resume?.() as Promise<unknown>);

            // Verify error handling after failure - focus on workspace invitation error
            const policyData = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`);

            // The new accountant should have been added to the employee list with error
            const accountantEmployee = policyData?.employeeList?.[accountant.email];
            expect(accountantEmployee).toBeTruthy();
            expect(accountantEmployee?.errors).toBeTruthy();
            expect(Object.values(accountantEmployee?.errors ?? {}).at(0)).toEqual(translateLocal('workspace.people.error.genericAdd'));

            // Cleanup
            mockFetch?.succeed?.();
        });

        it('does not trigger notifyNewAction when doing the money request in a money request report', () => {
            requestMoney({
                report: {reportID: '123', type: CONST.REPORT.TYPE.EXPENSE},
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                },
                transactionParams: {
                    amount: 1,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: '',
                    comment: '',
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                policyRecentlyUsedCurrencies: [],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
            });
            expect(notifyNewAction).toHaveBeenCalledTimes(0);
        });

        it('trigger notifyNewAction when doing the money request in a chat report', () => {
            requestMoney({
                report: {reportID: '123'},
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                },
                transactionParams: {
                    amount: 1,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: '',
                    comment: '',
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                policyRecentlyUsedCurrencies: [],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
            });
            expect(Navigation.setNavigationActionToMicrotaskQueue).toHaveBeenCalledTimes(1);
        });

        it('should pass isSelfTourViewed true to the request when user has viewed the tour', () => {
            const {iouReport} = requestMoney({
                report: {reportID: ''},
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                },
                transactionParams: {
                    amount: 1000,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: 'Test Merchant',
                    comment: 'Test comment',
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                policyRecentlyUsedCurrencies: [],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                isSelfTourViewed: true,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
            });
            // Verify that the iouReport is created successfully when isSelfTourViewed is true
            expect(iouReport).toBeDefined();
            expect(iouReport?.reportID).toBeDefined();
        });

        it('increase the nonReimbursableTotal only when the expense is not reimbursable', async () => {
            const expenseReport: Report = {
                ...createRandomReport(0, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                nonReimbursableTotal: 0,
                total: 0,
                ownerAccountID: RORY_ACCOUNT_ID,
                currency: CONST.CURRENCY.USD,
            };
            const workspaceChat: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                type: CONST.REPORT.TYPE.CHAT,
                iouReportID: expenseReport.reportID,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${workspaceChat.reportID}`, workspaceChat);

            requestMoney({
                report: expenseReport,
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {reportID: workspaceChat.reportID, isPolicyExpenseChat: true},
                },
                transactionParams: {
                    amount: 100,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: '',
                    comment: '',
                    reimbursable: true,
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: 123,
                policyRecentlyUsedCurrencies: [],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                currentUserEmailParam: 'existing@example.com',
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
            });

            await waitForBatchedUpdates();

            const nonReimbursableTotal = await new Promise<number>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        resolve(report?.nonReimbursableTotal ?? 0);
                    },
                });
            });

            expect(nonReimbursableTotal).toBe(0);

            requestMoney({
                report: expenseReport,
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {reportID: workspaceChat.reportID, isPolicyExpenseChat: true},
                },
                transactionParams: {
                    amount: 100,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: '',
                    comment: '',
                    reimbursable: false,
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                policyRecentlyUsedCurrencies: [],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
            });

            await waitForBatchedUpdates();

            const newNonReimbursableTotal = await new Promise<number>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport?.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        resolve(report?.nonReimbursableTotal ?? 0);
                    },
                });
            });

            expect(newNonReimbursableTotal).toBe(-100);
        });

        it('should update policyRecentlyUsedTags when tag is provided', async () => {
            // Given a policy recently used tags
            const transactionTag = 'new tag';
            const policyID = 'A';
            const tagName = 'Tag';
            const expenseReport: Report = {
                ...createRandomReport(0, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                nonReimbursableTotal: 0,
                total: 0,
                ownerAccountID: RORY_ACCOUNT_ID,
                currency: CONST.CURRENCY.USD,
                policyID,
            };
            const policyRecentlyUsedTags: OnyxEntry<RecentlyUsedTags> = {
                [tagName]: ['old tag'],
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {
                [tagName]: {name: tagName},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`, policyRecentlyUsedTags);
            const policyTagList = (await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`)) ?? {};

            // When requesting money
            requestMoney({
                report: expenseReport,
                existingIOUReport: expenseReport,
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {reportID: '1', isPolicyExpenseChat: true},
                },
                policyParams: {policyRecentlyUsedTags, policyTagList},
                transactionParams: {
                    amount: 100,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: '',
                    comment: '',
                    tag: transactionTag,
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                currentUserEmailParam: currentUserPersonalDetails.login ?? '',
                policyRecentlyUsedCurrencies: [],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
            });
            waitForBatchedUpdates();

            // Then the transaction tag should be added to the recently used tags collection
            const newPolicyRecentlyUsedTags: RecentlyUsedTags = await new Promise((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`,
                    callback: (recentlyUsedTags) => {
                        resolve(recentlyUsedTags ?? {});
                        Onyx.disconnect(connection);
                    },
                });
            });
            expect(newPolicyRecentlyUsedTags[tagName].length).toBe(2);
            expect(newPolicyRecentlyUsedTags[tagName].at(0)).toBe(transactionTag);
        });

        it('should use personalDetails to create expense with participant display name', async () => {
            const testPersonalDetails: PersonalDetailsList = {
                [CARLOS_ACCOUNT_ID]: {
                    accountID: CARLOS_ACCOUNT_ID,
                    login: CARLOS_EMAIL,
                    displayName: 'Carlos Martinez',
                    firstName: 'Carlos',
                    lastName: 'Martinez',
                    avatar: 'https://example.com/carlos.jpg',
                },
                [RORY_ACCOUNT_ID]: {
                    accountID: RORY_ACCOUNT_ID,
                    login: RORY_EMAIL,
                    displayName: 'Rory Smith',
                    firstName: 'Rory',
                    lastName: 'Smith',
                    avatar: 'https://example.com/rory.jpg',
                },
            };

            const amount = 5000;
            const comment = 'Test expense with personal details';
            const merchant = 'Test Store';

            const {iouReport} = requestMoney({
                report: {reportID: ''},
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                },
                transactionParams: {
                    amount,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant,
                    comment,
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                policyRecentlyUsedCurrencies: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                personalDetails: testPersonalDetails,
                betas: [CONST.BETAS.ALL],
            });

            expect(iouReport).toBeDefined();
            expect(iouReport?.reportID).toBeDefined();

            // Verify that the expense was created successfully with the personal details
            await waitForBatchedUpdates();

            const createdIouReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`);
            expect(createdIouReport).toBeDefined();
            expect(createdIouReport?.ownerAccountID).toBe(RORY_ACCOUNT_ID);
        });

        it('should create expense correctly when personalDetails contains multiple users', async () => {
            const testPersonalDetails: PersonalDetailsList = {
                [CARLOS_ACCOUNT_ID]: {
                    accountID: CARLOS_ACCOUNT_ID,
                    login: CARLOS_EMAIL,
                    displayName: 'Carlos Martinez',
                    firstName: 'Carlos',
                    lastName: 'Martinez',
                },
                [JULES_ACCOUNT_ID]: {
                    accountID: JULES_ACCOUNT_ID,
                    login: JULES_EMAIL,
                    displayName: 'Jules Thompson',
                    firstName: 'Jules',
                    lastName: 'Thompson',
                },
                [RORY_ACCOUNT_ID]: {
                    accountID: RORY_ACCOUNT_ID,
                    login: RORY_EMAIL,
                    displayName: 'Rory Smith',
                    firstName: 'Rory',
                    lastName: 'Smith',
                },
                [VIT_ACCOUNT_ID]: {
                    accountID: VIT_ACCOUNT_ID,
                    login: VIT_EMAIL,
                    displayName: 'Vit Developer',
                    firstName: 'Vit',
                    lastName: 'Developer',
                },
            };

            const amount = 10000;
            const {iouReport} = requestMoney({
                report: {reportID: ''},
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {login: JULES_EMAIL, accountID: JULES_ACCOUNT_ID},
                },
                transactionParams: {
                    amount,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: 'Multi-user test',
                    comment: 'Testing with multiple personal details',
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                policyRecentlyUsedCurrencies: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                personalDetails: testPersonalDetails,
                betas: [CONST.BETAS.ALL],
            });

            expect(iouReport).toBeDefined();
            expect(iouReport?.reportID).toBeDefined();

            await waitForBatchedUpdates();

            // Verify the IOU report was created successfully with multiple users in personalDetails
            const createdIouReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`);
            expect(createdIouReport).toBeDefined();
            // The IOU report should have the correct owner (payee)
            expect(createdIouReport?.ownerAccountID).toBe(RORY_ACCOUNT_ID);
        });

        it('should handle empty personalDetails gracefully', async () => {
            const amount = 2500;

            const {iouReport} = requestMoney({
                report: {reportID: ''},
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                },
                transactionParams: {
                    amount,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: 'Empty details test',
                    comment: 'Testing with empty personal details',
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                policyRecentlyUsedCurrencies: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                personalDetails: {},
                betas: [CONST.BETAS.ALL],
            });

            // Should still create the expense even with empty personalDetails
            expect(iouReport).toBeDefined();

            await waitForBatchedUpdates();

            const createdIouReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`);
            expect(createdIouReport).toBeDefined();
        });

        it('should update the parentReportID and parentReportActionID of the transactionThreadReport of the transaction when submitted to another report', async () => {
            const amount = 10000;
            const comment = 'Send me money please';
            const chatReport: OnyxEntry<Report> = {
                reportID: '1234',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT},
            };
            const selfDMReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                reportID: '10',
            };
            const TEST_USER_ACCOUNT_ID = 1;
            const TEST_USER_LOGIN = 'test@test.com';

            // Given a test user is signed in with Onyx setup and some initial data
            await signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
            subscribeToUserEvents(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN, undefined);
            await waitForBatchedUpdates();
            await setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID);

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport);
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            // Create a tracked expense
            trackExpense({
                report: selfDMReport,
                isDraftPolicy: true,
                action: CONST.IOU.ACTION.CREATE,
                participantParams: {
                    payeeEmail: TEST_USER_LOGIN,
                    payeeAccountID: TEST_USER_ACCOUNT_ID,
                    participant: {login: RORY_EMAIL, accountID: RORY_ACCOUNT_ID},
                },
                transactionParams: {
                    amount,
                    currency: 'USD',
                    created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
                    merchant: comment,
                    billable: false,
                },
                isASAPSubmitBetaEnabled: false,
                currentUser: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                introSelected: undefined,
                quickAction: undefined,
                recentWaypoints,
                betas: [CONST.BETAS.ALL],
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                currentUserLocalCurrency: undefined,
                reportActionsList: undefined,
            });
            await waitForBatchedUpdates();

            // When fetching all reports from Onyx
            const allReports = await new Promise<OnyxCollection<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (reports) => {
                        Onyx.disconnect(connection);
                        resolve(reports);
                    },
                });
            });

            // Then we should have exactly 2 reports
            expect(Object.values(allReports ?? {}).length).toBe(3);

            // Then one of them should be a chat report with relevant properties
            const transactionThreadReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.CHAT && report?.parentReportID === selfDMReport.reportID);
            expect(transactionThreadReport).toBeTruthy();
            expect(transactionThreadReport).toHaveProperty('reportID');
            expect(transactionThreadReport).toHaveProperty('parentReportActionID');

            await waitForBatchedUpdates();

            // When fetching all report actions from Onyx
            const allReportActions = await new Promise<OnyxCollection<ReportActions>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                    waitForCollectionCallback: true,
                    callback: (actions) => {
                        Onyx.disconnect(connection);
                        resolve(actions);
                    },
                });
            });

            // Then we should find an IOU action with specific properties
            const reportActionsForIOUReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`];
            const createIOUAction = Object.values(reportActionsForIOUReport ?? {}).find(
                (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => reportAction.reportActionID === transactionThreadReport?.parentReportActionID,
            );
            expect(createIOUAction).toBeTruthy();
            expect(createIOUAction?.childReportID).toBe(transactionThreadReport?.reportID);

            // When fetching all transactions from Onyx
            const allTransactions = await new Promise<OnyxCollection<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: (transactions) => {
                        Onyx.disconnect(connection);
                        resolve(transactions);
                    },
                });
            });

            // Then we should find a specific transaction with relevant properties
            const transaction = Object.values(allTransactions ?? {}).find((t) => t);
            expect(transaction).toBeTruthy();
            expect(transaction?.amount).toBe(-amount);
            expect(transaction?.reportID).toBe(CONST.REPORT.UNREPORTED_REPORT_ID);
            expect(createIOUAction && getOriginalMessage(createIOUAction)?.IOUTransactionID).toBe(transaction?.transactionID);

            // When: submitting the tracked expense to another user
            const {iouReport} = requestMoney({
                action: CONST.IOU.ACTION.SUBMIT,
                report: chatReport,
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                },
                transactionParams: {
                    amount,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: '',
                    comment,
                    linkedTrackedExpenseReportAction: createIOUAction,
                    linkedTrackedExpenseReportID: selfDMReport.reportID,
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                transactionViolations: {},
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                policyRecentlyUsedCurrencies: [],
                quickAction: undefined,
                isSelfTourViewed: false,
                existingTransactionDraft: transaction,
                existingTransaction: transaction,
                draftTransactionIDs: [],
                personalDetails: {},
                betas: [CONST.BETAS.ALL],
            });

            await waitForBatchedUpdates();

            // Then: the parentReportID and parentReportActionID of the transactionThreadReport should be updated correctly
            const updatedTransactionThreadReport = await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (reports) => {
                        Onyx.disconnect(connection);
                        resolve(reports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.reportID}`]);
                    },
                });
            });

            const iouReportActionID = getIOUActionForReportID(iouReport?.reportID, transaction?.transactionID)?.reportActionID;
            expect(updatedTransactionThreadReport).toBeTruthy();
            expect(updatedTransactionThreadReport?.parentReportID).toBe(iouReport?.reportID);
            expect(updatedTransactionThreadReport?.parentReportActionID).toBe(iouReportActionID);

            // Also, the fromReportID of movedTransactionAction should be CONST.REPORT.UNREPORTED_REPORT_ID
            const updatedTransactionThreadReportActions = getAllReportActions(transactionThreadReport?.reportID);
            const movedTransactionAction = Object.values(updatedTransactionThreadReportActions ?? {}).find(
                (reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION,
            );
            expect(movedTransactionAction).toBeTruthy();
            const originalMessage = getOriginalMessage(movedTransactionAction) as OriginalMessageMovedTransaction | undefined;
            expect(originalMessage?.fromReportID).toBe(CONST.REPORT.UNREPORTED_REPORT_ID);
        });

        it('creates new chat report when participant does not match existing chat report participants', () => {
            const amount = 10000;
            const comment = 'Test participant mismatch';

            // Create an existing chat report between RORY and JULES (not CARLOS)
            const existingChatReport: Report = {
                reportID: '9999',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [JULES_ACCOUNT_ID]: JULES_PARTICIPANT},
            };

            mockFetch?.pause?.();

            return Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${existingChatReport.reportID}`, existingChatReport)
                .then(() => {
                    // Request money from CARLOS, but pass the existing chat report with JULES
                    // This simulates the scenario where submit frequency is disabled and user selects a different participant
                    requestMoney({
                        report: existingChatReport,
                        participantParams: {
                            payeeEmail: RORY_EMAIL,
                            payeeAccountID: RORY_ACCOUNT_ID,
                            participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                        },
                        transactionParams: {
                            amount,
                            attendees: [],
                            currency: CONST.CURRENCY.USD,
                            created: '',
                            merchant: 'Test',
                            comment,
                        },
                        shouldGenerateTransactionThreadReport: true,
                        isASAPSubmitBetaEnabled: false,
                        transactionViolations: {},
                        currentUserAccountIDParam: RORY_ACCOUNT_ID,
                        currentUserEmailParam: RORY_EMAIL,
                        policyRecentlyUsedCurrencies: [],
                        quickAction: undefined,
                        isSelfTourViewed: false,
                        betas: [CONST.BETAS.ALL],
                        existingTransactionDraft: undefined,
                        draftTransactionIDs: [],
                        personalDetails: {},
                    });
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);

                                    // A NEW chat report should be created for RORY and CARLOS
                                    // The existing chat report between RORY and JULES should still exist
                                    const chatReports = Object.values(allReports ?? {}).filter((report) => report?.type === CONST.REPORT.TYPE.CHAT);

                                    // There should be at least 2 chat reports (existing one + new one for RORY/CARLOS)
                                    // Plus a transaction thread
                                    expect(chatReports.length).toBeGreaterThanOrEqual(2);

                                    // Find the chat report that has RORY and CARLOS as participants
                                    const newChatReport = chatReports.find((report) => {
                                        const participantKeys = Object.keys(report?.participants ?? {}).map(Number);
                                        return participantKeys.includes(RORY_ACCOUNT_ID) && participantKeys.includes(CARLOS_ACCOUNT_ID) && participantKeys.length === 2;
                                    });

                                    // The new chat report should exist and NOT be the existing one
                                    expect(newChatReport).toBeDefined();
                                    expect(newChatReport?.reportID).not.toBe(existingChatReport.reportID);

                                    // The new chat report should have RORY and CARLOS as participants
                                    expect(newChatReport?.participants).toEqual({
                                        [RORY_ACCOUNT_ID]: RORY_PARTICIPANT,
                                        [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT,
                                    });

                                    resolve();
                                },
                            });
                        }),
                )
                .then(mockFetch?.resume);
        });

        it('reuses existing chat report when participant matches chat report participants', () => {
            const amount = 10000;
            const comment = 'Test participant match';

            // Create an existing chat report between RORY and CARLOS (matching the participant)
            const existingChatReport: Report = {
                reportID: '8888',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [CARLOS_ACCOUNT_ID]: CARLOS_PARTICIPANT},
            };

            mockFetch?.pause?.();

            return Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${existingChatReport.reportID}`, existingChatReport)
                .then(() => {
                    // Request money from CARLOS with matching chat report
                    requestMoney({
                        report: existingChatReport,
                        participantParams: {
                            payeeEmail: RORY_EMAIL,
                            payeeAccountID: RORY_ACCOUNT_ID,
                            participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                        },
                        transactionParams: {
                            amount,
                            attendees: [],
                            currency: CONST.CURRENCY.USD,
                            created: '',
                            merchant: 'Test',
                            comment,
                        },
                        shouldGenerateTransactionThreadReport: true,
                        isASAPSubmitBetaEnabled: false,
                        transactionViolations: {},
                        currentUserAccountIDParam: RORY_ACCOUNT_ID,
                        currentUserEmailParam: RORY_EMAIL,
                        policyRecentlyUsedCurrencies: [],
                        quickAction: undefined,
                        isSelfTourViewed: false,
                        betas: [CONST.BETAS.ALL],
                        existingTransactionDraft: undefined,
                        draftTransactionIDs: [],
                        personalDetails: {},
                    });
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);

                                    // The existing chat report should be reused
                                    const chatReports = Object.values(allReports ?? {}).filter((report) => report?.type === CONST.REPORT.TYPE.CHAT);

                                    // Find the chat report that has RORY and CARLOS as participants
                                    const chatReportWithParticipants = chatReports.find((report) => {
                                        const participantKeys = Object.keys(report?.participants ?? {}).map(Number);
                                        return participantKeys.includes(RORY_ACCOUNT_ID) && participantKeys.includes(CARLOS_ACCOUNT_ID) && participantKeys.length === 2;
                                    });

                                    // The existing chat report should be reused
                                    expect(chatReportWithParticipants?.reportID).toBe(existingChatReport.reportID);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(mockFetch?.resume);
        });

        it('skips participant validation for policy expense chat participant', () => {
            const amount = 10000;
            const comment = 'Test policy expense chat';
            const policyID = 'policy123';

            // Create a policy expense chat report
            const policyExpenseChatReport: Report = {
                reportID: '7777',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT},
            };

            mockFetch?.pause?.();

            return Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChatReport.reportID}`, policyExpenseChatReport)
                .then(() => {
                    // Request money with isPolicyExpenseChat: true - should skip participant validation
                    requestMoney({
                        report: policyExpenseChatReport,
                        participantParams: {
                            payeeEmail: RORY_EMAIL,
                            payeeAccountID: RORY_ACCOUNT_ID,
                            participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID, isPolicyExpenseChat: true, reportID: policyExpenseChatReport.reportID},
                        },
                        transactionParams: {
                            amount,
                            attendees: [],
                            currency: CONST.CURRENCY.USD,
                            created: '',
                            merchant: 'Test',
                            comment,
                        },
                        shouldGenerateTransactionThreadReport: true,
                        isASAPSubmitBetaEnabled: false,
                        transactionViolations: {},
                        currentUserAccountIDParam: 123,
                        currentUserEmailParam: 'existing@example.com',
                        policyRecentlyUsedCurrencies: [],
                        quickAction: undefined,
                        isSelfTourViewed: false,
                        betas: [CONST.BETAS.ALL],
                        existingTransactionDraft: undefined,
                        draftTransactionIDs: [],
                        personalDetails: {},
                    });
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);

                                    // The policy expense chat report should be reused (participant validation skipped)
                                    const policyExpenseChats = Object.values(allReports ?? {}).filter((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);

                                    // The original policy expense chat should still exist
                                    expect(policyExpenseChats.some((report) => report?.reportID === policyExpenseChatReport.reportID)).toBe(true);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(mockFetch?.resume);
        });

        it('skips participant validation when chatReport is a Policy Expense Chat', () => {
            const amount = 10000;
            const comment = 'Test chatReport is policy expense chat';
            const policyID = 'policy456';

            // Create a policy expense chat report (the chatReport itself is a policy expense chat)
            const policyExpenseChatReport: Report = {
                reportID: '6666',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT, [JULES_ACCOUNT_ID]: JULES_PARTICIPANT},
            };

            mockFetch?.pause?.();

            return Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChatReport.reportID}`, policyExpenseChatReport)
                .then(() => {
                    // Request money from CARLOS but passing a policy expense chat report with different participants (JULES)
                    // Since the chatReport is a policy expense chat, participant validation should be skipped
                    requestMoney({
                        report: policyExpenseChatReport,
                        participantParams: {
                            payeeEmail: RORY_EMAIL,
                            payeeAccountID: RORY_ACCOUNT_ID,
                            participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                        },
                        transactionParams: {
                            amount,
                            attendees: [],
                            currency: CONST.CURRENCY.USD,
                            created: '',
                            merchant: 'Test',
                            comment,
                        },
                        shouldGenerateTransactionThreadReport: true,
                        isASAPSubmitBetaEnabled: false,
                        transactionViolations: {},
                        currentUserAccountIDParam: 123,
                        currentUserEmailParam: 'existing@example.com',
                        policyRecentlyUsedCurrencies: [],
                        quickAction: undefined,
                        isSelfTourViewed: false,
                        betas: [CONST.BETAS.ALL],
                        existingTransactionDraft: undefined,
                        draftTransactionIDs: [],
                        personalDetails: {},
                    });
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);

                                    // Even though participants don't match (JULES vs CARLOS),
                                    // since the chatReport is a policy expense chat, it should be reused
                                    // (no new 1:1 DM chat should be created for this case)
                                    const policyExpenseChats = Object.values(allReports ?? {}).filter((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);

                                    // The policy expense chat should still exist
                                    expect(policyExpenseChats.some((report) => report?.reportID === policyExpenseChatReport.reportID)).toBe(true);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(mockFetch?.resume);
        });

        it('skips participant validation for self-DM report with accountID 0', () => {
            const amount = 10000;
            const comment = 'Test self-DM track expense';

            // Create a self-DM report (Your Space)
            const selfDMReport: Report = {
                reportID: '5555',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                participants: {[RORY_ACCOUNT_ID]: RORY_PARTICIPANT},
            };

            mockFetch?.pause?.();

            return Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport)
                .then(() => {
                    // Track expense in self-DM with accountID: 0 (as getMoneyRequestParticipantsFromReport does)
                    // This simulates the scenario where user starts an expense from "Your Space"
                    requestMoney({
                        report: selfDMReport,
                        participantParams: {
                            payeeEmail: RORY_EMAIL,
                            payeeAccountID: RORY_ACCOUNT_ID,
                            // accountID: 0 is used for self-DM participants (represents the report itself, not another user)
                            participant: {accountID: 0, reportID: selfDMReport.reportID, isPolicyExpenseChat: false},
                        },
                        transactionParams: {
                            amount,
                            attendees: [],
                            currency: CONST.CURRENCY.USD,
                            created: '',
                            merchant: 'Test',
                            comment,
                        },
                        shouldGenerateTransactionThreadReport: true,
                        isASAPSubmitBetaEnabled: false,
                        transactionViolations: {},
                        currentUserAccountIDParam: RORY_ACCOUNT_ID,
                        currentUserEmailParam: RORY_EMAIL,
                        policyRecentlyUsedCurrencies: [],
                        quickAction: undefined,
                        isSelfTourViewed: false,
                        betas: [CONST.BETAS.ALL],
                        existingTransactionDraft: undefined,
                        draftTransactionIDs: [],
                        personalDetails: {},
                    });
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);

                                    // The self-DM report should be reused (participant validation should be skipped)
                                    // No new 1:1 DM chat with accountID 0 should be created
                                    const selfDMReports = Object.values(allReports ?? {}).filter((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.SELF_DM);

                                    // The original self-DM report should still exist
                                    expect(selfDMReports.some((report) => report?.reportID === selfDMReport.reportID)).toBe(true);

                                    // There should NOT be a new invalid chat report with accountID 0 participant
                                    const chatReportsWithZeroParticipant = Object.values(allReports ?? {}).filter((report) => {
                                        if (report?.type !== CONST.REPORT.TYPE.CHAT || report?.chatType === CONST.REPORT.CHAT_TYPE.SELF_DM) {
                                            return false;
                                        }
                                        const participantKeys = Object.keys(report?.participants ?? {}).map(Number);
                                        return participantKeys.includes(0);
                                    });

                                    // No chat reports should have accountID 0 as a participant (that would be invalid)
                                    expect(chatReportsWithZeroParticipant.length).toBe(0);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(mockFetch?.resume);
        });
    });

    describe('should have valid parameters', () => {
        let writeSpy: jest.SpyInstance;
        const isValid = (value: unknown) => !value || typeof value !== 'object' || value instanceof Blob;

        beforeEach(() => {
            writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());
        });

        afterEach(() => {
            writeSpy.mockRestore();
        });

        test.each([
            [WRITE_COMMANDS.REQUEST_MONEY, CONST.IOU.ACTION.CREATE],
            [WRITE_COMMANDS.CONVERT_TRACKED_EXPENSE_TO_REQUEST, CONST.IOU.ACTION.SUBMIT],
        ])('%s', async (expectedCommand: ApiCommand, action: IOUAction) => {
            // When an expense is created
            requestMoney({
                action,
                report: {reportID: ''},
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                },
                transactionParams: {
                    amount: 10000,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: 'KFC',
                    comment: '',
                    linkedTrackedExpenseReportAction: {
                        reportActionID: '',
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        created: '2024-10-30',
                    },
                    actionableWhisperReportActionID: '1',
                    linkedTrackedExpenseReportID: '1',
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                transactionViolations: {},
                policyRecentlyUsedCurrencies: [],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
            });

            await waitForBatchedUpdates();

            // Then the correct API request should be made
            expect(writeSpy).toHaveBeenCalledTimes(1);

            const [command, params] = writeSpy.mock.calls.at(0);
            expect(command).toBe(expectedCommand);

            // And the parameters should be supported by XMLHttpRequest
            for (const value of Object.values(params as Record<string, unknown>)) {
                expect(Array.isArray(value) ? value.every(isValid) : isValid(value)).toBe(true);
            }
        });

        it('propagates the capture-time receiptTraceId into the final request params', async () => {
            // jsdom and the lib module disagree on the `Blob` constructor identity, so a real File is
            // gated out by isFileUploadable in tests. Force it through to exercise the receipt pass-through.
            const isFileUploadableSpy = jest.spyOn(IsFileUploadable, 'default').mockReturnValue(true);

            // Given a receipt file stamped with a trace id at capture time
            const receipt: Receipt = new File(['receipt-bytes'], 'receipt.png', {
                type: 'image/png',
            });
            receipt.source = 'file://receipt.png';
            const traceId = mintAndStampReceiptTraceId(receipt);

            // When the expense is submitted
            requestMoney({
                report: {reportID: ''},
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                },
                transactionParams: {
                    amount: 10000,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: 'KFC',
                    comment: '',
                    receipt,
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                transactionViolations: {},
                policyRecentlyUsedCurrencies: [],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                personalDetails: {},
            });

            await waitForBatchedUpdates();

            // Then the trace id minted at capture reaches the final request receipt params
            expect(writeSpy).toHaveBeenCalledTimes(1);
            const [command, params] = writeSpy.mock.calls.at(0);
            expect(command).toBe(WRITE_COMMANDS.REQUEST_MONEY);
            expect(JSON.stringify(params)).toContain(traceId);

            isFileUploadableSpy.mockRestore();
        });

        it('adds grouped from snapshot optimistic data for grouped search queries', async () => {
            const currentSearchQueryJSON = {
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                status: [CONST.SEARCH.STATUS.EXPENSE.DRAFTS, CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING] as SearchStatus,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                groupBy: CONST.SEARCH.GROUP_BY.FROM,
                filters: {
                    operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                    left: CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE,
                    right: 'yes',
                },
                inputQuery: 'sortBy:date sortOrder:desc type:expense groupBy:from status:drafts,outstanding',
                flatFilters: [],
                hash: 71801560,
                recentSearchHash: 1043581824,
                similarSearchHash: 1832274510,
                view: CONST.SEARCH.VIEW.TABLE,
            } as SearchQueryJSON;

            const getCurrentSearchQueryJSONSpy = jest.spyOn(SearchQueryUtils, 'getCurrentSearchQueryJSON').mockReturnValue(currentSearchQueryJSON);

            requestMoney({
                action: CONST.IOU.ACTION.CREATE,
                report: {reportID: ''},
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                },
                transactionParams: {
                    amount: 10000,
                    attendees: [],
                    currency: CONST.CURRENCY.USD,
                    created: '',
                    merchant: 'KFC',
                    comment: '',
                    linkedTrackedExpenseReportAction: {
                        reportActionID: '',
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        created: '2024-10-30',
                    },
                    actionableWhisperReportActionID: '1',
                    linkedTrackedExpenseReportID: '1',
                },
                shouldGenerateTransactionThreadReport: true,
                isASAPSubmitBetaEnabled: false,
                currentUserAccountIDParam: RORY_ACCOUNT_ID,
                currentUserEmailParam: RORY_EMAIL,
                transactionViolations: {},
                policyRecentlyUsedCurrencies: [],
                isSelfTourViewed: false,
                quickAction: undefined,
                betas: [CONST.BETAS.ALL],
                existingTransactionDraft: undefined,
                draftTransactionIDs: [],
                personalDetails: {},
            });

            await waitForBatchedUpdates();

            expect(writeSpy).toHaveBeenCalledTimes(1);
            const [, , requestData] = writeSpy.mock.calls.at(0) as [ApiCommand, Record<string, unknown>, {optimisticData?: Array<{key: string}>}];
            const optimisticData = requestData.optimisticData ?? [];
            const mainSnapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchQueryJSON.hash}`;
            expect(optimisticData.some((update) => update.key === mainSnapshotKey)).toBeTruthy();

            const newFlatFilters = currentSearchQueryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM);
            newFlatFilters.push({
                key: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
                filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: String(RORY_ACCOUNT_ID)}],
            });
            const groupedTransactionsQueryJSON = SearchQueryUtils.buildSearchQueryJSON(
                SearchQueryUtils.buildSearchQueryString({
                    ...currentSearchQueryJSON,
                    groupBy: undefined,
                    flatFilters: newFlatFilters,
                }),
            );

            expect(groupedTransactionsQueryJSON?.hash).toBeDefined();
            if (!groupedTransactionsQueryJSON) {
                throw new Error('Expected grouped transactions query JSON to be defined');
            }
            const groupedSnapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${groupedTransactionsQueryJSON.hash}`;
            expect(optimisticData.some((update) => update.key === groupedSnapshotKey)).toBeTruthy();

            getCurrentSearchQueryJSONSpy.mockRestore();
        });

        test.each([
            [WRITE_COMMANDS.TRACK_EXPENSE, CONST.IOU.ACTION.CREATE],
            [WRITE_COMMANDS.CATEGORIZE_TRACKED_EXPENSE, CONST.IOU.ACTION.CATEGORIZE],
            [WRITE_COMMANDS.SHARE_TRACKED_EXPENSE, CONST.IOU.ACTION.SHARE],
        ])('%s', async (expectedCommand: ApiCommand, action: IOUAction) => {
            const recentWaypoints = (await getOnyxValue(ONYXKEYS.NVP_RECENT_WAYPOINTS)) ?? [];

            // When a track expense is created
            trackExpense({
                report: {reportID: '123', policyID: 'A'},
                isDraftPolicy: false,
                action,
                participantParams: {
                    payeeEmail: RORY_EMAIL,
                    payeeAccountID: RORY_ACCOUNT_ID,
                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID},
                },
                transactionParams: {
                    amount: 10000,
                    currency: CONST.CURRENCY.USD,
                    created: '2024-10-30',
                    merchant: 'KFC',
                    receipt: {},
                    actionableWhisperReportActionID: '1',
                    linkedTrackedExpenseReportAction: {
                        reportActionID: '',
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        created: '2024-10-30',
                    },
                    linkedTrackedExpenseReportID: '1',
                },
                accountantParams: action === CONST.IOU.ACTION.SHARE ? {accountant: {accountID: VIT_ACCOUNT_ID, login: VIT_EMAIL}} : undefined,
                isASAPSubmitBetaEnabled: false,
                currentUser: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                introSelected: undefined,
                quickAction: undefined,
                recentWaypoints,
                betas: [CONST.BETAS.ALL],
                draftTransactionIDs: [],
                isSelfTourViewed: false,
                currentUserLocalCurrency: undefined,
                reportActionsList: undefined,
            });

            await waitForBatchedUpdates();

            // Then the correct API request should be made
            expect(writeSpy).toHaveBeenCalledTimes(1);

            const [command, params] = writeSpy.mock.calls.at(0);
            expect(command).toBe(expectedCommand);

            if (expectedCommand === WRITE_COMMANDS.SHARE_TRACKED_EXPENSE) {
                expect(params).toHaveProperty('policyName');
            }

            // And the parameters should be supported by XMLHttpRequest
            for (const value of Object.values(params as Record<string, unknown>)) {
                expect(Array.isArray(value) ? value.every(isValid) : isValid(value)).toBe(true);
            }
        });
    });
});
