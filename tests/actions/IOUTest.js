import _ from 'underscore';
import Onyx from 'react-native-onyx';
import CONST from '../../src/CONST';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import * as IOU from '../../src/libs/actions/IOU';
import * as TestHelper from '../utils/TestHelper';
import DateUtils from '../../src/libs/DateUtils';
import * as NumberUtils from '../../src/libs/NumberUtils';
import * as ReportActions from '../../src/libs/actions/ReportActions';
import * as Report from '../../src/libs/actions/Report';

const CARLOS_EMAIL = 'cmartins@expensifail.com';
const CARLOS_ACCOUNT_ID = 1;
const JULES_EMAIL = 'jules@expensifail.com';
const JULES_ACCOUNT_ID = 2;
const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;
const VIT_EMAIL = 'vit@expensifail.com';
const VIT_ACCOUNT_ID = 4;

describe('actions/IOU', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        return Onyx.clear().then(waitForPromisesToResolve);
    });

    describe('requestMoney', () => {
        it('creates new chat if needed', () => {
            const amount = 10000;
            const comment = 'Giv money plz';
            const merchant = 'KFC';
            let iouReportID;
            let createdAction;
            let iouAction;
            let transactionID;
            fetch.pause();
            IOU.requestMoney({}, amount, CONST.CURRENCY.USD, '', merchant, RORY_EMAIL, RORY_ACCOUNT_ID, {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID}, comment);
            return waitForPromisesToResolve()
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);

                                    // A chat report and an iou report should be created
                                    const chatReports = _.filter(allReports, (report) => report.type === CONST.REPORT.TYPE.CHAT);
                                    const iouReports = _.filter(allReports, (report) => report.type === CONST.REPORT.TYPE.IOU);
                                    expect(_.size(chatReports)).toBe(1);
                                    expect(_.size(iouReports)).toBe(1);
                                    const chatReport = chatReports[0];
                                    const iouReport = iouReports[0];
                                    iouReportID = iouReport.reportID;

                                    // They should be linked together
                                    expect(chatReport.participantAccountIDs).toEqual([CARLOS_ACCOUNT_ID]);
                                    expect(chatReport.iouReportID).toBe(iouReport.reportID);
                                    expect(chatReport.hasOutstandingIOU).toBe(true);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                waitForCollectionCallback: true,
                                callback: (reportActionsForIOUReport) => {
                                    Onyx.disconnect(connectionID);

                                    // The IOU report should have a CREATED action and IOU action
                                    expect(_.size(reportActionsForIOUReport)).toBe(2);
                                    const createdActions = _.filter(reportActionsForIOUReport, (reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);
                                    const iouActions = _.filter(reportActionsForIOUReport, (reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU);
                                    expect(_.size(createdActions)).toBe(1);
                                    expect(_.size(iouActions)).toBe(1);
                                    createdAction = createdActions[0];
                                    iouAction = iouActions[0];

                                    // The CREATED action should not be created after the IOU action
                                    expect(Date.parse(createdAction.created)).toBeLessThanOrEqual(Date.parse(iouAction.created));

                                    // The IOUReportID should be correct
                                    expect(iouAction.originalMessage.IOUReportID).toBe(iouReportID);

                                    // The comment should be included in the IOU action
                                    expect(iouAction.originalMessage.comment).toBe(comment);

                                    // The amount in the IOU action should be correct
                                    expect(iouAction.originalMessage.amount).toBe(amount);

                                    // The IOU type should be correct
                                    expect(iouAction.originalMessage.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);

                                    // Both actions should be pending
                                    expect(createdAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    expect(iouAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.TRANSACTION,
                                waitForCollectionCallback: true,
                                callback: (allTransactions) => {
                                    Onyx.disconnect(connectionID);

                                    // There should be one transaction
                                    expect(_.size(allTransactions)).toBe(1);
                                    const transaction = _.find(allTransactions, (t) => !_.isEmpty(t));
                                    transactionID = transaction.transactionID;

                                    // The transaction should be attached to the IOU report
                                    expect(transaction.reportID).toBe(iouReportID);

                                    // Its amount should match the amount of the request
                                    expect(transaction.amount).toBe(amount);

                                    // The comment should be correct
                                    expect(transaction.comment.comment).toBe(comment);

                                    // It should be pending
                                    expect(transaction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    // The transactionID on the iou action should match the one from the transactions collection
                                    expect(iouAction.originalMessage.IOUTransactionID).toBe(transactionID);

                                    expect(transaction.merchant).toBe(merchant);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(fetch.resume)
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                waitForCollectionCallback: true,
                                callback: (reportActionsForIOUReport) => {
                                    Onyx.disconnect(connectionID);
                                    expect(_.size(reportActionsForIOUReport)).toBe(2);
                                    _.each(reportActionsForIOUReport, (reportAction) => expect(reportAction.pendingAction).toBeFalsy());
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                                waitForCollectionCallback: true,
                                callback: (transaction) => {
                                    Onyx.disconnect(connectionID);
                                    expect(transaction.pendingAction).toBeFalsy();
                                    resolve();
                                },
                            });
                        }),
                );
        });

        it('updates existing chat report if there is one', () => {
            const amount = 10000;
            const comment = 'Giv money plz';
            let chatReport = {
                reportID: 1234,
                type: CONST.REPORT.TYPE.CHAT,
                hasOutstandingIOU: false,
                participantAccountIDs: [CARLOS_ACCOUNT_ID],
            };
            const createdAction = {
                reportActionID: NumberUtils.rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: DateUtils.getDBTime(),
            };
            let iouReportID;
            let iouAction;
            let transactionID;
            fetch.pause();
            return Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport)
                .then(() =>
                    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`, {
                        [createdAction.reportActionID]: createdAction,
                    }),
                )
                .then(() => {
                    IOU.requestMoney(chatReport, amount, CONST.CURRENCY.USD, '', '', RORY_EMAIL, RORY_ACCOUNT_ID, {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID}, comment);
                    return waitForPromisesToResolve();
                })
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);

                                    // The same chat report should be reused, and an IOU report should be created
                                    expect(_.size(allReports)).toBe(2);
                                    expect(_.find(allReports, (report) => report.type === CONST.REPORT.TYPE.CHAT).reportID).toBe(chatReport.reportID);
                                    chatReport = _.find(allReports, (report) => report.type === CONST.REPORT.TYPE.CHAT);
                                    const iouReport = _.find(allReports, (report) => report.type === CONST.REPORT.TYPE.IOU);
                                    iouReportID = iouReport.reportID;

                                    // They should be linked together
                                    expect(chatReport.iouReportID).toBe(iouReportID);
                                    expect(chatReport.hasOutstandingIOU).toBe(true);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                waitForCollectionCallback: true,
                                callback: (allIOUReportActions) => {
                                    Onyx.disconnect(connectionID);

                                    // The chat report should have a CREATED and an IOU action
                                    expect(_.size(allIOUReportActions)).toBe(2);
                                    iouAction = _.find(allIOUReportActions, (reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU);

                                    // The CREATED action should not be created after the IOU action
                                    expect(Date.parse(createdAction.created)).toBeLessThanOrEqual(Date.parse(iouAction.created));

                                    // The IOUReportID should be correct
                                    expect(iouAction.originalMessage.IOUReportID).toBe(iouReportID);

                                    // The comment should be included in the IOU action
                                    expect(iouAction.originalMessage.comment).toBe(comment);

                                    // The amount in the IOU action should be correct
                                    expect(iouAction.originalMessage.amount).toBe(amount);

                                    // The IOU action type should be correct
                                    expect(iouAction.originalMessage.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);

                                    // The IOU action should be pending
                                    expect(iouAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.TRANSACTION,
                                waitForCollectionCallback: true,
                                callback: (allTransactions) => {
                                    Onyx.disconnect(connectionID);

                                    // There should be one transaction
                                    expect(_.size(allTransactions)).toBe(1);
                                    const transaction = _.find(allTransactions, (t) => !_.isEmpty(t));
                                    transactionID = transaction.transactionID;

                                    // The transaction should be attached to the IOU report
                                    expect(transaction.reportID).toBe(iouReportID);

                                    // Its amount should match the amount of the request
                                    expect(transaction.amount).toBe(amount);

                                    // The comment should be correct
                                    expect(transaction.comment.comment).toBe(comment);

                                    expect(transaction.merchant).toBe(CONST.TRANSACTION.DEFAULT_MERCHANT);

                                    // It should be pending
                                    expect(transaction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    // The transactionID on the iou action should match the one from the transactions collection
                                    expect(iouAction.originalMessage.IOUTransactionID).toBe(transactionID);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(fetch.resume)
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                waitForCollectionCallback: true,
                                callback: (reportActionsForIOUReport) => {
                                    Onyx.disconnect(connectionID);
                                    expect(_.size(reportActionsForIOUReport)).toBe(2);
                                    _.each(reportActionsForIOUReport, (reportAction) => expect(reportAction.pendingAction).toBeFalsy());
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                                waitForCollectionCallback: true,
                                callback: (transaction) => {
                                    Onyx.disconnect(connectionID);
                                    expect(transaction.pendingAction).toBeFalsy();
                                    resolve();
                                },
                            });
                        }),
                );
        });

        it('updates existing IOU report if there is one', () => {
            const amount = 10000;
            const comment = 'Giv money plz';
            const chatReportID = 1234;
            const iouReportID = 5678;
            let chatReport = {
                reportID: chatReportID,
                type: CONST.REPORT.TYPE.CHAT,
                hasOutstandingIOU: true,
                iouReportID,
                participantAccountIDs: [CARLOS_ACCOUNT_ID],
            };
            const createdAction = {
                reportActionID: NumberUtils.rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: DateUtils.getDBTime(),
            };
            const existingTransaction = {
                transactionID: NumberUtils.rand64(),
                amount: 1000,
                comment: '',
                created: DateUtils.getDBTime(),
            };
            let iouReport = {
                reportID: iouReportID,
                chatReportID,
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: RORY_ACCOUNT_ID,
                managerID: CARLOS_ACCOUNT_ID,
                currency: CONST.CURRENCY.USD,
                total: existingTransaction.amount,
            };
            const iouAction = {
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
            let newIOUAction;
            let newTransaction;
            fetch.pause();
            return Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, chatReport)
                .then(() => Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, iouReport))
                .then(() =>
                    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`, {
                        [createdAction.reportActionID]: createdAction,
                        [iouAction.reportActionID]: iouAction,
                    }),
                )
                .then(() => Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${existingTransaction.transactionID}`, existingTransaction))
                .then(() => {
                    IOU.requestMoney(chatReport, amount, CONST.CURRENCY.USD, '', '', RORY_EMAIL, RORY_ACCOUNT_ID, {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID}, comment);
                    return waitForPromisesToResolve();
                })
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);

                                    // No new reports should be created
                                    expect(_.size(allReports)).toBe(2);
                                    expect(_.find(allReports, (report) => report.reportID === chatReportID)).toBeTruthy();
                                    expect(_.find(allReports, (report) => report.reportID === iouReportID)).toBeTruthy();

                                    chatReport = _.find(allReports, (report) => report.type === CONST.REPORT.TYPE.CHAT);
                                    iouReport = _.find(allReports, (report) => report.type === CONST.REPORT.TYPE.IOU);

                                    // The total on the iou report should be updated
                                    expect(iouReport.total).toBe(11000);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                waitForCollectionCallback: true,
                                callback: (reportActionsForIOUReport) => {
                                    Onyx.disconnect(connectionID);

                                    expect(_.size(reportActionsForIOUReport)).toBe(3);
                                    newIOUAction = _.find(
                                        reportActionsForIOUReport,
                                        (reportAction) => reportAction.reportActionID !== createdAction.reportActionID && reportAction.reportActionID !== iouAction.reportActionID,
                                    );

                                    // The IOUReportID should be correct
                                    expect(iouAction.originalMessage.IOUReportID).toBe(iouReportID);

                                    // The comment should be included in the IOU action
                                    expect(newIOUAction.originalMessage.comment).toBe(comment);

                                    // The amount in the IOU action should be correct
                                    expect(newIOUAction.originalMessage.amount).toBe(amount);

                                    // The type of the IOU action should be correct
                                    expect(newIOUAction.originalMessage.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);

                                    // The IOU action should be pending
                                    expect(newIOUAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.TRANSACTION,
                                waitForCollectionCallback: true,
                                callback: (allTransactions) => {
                                    Onyx.disconnect(connectionID);

                                    // There should be two transactions
                                    expect(_.size(allTransactions)).toBe(2);

                                    newTransaction = _.find(allTransactions, (transaction) => transaction.transactionID !== existingTransaction.transactionID);

                                    expect(newTransaction.reportID).toBe(iouReportID);
                                    expect(newTransaction.amount).toBe(amount);
                                    expect(newTransaction.comment.comment).toBe(comment);
                                    expect(newTransaction.merchant).toBe(CONST.TRANSACTION.DEFAULT_MERCHANT);
                                    expect(newTransaction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    // The transactionID on the iou action should match the one from the transactions collection
                                    expect(newIOUAction.originalMessage.IOUTransactionID).toBe(newTransaction.transactionID);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(fetch.resume)
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                waitForCollectionCallback: true,
                                callback: (reportActionsForIOUReport) => {
                                    Onyx.disconnect(connectionID);
                                    expect(_.size(reportActionsForIOUReport)).toBe(3);
                                    _.each(reportActionsForIOUReport, (reportAction) => expect(reportAction.pendingAction).toBeFalsy());
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.TRANSACTION,
                                waitForCollectionCallback: true,
                                callback: (allTransactions) => {
                                    Onyx.disconnect(connectionID);
                                    _.each(allTransactions, (transaction) => expect(transaction.pendingAction).toBeFalsy());
                                    resolve();
                                },
                            });
                        }),
                );
        });

        it('correctly implements RedBrickRoad error handling', () => {
            const amount = 10000;
            const comment = 'Giv money plz';
            let chatReportID;
            let iouReportID;
            let createdAction;
            let iouAction;
            let transactionID;
            fetch.pause();
            IOU.requestMoney({}, amount, CONST.CURRENCY.USD, '', '', RORY_EMAIL, RORY_ACCOUNT_ID, {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID}, comment);
            return (
                waitForPromisesToResolve()
                    .then(
                        () =>
                            new Promise((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT,
                                    waitForCollectionCallback: true,
                                    callback: (allReports) => {
                                        Onyx.disconnect(connectionID);

                                        // A chat report and an iou report should be created
                                        const chatReports = _.filter(allReports, (report) => report.type === CONST.REPORT.TYPE.CHAT);
                                        const iouReports = _.filter(allReports, (report) => report.type === CONST.REPORT.TYPE.IOU);
                                        expect(_.size(chatReports)).toBe(1);
                                        expect(_.size(iouReports)).toBe(1);
                                        const chatReport = chatReports[0];
                                        chatReportID = chatReport.reportID;
                                        const iouReport = iouReports[0];
                                        iouReportID = iouReport.reportID;

                                        // They should be linked together
                                        expect(chatReport.participantAccountIDs).toEqual([CARLOS_ACCOUNT_ID]);
                                        expect(chatReport.iouReportID).toBe(iouReport.reportID);
                                        expect(chatReport.hasOutstandingIOU).toBe(true);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                    waitForCollectionCallback: true,
                                    callback: (reportActionsForIOUReport) => {
                                        Onyx.disconnect(connectionID);

                                        // The chat report should have a CREATED action and IOU action
                                        expect(_.size(reportActionsForIOUReport)).toBe(2);
                                        const createdActions = _.filter(reportActionsForIOUReport, (reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);
                                        const iouActions = _.filter(reportActionsForIOUReport, (reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU);
                                        expect(_.size(createdActions)).toBe(1);
                                        expect(_.size(iouActions)).toBe(1);
                                        createdAction = createdActions[0];
                                        iouAction = iouActions[0];

                                        // The CREATED action should not be created after the IOU action
                                        expect(Date.parse(createdAction.created)).toBeLessThanOrEqual(Date.parse(iouAction.created));

                                        // The IOUReportID should be correct
                                        expect(iouAction.originalMessage.IOUReportID).toBe(iouReportID);

                                        // The comment should be included in the IOU action
                                        expect(iouAction.originalMessage.comment).toBe(comment);

                                        // The amount in the IOU action should be correct
                                        expect(iouAction.originalMessage.amount).toBe(amount);

                                        // The type should be correct
                                        expect(iouAction.originalMessage.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);

                                        // Both actions should be pending
                                        expect(createdAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        expect(iouAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                                    waitForCollectionCallback: true,
                                    callback: (allTransactions) => {
                                        Onyx.disconnect(connectionID);

                                        // There should be one transaction
                                        expect(_.size(allTransactions)).toBe(1);
                                        const transaction = _.find(allTransactions, (t) => !_.isEmpty(t));
                                        transactionID = transaction.transactionID;

                                        expect(transaction.reportID).toBe(iouReportID);
                                        expect(transaction.amount).toBe(amount);
                                        expect(transaction.comment.comment).toBe(comment);
                                        expect(transaction.merchant).toBe(CONST.TRANSACTION.DEFAULT_MERCHANT);
                                        expect(transaction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                        // The transactionID on the iou action should match the one from the transactions collection
                                        expect(iouAction.originalMessage.IOUTransactionID).toBe(transactionID);

                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(() => {
                        fetch.fail();
                        return fetch.resume();
                    })
                    .then(
                        () =>
                            new Promise((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                                    waitForCollectionCallback: true,
                                    callback: (reportActionsForIOUReport) => {
                                        Onyx.disconnect(connectionID);
                                        expect(_.size(reportActionsForIOUReport)).toBe(2);
                                        iouAction = _.find(reportActionsForIOUReport, (reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU);
                                        expect(iouAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(
                        () =>
                            new Promise((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                                    waitForCollectionCallback: true,
                                    callback: (transaction) => {
                                        Onyx.disconnect(connectionID);
                                        expect(transaction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        expect(transaction.errors).toBeTruthy();
                                        expect(_.values(transaction.errors)[0]).toBe('iou.error.genericCreateFailureMessage');
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // If the user clears the errors on the IOU action
                    .then(
                        () =>
                            new Promise((resolve) => {
                                ReportActions.clearReportActionErrors(iouReportID, iouAction);
                                resolve();
                            }),
                    )

                    // Then the reportAction should be removed from Onyx
                    .then(
                        () =>
                            new Promise((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
                                    waitForCollectionCallback: true,
                                    callback: (reportActionsForReport) => {
                                        Onyx.disconnect(connectionID);
                                        iouAction = _.find(reportActionsForReport, (reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU);
                                        expect(iouAction).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // Along with the associated transaction
                    .then(
                        () =>
                            new Promise((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                                    waitForCollectionCallback: true,
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
                            new Promise((resolve) => {
                                Report.deleteReport(chatReportID);
                                resolve();
                            }),
                    )

                    // Then the report should be deleted
                    .then(
                        () =>
                            new Promise((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT,
                                    waitForCollectionCallback: true,
                                    callback: (allReports) => {
                                        Onyx.disconnect(connectionID);
                                        _.each(allReports, (report) => expect(report).toBeFalsy());
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // All reportActions should also be deleted
                    .then(
                        () =>
                            new Promise((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                    waitForCollectionCallback: true,
                                    callback: (allReportActions) => {
                                        Onyx.disconnect(connectionID);
                                        _.each(allReportActions, (reportAction) => expect(reportAction).toBeFalsy());
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // All transactions should also be deleted
                    .then(
                        () =>
                            new Promise((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.TRANSACTION,
                                    waitForCollectionCallback: true,
                                    callback: (allTransactions) => {
                                        Onyx.disconnect(connectionID);
                                        _.each(allTransactions, (transaction) => expect(transaction).toBeFalsy());
                                        resolve();
                                    },
                                });
                            }),
                    )

                    // Cleanup
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
            let carlosChatReport = {
                reportID: NumberUtils.rand64(),
                type: CONST.REPORT.TYPE.CHAT,
                hasOutstandingIOU: false,
                participantAccountIDs: [CARLOS_ACCOUNT_ID],
            };
            const carlosCreatedAction = {
                reportActionID: NumberUtils.rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: DateUtils.getDBTime(),
            };
            const julesIOUReportID = NumberUtils.rand64();
            let julesChatReport = {
                reportID: NumberUtils.rand64(),
                type: CONST.REPORT.TYPE.CHAT,
                hasOutstandingIOU: true,
                iouReportID: julesIOUReportID,
                participantAccountIDs: [JULES_ACCOUNT_ID],
            };
            const julesChatCreatedAction = {
                reportActionID: NumberUtils.rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: DateUtils.getDBTime(),
            };
            const julesCreatedAction = {
                reportActionID: NumberUtils.rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: DateUtils.getDBTime(),
            };
            jest.advanceTimersByTime(200);
            const julesExistingTransaction = {
                transactionID: NumberUtils.rand64(),
                amount: 1000,
                comment: 'This is an existing transaction',
                created: DateUtils.getDBTime(),
            };
            let julesIOUReport = {
                reportID: julesIOUReportID,
                chatReportID: julesChatReport.reportID,
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: RORY_ACCOUNT_ID,
                managerID: JULES_ACCOUNT_ID,
                currency: CONST.CURRENCY.USD,
                total: julesExistingTransaction.amount,
            };
            const julesExistingIOUAction = {
                reportActionID: NumberUtils.rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: RORY_ACCOUNT_ID,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: julesIOUReportID,
                    IOUTransactionID: julesExistingTransaction.transactionID,
                    amount: julesExistingTransaction.amount,
                    currency: CONST.CURRENCY.USD,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    participantAccountIDs: [RORY_ACCOUNT_ID, JULES_ACCOUNT_ID],
                },
            };

            let carlosIOUReport;
            let carlosIOUAction;
            let carlosTransaction;

            let julesIOUAction;
            let julesTransaction;

            let vitChatReport;
            let vitIOUReport;
            let vitCreatedAction;
            let vitIOUAction;
            let vitTransaction;

            let groupChat;
            let groupCreatedAction;
            let groupIOUAction;
            let groupTransaction;

            return Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, {
                [`${ONYXKEYS.COLLECTION.REPORT}${carlosChatReport.reportID}`]: carlosChatReport,
                [`${ONYXKEYS.COLLECTION.REPORT}${julesChatReport.reportID}`]: julesChatReport,
                [`${ONYXKEYS.COLLECTION.REPORT}${julesIOUReport.reportID}`]: julesIOUReport,
            })
                .then(() =>
                    Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
                        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${carlosChatReport.reportID}`]: {
                            [carlosCreatedAction.reportActionID]: carlosCreatedAction,
                        },
                        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${julesChatReport.reportID}`]: {
                            [julesChatCreatedAction.reportActionID]: julesChatCreatedAction,
                        },
                        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${julesIOUReport.reportID}`]: {
                            [julesCreatedAction.reportActionID]: julesCreatedAction,
                            [julesExistingIOUAction.reportActionID]: julesExistingIOUAction,
                        },
                    }),
                )
                .then(() => Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${julesExistingTransaction.transactionID}`, julesExistingTransaction))
                .then(() => {
                    // When we split a bill offline
                    fetch.pause();
                    IOU.splitBill(
                        // TODO: Migrate after the backend accepts accountIDs
                        _.map(
                            [
                                [CARLOS_EMAIL, CARLOS_ACCOUNT_ID],
                                [JULES_EMAIL, JULES_ACCOUNT_ID],
                                [VIT_EMAIL, VIT_ACCOUNT_ID],
                            ],
                            ([email, accountID]) => ({login: email, accountID}),
                        ),
                        RORY_EMAIL,
                        RORY_ACCOUNT_ID,
                        amount,
                        comment,
                        CONST.CURRENCY.USD,
                    );
                    return waitForPromisesToResolve();
                })
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);

                                    // There should now be 7 reports
                                    expect(_.size(allReports)).toBe(7);

                                    // 1. The chat report with Rory + Carlos
                                    carlosChatReport = _.find(allReports, (report) => report.reportID === carlosChatReport.reportID);
                                    expect(_.isEmpty(carlosChatReport)).toBe(false);
                                    expect(carlosChatReport.pendingFields).toBeFalsy();

                                    // 2. The IOU report with Rory + Carlos (new)
                                    carlosIOUReport = _.find(allReports, (report) => report.type === CONST.REPORT.TYPE.IOU && report.managerID === CARLOS_ACCOUNT_ID);
                                    expect(_.isEmpty(carlosIOUReport)).toBe(false);
                                    expect(carlosIOUReport.total).toBe(amount / 4);

                                    // 3. The chat report with Rory + Jules
                                    julesChatReport = _.find(allReports, (report) => report.reportID === julesChatReport.reportID);
                                    expect(_.isEmpty(julesChatReport)).toBe(false);
                                    expect(julesChatReport.pendingFields).toBeFalsy();

                                    // 4. The IOU report with Rory + Jules
                                    julesIOUReport = _.find(allReports, (report) => report.reportID === julesIOUReport.reportID);
                                    expect(_.isEmpty(julesIOUReport)).toBe(false);
                                    expect(julesChatReport.pendingFields).toBeFalsy();
                                    expect(julesIOUReport.total).toBe(julesExistingTransaction.amount + amount / 4);

                                    // 5. The chat report with Rory + Vit (new)
                                    vitChatReport = _.find(allReports, (report) => report.type === CONST.REPORT.TYPE.CHAT && _.isEqual(report.participantAccountIDs, [VIT_ACCOUNT_ID]));
                                    expect(_.isEmpty(vitChatReport)).toBe(false);
                                    expect(vitChatReport.pendingFields).toStrictEqual({createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});

                                    // 6. The IOU report with Rory + Vit (new)
                                    vitIOUReport = _.find(allReports, (report) => report.type === CONST.REPORT.TYPE.IOU && report.managerID === VIT_ACCOUNT_ID);
                                    expect(_.isEmpty(vitIOUReport)).toBe(false);
                                    expect(vitIOUReport.total).toBe(amount / 4);

                                    // 7. The group chat with everyone
                                    groupChat = _.find(
                                        allReports,
                                        (report) => report.type === CONST.REPORT.TYPE.CHAT && _.isEqual(report.participantAccountIDs, [CARLOS_ACCOUNT_ID, JULES_ACCOUNT_ID, VIT_ACCOUNT_ID]),
                                    );
                                    expect(_.isEmpty(groupChat)).toBe(false);
                                    expect(groupChat.pendingFields).toStrictEqual({createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});

                                    // The 1:1 chat reports and the IOU reports should be linked together
                                    expect(carlosChatReport.hasOutstandingIOU).toBe(true);
                                    expect(carlosChatReport.iouReportID).toBe(carlosIOUReport.reportID);
                                    expect(carlosIOUReport.chatReportID).toBe(carlosChatReport.reportID);

                                    expect(julesChatReport.hasOutstandingIOU).toBe(true);
                                    expect(julesChatReport.iouReportID).toBe(julesIOUReport.reportID);
                                    expect(julesIOUReport.chatReportID).toBe(julesChatReport.reportID);

                                    expect(vitChatReport.hasOutstandingIOU).toBe(true);
                                    expect(vitChatReport.iouReportID).toBe(vitIOUReport.reportID);
                                    expect(vitIOUReport.chatReportID).toBe(vitChatReport.reportID);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                waitForCollectionCallback: true,
                                callback: (allReportActions) => {
                                    Onyx.disconnect(connectionID);

                                    // There should be reportActions on all 4 chat reports + 3 IOU reports in each 1:1 chat
                                    expect(_.size(allReportActions)).toBe(7);

                                    const carlosReportActions = allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${carlosChatReport.iouReportID}`];
                                    const julesReportActions = allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${julesChatReport.iouReportID}`];
                                    const vitReportActions = allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${vitChatReport.iouReportID}`];
                                    const groupReportActions = allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${groupChat.reportID}`];

                                    // Carlos DM should have two reportActions – the existing CREATED action and a pending IOU action
                                    expect(_.size(carlosReportActions)).toBe(2);
                                    carlosIOUAction = _.find(carlosReportActions, (reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU);
                                    expect(carlosIOUAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    expect(carlosIOUAction.originalMessage.IOUReportID).toBe(carlosIOUReport.reportID);
                                    expect(carlosIOUAction.originalMessage.amount).toBe(amount / 4);
                                    expect(carlosIOUAction.originalMessage.comment).toBe(comment);
                                    expect(carlosIOUAction.originalMessage.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);
                                    expect(Date.parse(carlosCreatedAction.created)).toBeLessThanOrEqual(Date.parse(carlosIOUAction.created));

                                    // Jules DM should have three reportActions, the existing CREATED action, the existing IOU action, and a new pending IOU action
                                    expect(_.size(julesReportActions)).toBe(3);
                                    expect(julesReportActions[julesCreatedAction.reportActionID]).toStrictEqual(julesCreatedAction);
                                    julesIOUAction = _.find(
                                        julesReportActions,
                                        (reportAction) =>
                                            reportAction.reportActionID !== julesCreatedAction.reportActionID && reportAction.reportActionID !== julesExistingIOUAction.reportActionID,
                                    );
                                    expect(julesIOUAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    expect(julesIOUAction.originalMessage.IOUReportID).toBe(julesIOUReport.reportID);
                                    expect(julesIOUAction.originalMessage.amount).toBe(amount / 4);
                                    expect(julesIOUAction.originalMessage.comment).toBe(comment);
                                    expect(julesIOUAction.originalMessage.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);
                                    expect(Date.parse(julesCreatedAction.created)).toBeLessThanOrEqual(Date.parse(julesIOUAction.created));

                                    // Vit DM should have two reportActions – a pending CREATED action and a pending IOU action
                                    expect(_.size(vitReportActions)).toBe(2);
                                    vitCreatedAction = _.find(vitReportActions, (reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);
                                    vitIOUAction = _.find(vitReportActions, (reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU);
                                    expect(vitCreatedAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    expect(vitIOUAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    expect(vitIOUAction.originalMessage.IOUReportID).toBe(vitIOUReport.reportID);
                                    expect(vitIOUAction.originalMessage.amount).toBe(amount / 4);
                                    expect(vitIOUAction.originalMessage.comment).toBe(comment);
                                    expect(vitIOUAction.originalMessage.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.CREATE);
                                    expect(Date.parse(vitCreatedAction.created)).toBeLessThanOrEqual(Date.parse(vitIOUAction.created));

                                    // Group chat should have two reportActions – a pending CREATED action and a pending IOU action w/ type SPLIT
                                    expect(_.size(groupReportActions)).toBe(2);
                                    groupCreatedAction = _.find(groupReportActions, (reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);
                                    groupIOUAction = _.find(groupReportActions, (reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU);
                                    expect(groupCreatedAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    expect(groupIOUAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    expect(groupIOUAction.originalMessage).not.toHaveProperty('IOUReportID');
                                    expect(groupIOUAction.originalMessage.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.SPLIT);
                                    expect(Date.parse(groupCreatedAction.created)).toBeLessThanOrEqual(Date.parse(groupIOUAction.created));

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise((resolve) => {
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
                                    expect(_.size(allTransactions)).toBe(5);
                                    expect(allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${julesExistingTransaction.transactionID}`]).toBeTruthy();

                                    carlosTransaction = _.find(allTransactions, (transaction) => transaction.transactionID === carlosIOUAction.originalMessage.IOUTransactionID);
                                    julesTransaction = _.find(allTransactions, (transaction) => transaction.transactionID === julesIOUAction.originalMessage.IOUTransactionID);
                                    vitTransaction = _.find(allTransactions, (transaction) => transaction.transactionID === vitIOUAction.originalMessage.IOUTransactionID);
                                    groupTransaction = _.find(allTransactions, (transaction) => transaction.reportID === CONST.REPORT.SPLIT_REPORTID);

                                    expect(carlosTransaction.reportID).toBe(carlosIOUReport.reportID);
                                    expect(julesTransaction.reportID).toBe(julesIOUReport.reportID);
                                    expect(vitTransaction.reportID).toBe(vitIOUReport.reportID);
                                    expect(groupTransaction).toBeTruthy();

                                    expect(carlosTransaction.amount).toBe(amount / 4);
                                    expect(julesTransaction.amount).toBe(amount / 4);
                                    expect(vitTransaction.amount).toBe(amount / 4);
                                    expect(groupTransaction.amount).toBe(amount);

                                    expect(carlosTransaction.comment.comment).toBe(comment);
                                    expect(julesTransaction.comment.comment).toBe(comment);
                                    expect(vitTransaction.comment.comment).toBe(comment);
                                    expect(groupTransaction.comment.comment).toBe(comment);

                                    expect(carlosTransaction.merchant).toBe(CONST.TRANSACTION.DEFAULT_MERCHANT);
                                    expect(julesTransaction.merchant).toBe(CONST.TRANSACTION.DEFAULT_MERCHANT);
                                    expect(vitTransaction.merchant).toBe(CONST.TRANSACTION.DEFAULT_MERCHANT);
                                    expect(groupTransaction.merchant).toBe(
                                        `Split bill with ${RORY_EMAIL}, ${CARLOS_EMAIL}, ${JULES_EMAIL}, and ${VIT_EMAIL} [${DateUtils.getDBTime().slice(0, 10)}]`,
                                    );

                                    expect(carlosTransaction.comment.source).toBe(CONST.IOU.MONEY_REQUEST_TYPE.SPLIT);
                                    expect(julesTransaction.comment.source).toBe(CONST.IOU.MONEY_REQUEST_TYPE.SPLIT);
                                    expect(vitTransaction.comment.source).toBe(CONST.IOU.MONEY_REQUEST_TYPE.SPLIT);

                                    expect(carlosTransaction.comment.originalTransactionID).toBe(groupTransaction.transactionID);
                                    expect(julesTransaction.comment.originalTransactionID).toBe(groupTransaction.transactionID);
                                    expect(vitTransaction.comment.originalTransactionID).toBe(groupTransaction.transactionID);

                                    expect(carlosTransaction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    expect(julesTransaction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    expect(vitTransaction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    expect(groupTransaction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                                waitForCollectionCallback: true,
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
                .then(fetch.resume)
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);
                                    _.each(allReports, (report) => {
                                        if (!report.pendingFields) {
                                            return;
                                        }
                                        _.each(report.pendingFields, (pendingField) => expect(pendingField).toBeFalsy());
                                    });
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                waitForCollectionCallback: true,
                                callback: (allReportActions) => {
                                    Onyx.disconnect(connectionID);
                                    _.each(allReportActions, (reportAction) => expect(reportAction.pendingAction).toBeFalsy());
                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.TRANSACTION,
                                waitForCollectionCallback: true,
                                callback: (allTransactions) => {
                                    Onyx.disconnect(connectionID);
                                    _.each(allTransactions, (transaction) => expect(transaction.pendingAction).toBeFalsy());
                                    resolve();
                                },
                            });
                        }),
                );
        });
    });

    describe('payMoneyRequestElsewhere', () => {
        it('clears outstanding IOUReport', () => {
            const amount = 10000;
            const comment = 'Giv money plz';
            let chatReport;
            let iouReport;
            let createIOUAction;
            let payIOUAction;
            let transaction;
            IOU.requestMoney({}, amount, CONST.CURRENCY.USD, '', '', RORY_EMAIL, RORY_ACCOUNT_ID, {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID}, comment);
            return waitForPromisesToResolve()
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);

                                    expect(_.size(allReports)).toBe(2);

                                    chatReport = _.find(allReports, (report) => report.type === CONST.REPORT.TYPE.CHAT);
                                    expect(chatReport).toBeTruthy();
                                    expect(chatReport).toHaveProperty('reportID');
                                    expect(chatReport).toHaveProperty('iouReportID');
                                    expect(chatReport.hasOutstandingIOU).toBe(true);

                                    iouReport = _.find(allReports, (report) => report.type === CONST.REPORT.TYPE.IOU);
                                    expect(iouReport).toBeTruthy();
                                    expect(iouReport).toHaveProperty('reportID');
                                    expect(iouReport).toHaveProperty('chatReportID');

                                    expect(chatReport.iouReportID).toBe(iouReport.reportID);
                                    expect(iouReport.chatReportID).toBe(chatReport.reportID);

                                    expect(chatReport.pendingFields).toBeFalsy();
                                    expect(iouReport.pendingFields).toBeFalsy();

                                    // expect(iouReport.status).toBe(CONST.REPORT.STATUS.SUBMITTED);
                                    // expect(iouReport.stateNum).toBe(CONST.REPORT.STATE_NUM.SUBMITTED);
                                    // expect(iouReport.state).toBe(CONST.REPORT.STATE.SUBMITTED);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                waitForCollectionCallback: true,
                                callback: (allReportActions) => {
                                    Onyx.disconnect(connectionID);

                                    const reportActionsForIOUReport = allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.iouReportID}`];

                                    createIOUAction = _.find(reportActionsForIOUReport, (ra) => ra.actionName === CONST.REPORT.ACTIONS.TYPE.IOU);
                                    expect(createIOUAction).toBeTruthy();
                                    expect(createIOUAction.originalMessage.IOUReportID).toBe(iouReport.reportID);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.TRANSACTION,
                                waitForCollectionCallback: true,
                                callback: (allTransactions) => {
                                    Onyx.disconnect(connectionID);
                                    expect(_.size(allTransactions)).toBe(1);
                                    transaction = _.find(allTransactions, (t) => t);
                                    expect(transaction).toBeTruthy();
                                    expect(transaction.amount).toBe(amount);
                                    expect(transaction.reportID).toBe(iouReport.reportID);
                                    expect(createIOUAction.originalMessage.IOUTransactionID).toBe(transaction.transactionID);
                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    fetch.pause();
                    IOU.payMoneyRequest(CONST.IOU.PAYMENT_TYPE.ELSEWHERE, chatReport, iouReport);
                    return waitForPromisesToResolve();
                })
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);

                                    expect(_.size(allReports)).toBe(2);

                                    chatReport = _.find(allReports, (r) => r.type === CONST.REPORT.TYPE.CHAT);
                                    iouReport = _.find(allReports, (r) => r.type === CONST.REPORT.TYPE.IOU);

                                    expect(chatReport.hasOutstandingIOU).toBe(false);
                                    expect(chatReport.iouReportID).toBeFalsy();

                                    // expect(iouReport.status).toBe(CONST.REPORT.STATUS.REIMBURSED);
                                    // expect(iouReport.state).toBe(CONST.REPORT.STATE.MANUALREIMBURSED);
                                    // expect(iouReport.stateNum).toBe(CONST.REPORT.STATE_NUM.SUBMITTED);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                waitForCollectionCallback: true,
                                callback: (allReportActions) => {
                                    Onyx.disconnect(connectionID);

                                    const reportActionsForIOUReport = allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`];
                                    expect(_.size(reportActionsForIOUReport)).toBe(3);

                                    payIOUAction = _.find(
                                        reportActionsForIOUReport,
                                        (ra) => ra.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && ra.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.PAY,
                                    );
                                    expect(payIOUAction).toBeTruthy();
                                    expect(payIOUAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(fetch.resume)
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connectionID);

                                    expect(_.size(allReports)).toBe(2);

                                    chatReport = _.find(allReports, (r) => r.type === CONST.REPORT.TYPE.CHAT);
                                    iouReport = _.find(allReports, (r) => r.type === CONST.REPORT.TYPE.IOU);

                                    expect(chatReport.hasOutstandingIOU).toBe(false);
                                    expect(chatReport.iouReportID).toBeFalsy();

                                    // expect(iouReport.status).toBe(CONST.REPORT.STATUS.REIMBURSED);
                                    // expect(iouReport.state).toBe(CONST.REPORT.STATE.MANUALREIMBURSED);
                                    // expect(iouReport.stateNum).toBe(CONST.REPORT.STATE_NUM.SUBMITTED);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(
                    () =>
                        new Promise((resolve) => {
                            const connectionID = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                waitForCollectionCallback: true,
                                callback: (allReportActions) => {
                                    Onyx.disconnect(connectionID);

                                    const reportActionsForIOUReport = allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`];
                                    expect(_.size(reportActionsForIOUReport)).toBe(3);

                                    payIOUAction = _.find(
                                        reportActionsForIOUReport,
                                        (ra) => ra.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && ra.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.PAY,
                                    );
                                    expect(payIOUAction).toBeTruthy();
                                    expect(payIOUAction.pendingAction).toBeFalsy();

                                    resolve();
                                },
                            });
                        }),
                );
        });
    });
});
