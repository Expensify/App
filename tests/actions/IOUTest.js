import _ from 'underscore';
import Onyx from 'react-native-onyx';
import CONST from '../../src/CONST';
import ONYXKEYS from '../../src/ONYXKEYS';
import PusherHelper from '../utils/PusherHelper';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import * as IOU from '../../src/libs/actions/IOU';
import * as TestHelper from '../utils/TestHelper';
import DateUtils from '../../src/libs/DateUtils';
import * as NumberUtils from '../../src/libs/NumberUtils';

const RORY_EMAIL = 'rory@expensifail.com';
const CARLOS_EMAIL = 'cmartins@expensifail.com';

describe('actions/IOU', () => {
    beforeAll(() => {
        PusherHelper.setup();
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        return Onyx.clear().then(waitForPromisesToResolve);
    });

    afterEach(PusherHelper.teardown);

    describe('requestMoney', () => {
        it('creates new chat if needed', () => {
            const amount = 100;
            const comment = 'Giv money plz';
            let chatReportID;
            let iouReportID;
            let createdAction;
            let iouAction;
            let transactionID;
            fetch.pause();
            IOU.requestMoney({}, amount, CONST.CURRENCY.USD, RORY_EMAIL, {login: CARLOS_EMAIL}, comment);
            return waitForPromisesToResolve()
                .then(() => new Promise((resolve) => {
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT,
                        waitForCollectionCallback: true,
                        callback: (allReports) => {
                            Onyx.disconnect(connectionID);

                            // A chat report and an iou report should be created
                            const chatReports = _.filter(allReports, report => report.type === CONST.REPORT.TYPE.CHAT);
                            const iouReports = _.filter(allReports, report => report.type === CONST.REPORT.TYPE.IOU);
                            expect(_.size(chatReports)).toBe(1);
                            expect(_.size(iouReports)).toBe(1);
                            const chatReport = chatReports[0];
                            chatReportID = chatReport.reportID;
                            const iouReport = iouReports[0];
                            iouReportID = iouReport.reportID;

                            // They should be linked together
                            expect(chatReport.participants).toEqual([CARLOS_EMAIL]);
                            expect(chatReport.iouReportID).toBe(iouReport.reportID);
                            expect(chatReport.hasOutstandingIOU).toBe(true);

                            resolve();
                        },
                    });
                }))
                .then(() => new Promise((resolve) => {
                    const connectionID = Onyx.connect({
                        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
                        waitForCollectionCallback: true,
                        callback: (reportActionsForChatReport) => {
                            Onyx.disconnect(connectionID);

                            // The chat report should have a CREATED action and IOU action
                            expect(_.size(reportActionsForChatReport)).toBe(2);
                            const createdActions = _.filter(reportActionsForChatReport, reportAction => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);
                            const iouActions = _.filter(reportActionsForChatReport, reportAction => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU);
                            expect(_.size(createdActions)).toBe(1);
                            expect(_.size(iouActions)).toBe(1);
                            createdAction = createdActions[0];
                            iouAction = iouActions[0];

                            // The CREATED action should not be created after the IOU action
                            expect(Date.parse(createdAction.created)).toBeLessThanOrEqual(Date.parse(iouAction.created));

                            // The comment should be included in the IOU action
                            expect(iouAction.originalMessage.comment).toBe(comment);

                            // The amount in the IOU action should be correct
                            expect(iouAction.originalMessage.amount).toBe(amount);

                            // Both actions should be pending
                            expect(createdAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                            expect(iouAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                            resolve();
                        },
                    });
                }))
                .then(() => new Promise((resolve) => {
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.TRANSACTION,
                        waitForCollectionCallback: true,
                        callback: (allTransactions) => {
                            Onyx.disconnect(connectionID);

                            // There should be one transaction
                            expect(_.size(allTransactions)).toBe(1);
                            const transaction = _.find(allTransactions, transaction => !_.isEmpty(transaction));
                            transactionID = transaction.transactionID;

                            // Its amount should match the amount of the request
                            expect(transaction.amount).toBe(amount);

                            // It should be pending
                            expect(transaction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                            // The transactionID on the iou action should match the one from the transactions collection
                            expect(iouAction.originalMessage.IOUTransactionID).toBe(transactionID);

                            resolve();
                        },
                    });
                }))
                .then(fetch.resume)
                .then(() => new Promise((resolve) => {
                    const connectionID = Onyx.connect({
                        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
                        waitForCollectionCallback: true,
                        callback: reportActionsForChatReport => {
                            Onyx.disconnect(connectionID);
                            expect(_.size(reportActionsForChatReport)).toBe(2);
                            _.each(reportActionsForChatReport, reportAction => expect(reportAction.pendingAction).toBeFalsy());
                            resolve();
                        },
                    });
                }))
                .then(() => new Promise((resolve) => {
                    const connectionID = Onyx.connect({
                        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                        waitForCollectionCallback: true,
                        callback: transaction => {
                            Onyx.disconnect(connectionID);
                            expect(transaction.pendingAction).toBeFalsy();
                            resolve();
                        },
                    });
                }));
        });

        it('updates existing chat report if there is one', () => {
            const amount = 100;
            const comment = 'Giv money plz';
            let chatReport = {
                reportID: 1234,
                type: CONST.REPORT.TYPE.CHAT,
                hasOutstandingIOU: false,
                participants: [CARLOS_EMAIL],
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
                .then(() => Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`, {
                    [createdAction.reportActionID]: createdAction,
                }))
                .then(() => {
                    IOU.requestMoney(chatReport, amount, CONST.CURRENCY.USD, RORY_EMAIL, {login: CARLOS_EMAIL}, comment);
                    return waitForPromisesToResolve();
                })
                .then(() => new Promise((resolve) => {
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT,
                        waitForCollectionCallback: true,
                        callback: (allReports) => {
                            Onyx.disconnect(connectionID);

                            // TODO: clean this up after https://github.com/Expensify/App/pull/16531 is merged
                            allReports = _.filter(allReports, report => report !== null);

                            // The same chat report should be reused, and an IOU report should be created
                            expect(_.size(allReports)).toBe(2);
                            expect(_.find(allReports, report => report.type === CONST.REPORT.TYPE.CHAT).reportID).toBe(chatReport.reportID);
                            chatReport = _.find(allReports, report => report.type === CONST.REPORT.TYPE.CHAT);
                            const iouReport = _.find(allReports, report => report.type === CONST.REPORT.TYPE.IOU);
                            iouReportID = iouReport.reportID;

                            // They should be linked together
                            expect(chatReport.iouReportID).toBe(iouReportID);
                            expect(chatReport.hasOutstandingIOU).toBe(true);

                            resolve();
                        },
                    });
                }))
                .then(() => new Promise((resolve) => {
                    const connectionID = Onyx.connect({
                        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);

                            // The chat report should have a CREATED and an IOU action
                            expect(_.size(allReportActions)).toBe(2);
                            iouAction = _.find(allReportActions, reportAction => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU);

                            // The CREATED action should not be created after the IOU action
                            expect(Date.parse(createdAction.created)).toBeLessThanOrEqual(Date.parse(iouAction.created));

                            // The comment should be included in the IOU action
                            expect(iouAction.originalMessage.comment).toBe(comment);

                            // The amount in the IOU action should be correct
                            expect(iouAction.originalMessage.amount).toBe(amount);

                            // The IOU action should be pending
                            expect(iouAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                            resolve();
                        },
                    });
                }))
                .then(() => new Promise((resolve) => {
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.TRANSACTION,
                        waitForCollectionCallback: true,
                        callback: (allTransactions) => {
                            Onyx.disconnect(connectionID);

                            // TODO: clean this up after https://github.com/Expensify/App/pull/16531 is merged
                            allTransactions = _.filter(allTransactions, transaction => transaction !== null);

                            // There should be one transaction
                            expect(_.size(allTransactions)).toBe(1);
                            const transaction = _.find(allTransactions, transaction => !_.isEmpty(transaction));
                            transactionID = transaction.transactionID;

                            // Its amount should match the amount of the request
                            expect(transaction.amount).toBe(amount);

                            // It should be pending
                            expect(transaction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                            // The transactionID on the iou action should match the one from the transactions collection
                            expect(iouAction.originalMessage.IOUTransactionID).toBe(transactionID);

                            resolve();
                        }
                    })
                }))
                .then(fetch.resume)
                .then(() => new Promise((resolve) => {
                    const connectionID = Onyx.connect({
                        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
                        waitForCollectionCallback: true,
                        callback: reportActionsForChatReport => {
                            Onyx.disconnect(connectionID);
                            expect(_.size(reportActionsForChatReport)).toBe(2);
                            _.each(reportActionsForChatReport, reportAction => expect(reportAction.pendingAction).toBeFalsy());
                            resolve();
                        },
                    });
                }))
                .then(() => new Promise((resolve) => {
                    const connectionID = Onyx.connect({
                        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                        waitForCollectionCallback: true,
                        callback: transaction => {
                            Onyx.disconnect(connectionID);
                            expect(transaction.pendingAction).toBeFalsy();
                            resolve();
                        },
                    });
                }));
        });

        it('updates existing IOU report if there is one', () => {
            const amount = 100;
            const comment = 'Giv money plz';
            const chatReportID = 1234;
            const iouReportID = 5678;
            let chatReport = {
                reportID: chatReportID,
                type: CONST.REPORT.TYPE.CHAT,
                hasOutstandingIOU: true,
                iouReportID,
                participants: [CARLOS_EMAIL],
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
                ownerEmail: RORY_EMAIL,
                managerEmail: CARLOS_EMAIL,
                currency: CONST.CURRENCY.USD,
                total: existingTransaction.amount,
            };
            const iouAction = {
                reportActionID: NumberUtils.rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorEmail: RORY_EMAIL,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: iouReportID,
                    IOUTransactionID: existingTransaction.transactionID,
                    amount: existingTransaction.amount,
                    currency: CONST.CURRENCY.USD,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    participants: [RORY_EMAIL, CARLOS_EMAIL],
                },
            };
            let newIOUAction;
            let newTransaction;
            fetch.pause();
            return Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, chatReport)
                .then(() => Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, iouReport))
                .then(() => Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`, {
                    [createdAction.reportActionID]: createdAction,
                    [iouAction.reportActionID]: iouAction,
                }))
                .then(() => Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${existingTransaction.transactionID}`, existingTransaction))
                .then(() => {
                    IOU.requestMoney(chatReport, amount, CONST.CURRENCY.USD, RORY_EMAIL, {login: CARLOS_EMAIL}, comment);
                    return waitForPromisesToResolve();
                })
                .then(() => new Promise((resolve) => {
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT,
                        waitForCollectionCallback: true,
                        callback: (allReports) => {
                            Onyx.disconnect(connectionID);

                            // TODO: clean this up after https://github.com/Expensify/App/pull/16531 is merged
                            allReports = _.filter(allReports, report => report !== null);

                            // No new reports should be created
                            expect(_.size(allReports)).toBe(2);
                            expect(_.find(allReports, report => report.reportID === chatReportID)).toBeTruthy();
                            expect(_.find(allReports, report => report.reportID === iouReportID)).toBeTruthy();

                            chatReport = _.find(allReports, report => report.type === CONST.REPORT.TYPE.CHAT);
                            iouReport = _.find(allReports, report => report.type === CONST.REPORT.TYPE.IOU);

                            // The total on the iou report should be updated
                            expect(iouReport.total).toBe(1100);

                            resolve();
                        },
                    });
                }))
                .then(() => new Promise((resolve) => {
                    const connectionID = Onyx.connect({
                        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
                        waitForCollectionCallback: true,
                        callback: (reportActionsForChatReport) => {
                            Onyx.disconnect(connectionID);

                            expect(_.size(reportActionsForChatReport)).toBe(3);
                            newIOUAction = _.find(reportActionsForChatReport, reportAction => reportAction.reportActionID !== createdAction.reportActionID && reportAction.reportActionID !== iouAction.reportActionID);

                            // The comment should be included in the IOU action
                            expect(newIOUAction.originalMessage.comment).toBe(comment);

                            // The amount in the IOU action should be correct
                            expect(newIOUAction.originalMessage.amount).toBe(amount);

                            // The IOU action should be pending
                            expect(newIOUAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                            resolve();
                        },
                    });
                }))
                .then(() => new Promise((resolve) => {
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.TRANSACTION,
                        waitForCollectionCallback: true,
                        callback: (allTransactions) => {
                            Onyx.disconnect(connectionID);

                            // TODO: clean this up after https://github.com/Expensify/App/pull/16531 is merged
                            allTransactions = _.filter(allTransactions, transaction => transaction !== null);

                            // There should be two transactions
                            expect(_.size(allTransactions)).toBe(2);

                            // The amount on the new transaction should be correct
                            newTransaction = _.find(allTransactions, transaction => transaction.transactionID !== existingTransaction.transactionID);
                            expect(newTransaction.amount).toBe(amount);

                            // The new transaction should be pending
                            expect(newTransaction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                            // The transactionID on the iou action should match the one from the transactions collection
                            expect(newIOUAction.originalMessage.IOUTransactionID).toBe(newTransaction.transactionID);

                            resolve();
                        },
                    });
                }))
                .then(fetch.resume)
                .then(() => new Promise((resolve) => {
                    const connectionID = Onyx.connect({
                        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
                        waitForCollectionCallback: true,
                        callback: reportActionsForChatReport => {
                            Onyx.disconnect(connectionID);
                            expect(_.size(reportActionsForChatReport)).toBe(3);
                            _.each(reportActionsForChatReport, reportAction => expect(reportAction.pendingAction).toBeFalsy());
                            resolve();
                        },
                    });
                }))
                .then(() => new Promise((resolve) => {
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.TRANSACTION,
                        waitForCollectionCallback: true,
                        callback: (allTransactions) => {
                            Onyx.disconnect(connectionID);

                            // TODO: clean this up after https://github.com/Expensify/App/pull/16531 is merged
                            allTransactions = _.filter(allTransactions, transaction => transaction !== null);

                            _.each(allTransactions, transaction => expect(transaction.pendingAction).toBeFalsy());
                            resolve();
                        },
                    });
                }));
        });

        it('correctly implements RedBrickRoad error handling', () => {

        });
    });
});
