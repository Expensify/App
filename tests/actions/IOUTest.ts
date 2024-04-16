import isEqual from 'lodash/isEqual';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {OptimisticChatReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import * as IOU from '@src/libs/actions/IOU';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as PolicyActions from '@src/libs/actions/Policy';
import * as Report from '@src/libs/actions/Report';
import * as ReportActions from '@src/libs/actions/ReportActions';
import * as User from '@src/libs/actions/User';
import DateUtils from '@src/libs/DateUtils';
import Navigation from '@src/libs/Navigation/Navigation';
import * as NumberUtils from '@src/libs/NumberUtils';
import * as PersonalDetailsUtils from '@src/libs/PersonalDetailsUtils';
import * as ReportActionsUtils from '@src/libs/ReportActionsUtils';
import * as ReportUtils from '@src/libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {IOUMessage, OriginalMessageIOU} from '@src/types/onyx/OriginalMessage';
import type {ReportActionBase} from '@src/types/onyx/ReportAction';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import PusherHelper from '../utils/PusherHelper';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForNetworkPromises from '../utils/waitForNetworkPromises';

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    dismissModalWithReport: jest.fn(),
    goBack: jest.fn(),
}));

const CARLOS_EMAIL = 'cmartins@expensifail.com';
const CARLOS_ACCOUNT_ID = 1;
const JULES_EMAIL = 'jules@expensifail.com';
const JULES_ACCOUNT_ID = 2;
const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;
const VIT_EMAIL = 'vit@expensifail.com';
const VIT_ACCOUNT_ID = 4;

OnyxUpdateManager();
describe('actions/IOU', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
        global.fetch = TestHelper.getGlobalFetchMock();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('requestMoney', () => {
        it('creates new chat if needed', () => {
            const amount = 10000;
            const comment = 'Giv money plz';
            const merchant = 'KFC';
            let iouReportID: string | undefined;
            let createdAction: OnyxEntry<OnyxTypes.ReportAction>;
            let iouAction: OnyxEntry<OnyxTypes.ReportAction>;
            let transactionID: string | undefined;
            let transactionThread: OnyxEntry<OnyxTypes.Report>;
            let transactionThreadCreatedAction: OnyxEntry<OnyxTypes.ReportAction>;
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            IOU.requestMoney({reportID: ''}, amount, CONST.CURRENCY.USD, '', merchant, RORY_EMAIL, RORY_ACCOUNT_ID, {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID}, comment, {});
            return (
                waitForBatchedUpdates()
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT,
                                    waitForCollectionCallback: true,
                                    callback: (allReports) => {
                                        Onyx.disconnect(connectionID);

                                        // A chat report, a transaction thread, and an iou report should be created
                                        const chatReports = Object.values(allReports ?? {}).filter((report) => report?.type === CONST.REPORT.TYPE.CHAT);
                                        const iouReports = Object.values(allReports ?? {}).filter((report) => report?.type === CONST.REPORT.TYPE.IOU);
                                        expect(Object.keys(chatReports).length).toBe(2);
                                        expect(Object.keys(iouReports).length).toBe(1);
                                        const chatReport = chatReports[0];
                                        const transactionThreadReport = chatReports[1];
                                        const iouReport = iouReports[0];
                                        iouReportID = iouReport?.reportID;
                                        transactionThread = transactionThreadReport;

                                        expect(iouReport?.notificationPreference).toBe(CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN);

                                        // They should be linked together
                                        expect(chatReport?.participantAccountIDs).toEqual([CARLOS_ACCOUNT_ID]);
                                        expect(chatReport?.iouReportID).toBe(iouReport?.reportID);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActionsForIOUReport) => {
                                        Onyx.disconnect(connectionID);

                                        // The IOU report should have a CREATED action and IOU action
                                        expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(2);
                                        const createdActions = Object.values(reportActionsForIOUReport ?? {}).filter(
                                            (reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED,
                                        );
                                        const iouActions = Object.values(reportActionsForIOUReport ?? {}).filter(
                                            (reportAction): reportAction is ReportActionBase & OriginalMessageIOU => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU,
                                        );
                                        expect(Object.values(createdActions).length).toBe(1);
                                        expect(Object.values(iouActions).length).toBe(1);
                                        createdAction = createdActions?.[0] ?? null;
                                        iouAction = iouActions?.[0] ?? null;

                                        // The CREATED action should not be created after the IOU action
                                        expect(Date.parse(createdAction?.created ?? '')).toBeLessThan(Date.parse(iouAction?.created ?? ''));

                                        // The IOUReportID should be correct
                                        expect(iouAction.originalMessage.IOUReportID).toBe(iouReportID);

                                        // The comment should be included in the IOU action
                                        expect(iouAction.originalMessage.comment).toBe(comment);

                                        // The amount in the IOU action should be correct
                                        expect(iouAction.originalMessage.amount).toBe(amount);

                                        // The IOU type should be correct
                                        expect(iouAction.originalMessage.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);

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
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread?.reportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActionsForTransactionThread) => {
                                        Onyx.disconnect(connectionID);

                                        // The transaction thread should have a CREATED action
                                        expect(Object.values(reportActionsForTransactionThread ?? {}).length).toBe(1);
                                        const createdActions = Object.values(reportActionsForTransactionThread ?? {}).filter(
                                            (reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED,
                                        );
                                        expect(Object.values(createdActions).length).toBe(1);
                                        transactionThreadCreatedAction = createdActions[0];

                                        expect(transactionThreadCreatedAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                                    waitForCollectionCallback: true,
                                    callback: (allTransactions) => {
                                        Onyx.disconnect(connectionID);

                                        // There should be one transaction
                                        expect(Object.values(allTransactions ?? {}).length).toBe(1);
                                        const transaction = Object.values(allTransactions ?? []).find((t) => !isEmptyObject(t));
                                        transactionID = transaction?.transactionID;

                                        // The transaction should be attached to the IOU report
                                        expect(transaction?.reportID).toBe(iouReportID);

                                        // Its amount should match the amount of the request
                                        expect(transaction?.amount).toBe(amount);

                                        // The comment should be correct
                                        expect(transaction?.comment.comment).toBe(comment);

                                        // It should be pending
                                        expect(transaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                        // The transactionID on the iou action should match the one from the transactions collection
                                        expect((iouAction?.originalMessage as IOUMessage)?.IOUTransactionID).toBe(transactionID);

                                        expect(transaction?.merchant).toBe(merchant);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActionsForIOUReport) => {
                                        Onyx.disconnect(connectionID);
                                        expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(2);
                                        Object.values(reportActionsForIOUReport ?? {}).forEach((reportAction) => expect(reportAction?.pendingAction).toBeFalsy());
                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                                    waitForCollectionCallback: false,
                                    callback: (transaction) => {
                                        Onyx.disconnect(connectionID);
                                        expect(transaction?.pendingAction).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });

        it('updates existing chat report if there is one', () => {
            const amount = 10000;
            const comment = 'Giv money plz';
            let chatReport: OnyxTypes.Report = {
                reportID: '1234',
                type: CONST.REPORT.TYPE.CHAT,
                participantAccountIDs: [CARLOS_ACCOUNT_ID],
            };
            const createdAction: OnyxTypes.ReportAction = {
                reportActionID: NumberUtils.rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: DateUtils.getDBTime(),
            };
            let iouReportID: string | undefined;
            let iouAction: OnyxEntry<OnyxTypes.ReportAction>;
            let iouCreatedAction: OnyxEntry<OnyxTypes.ReportAction>;
            let transactionID: string | undefined;
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport)
                    .then(() =>
                        Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`, {
                            [createdAction.reportActionID]: createdAction,
                        }),
                    )
                    .then(() => {
                        IOU.requestMoney(chatReport, amount, CONST.CURRENCY.USD, '', '', RORY_EMAIL, RORY_ACCOUNT_ID, {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID}, comment, {});
                        return waitForBatchedUpdates();
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT,
                                    waitForCollectionCallback: true,
                                    callback: (allReports) => {
                                        Onyx.disconnect(connectionID);

                                        // The same chat report should be reused, a transaction thread and an IOU report should be created
                                        expect(Object.values(allReports ?? {}).length).toBe(3);
                                        expect(Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.CHAT)?.reportID).toBe(chatReport.reportID);
                                        chatReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.CHAT) ?? chatReport;
                                        const iouReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);
                                        iouReportID = iouReport?.reportID;

                                        expect(iouReport?.notificationPreference).toBe(CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN);

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
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (allIOUReportActions) => {
                                        Onyx.disconnect(connectionID);

                                        iouCreatedAction =
                                            Object.values(allIOUReportActions ?? {}).find((reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) ?? null;
                                        iouAction =
                                            Object.values(allIOUReportActions ?? {}).find(
                                                (reportAction): reportAction is ReportActionBase & OriginalMessageIOU => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU,
                                            ) ?? null;

                                        // The CREATED action should not be created after the IOU action
                                        expect(Date.parse(iouCreatedAction?.created ?? '')).toBeLessThan(Date.parse(iouAction?.created ?? ''));

                                        // The IOUReportID should be correct
                                        expect(iouAction?.originalMessage?.IOUReportID).toBe(iouReportID);

                                        // The comment should be included in the IOU action
                                        expect(iouAction?.originalMessage?.comment).toBe(comment);

                                        // The amount in the IOU action should be correct
                                        expect(iouAction?.originalMessage?.amount).toBe(amount);

                                        // The IOU action type should be correct
                                        expect(iouAction?.originalMessage?.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);

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
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                                    waitForCollectionCallback: true,
                                    callback: (allTransactions) => {
                                        Onyx.disconnect(connectionID);

                                        // There should be one transaction
                                        expect(Object.values(allTransactions ?? {}).length).toBe(1);
                                        const transaction = Object.values(allTransactions ?? {}).find((t) => !isEmptyObject(t));
                                        transactionID = transaction?.transactionID;

                                        // The transaction should be attached to the IOU report
                                        expect(transaction?.reportID).toBe(iouReportID);

                                        // Its amount should match the amount of the request
                                        expect(transaction?.amount).toBe(amount);

                                        // The comment should be correct
                                        expect(transaction?.comment.comment).toBe(comment);

                                        expect(transaction?.merchant).toBe(CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT);

                                        // It should be pending
                                        expect(transaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                        // The transactionID on the iou action should match the one from the transactions collection
                                        expect((iouAction?.originalMessage as IOUMessage)?.IOUTransactionID).toBe(transactionID);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActionsForIOUReport) => {
                                        Onyx.disconnect(connectionID);
                                        expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(2);
                                        Object.values(reportActionsForIOUReport ?? {}).forEach((reportAction) => expect(reportAction?.pendingAction).toBeFalsy());
                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                                    callback: (transaction) => {
                                        Onyx.disconnect(connectionID);
                                        expect(transaction?.pendingAction).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });

        it('updates existing IOU report if there is one', () => {
            const amount = 10000;
            const comment = 'Giv money plz';
            const chatReportID = '1234';
            const iouReportID = '5678';
            let chatReport: OnyxEntry<OnyxTypes.Report> = {
                reportID: chatReportID,
                type: CONST.REPORT.TYPE.CHAT,
                iouReportID,
                participantAccountIDs: [CARLOS_ACCOUNT_ID],
            };
            const createdAction: OnyxTypes.ReportAction = {
                reportActionID: NumberUtils.rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: DateUtils.getDBTime(),
            };
            const existingTransaction: OnyxTypes.Transaction = {
                transactionID: NumberUtils.rand64(),
                amount: 1000,
                comment: {
                    comment: 'Existing transaction',
                },
                created: DateUtils.getDBTime(),
                currency: CONST.CURRENCY.USD,
                merchant: '',
                reportID: '',
            };
            let iouReport: OnyxEntry<OnyxTypes.Report> = {
                reportID: iouReportID,
                chatReportID,
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: RORY_ACCOUNT_ID,
                managerID: CARLOS_ACCOUNT_ID,
                currency: CONST.CURRENCY.USD,
                total: existingTransaction.amount,
            };
            const iouAction: OnyxEntry<OnyxTypes.ReportAction> = {
                reportActionID: NumberUtils.rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: RORY_ACCOUNT_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: iouReportID,
                    IOUTransactionID: existingTransaction.transactionID,
                    amount: existingTransaction.amount,
                    currency: CONST.CURRENCY.USD,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    participantAccountIDs: [RORY_ACCOUNT_ID, CARLOS_ACCOUNT_ID],
                },
            };
            let newIOUAction: OnyxEntry<OnyxTypes.ReportAction>;
            let newTransaction: OnyxEntry<OnyxTypes.Transaction>;
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, chatReport)
                    .then(() => Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, iouReport))
                    .then(() =>
                        Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`, {
                            [createdAction.reportActionID]: createdAction,
                            [iouAction.reportActionID]: iouAction,
                        }),
                    )
                    .then(() => Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${existingTransaction.transactionID}`, existingTransaction))
                    .then(() => {
                        if (chatReport) {
                            IOU.requestMoney(chatReport, amount, CONST.CURRENCY.USD, '', '', RORY_EMAIL, RORY_ACCOUNT_ID, {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID}, comment, {});
                        }
                        return waitForBatchedUpdates();
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT,
                                    waitForCollectionCallback: true,
                                    callback: (allReports) => {
                                        Onyx.disconnect(connectionID);

                                        // No new reports should be created
                                        expect(Object.values(allReports ?? {}).length).toBe(3);
                                        expect(Object.values(allReports ?? {}).find((report) => report?.reportID === chatReportID)).toBeTruthy();
                                        expect(Object.values(allReports ?? {}).find((report) => report?.reportID === iouReportID)).toBeTruthy();

                                        chatReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.CHAT) ?? null;
                                        iouReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU) ?? null;

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
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActionsForIOUReport) => {
                                        Onyx.disconnect(connectionID);

                                        expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(3);
                                        newIOUAction =
                                            Object.values(reportActionsForIOUReport ?? {}).find(
                                                (reportAction): reportAction is ReportActionBase & OriginalMessageIOU =>
                                                    reportAction?.reportActionID !== createdAction.reportActionID && reportAction?.reportActionID !== iouAction?.reportActionID,
                                            ) ?? null;

                                        // The IOUReportID should be correct
                                        expect(iouAction.originalMessage.IOUReportID).toBe(iouReportID);

                                        // The comment should be included in the IOU action
                                        expect(newIOUAction?.originalMessage.comment).toBe(comment);

                                        // The amount in the IOU action should be correct
                                        expect(newIOUAction?.originalMessage.amount).toBe(amount);

                                        // The type of the IOU action should be correct
                                        expect(newIOUAction?.originalMessage.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);

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
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                                    waitForCollectionCallback: true,
                                    callback: (allTransactions) => {
                                        Onyx.disconnect(connectionID);

                                        // There should be two transactions
                                        expect(Object.values(allTransactions ?? {}).length).toBe(2);

                                        newTransaction = Object.values(allTransactions ?? {}).find((transaction) => transaction?.transactionID !== existingTransaction.transactionID) ?? null;

                                        expect(newTransaction?.reportID).toBe(iouReportID);
                                        expect(newTransaction?.amount).toBe(amount);
                                        expect(newTransaction?.comment.comment).toBe(comment);
                                        expect(newTransaction?.merchant).toBe(CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT);
                                        expect(newTransaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                        // The transactionID on the iou action should match the one from the transactions collection
                                        expect((newIOUAction?.originalMessage as IOUMessage)?.IOUTransactionID).toBe(newTransaction?.transactionID);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForNetworkPromises)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActionsForIOUReport) => {
                                        Onyx.disconnect(connectionID);
                                        expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(3);
                                        Object.values(reportActionsForIOUReport ?? {}).forEach((reportAction) => expect(reportAction?.pendingAction).toBeFalsy());
                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                                    waitForCollectionCallback: true,
                                    callback: (allTransactions) => {
                                        Onyx.disconnect(connectionID);
                                        Object.values(allTransactions ?? {}).forEach((transaction) => expect(transaction?.pendingAction).toBeFalsy());
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });

        it('correctly implements RedBrickRoad error handling', () => {
            const amount = 10000;
            const comment = 'Giv money plz';
            let chatReportID: string | undefined;
            let iouReportID: string | undefined;
            let createdAction: OnyxEntry<OnyxTypes.ReportAction>;
            let iouAction: OnyxEntry<OnyxTypes.ReportAction>;
            let transactionID: string;
            let transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
            let transactionThreadAction: OnyxEntry<OnyxTypes.ReportAction>;
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            IOU.requestMoney({reportID: ''}, amount, CONST.CURRENCY.USD, '', '', RORY_EMAIL, RORY_ACCOUNT_ID, {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID}, comment, {});
            return (
                waitForBatchedUpdates()
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT,
                                    waitForCollectionCallback: true,
                                    callback: (allReports) => {
                                        Onyx.disconnect(connectionID);

                                        // A chat report, transaction thread and an iou report should be created
                                        const chatReports = Object.values(allReports ?? {}).filter((report) => report?.type === CONST.REPORT.TYPE.CHAT);
                                        const iouReports = Object.values(allReports ?? {}).filter((report) => report?.type === CONST.REPORT.TYPE.IOU);
                                        expect(Object.values(chatReports).length).toBe(2);
                                        expect(Object.values(iouReports).length).toBe(1);
                                        const chatReport = chatReports[0];
                                        chatReportID = chatReport?.reportID;
                                        transactionThreadReport = chatReports[1];

                                        const iouReport = iouReports[0];
                                        iouReportID = iouReport?.reportID;

                                        expect(iouReport?.notificationPreference).toBe(CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN);

                                        // They should be linked together
                                        expect(chatReport?.participantAccountIDs).toEqual([CARLOS_ACCOUNT_ID]);
                                        expect(chatReport?.iouReportID).toBe(iouReport?.reportID);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActionsForIOUReport) => {
                                        Onyx.disconnect(connectionID);

                                        // The chat report should have a CREATED action and IOU action
                                        expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(2);
                                        const createdActions =
                                            Object.values(reportActionsForIOUReport ?? {}).filter((reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) ?? null;
                                        const iouActions =
                                            Object.values(reportActionsForIOUReport ?? {}).filter(
                                                (reportAction): reportAction is ReportActionBase & OriginalMessageIOU => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU,
                                            ) ?? null;
                                        expect(Object.values(createdActions).length).toBe(1);
                                        expect(Object.values(iouActions).length).toBe(1);
                                        createdAction = createdActions[0];
                                        iouAction = iouActions[0];

                                        // The CREATED action should not be created after the IOU action
                                        expect(Date.parse(createdAction?.created ?? '')).toBeLessThan(Date.parse(iouAction?.created ?? {}));

                                        // The IOUReportID should be correct
                                        expect(iouAction.originalMessage.IOUReportID).toBe(iouReportID);

                                        // The comment should be included in the IOU action
                                        expect(iouAction.originalMessage.comment).toBe(comment);

                                        // The amount in the IOU action should be correct
                                        expect(iouAction.originalMessage.amount).toBe(amount);

                                        // The type should be correct
                                        expect(iouAction.originalMessage.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);

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
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                                    waitForCollectionCallback: true,
                                    callback: (allTransactions) => {
                                        Onyx.disconnect(connectionID);

                                        // There should be one transaction
                                        expect(Object.values(allTransactions ?? {}).length).toBe(1);
                                        const transaction = Object.values(allTransactions ?? {}).find((t) => !isEmptyObject(t));
                                        transactionID = transaction?.transactionID ?? '';

                                        expect(transaction?.reportID).toBe(iouReportID);
                                        expect(transaction?.amount).toBe(amount);
                                        expect(transaction?.comment.comment).toBe(comment);
                                        expect(transaction?.merchant).toBe(CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT);
                                        expect(transaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                        // The transactionID on the iou action should match the one from the transactions collection
                                        expect((iouAction?.originalMessage as IOUMessage)?.IOUTransactionID).toBe(transactionID);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then((): Promise<unknown> => {
                        // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                        fetch.fail();
                        // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                        return fetch.resume() as Promise<unknown>;
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActionsForIOUReport) => {
                                        Onyx.disconnect(connectionID);
                                        expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(2);
                                        iouAction = Object.values(reportActionsForIOUReport ?? {}).find((reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) ?? null;
                                        expect(iouAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                    waitForCollectionCallback: true,
                                    callback: (reportActionsForTransactionThread) => {
                                        Onyx.disconnect(connectionID);
                                        expect(Object.values(reportActionsForTransactionThread ?? {}).length).toBe(3);
                                        transactionThreadAction =
                                            Object.values(reportActionsForTransactionThread?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`] ?? {}).find(
                                                (reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED,
                                            ) ?? null;
                                        expect(transactionThreadAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                                    waitForCollectionCallback: false,
                                    callback: (transaction) => {
                                        Onyx.disconnect(connectionID);
                                        expect(transaction?.pendingAction).toBeFalsy();
                                        expect(transaction?.errors).toBeTruthy();
                                        expect(Object.values(transaction?.errors ?? {})[0]).toEqual(expect.arrayContaining(['iou.error.genericCreateFailureMessage', {isTranslated: false}]));
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // If the user clears the errors on the IOU action
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                ReportActions.clearAllRelatedReportActionErrors(iouReportID ?? '', iouAction);
                                resolve();
                            }),
                    )

                    // Then the reportAction from chat report should be removed from Onyx
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActionsForReport) => {
                                        Onyx.disconnect(connectionID);
                                        iouAction = Object.values(reportActionsForReport ?? {}).find((reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) ?? null;
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
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActionsForReport) => {
                                        Onyx.disconnect(connectionID);
                                        iouAction = Object.values(reportActionsForReport ?? {}).find((reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) ?? null;
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
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
                                    waitForCollectionCallback: false,
                                    callback: (reportActionsForReport) => {
                                        Onyx.disconnect(connectionID);
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
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                                    waitForCollectionCallback: false,
                                    callback: (transaction) => {
                                        Onyx.disconnect(connectionID);
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
                                Report.deleteReport(chatReportID ?? '');
                                Report.deleteReport(transactionThreadReport?.reportID ?? '');
                                resolve();
                            }),
                    )

                    // Then the report should be deleted
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT,
                                    waitForCollectionCallback: true,
                                    callback: (allReports) => {
                                        Onyx.disconnect(connectionID);
                                        Object.values(allReports ?? {}).forEach((report) => expect(report).toBeFalsy());
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // All reportActions should also be deleted
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                    waitForCollectionCallback: false,
                                    callback: (allReportActions) => {
                                        Onyx.disconnect(connectionID);
                                        Object.values(allReportActions ?? {}).forEach((reportAction) => expect(reportAction).toBeFalsy());
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // All transactions should also be deleted
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                                    waitForCollectionCallback: true,
                                    callback: (allTransactions) => {
                                        Onyx.disconnect(connectionID);
                                        Object.values(allTransactions ?? {}).forEach((transaction) => expect(transaction).toBeFalsy());
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // Cleanup
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.succeed)
            );
        });
    });

    describe('split bill', () => {
        it('creates and updates new chats and IOUs as needed', () => {
            jest.setTimeout(10 * 1000);
            /*
             * Given that:
             *   - Rory and Carlos have chatted before
             *   - Rory and Jules have chatted before and have an active IOU report
             *   - Rory and Vit have never chatted together before
             *   - There is no existing group chat with the four of them
             */
            const amount = 400;
            const comment = 'Yes, I am splitting a bill for $4 USD';
            const merchant = 'Yema Kitchen';
            let carlosChatReport: OnyxEntry<OnyxTypes.Report> = {
                reportID: NumberUtils.rand64(),
                type: CONST.REPORT.TYPE.CHAT,
                participantAccountIDs: [CARLOS_ACCOUNT_ID],
            };
            const carlosCreatedAction: OnyxEntry<OnyxTypes.ReportAction> = {
                reportActionID: NumberUtils.rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: DateUtils.getDBTime(),
                reportID: carlosChatReport.reportID,
            };
            const julesIOUReportID = NumberUtils.rand64();
            let julesChatReport: OnyxEntry<OnyxTypes.Report> = {
                reportID: NumberUtils.rand64(),
                type: CONST.REPORT.TYPE.CHAT,
                iouReportID: julesIOUReportID,
                participantAccountIDs: [JULES_ACCOUNT_ID],
            };
            const julesChatCreatedAction: OnyxEntry<OnyxTypes.ReportAction> = {
                reportActionID: NumberUtils.rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: DateUtils.getDBTime(),
                reportID: julesChatReport.reportID,
            };
            const julesCreatedAction: OnyxEntry<OnyxTypes.ReportAction> = {
                reportActionID: NumberUtils.rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: DateUtils.getDBTime(),
                reportID: julesIOUReportID,
            };
            jest.advanceTimersByTime(200);
            const julesExistingTransaction: OnyxEntry<OnyxTypes.Transaction> = {
                transactionID: NumberUtils.rand64(),
                amount: 1000,
                comment: {
                    comment: 'This is an existing transaction',
                },
                created: DateUtils.getDBTime(),
                currency: '',
                merchant: '',
                reportID: '',
            };
            let julesIOUReport: OnyxEntry<OnyxTypes.Report> = {
                reportID: julesIOUReportID,
                chatReportID: julesChatReport.reportID,
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: RORY_ACCOUNT_ID,
                managerID: JULES_ACCOUNT_ID,
                currency: CONST.CURRENCY.USD,
                total: julesExistingTransaction?.amount,
            };
            const julesExistingIOUAction: OnyxEntry<OnyxTypes.ReportAction> = {
                reportActionID: NumberUtils.rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: RORY_ACCOUNT_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: julesIOUReportID,
                    IOUTransactionID: julesExistingTransaction?.transactionID,
                    amount: julesExistingTransaction?.amount ?? 0,
                    currency: CONST.CURRENCY.USD,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    participantAccountIDs: [RORY_ACCOUNT_ID, JULES_ACCOUNT_ID],
                },
                reportID: julesIOUReportID,
            };

            let carlosIOUReport: OnyxEntry<OnyxTypes.Report>;
            let carlosIOUAction: OnyxEntry<OnyxTypes.ReportAction>;
            let carlosIOUCreatedAction: OnyxEntry<OnyxTypes.ReportAction>;
            let carlosTransaction: OnyxEntry<OnyxTypes.Transaction>;

            let julesIOUAction: OnyxEntry<OnyxTypes.ReportAction>;
            let julesIOUCreatedAction: OnyxEntry<OnyxTypes.ReportAction>;
            let julesTransaction: OnyxEntry<OnyxTypes.Transaction>;

            let vitChatReport: OnyxEntry<OnyxTypes.Report>;
            let vitIOUReport: OnyxEntry<OnyxTypes.Report>;
            let vitCreatedAction: OnyxEntry<OnyxTypes.ReportAction>;
            let vitIOUAction: OnyxEntry<OnyxTypes.ReportAction>;
            let vitTransaction: OnyxEntry<OnyxTypes.Transaction>;

            let groupChat: OnyxEntry<OnyxTypes.Report>;
            let groupCreatedAction: OnyxEntry<OnyxTypes.ReportAction>;
            let groupIOUAction: OnyxEntry<OnyxTypes.ReportAction>;
            let groupTransaction: OnyxEntry<OnyxTypes.Transaction>;

            const reportCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.REPORT, [carlosChatReport, julesChatReport, julesIOUReport], (item) => item.reportID);

            const carlosActionsCollectionDataSet = toCollectionDataSet(
                `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}`,
                [
                    {
                        [carlosCreatedAction.reportActionID]: carlosCreatedAction,
                    },
                ],
                (item) => item[carlosCreatedAction.reportActionID].reportID ?? '',
            );

            const julesActionsCollectionDataSet = toCollectionDataSet(
                `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}`,
                [
                    {
                        [julesCreatedAction.reportActionID]: julesCreatedAction,
                        [julesExistingIOUAction.reportActionID]: julesExistingIOUAction,
                    },
                ],
                (item) => item[julesCreatedAction.reportActionID].reportID ?? '',
            );

            const julesCreatedActionsCollectionDataSet = toCollectionDataSet(
                `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}`,
                [
                    {
                        [julesChatCreatedAction.reportActionID]: julesChatCreatedAction,
                    },
                ],
                (item) => item[julesChatCreatedAction.reportActionID].reportID ?? '',
            );

            return (
                Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, {
                    ...reportCollectionDataSet,
                })
                    .then(() =>
                        Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
                            ...carlosActionsCollectionDataSet,
                            ...julesCreatedActionsCollectionDataSet,
                            ...julesActionsCollectionDataSet,
                        }),
                    )
                    .then(() => Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${julesExistingTransaction?.transactionID}`, julesExistingTransaction))
                    .then(() => {
                        // When we split a bill offline
                        // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                        fetch.pause();
                        IOU.splitBill(
                            // TODO: Migrate after the backend accepts accountIDs
                            {
                                participants: [
                                    [CARLOS_EMAIL, String(CARLOS_ACCOUNT_ID)],
                                    [JULES_EMAIL, String(JULES_ACCOUNT_ID)],
                                    [VIT_EMAIL, String(VIT_ACCOUNT_ID)],
                                ].map(([email, accountID]) => ({login: email, accountID: Number(accountID)})),
                                currentUserLogin: RORY_EMAIL,
                                currentUserAccountID: RORY_ACCOUNT_ID,
                                amount,
                                comment,
                                currency: CONST.CURRENCY.USD,
                                merchant,
                                created: '',
                                tag: '',
                                existingSplitChatReportID: '',
                            },
                        );
                        return waitForBatchedUpdates();
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT,
                                    waitForCollectionCallback: true,
                                    callback: (allReports) => {
                                        Onyx.disconnect(connectionID);

                                        // There should now be 10 reports
                                        expect(Object.values(allReports ?? {}).length).toBe(10);

                                        // 1. The chat report with Rory + Carlos
                                        carlosChatReport = Object.values(allReports ?? {}).find((report) => report?.reportID === carlosChatReport?.reportID) ?? null;
                                        expect(isEmptyObject(carlosChatReport)).toBe(false);
                                        expect(carlosChatReport?.pendingFields).toBeFalsy();

                                        // 2. The IOU report with Rory + Carlos (new)
                                        carlosIOUReport =
                                            Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU && report.managerID === CARLOS_ACCOUNT_ID) ?? null;
                                        expect(isEmptyObject(carlosIOUReport)).toBe(false);
                                        expect(carlosIOUReport?.total).toBe(amount / 4);

                                        // 3. The chat report with Rory + Jules
                                        julesChatReport = Object.values(allReports ?? {}).find((report) => report?.reportID === julesChatReport?.reportID) ?? null;
                                        expect(isEmptyObject(julesChatReport)).toBe(false);
                                        expect(julesChatReport?.pendingFields).toBeFalsy();

                                        // 4. The IOU report with Rory + Jules
                                        julesIOUReport = Object.values(allReports ?? {}).find((report) => report?.reportID === julesIOUReport?.reportID) ?? null;
                                        expect(isEmptyObject(julesIOUReport)).toBe(false);
                                        expect(julesChatReport?.pendingFields).toBeFalsy();
                                        expect(julesIOUReport?.total).toBe((julesExistingTransaction?.amount ?? 0) + amount / 4);

                                        // 5. The chat report with Rory + Vit (new)
                                        vitChatReport =
                                            Object.values(allReports ?? {}).find(
                                                (report) => report?.type === CONST.REPORT.TYPE.CHAT && isEqual(report.participantAccountIDs, [VIT_ACCOUNT_ID]),
                                            ) ?? null;
                                        expect(isEmptyObject(vitChatReport)).toBe(false);
                                        expect(vitChatReport?.pendingFields).toStrictEqual({createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});

                                        // 6. The IOU report with Rory + Vit (new)
                                        vitIOUReport =
                                            Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU && report.managerID === VIT_ACCOUNT_ID) ?? null;
                                        expect(isEmptyObject(vitIOUReport)).toBe(false);
                                        expect(vitIOUReport?.total).toBe(amount / 4);

                                        // 7. The group chat with everyone
                                        groupChat =
                                            Object.values(allReports ?? {}).find(
                                                (report) =>
                                                    report?.type === CONST.REPORT.TYPE.CHAT &&
                                                    isEqual(report.participantAccountIDs, [CARLOS_ACCOUNT_ID, JULES_ACCOUNT_ID, VIT_ACCOUNT_ID, RORY_ACCOUNT_ID]),
                                            ) ?? null;
                                        expect(isEmptyObject(groupChat)).toBe(false);
                                        expect(groupChat?.pendingFields).toStrictEqual({createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});

                                        // The 1:1 chat reports and the IOU reports should be linked together
                                        expect(carlosChatReport?.iouReportID).toBe(carlosIOUReport?.reportID);
                                        expect(carlosIOUReport?.chatReportID).toBe(carlosChatReport?.reportID);
                                        expect(carlosIOUReport?.notificationPreference).toBe(CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN);

                                        expect(julesChatReport?.iouReportID).toBe(julesIOUReport?.reportID);
                                        expect(julesIOUReport?.chatReportID).toBe(julesChatReport?.reportID);

                                        expect(vitChatReport?.iouReportID).toBe(vitIOUReport?.reportID);
                                        expect(vitIOUReport?.chatReportID).toBe(vitChatReport?.reportID);
                                        expect(carlosIOUReport?.notificationPreference).toBe(CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                    waitForCollectionCallback: true,
                                    callback: (allReportActions) => {
                                        Onyx.disconnect(connectionID);

                                        // There should be reportActions on all 7 chat reports + 3 IOU reports in each 1:1 chat
                                        expect(Object.values(allReportActions ?? {}).length).toBe(10);

                                        const carlosReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${carlosChatReport?.iouReportID}`];
                                        const julesReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${julesChatReport?.iouReportID}`];
                                        const vitReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${vitChatReport?.iouReportID}`];
                                        const groupReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${groupChat?.reportID}`];

                                        // Carlos DM should have two reportActions – the existing CREATED action and a pending IOU action
                                        expect(Object.values(carlosReportActions ?? {}).length).toBe(2);
                                        carlosIOUCreatedAction =
                                            Object.values(carlosReportActions ?? {}).find(
                                                (reportAction): reportAction is ReportActionBase & OriginalMessageIOU => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED,
                                            ) ?? null;
                                        carlosIOUAction =
                                            Object.values(carlosReportActions ?? {}).find(
                                                (reportAction): reportAction is ReportActionBase & OriginalMessageIOU => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU,
                                            ) ?? null;
                                        expect(carlosIOUAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        expect(carlosIOUAction?.originalMessage.IOUReportID).toBe(carlosIOUReport?.reportID);
                                        expect(carlosIOUAction?.originalMessage.amount).toBe(amount / 4);
                                        expect(carlosIOUAction?.originalMessage.comment).toBe(comment);
                                        expect(carlosIOUAction?.originalMessage.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);
                                        expect(Date.parse(carlosIOUCreatedAction?.created ?? '')).toBeLessThan(Date.parse(carlosIOUAction?.created ?? ''));

                                        // Jules DM should have three reportActions, the existing CREATED action, the existing IOU action, and a new pending IOU action
                                        expect(Object.values(julesReportActions ?? {}).length).toBe(3);
                                        expect(julesReportActions?.[julesCreatedAction.reportActionID]).toStrictEqual(julesCreatedAction);
                                        julesIOUCreatedAction =
                                            Object.values(julesReportActions ?? {}).find(
                                                (reportAction): reportAction is ReportActionBase & OriginalMessageIOU => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED,
                                            ) ?? null;
                                        julesIOUAction =
                                            Object.values(julesReportActions ?? {}).find(
                                                (reportAction): reportAction is ReportActionBase & OriginalMessageIOU =>
                                                    reportAction.reportActionID !== julesCreatedAction.reportActionID &&
                                                    reportAction.reportActionID !== julesExistingIOUAction.reportActionID,
                                            ) ?? null;
                                        expect(julesIOUAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        expect(julesIOUAction?.originalMessage.IOUReportID).toBe(julesIOUReport?.reportID);
                                        expect(julesIOUAction?.originalMessage.amount).toBe(amount / 4);
                                        expect(julesIOUAction?.originalMessage.comment).toBe(comment);
                                        expect(julesIOUAction?.originalMessage.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);
                                        expect(Date.parse(julesIOUCreatedAction?.created ?? '')).toBeLessThan(Date.parse(julesIOUAction?.created ?? ''));

                                        // Vit DM should have two reportActions – a pending CREATED action and a pending IOU action
                                        expect(Object.values(vitReportActions ?? {}).length).toBe(2);
                                        vitCreatedAction =
                                            Object.values(vitReportActions ?? {}).find(
                                                (reportAction): reportAction is ReportActionBase & OriginalMessageIOU => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED,
                                            ) ?? null;
                                        vitIOUAction =
                                            Object.values(vitReportActions ?? {}).find(
                                                (reportAction): reportAction is ReportActionBase & OriginalMessageIOU => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU,
                                            ) ?? null;
                                        expect(vitCreatedAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        expect(vitIOUAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        expect(vitIOUAction?.originalMessage.IOUReportID).toBe(vitIOUReport?.reportID);
                                        expect(vitIOUAction?.originalMessage.amount).toBe(amount / 4);
                                        expect(vitIOUAction?.originalMessage.comment).toBe(comment);
                                        expect(vitIOUAction?.originalMessage.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);
                                        expect(Date.parse(vitCreatedAction?.created ?? '')).toBeLessThan(Date.parse(vitIOUAction?.created ?? ''));

                                        // Group chat should have two reportActions – a pending CREATED action and a pending IOU action w/ type SPLIT
                                        expect(Object.values(groupReportActions ?? {}).length).toBe(2);
                                        groupCreatedAction =
                                            Object.values(groupReportActions ?? {}).find((reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) ?? null;
                                        groupIOUAction =
                                            Object.values(groupReportActions ?? {}).find(
                                                (reportAction): reportAction is ReportActionBase & OriginalMessageIOU => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU,
                                            ) ?? null;
                                        expect(groupCreatedAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        expect(groupIOUAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        expect(groupIOUAction?.originalMessage).not.toHaveProperty('IOUReportID');
                                        expect(groupIOUAction?.originalMessage?.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.SPLIT);
                                        expect(Date.parse(groupCreatedAction?.created ?? '')).toBeLessThanOrEqual(Date.parse(groupIOUAction?.created ?? ''));

                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                                    waitForCollectionCallback: true,
                                    callback: (allTransactions) => {
                                        Onyx.disconnect(connectionID);

                                        /* There should be 5 transactions
                                         *   – one existing one with Jules
                                         *   - one for each of the three IOU reports
                                         *   - one on the group chat w/ deleted report
                                         */
                                        expect(Object.values(allTransactions ?? {}).length).toBe(5);
                                        expect(allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${julesExistingTransaction?.transactionID}`]).toBeTruthy();

                                        carlosTransaction =
                                            Object.values(allTransactions ?? {}).find(
                                                (transaction) => transaction?.transactionID === (carlosIOUAction?.originalMessage as IOUMessage)?.IOUTransactionID,
                                            ) ?? null;
                                        julesTransaction =
                                            Object.values(allTransactions ?? {}).find(
                                                (transaction) => transaction?.transactionID === (julesIOUAction?.originalMessage as IOUMessage)?.IOUTransactionID,
                                            ) ?? null;
                                        vitTransaction =
                                            Object.values(allTransactions ?? {}).find(
                                                (transaction) => transaction?.transactionID === (vitIOUAction?.originalMessage as IOUMessage)?.IOUTransactionID,
                                            ) ?? null;
                                        groupTransaction = Object.values(allTransactions ?? {}).find((transaction) => transaction?.reportID === CONST.REPORT.SPLIT_REPORTID) ?? null;

                                        expect(carlosTransaction?.reportID).toBe(carlosIOUReport?.reportID);
                                        expect(julesTransaction?.reportID).toBe(julesIOUReport?.reportID);
                                        expect(vitTransaction?.reportID).toBe(vitIOUReport?.reportID);
                                        expect(groupTransaction).toBeTruthy();

                                        expect(carlosTransaction?.amount).toBe(amount / 4);
                                        expect(julesTransaction?.amount).toBe(amount / 4);
                                        expect(vitTransaction?.amount).toBe(amount / 4);
                                        expect(groupTransaction?.amount).toBe(amount);

                                        expect(carlosTransaction?.comment.comment).toBe(comment);
                                        expect(julesTransaction?.comment.comment).toBe(comment);
                                        expect(vitTransaction?.comment.comment).toBe(comment);
                                        expect(groupTransaction?.comment.comment).toBe(comment);

                                        expect(carlosTransaction?.merchant).toBe(merchant);
                                        expect(julesTransaction?.merchant).toBe(merchant);
                                        expect(vitTransaction?.merchant).toBe(merchant);
                                        expect(groupTransaction?.merchant).toBe(merchant);

                                        expect(carlosTransaction?.comment.source).toBe(CONST.IOU.TYPE.SPLIT);
                                        expect(julesTransaction?.comment.source).toBe(CONST.IOU.TYPE.SPLIT);
                                        expect(vitTransaction?.comment.source).toBe(CONST.IOU.TYPE.SPLIT);

                                        expect(carlosTransaction?.comment.originalTransactionID).toBe(groupTransaction?.transactionID);
                                        expect(julesTransaction?.comment.originalTransactionID).toBe(groupTransaction?.transactionID);
                                        expect(vitTransaction?.comment.originalTransactionID).toBe(groupTransaction?.transactionID);

                                        expect(carlosTransaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        expect(julesTransaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        expect(vitTransaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        expect(groupTransaction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                                    waitForCollectionCallback: false,
                                    callback: (allPersonalDetails) => {
                                        Onyx.disconnect(connectionID);
                                        expect(allPersonalDetails).toMatchObject({
                                            [VIT_ACCOUNT_ID]: {
                                                accountID: VIT_ACCOUNT_ID,
                                                displayName: VIT_EMAIL,
                                                login: VIT_EMAIL,
                                            },
                                        });
                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForNetworkPromises)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT,
                                    waitForCollectionCallback: true,
                                    callback: (allReports) => {
                                        Onyx.disconnect(connectionID);
                                        Object.values(allReports ?? {}).forEach((report) => {
                                            if (!report?.pendingFields) {
                                                return;
                                            }
                                            Object.values(report?.pendingFields).forEach((pendingField) => expect(pendingField).toBeFalsy());
                                        });
                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                    waitForCollectionCallback: true,
                                    callback: (allReportActions) => {
                                        Onyx.disconnect(connectionID);
                                        Object.values(allReportActions ?? {}).forEach((reportAction) => expect(reportAction?.pendingAction).toBeFalsy());
                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                                    waitForCollectionCallback: true,
                                    callback: (allTransactions) => {
                                        Onyx.disconnect(connectionID);
                                        Object.values(allTransactions ?? {}).forEach((transaction) => expect(transaction?.pendingAction).toBeFalsy());
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });
    });

    describe('payMoneyRequestElsewhere', () => {
        it('clears outstanding IOUReport', () => {
            const amount = 10000;
            const comment = 'Giv money plz';
            let chatReport: OnyxEntry<OnyxTypes.Report>;
            let iouReport: OnyxEntry<OnyxTypes.Report>;
            let createIOUAction: OnyxEntry<OnyxTypes.ReportAction>;
            let payIOUAction: OnyxEntry<OnyxTypes.ReportAction>;
            let transaction: OnyxEntry<OnyxTypes.Transaction>;
            IOU.requestMoney({reportID: ''}, amount, CONST.CURRENCY.USD, '', '', RORY_EMAIL, RORY_ACCOUNT_ID, {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID}, comment, {});
            return (
                waitForBatchedUpdates()
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT,
                                    waitForCollectionCallback: true,
                                    callback: (allReports) => {
                                        Onyx.disconnect(connectionID);

                                        expect(Object.values(allReports ?? {}).length).toBe(3);

                                        const chatReports = Object.values(allReports ?? {}).filter((report) => report?.type === CONST.REPORT.TYPE.CHAT);
                                        chatReport = chatReports[0];
                                        expect(chatReport).toBeTruthy();
                                        expect(chatReport).toHaveProperty('reportID');
                                        expect(chatReport).toHaveProperty('iouReportID');

                                        iouReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU) ?? null;
                                        expect(iouReport).toBeTruthy();
                                        expect(iouReport).toHaveProperty('reportID');
                                        expect(iouReport).toHaveProperty('chatReportID');

                                        expect(chatReport?.iouReportID).toBe(iouReport?.reportID);
                                        expect(iouReport?.chatReportID).toBe(chatReport?.reportID);

                                        expect(chatReport?.pendingFields).toBeFalsy();
                                        expect(iouReport?.pendingFields).toBeFalsy();

                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                    waitForCollectionCallback: true,
                                    callback: (allReportActions) => {
                                        Onyx.disconnect(connectionID);

                                        const reportActionsForIOUReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.iouReportID}`];

                                        createIOUAction =
                                            Object.values(reportActionsForIOUReport ?? {}).find((reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) ?? null;
                                        expect(createIOUAction).toBeTruthy();
                                        expect((createIOUAction?.originalMessage as IOUMessage)?.IOUReportID).toBe(iouReport?.reportID);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                                    waitForCollectionCallback: true,
                                    callback: (allTransactions) => {
                                        Onyx.disconnect(connectionID);
                                        expect(Object.values(allTransactions ?? {}).length).toBe(1);
                                        transaction = Object.values(allTransactions ?? {}).find((t) => t) ?? null;
                                        expect(transaction).toBeTruthy();
                                        expect(transaction?.amount).toBe(amount);
                                        expect(transaction?.reportID).toBe(iouReport?.reportID);
                                        expect((createIOUAction?.originalMessage as IOUMessage)?.IOUTransactionID).toBe(transaction?.transactionID);
                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(() => {
                        // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                        fetch.pause();
                        if (chatReport && iouReport) {
                            IOU.payMoneyRequest(CONST.IOU.PAYMENT_TYPE.ELSEWHERE, chatReport, iouReport);
                        }
                        return waitForBatchedUpdates();
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT,
                                    waitForCollectionCallback: true,
                                    callback: (allReports) => {
                                        Onyx.disconnect(connectionID);

                                        expect(Object.values(allReports ?? {}).length).toBe(3);

                                        chatReport = Object.values(allReports ?? {}).find((r) => r?.type === CONST.REPORT.TYPE.CHAT) ?? null;
                                        iouReport = Object.values(allReports ?? {}).find((r) => r?.type === CONST.REPORT.TYPE.IOU) ?? null;

                                        expect(chatReport?.iouReportID).toBeFalsy();

                                        // expect(iouReport.status).toBe(CONST.REPORT.STATUS_NUM.REIMBURSED);
                                        // expect(iouReport.stateNum).toBe(CONST.REPORT.STATE_NUM.APPROVED);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                    waitForCollectionCallback: true,
                                    callback: (allReportActions) => {
                                        Onyx.disconnect(connectionID);

                                        const reportActionsForIOUReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`];
                                        expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(3);

                                        payIOUAction =
                                            Object.values(reportActionsForIOUReport ?? {}).find(
                                                (reportAction) =>
                                                    reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && reportAction?.originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY,
                                            ) ?? null;
                                        expect(payIOUAction).toBeTruthy();
                                        expect(payIOUAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT,
                                    waitForCollectionCallback: true,
                                    callback: (allReports) => {
                                        Onyx.disconnect(connectionID);

                                        expect(Object.values(allReports ?? {}).length).toBe(3);

                                        chatReport = Object.values(allReports ?? {}).find((r) => r?.type === CONST.REPORT.TYPE.CHAT) ?? null;
                                        iouReport = Object.values(allReports ?? {}).find((r) => r?.type === CONST.REPORT.TYPE.IOU) ?? null;

                                        expect(chatReport?.iouReportID).toBeFalsy();

                                        // expect(iouReport.status).toBe(CONST.REPORT.STATUS_NUM.REIMBURSED);
                                        // expect(iouReport.stateNum).toBe(CONST.REPORT.STATE_NUM.APPROVED);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                    waitForCollectionCallback: true,
                                    callback: (allReportActions) => {
                                        Onyx.disconnect(connectionID);

                                        const reportActionsForIOUReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`];
                                        expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(3);

                                        payIOUAction =
                                            Object.values(reportActionsForIOUReport ?? {}).find(
                                                (reportAction) =>
                                                    reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && reportAction.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.PAY,
                                            ) ?? null;
                                        expect(payIOUAction).toBeTruthy();

                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });
    });

    describe('edit money request', () => {
        const amount = 10000;
        const comment = '💸💸💸💸';
        const merchant = 'NASDAQ';

        afterEach(() => {
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.resume();
        });

        it('updates the IOU request and IOU report when offline', () => {
            let thread: OptimisticChatReport;
            let iouReport: OnyxEntry<OnyxTypes.Report> = null;
            let iouAction: OnyxEntry<OnyxTypes.ReportAction> = null;
            let transaction: OnyxEntry<OnyxTypes.Transaction> = null;

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            IOU.requestMoney({reportID: ''}, amount, CONST.CURRENCY.USD, '', merchant, RORY_EMAIL, RORY_ACCOUNT_ID, {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID}, comment, {});
            return waitForBatchedUpdates()
                .then(() => {
                    Onyx.set(ONYXKEYS.SESSION, {email: RORY_EMAIL, accountID: RORY_ACCOUNT_ID});
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);
                                    iouReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU) ?? null;

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                                waitForCollectionCallback: false,
                                callback: (reportActionsForIOUReport) => {
                                    Onyx.disconnect(connectionID);

                                    [iouAction] = Object.values(reportActionsForIOUReport ?? {}).filter((reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU);
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.TRANSACTION,
                                waitForCollectionCallback: true,
                                callback: (allTransactions) => {
                                    Onyx.disconnect(connectionID);

                                    transaction = Object.values(allTransactions ?? {}).find((t) => !isEmptyObject(t)) ?? null;
                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    thread = ReportUtils.buildTransactionThread(iouAction, iouReport) ?? null;
                    Onyx.set(`report_${thread?.reportID ?? ''}`, thread);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    if (transaction) {
                        IOU.editMoneyRequest(
                            transaction,
                            thread.reportID,
                            {amount: 20000, comment: 'Double the amount!'},
                            {
                                id: '123',
                                role: 'user',
                                type: 'free',
                                name: '',
                                owner: '',
                                outputCurrency: '',
                                isPolicyExpenseChatEnabled: false,
                            },
                            {},
                            {},
                        );
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.TRANSACTION,
                                waitForCollectionCallback: true,
                                callback: (allTransactions) => {
                                    Onyx.disconnect(connectionID);

                                    const updatedTransaction = Object.values(allTransactions ?? {}).find((t) => !isEmptyObject(t));
                                    expect(updatedTransaction?.modifiedAmount).toBe(20000);
                                    expect(updatedTransaction?.comment).toMatchObject({comment: 'Double the amount!'});
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${thread.reportID}`,
                                waitForCollectionCallback: false,
                                callback: (allActions) => {
                                    Onyx.disconnect(connectionID);
                                    const updatedAction = Object.values(allActions ?? {}).find((reportAction) => !isEmptyObject(reportAction));
                                    expect(updatedAction?.actionName).toEqual('MODIFIEDEXPENSE');
                                    expect(updatedAction?.originalMessage).toEqual(
                                        expect.objectContaining({amount: 20000, newComment: 'Double the amount!', oldAmount: amount, oldComment: comment}),
                                    );
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);
                                    const updatedIOUReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);
                                    const updatedChatReport = Object.values(allReports ?? {}).find((report) => report?.reportID === iouReport?.chatReportID);
                                    expect(updatedIOUReport).toEqual(
                                        expect.objectContaining({
                                            total: 20000,
                                            cachedTotal: '$200.00',
                                            lastMessageHtml: 'requested $200.00',
                                            lastMessageText: 'requested $200.00',
                                        }),
                                    );
                                    expect(updatedChatReport).toEqual(
                                        expect.objectContaining({
                                            lastMessageHtml: `${CARLOS_EMAIL} owes $200.00`,
                                            lastMessageText: `${CARLOS_EMAIL} owes $200.00`,
                                        }),
                                    );
                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    fetch.resume();
                });
        });

        it('resets the IOU request and IOU report when api returns an error', () => {
            let thread: OptimisticChatReport;
            let iouReport: OnyxEntry<OnyxTypes.Report>;
            let iouAction: OnyxEntry<OnyxTypes.ReportAction>;
            let transaction: OnyxEntry<OnyxTypes.Transaction>;

            IOU.requestMoney({reportID: ''}, amount, CONST.CURRENCY.USD, '', merchant, RORY_EMAIL, RORY_ACCOUNT_ID, {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID}, comment, {});
            return waitForBatchedUpdates()
                .then(() => {
                    Onyx.set(ONYXKEYS.SESSION, {email: RORY_EMAIL, accountID: RORY_ACCOUNT_ID});
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);
                                    [iouReport] = Object.values(allReports ?? {}).filter((report) => report?.type === CONST.REPORT.TYPE.IOU);
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                                waitForCollectionCallback: false,
                                callback: (reportActionsForIOUReport) => {
                                    Onyx.disconnect(connectionID);

                                    [iouAction] = Object.values(reportActionsForIOUReport ?? {}).filter((reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU);
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.TRANSACTION,
                                waitForCollectionCallback: true,
                                callback: (allTransactions) => {
                                    Onyx.disconnect(connectionID);

                                    transaction = Object.values(allTransactions ?? {}).find((t) => !isEmptyObject(t)) ?? null;
                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    thread = ReportUtils.buildTransactionThread(iouAction, iouReport);
                    Onyx.set(`report_${thread.reportID}`, thread);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    fetch.fail();

                    if (transaction) {
                        IOU.editMoneyRequest(
                            transaction,
                            thread.reportID,
                            {amount: 20000, comment: 'Double the amount!'},
                            {
                                id: '123',
                                role: 'user',
                                type: 'free',
                                name: '',
                                owner: '',
                                outputCurrency: '',
                                isPolicyExpenseChatEnabled: false,
                            },
                            {},
                            {},
                        );
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.TRANSACTION,
                                waitForCollectionCallback: true,
                                callback: (allTransactions) => {
                                    Onyx.disconnect(connectionID);

                                    const updatedTransaction = Object.values(allTransactions ?? {}).find((t) => !isEmptyObject(t));
                                    expect(updatedTransaction?.modifiedAmount).toBe(undefined);
                                    expect(updatedTransaction?.amount).toBe(10000);
                                    expect(updatedTransaction?.comment).toMatchObject({comment});
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${thread.reportID}`,
                                waitForCollectionCallback: false,
                                callback: (allActions) => {
                                    Onyx.disconnect(connectionID);
                                    const updatedAction = Object.values(allActions ?? {}).find((reportAction) => !isEmptyObject(reportAction));
                                    expect(updatedAction?.actionName).toEqual('MODIFIEDEXPENSE');
                                    expect(Object.values(updatedAction?.errors ?? {})).toEqual(expect.arrayContaining([['iou.error.genericEditFailureMessage', {isTranslated: false}]]));
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);
                                    const updatedIOUReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);
                                    const updatedChatReport = Object.values(allReports ?? {}).find((report) => report?.reportID === iouReport?.chatReportID);
                                    expect(updatedIOUReport).toEqual(
                                        expect.objectContaining({
                                            total: 10000,
                                            cachedTotal: '$100.00',
                                            lastMessageHtml: `requested $${amount / 100}.00 for ${comment}`,
                                            lastMessageText: `requested $${amount / 100}.00 for ${comment}`,
                                        }),
                                    );
                                    expect(updatedChatReport).toEqual(
                                        expect.objectContaining({
                                            lastMessageHtml: '',
                                        }),
                                    );
                                    resolve();
                                },
                            });
                        }),
                );
        });
    });

    describe('pay expense report via ACH', () => {
        const amount = 10000;
        const comment = '💸💸💸💸';
        const merchant = 'NASDAQ';

        afterEach(() => {
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.resume();
        });

        it('updates the expense request and expense report when paid while offline', () => {
            let expenseReport: OnyxEntry<OnyxTypes.Report>;
            let chatReport: OnyxEntry<OnyxTypes.Report>;

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            Onyx.set(ONYXKEYS.SESSION, {email: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID});
            return waitForBatchedUpdates()
                .then(() => {
                    PolicyActions.createWorkspace(CARLOS_EMAIL, true, "Carlos's Workspace");
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);
                                    chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT) ?? null;

                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    if (chatReport) {
                        IOU.requestMoney(chatReport, amount, CONST.CURRENCY.USD, '', merchant, RORY_EMAIL, RORY_ACCOUNT_ID, {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID}, comment, {});
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU) ?? null;

                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    if (chatReport && expenseReport) {
                        IOU.payMoneyRequest(CONST.IOU.PAYMENT_TYPE.VBBA, chatReport, expenseReport);
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
                                waitForCollectionCallback: false,
                                callback: (allActions) => {
                                    Onyx.disconnect(connectionID);
                                    expect(Object.values(allActions ?? {})).toEqual(
                                        expect.arrayContaining([
                                            expect.objectContaining({
                                                message: expect.arrayContaining([
                                                    expect.objectContaining({
                                                        html: `paid $${amount / 100}.00 with Expensify`,
                                                        text: `paid $${amount / 100}.00 with Expensify`,
                                                    }),
                                                ]),
                                                originalMessage: expect.objectContaining({
                                                    amount,
                                                    paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
                                                    type: 'pay',
                                                }),
                                            }),
                                        ]),
                                    );
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);
                                    const updatedIOUReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);
                                    const updatedChatReport = Object.values(allReports ?? {}).find((report) => report?.reportID === expenseReport?.chatReportID);
                                    expect(updatedIOUReport).toEqual(
                                        expect.objectContaining({
                                            lastMessageHtml: `paid $${amount / 100}.00 with Expensify`,
                                            lastMessageText: `paid $${amount / 100}.00 with Expensify`,
                                            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                                            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                                        }),
                                    );
                                    expect(updatedChatReport).toEqual(
                                        expect.objectContaining({
                                            lastMessageHtml: `paid $${amount / 100}.00 with Expensify`,
                                            lastMessageText: `paid $${amount / 100}.00 with Expensify`,
                                        }),
                                    );
                                    resolve();
                                },
                            });
                        }),
                );
        });

        it('shows an error when paying results in an error', () => {
            let expenseReport: OnyxEntry<OnyxTypes.Report>;
            let chatReport: OnyxEntry<OnyxTypes.Report>;

            Onyx.set(ONYXKEYS.SESSION, {email: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID});
            return waitForBatchedUpdates()
                .then(() => {
                    PolicyActions.createWorkspace(CARLOS_EMAIL, true, "Carlos's Workspace");
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);
                                    chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT) ?? null;

                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    if (chatReport) {
                        IOU.requestMoney(chatReport, amount, CONST.CURRENCY.USD, '', merchant, RORY_EMAIL, RORY_ACCOUNT_ID, {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID}, comment, {});
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU) ?? null;

                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    fetch.fail();
                    if (chatReport && expenseReport) {
                        IOU.payMoneyRequest('ACH', chatReport, expenseReport);
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
                                waitForCollectionCallback: false,
                                callback: (allActions) => {
                                    Onyx.disconnect(connectionID);
                                    const erroredAction = Object.values(allActions ?? {}).find((action) => !isEmptyObject(action?.errors));
                                    expect(Object.values(erroredAction?.errors ?? {})).toEqual(expect.arrayContaining([['iou.error.other', {isTranslated: false}]]));
                                    resolve();
                                },
                            });
                        }),
                );
        });
    });

    describe('deleteMoneyRequest', () => {
        const amount = 10000;
        const comment = 'Send me money please';
        let chatReport: OnyxEntry<OnyxTypes.Report>;
        let iouReport: OnyxEntry<OnyxTypes.Report>;
        let createIOUAction: OnyxEntry<OnyxTypes.ReportAction>;
        let transaction: OnyxEntry<OnyxTypes.Transaction>;
        let thread: OptimisticChatReport;
        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_USER_LOGIN = 'test@test.com';
        let IOU_REPORT_ID: string;
        let reportActionID;
        const REPORT_ACTION: OnyxEntry<OnyxTypes.ReportAction> = {
            actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
            actorAccountID: TEST_USER_ACCOUNT_ID,
            automatic: false,
            avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
            message: [{type: 'COMMENT', html: 'Testing a comment', text: 'Testing a comment', translationKey: ''}],
            person: [{type: 'TEXT', style: 'strong', text: 'Test User'}],
            shouldShow: true,
            created: DateUtils.getDBTime(),
            reportActionID: '1',
            originalMessage: {
                html: '',
                whisperedTo: [],
            },
        };

        let reportActions: OnyxCollection<OnyxTypes.ReportAction>;

        beforeEach(async () => {
            // Given mocks are cleared and helpers are set up
            jest.clearAllMocks();
            PusherHelper.setup();

            // Given a test user is signed in with Onyx setup and some initial data
            await TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
            User.subscribeToUserEvents();
            await waitForBatchedUpdates();
            await TestHelper.setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID);

            // When an IOU request for money is made
            IOU.requestMoney({reportID: ''}, amount, CONST.CURRENCY.USD, '', '', TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID, {login: RORY_EMAIL, accountID: RORY_ACCOUNT_ID}, comment, {});
            await waitForBatchedUpdates();

            // When fetching all reports from Onyx
            const allReports = await new Promise<OnyxCollection<OnyxTypes.Report>>((resolve) => {
                const connectionID = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (reports) => {
                        Onyx.disconnect(connectionID);
                        resolve(reports);
                    },
                });
            });

            // Then we should have exactly 3 reports
            expect(Object.values(allReports ?? {}).length).toBe(3);

            // Then one of them should be a chat report with relevant properties
            chatReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.CHAT) ?? null;
            expect(chatReport).toBeTruthy();
            expect(chatReport).toHaveProperty('reportID');
            expect(chatReport).toHaveProperty('iouReportID');

            // Then one of them should be an IOU report with relevant properties
            iouReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU) ?? null;
            expect(iouReport).toBeTruthy();
            expect(iouReport).toHaveProperty('reportID');
            expect(iouReport).toHaveProperty('chatReportID');

            // Then their IDs should reference each other
            expect(chatReport?.iouReportID).toBe(iouReport?.reportID);
            expect(iouReport?.chatReportID).toBe(chatReport?.reportID);

            // Storing IOU Report ID for further reference
            IOU_REPORT_ID = chatReport?.iouReportID ?? '';

            await waitForBatchedUpdates();

            // When fetching all report actions from Onyx
            const allReportActions = await new Promise<OnyxCollection<OnyxTypes.ReportActions>>((resolve) => {
                const connectionID = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                    waitForCollectionCallback: true,
                    callback: (actions) => {
                        Onyx.disconnect(connectionID);
                        resolve(actions);
                    },
                });
            });

            // Then we should find an IOU action with specific properties
            const reportActionsForIOUReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.iouReportID}`];
            createIOUAction =
                Object.values(reportActionsForIOUReport ?? {}).find(
                    (reportAction): reportAction is ReportActionBase & OriginalMessageIOU => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU,
                ) ?? null;
            expect(createIOUAction).toBeTruthy();
            expect(createIOUAction?.originalMessage.IOUReportID).toBe(iouReport?.reportID);

            // When fetching all transactions from Onyx
            const allTransactions = await new Promise<OnyxCollection<OnyxTypes.Transaction>>((resolve) => {
                const connectionID = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                    waitForCollectionCallback: true,
                    callback: (transactions) => {
                        Onyx.disconnect(connectionID);
                        resolve(transactions);
                    },
                });
            });

            // Then we should find a specific transaction with relevant properties
            transaction = Object.values(allTransactions ?? {}).find((t) => t) ?? null;
            expect(transaction).toBeTruthy();
            expect(transaction?.amount).toBe(amount);
            expect(transaction?.reportID).toBe(iouReport?.reportID);
            expect(createIOUAction?.originalMessage.IOUTransactionID).toBe(transaction?.transactionID);
        });

        afterEach(PusherHelper.teardown);

        it('delete a money request (IOU Action and transaction) successfully', async () => {
            // Given the fetch operations are paused and a money request is initiated
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();

            if (transaction && createIOUAction) {
                // When the money request is deleted
                IOU.deleteMoneyRequest(transaction?.transactionID, createIOUAction, true);
            }
            await waitForBatchedUpdates();

            // Then we check if the IOU report action is removed from the report actions collection
            let reportActionsForReport = await new Promise<OnyxCollection<OnyxTypes.ReportAction>>((resolve) => {
                const connectionID = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (actionsForReport) => {
                        Onyx.disconnect(connectionID);
                        resolve(actionsForReport);
                    },
                });
            });

            createIOUAction = Object.values(reportActionsForReport ?? {}).find((reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) ?? null;
            // Then the IOU Action should be truthy for offline support.
            expect(createIOUAction).toBeTruthy();

            // Then we check if the transaction is removed from the transactions collection
            const t = await new Promise<OnyxEntry<OnyxTypes.Transaction>>((resolve) => {
                const connectionID = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction?.transactionID}`,
                    waitForCollectionCallback: false,
                    callback: (transactionResult) => {
                        Onyx.disconnect(connectionID);
                        resolve(transactionResult);
                    },
                });
            });

            expect(t).toBeFalsy();

            // Given fetch operations are resumed
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.resume();
            await waitForBatchedUpdates();

            // Then we recheck the IOU report action from the report actions collection
            reportActionsForReport = await new Promise<OnyxCollection<OnyxTypes.ReportAction>>((resolve) => {
                const connectionID = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (actionsForReport) => {
                        Onyx.disconnect(connectionID);
                        resolve(actionsForReport);
                    },
                });
            });

            createIOUAction = Object.values(reportActionsForReport ?? {}).find((reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) ?? null;
            expect(createIOUAction).toBeFalsy();

            // Then we recheck the transaction from the transactions collection
            const tr = await new Promise<OnyxEntry<OnyxTypes.Transaction>>((resolve) => {
                const connectionID = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction?.transactionID}`,
                    waitForCollectionCallback: false,
                    callback: (transactionResult) => {
                        Onyx.disconnect(connectionID);
                        resolve(transactionResult);
                    },
                });
            });

            expect(tr).toBeFalsy();
        });

        it('delete the IOU report when there are no visible comments left in the IOU report', async () => {
            // Given an IOU report and a paused fetch state
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();

            if (transaction && createIOUAction) {
                // When the IOU money request is deleted
                IOU.deleteMoneyRequest(transaction?.transactionID, createIOUAction, true);
            }
            await waitForBatchedUpdates();

            let report = await new Promise<OnyxEntry<OnyxTypes.Report>>((resolve) => {
                const connectionID = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (res) => {
                        Onyx.disconnect(connectionID);
                        resolve(res);
                    },
                });
            });

            // Then the report should be truthy for offline support
            expect(report).toBeTruthy();

            // Given the resumed fetch state
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.resume();
            await waitForBatchedUpdates();

            report = await new Promise<OnyxEntry<OnyxTypes.Report>>((resolve) => {
                const connectionID = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (res) => {
                        Onyx.disconnect(connectionID);
                        resolve(res);
                    },
                });
            });

            // Then the report should be falsy so that there is no trace of the money request.
            expect(report).toBeFalsy();
        });

        it('does not delete the IOU report when there are visible comments left in the IOU report', async () => {
            // Given the initial setup is completed
            await waitForBatchedUpdates();

            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`,
                callback: (val) => (reportActions = val),
            });
            await waitForBatchedUpdates();

            jest.advanceTimersByTime(10);

            // When a comment is added to the IOU report
            Report.addComment(IOU_REPORT_ID, 'Testing a comment');
            await waitForBatchedUpdates();

            // Then verify that the comment is correctly added
            const resultAction = Object.values(reportActions ?? {}).find((reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT);
            reportActionID = resultAction?.reportActionID ?? '';

            expect(resultAction?.message).toEqual(REPORT_ACTION.message);
            expect(resultAction?.person).toEqual(REPORT_ACTION.person);
            expect(resultAction?.pendingAction).toBeUndefined();

            await waitForBatchedUpdates();

            // Verify there are three actions (created + iou + addcomment) and our optimistic comment has been removed
            expect(Object.values(reportActions ?? {}).length).toBe(3);

            // Then check the loading state of our action
            const resultActionAfterUpdate = reportActions?.[reportActionID];
            expect(resultActionAfterUpdate?.pendingAction).toBeUndefined();

            // When we attempt to delete a money request from the IOU report
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            if (transaction && createIOUAction) {
                IOU.deleteMoneyRequest(transaction?.transactionID, createIOUAction, false);
            }
            await waitForBatchedUpdates();

            // Then expect that the IOU report still exists
            let allReports = await new Promise<OnyxCollection<OnyxTypes.Report>>((resolve) => {
                const connectionID = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (reports) => {
                        Onyx.disconnect(connectionID);
                        resolve(reports);
                    },
                });
            });

            await waitForBatchedUpdates();

            iouReport = Object.values(allReports ?? {}).find((report) => ReportUtils.isIOUReport(report)) ?? null;
            expect(iouReport).toBeTruthy();
            expect(iouReport).toHaveProperty('reportID');
            expect(iouReport).toHaveProperty('chatReportID');

            // Given the resumed fetch state
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.resume();

            allReports = await new Promise<OnyxCollection<OnyxTypes.Report>>((resolve) => {
                const connectionID = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (reports) => {
                        Onyx.disconnect(connectionID);
                        resolve(reports);
                    },
                });
            });
            // Then expect that the IOU report still exists
            iouReport = Object.values(allReports ?? {}).find((report) => ReportUtils.isIOUReport(report)) ?? null;
            expect(iouReport).toBeTruthy();
            expect(iouReport).toHaveProperty('reportID');
            expect(iouReport).toHaveProperty('chatReportID');
        });

        it('delete the transaction thread if there are no visible comments in the thread', async () => {
            // Given all promises are resolved
            await waitForBatchedUpdates();
            jest.advanceTimersByTime(10);

            // Given a transaction thread
            thread = ReportUtils.buildTransactionThread(createIOUAction, iouReport);

            expect(thread.notificationPreference).toBe(CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN);

            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${thread.reportID}`,
                callback: (val) => (reportActions = val),
            });

            await waitForBatchedUpdates();

            jest.advanceTimersByTime(10);

            // Given User logins from the participant accounts
            const userLogins = PersonalDetailsUtils.getLoginsByAccountIDs(thread?.participantAccountIDs ?? []);

            // When Opening a thread report with the given details
            Report.openReport(thread.reportID, '', userLogins, thread, createIOUAction?.reportActionID);
            await waitForBatchedUpdates();

            // Then The iou action has the transaction report id as a child report ID
            const allReportActions = await new Promise<OnyxCollection<OnyxTypes.ReportActions>>((resolve) => {
                const connectionID = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                    waitForCollectionCallback: true,
                    callback: (actions) => {
                        Onyx.disconnect(connectionID);
                        resolve(actions);
                    },
                });
            });
            const reportActionsForIOUReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.iouReportID}`];
            createIOUAction = Object.values(reportActionsForIOUReport ?? {}).find((reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) ?? null;
            expect(createIOUAction?.childReportID).toBe(thread.reportID);

            await waitForBatchedUpdates();

            // Given Fetch is paused and timers have advanced
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            jest.advanceTimersByTime(10);

            if (transaction && createIOUAction) {
                // When Deleting a money request
                IOU.deleteMoneyRequest(transaction?.transactionID, createIOUAction, false);
            }
            await waitForBatchedUpdates();

            // Then The report for the given thread ID does not exist
            let report = await new Promise<OnyxEntry<OnyxTypes.Report>>((resolve) => {
                const connectionID = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${thread.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (reportData) => {
                        Onyx.disconnect(connectionID);
                        resolve(reportData);
                    },
                });
            });

            expect(report).toBeFalsy();
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.resume();

            // Then After resuming fetch, the report for the given thread ID still does not exist
            report = await new Promise<OnyxEntry<OnyxTypes.Report>>((resolve) => {
                const connectionID = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${thread.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (reportData) => {
                        Onyx.disconnect(connectionID);
                        resolve(reportData);
                    },
                });
            });

            expect(report).toBeFalsy();
        });

        it('delete the transaction thread if there are only changelogs (i.e. MODIFIEDEXPENSE actions) in the thread', async () => {
            // Given all promises are resolved
            await waitForBatchedUpdates();
            jest.advanceTimersByTime(10);

            // Given a transaction thread
            thread = ReportUtils.buildTransactionThread(createIOUAction, iouReport);

            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${thread.reportID}`,
                callback: (val) => (reportActions = val),
            });

            await waitForBatchedUpdates();

            jest.advanceTimersByTime(10);

            // Given User logins from the participant accounts
            const userLogins = PersonalDetailsUtils.getLoginsByAccountIDs(thread?.participantAccountIDs ?? []);

            // When Opening a thread report with the given details
            Report.openReport(thread.reportID, '', userLogins, thread, createIOUAction?.reportActionID);
            await waitForBatchedUpdates();

            // Then The iou action has the transaction report id as a child report ID
            const allReportActions = await new Promise<OnyxCollection<OnyxTypes.ReportActions>>((resolve) => {
                const connectionID = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                    waitForCollectionCallback: true,
                    callback: (actions) => {
                        Onyx.disconnect(connectionID);
                        resolve(actions);
                    },
                });
            });
            const reportActionsForIOUReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.iouReportID}`];
            createIOUAction = Object.values(reportActionsForIOUReport ?? {}).find((reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) ?? null;
            expect(createIOUAction?.childReportID).toBe(thread.reportID);

            await waitForBatchedUpdates();

            jest.advanceTimersByTime(10);
            if (transaction && createIOUAction) {
                IOU.editMoneyRequest(
                    transaction,
                    thread.reportID,
                    {amount: 20000, comment: 'Double the amount!'},
                    {
                        id: '123',
                        role: 'user',
                        type: 'free',
                        name: '',
                        owner: '',
                        outputCurrency: '',
                        isPolicyExpenseChatEnabled: false,
                    },
                    {},
                    {},
                );
            }
            await waitForBatchedUpdates();

            // Verify there are two actions (created + changelog)
            expect(Object.values(reportActions ?? {}).length).toBe(2);

            // Fetch the updated IOU Action from Onyx
            await new Promise<void>((resolve) => {
                const connectionID = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (reportActionsForReport) => {
                        Onyx.disconnect(connectionID);
                        createIOUAction = Object.values(reportActionsForReport ?? {}).find((reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) ?? null;
                        resolve();
                    },
                });
            });

            if (transaction && createIOUAction) {
                // When Deleting a money request
                IOU.deleteMoneyRequest(transaction?.transactionID, createIOUAction, false);
            }
            await waitForBatchedUpdates();

            // Then, the report for the given thread ID does not exist
            const report = await new Promise<OnyxEntry<OnyxTypes.Report>>((resolve) => {
                const connectionID = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${thread.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (reportData) => {
                        Onyx.disconnect(connectionID);
                        resolve(reportData);
                    },
                });
            });

            expect(report).toBeFalsy();
        });

        it('does not delete the transaction thread if there are visible comments in the thread', async () => {
            // Given initial environment is set up
            await waitForBatchedUpdates();

            // Given a transaction thread
            thread = ReportUtils.buildTransactionThread(createIOUAction, iouReport);

            expect(thread.notificationPreference).toBe(CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN);

            const userLogins = PersonalDetailsUtils.getLoginsByAccountIDs(thread?.participantAccountIDs ?? []);
            jest.advanceTimersByTime(10);
            Report.openReport(thread.reportID, '', userLogins, thread, createIOUAction?.reportActionID);
            await waitForBatchedUpdates();

            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${thread.reportID}`,
                callback: (val) => (reportActions = val),
            });
            await waitForBatchedUpdates();

            await new Promise<void>((resolve) => {
                const connectionID = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${thread.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connectionID);
                        expect(report).toBeTruthy();
                        resolve();
                    },
                });
            });

            jest.advanceTimersByTime(10);

            // When a comment is added
            Report.addComment(thread.reportID, 'Testing a comment');
            await waitForBatchedUpdates();

            // Then comment details should match the expected report action
            const resultAction = Object.values(reportActions ?? {}).find((reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT);
            reportActionID = resultAction?.reportActionID ?? '';
            expect(resultAction?.message).toEqual(REPORT_ACTION.message);
            expect(resultAction?.person).toEqual(REPORT_ACTION.person);

            await waitForBatchedUpdates();

            // Then the report should have 2 actions
            expect(Object.values(reportActions ?? {}).length).toBe(2);
            const resultActionAfter = reportActions?.[reportActionID];
            expect(resultActionAfter?.pendingAction).toBeUndefined();

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();

            if (transaction && createIOUAction) {
                // When deleting money request
                IOU.deleteMoneyRequest(transaction?.transactionID, createIOUAction, false);
            }
            await waitForBatchedUpdates();

            // Then the transaction thread report should still exist
            await new Promise<void>((resolve) => {
                const connectionID = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${thread.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (report) => {
                        Onyx.disconnect(connectionID);
                        expect(report).toBeTruthy();
                        resolve();
                    },
                });
            });

            // When fetch resumes
            // Then the transaction thread report should still exist
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.resume();
            await new Promise<void>((resolve) => {
                const connectionID = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${thread.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connectionID);
                        expect(report).toBeTruthy();
                        resolve();
                    },
                });
            });
        });

        it('update the moneyRequestPreview to show [Deleted request] when appropriate', async () => {
            await waitForBatchedUpdates();

            // Given a thread report

            jest.advanceTimersByTime(10);
            thread = ReportUtils.buildTransactionThread(createIOUAction, iouReport);

            expect(thread.notificationPreference).toBe(CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN);

            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${thread.reportID}`,
                callback: (val) => (reportActions = val),
            });
            await waitForBatchedUpdates();

            jest.advanceTimersByTime(10);
            const userLogins = PersonalDetailsUtils.getLoginsByAccountIDs(thread?.participantAccountIDs ?? []);
            Report.openReport(thread.reportID, '', userLogins, thread, createIOUAction?.reportActionID);

            await waitForBatchedUpdates();

            const allReportActions = await new Promise<OnyxCollection<OnyxTypes.ReportActions>>((resolve) => {
                const connectionID = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                    waitForCollectionCallback: true,
                    callback: (actions) => {
                        Onyx.disconnect(connectionID);
                        resolve(actions);
                    },
                });
            });

            const reportActionsForIOUReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.iouReportID}`];
            createIOUAction = Object.values(reportActionsForIOUReport ?? {}).find((reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) ?? null;
            expect(createIOUAction?.childReportID).toBe(thread.reportID);

            await waitForBatchedUpdates();

            // Given an added comment to the thread report

            jest.advanceTimersByTime(10);

            Report.addComment(thread.reportID, 'Testing a comment');
            await waitForBatchedUpdates();

            // Fetch the updated IOU Action from Onyx due to addition of comment to transaction thread.
            // This needs to be fetched as `deleteMoneyRequest` depends on `childVisibleActionCount` in `createIOUAction`.
            await new Promise<void>((resolve) => {
                const connectionID = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (reportActionsForReport) => {
                        Onyx.disconnect(connectionID);
                        createIOUAction = Object.values(reportActionsForReport ?? {}).find((reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) ?? null;
                        resolve();
                    },
                });
            });

            let resultAction = Object.values(reportActions ?? {}).find((reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT);
            reportActionID = resultAction?.reportActionID ?? '';

            expect(resultAction?.message).toEqual(REPORT_ACTION.message);
            expect(resultAction?.person).toEqual(REPORT_ACTION.person);
            expect(resultAction?.pendingAction).toBeUndefined();

            await waitForBatchedUpdates();

            // Verify there are three actions (created + addcomment) and our optimistic comment has been removed
            expect(Object.values(reportActions ?? {}).length).toBe(2);

            let resultActionAfterUpdate = reportActions?.[reportActionID];

            // Verify that our action is no longer in the loading state
            expect(resultActionAfterUpdate?.pendingAction).toBeUndefined();

            await waitForBatchedUpdates();

            // Given an added comment to the IOU report

            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`,
                callback: (val) => (reportActions = val),
            });
            await waitForBatchedUpdates();

            jest.advanceTimersByTime(10);

            Report.addComment(IOU_REPORT_ID, 'Testing a comment');
            await waitForBatchedUpdates();

            resultAction = Object.values(reportActions ?? {}).find((reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT);
            reportActionID = resultAction?.reportActionID ?? '';

            expect(resultAction?.message).toEqual(REPORT_ACTION.message);
            expect(resultAction?.person).toEqual(REPORT_ACTION.person);
            expect(resultAction?.pendingAction).toBeUndefined();

            await waitForBatchedUpdates();

            // Verify there are three actions (created + iou + addcomment) and our optimistic comment has been removed
            expect(Object.values(reportActions ?? {}).length).toBe(3);

            resultActionAfterUpdate = reportActions?.[reportActionID];

            // Verify that our action is no longer in the loading state
            expect(resultActionAfterUpdate?.pendingAction).toBeUndefined();

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            if (transaction && createIOUAction) {
                // When we delete the money request
                IOU.deleteMoneyRequest(transaction.transactionID, createIOUAction, false);
            }
            await waitForBatchedUpdates();

            // Then we expect the moneyRequestPreview to show [Deleted request]

            await new Promise<void>((resolve) => {
                const connectionID = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (reportActionsForReport) => {
                        Onyx.disconnect(connectionID);
                        createIOUAction = Object.values(reportActionsForReport ?? {}).find((reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) ?? null;
                        expect(createIOUAction?.message?.[0]?.isDeletedParentAction).toBeTruthy();
                        resolve();
                    },
                });
            });

            // When we resume fetch
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.resume();

            // Then we expect the moneyRequestPreview to show [Deleted request]

            await new Promise<void>((resolve) => {
                const connectionID = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                    waitForCollectionCallback: false,
                    callback: (reportActionsForReport) => {
                        Onyx.disconnect(connectionID);
                        createIOUAction = Object.values(reportActionsForReport ?? {}).find((reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) ?? null;
                        expect(createIOUAction?.message?.[0]?.isDeletedParentAction).toBeTruthy();
                        resolve();
                    },
                });
            });
        });

        it('update IOU report and reportPreview with new totals and messages if the IOU report is not deleted', async () => {
            await waitForBatchedUpdates();
            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                callback: (val) => (iouReport = val),
            });
            await waitForBatchedUpdates();

            // Given a second money request in addition to the first one

            jest.advanceTimersByTime(10);
            const amount2 = 20000;
            const comment2 = 'Send me money please 2';
            if (chatReport) {
                IOU.requestMoney(chatReport, amount2, CONST.CURRENCY.USD, '', '', TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID, {login: RORY_EMAIL, accountID: RORY_ACCOUNT_ID}, comment2, {});
            }

            await waitForBatchedUpdates();

            // Then we expect the IOU report and reportPreview to update with new totals

            expect(iouReport).toBeTruthy();
            expect(iouReport).toHaveProperty('reportID');
            expect(iouReport).toHaveProperty('chatReportID');
            expect(iouReport?.total).toBe(30000);

            const ioupreview = ReportActionsUtils.getReportPreviewAction(chatReport?.reportID ?? '', iouReport?.reportID ?? '');
            expect(ioupreview).toBeTruthy();
            expect(ioupreview?.message?.[0]?.text).toBe('rory@expensifail.com owes $300.00');

            // When we delete the first money request
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            jest.advanceTimersByTime(10);
            if (transaction && createIOUAction) {
                IOU.deleteMoneyRequest(transaction.transactionID, createIOUAction, false);
            }
            await waitForBatchedUpdates();

            // Then we expect the IOU report and reportPreview to update with new totals

            expect(iouReport).toBeTruthy();
            expect(iouReport).toHaveProperty('reportID');
            expect(iouReport).toHaveProperty('chatReportID');
            expect(iouReport?.total).toBe(20000);

            // When we resume
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.resume();

            // Then we expect the IOU report and reportPreview to update with new totals
            expect(iouReport).toBeTruthy();
            expect(iouReport).toHaveProperty('reportID');
            expect(iouReport).toHaveProperty('chatReportID');
            expect(iouReport?.total).toBe(20000);
        });

        it('navigate the user correctly to the iou Report when appropriate', async () => {
            await waitForBatchedUpdates();

            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOU_REPORT_ID}`,
                callback: (val) => (reportActions = val),
            });
            await waitForBatchedUpdates();

            // Given an added comment to the iou report

            jest.advanceTimersByTime(10);

            Report.addComment(IOU_REPORT_ID, 'Testing a comment');
            await waitForBatchedUpdates();

            const resultAction = Object.values(reportActions ?? {}).find((reportAction) => reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT);
            reportActionID = resultAction?.reportActionID;

            expect(resultAction?.message).toEqual(REPORT_ACTION.message);
            expect(resultAction?.person).toEqual(REPORT_ACTION.person);

            await waitForBatchedUpdates();

            // Verify there are three actions (created + iou + addcomment) and our optimistic comment has been removed
            expect(Object.values(reportActions ?? {}).length).toBe(3);

            await waitForBatchedUpdates();

            // Given a thread report

            jest.advanceTimersByTime(10);
            thread = ReportUtils.buildTransactionThread(createIOUAction, iouReport);

            expect(thread.notificationPreference).toBe(CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN);

            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${thread.reportID}`,
                callback: (val) => (reportActions = val),
            });
            await waitForBatchedUpdates();

            jest.advanceTimersByTime(10);
            const userLogins = PersonalDetailsUtils.getLoginsByAccountIDs(thread?.participantAccountIDs ?? []);
            Report.openReport(thread.reportID, '', userLogins, thread, createIOUAction?.reportActionID);
            await waitForBatchedUpdates();

            const allReportActions = await new Promise<OnyxCollection<OnyxTypes.ReportActions>>((resolve) => {
                const connectionID = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                    waitForCollectionCallback: true,
                    callback: (actions) => {
                        Onyx.disconnect(connectionID);
                        resolve(actions);
                    },
                });
            });

            const reportActionsForIOUReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.iouReportID}`];
            createIOUAction = Object.values(reportActionsForIOUReport ?? {}).find((reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) ?? null;
            expect(createIOUAction?.childReportID).toBe(thread.reportID);

            await waitForBatchedUpdates();

            // When we delete the money request in SingleTransactionView and we should not delete the IOU report

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();

            if (transaction && createIOUAction) {
                IOU.deleteMoneyRequest(transaction.transactionID, createIOUAction, true);
            }
            await waitForBatchedUpdates();

            let allReports = await new Promise<OnyxCollection<OnyxTypes.Report>>((resolve) => {
                const connectionID = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (reports) => {
                        Onyx.disconnect(connectionID);
                        resolve(reports);
                    },
                });
            });

            await waitForBatchedUpdates();

            iouReport = Object.values(allReports ?? {}).find((report) => ReportUtils.isIOUReport(report)) ?? null;
            expect(iouReport).toBeTruthy();
            expect(iouReport).toHaveProperty('reportID');
            expect(iouReport).toHaveProperty('chatReportID');

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.resume();

            allReports = await new Promise<OnyxCollection<OnyxTypes.Report>>((resolve) => {
                const connectionID = Onyx.connect({
                    key: ONYXKEYS.COLLECTION.REPORT,
                    waitForCollectionCallback: true,
                    callback: (reports) => {
                        Onyx.disconnect(connectionID);
                        resolve(reports);
                    },
                });
            });

            iouReport = Object.values(allReports ?? {}).find((report) => ReportUtils.isIOUReport(report)) ?? null;
            expect(iouReport).toBeTruthy();
            expect(iouReport).toHaveProperty('reportID');
            expect(iouReport).toHaveProperty('chatReportID');

            // Then we expect to navigate to the iou report

            expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(IOU_REPORT_ID));
        });

        it('navigate the user correctly to the chat Report when appropriate', () => {
            if (transaction && createIOUAction) {
                // When we delete the money request and we should delete the IOU report
                IOU.deleteMoneyRequest(transaction.transactionID, createIOUAction, false);
            }
            // Then we expect to navigate to the chat report
            expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(chatReport?.reportID ?? ''));
        });
    });

    describe('submitReport', () => {
        it('correctly submits a report', () => {
            const amount = 10000;
            const comment = '💸💸💸💸';
            const merchant = 'NASDAQ';
            let expenseReport: OnyxEntry<OnyxTypes.Report>;
            let chatReport: OnyxEntry<OnyxTypes.Report>;
            return waitForBatchedUpdates()
                .then(() => {
                    const policyID = PolicyActions.generatePolicyID();
                    PolicyActions.createWorkspace(CARLOS_EMAIL, true, "Carlos's Workspace", policyID);

                    // Change the approval mode for the policy since default is Submit and Close
                    PolicyActions.setWorkspaceApprovalMode(policyID, CARLOS_EMAIL, CONST.POLICY.APPROVAL_MODE.BASIC);
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);
                                    chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT) ?? null;

                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    if (chatReport) {
                        IOU.requestMoney(
                            chatReport,
                            amount,
                            CONST.CURRENCY.USD,
                            '',
                            merchant,
                            RORY_EMAIL,
                            RORY_ACCOUNT_ID,
                            {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID, isPolicyExpenseChat: true, reportID: chatReport.reportID},
                            comment,
                            {},
                        );
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE) ?? null;
                                    Onyx.merge(`report_${expenseReport?.reportID}`, {
                                        statusNum: 0,
                                        stateNum: 0,
                                    });
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE) ?? null;

                                    // Verify report is a draft
                                    expect(expenseReport?.stateNum).toBe(0);
                                    expect(expenseReport?.statusNum).toBe(0);
                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    if (expenseReport) {
                        IOU.submitReport(expenseReport);
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE) ?? null;

                                    // Report was submitted correctly
                                    expect(expenseReport?.stateNum).toBe(1);
                                    expect(expenseReport?.statusNum).toBe(1);
                                    resolve();
                                },
                            });
                        }),
                );
        });
        it('correctly submits a report with Submit and Close approval mode', () => {
            const amount = 10000;
            const comment = '💸💸💸💸';
            const merchant = 'NASDAQ';
            let expenseReport: OnyxEntry<OnyxTypes.Report>;
            let chatReport: OnyxEntry<OnyxTypes.Report>;
            return waitForBatchedUpdates()
                .then(() => {
                    PolicyActions.createWorkspace(CARLOS_EMAIL, true, "Carlos's Workspace");
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);
                                    chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT) ?? null;

                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    if (chatReport) {
                        IOU.requestMoney(
                            chatReport,
                            amount,
                            CONST.CURRENCY.USD,
                            '',
                            merchant,
                            RORY_EMAIL,
                            RORY_ACCOUNT_ID,
                            {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID, isPolicyExpenseChat: true, reportID: chatReport.reportID},
                            comment,
                            {},
                        );
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE) ?? null;
                                    Onyx.merge(`report_${expenseReport?.reportID}`, {
                                        statusNum: 0,
                                        stateNum: 0,
                                    });
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE) ?? null;

                                    // Verify report is a draft
                                    expect(expenseReport?.stateNum).toBe(0);
                                    expect(expenseReport?.statusNum).toBe(0);
                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    if (expenseReport) {
                        IOU.submitReport(expenseReport);
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE) ?? null;

                                    // Report is closed since the default policy settings is Submit and Close
                                    expect(expenseReport?.stateNum).toBe(2);
                                    expect(expenseReport?.statusNum).toBe(2);
                                    resolve();
                                },
                            });
                        }),
                );
        });
        it('correctly implements error handling', () => {
            const amount = 10000;
            const comment = '💸💸💸💸';
            const merchant = 'NASDAQ';
            let expenseReport: OnyxEntry<OnyxTypes.Report>;
            let chatReport: OnyxEntry<OnyxTypes.Report>;
            return waitForBatchedUpdates()
                .then(() => {
                    PolicyActions.createWorkspace(CARLOS_EMAIL, true, "Carlos's Workspace");
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);
                                    chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT) ?? null;

                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    if (chatReport) {
                        IOU.requestMoney(
                            chatReport,
                            amount,
                            CONST.CURRENCY.USD,
                            '',
                            merchant,
                            RORY_EMAIL,
                            RORY_ACCOUNT_ID,
                            {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID, isPolicyExpenseChat: true, reportID: chatReport.reportID},
                            comment,
                            {},
                        );
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE) ?? null;
                                    Onyx.merge(`report_${expenseReport?.reportID}`, {
                                        statusNum: 0,
                                        stateNum: 0,
                                    });
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE) ?? null;

                                    // Verify report is a draft
                                    expect(expenseReport?.stateNum).toBe(0);
                                    expect(expenseReport?.statusNum).toBe(0);
                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    fetch.fail();
                    if (expenseReport) {
                        IOU.submitReport(expenseReport);
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE) ?? null;

                                    // Report was submitted with some fail
                                    expect(expenseReport?.stateNum).toBe(0);
                                    expect(expenseReport?.statusNum).toBe(0);
                                    resolve();
                                },
                            });
                        }),
                );
        });
    });
});
