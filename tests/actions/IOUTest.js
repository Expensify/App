import _ from 'underscore';
import Onyx from 'react-native-onyx';
import CONST from '../../src/CONST';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import * as IOU from '../../src/libs/actions/IOU';
import * as TestHelper from '../utils/TestHelper';
import DateUtils from '../../src/libs/DateUtils';
import * as NumberUtils from '../../src/libs/NumberUtils';
import * as Localize from '../../src/libs/Localize';

const CARLOS_EMAIL = 'cmartins@expensifail.com';
const JULES_EMAIL = 'jules@expensifail.com';
const RORY_EMAIL = 'rory@expensifail.com';
const VIT_EMAIL = 'vit@expensifail.com';

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

                            _.each(allTransactions, transaction => expect(transaction.pendingAction).toBeFalsy());
                            resolve();
                        },
                    });
                }));
        });

        it('correctly implements RedBrickRoad error handling', () => {
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
                .then(() => {
                    fetch.fail();
                    return fetch.resume();
                })
                .then(() => new Promise((resolve) => {
                    const connectionID = Onyx.connect({
                        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
                        waitForCollectionCallback: true,
                        callback: reportActionsForChatReport => {
                            Onyx.disconnect(connectionID);
                            expect(_.size(reportActionsForChatReport)).toBe(2);
                            iouAction = _.find(reportActionsForChatReport, reportAction => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU);
                            expect(iouAction.pendingAction).toBeFalsy();
                            const errorMessage = _.values(iouAction.errors)[0];
                            expect(errorMessage).toBe(Localize.translateLocal('iou.error.genericCreateFailureMessage'));
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
                            expect(transaction.errors).toBeTruthy();
                            expect(_.values(transaction.errors)[0]).toBe(Localize.translateLocal('iou.error.genericCreateFailureMessage'));

                            // Cleanup
                            fetch.succeed();

                            resolve();
                        },
                    });
                }));
        });
    });

    describe('split bill', () => {
        it('creates and updates new chats and IOUs as needed', () => {
            /*
             * Given that:
             *   - Rory and Carlos have chatted before
             *   - Rory and Jules have chatted before and have an active IOU report
             *   - Rory and Vit have never chatted together before
             *   - There is no existing group chat with the four of them
             */
            const amount = 400;
            const amountInCents = amount * 100;
            const comment = 'Yes, I am splitting a bill for $4 USD';
            let carlosChatReport = {
                reportID: NumberUtils.rand64(),
                type: CONST.REPORT.TYPE.CHAT,
                hasOutstandingIOU: false,
                participants: [CARLOS_EMAIL],
            };
            let carlosCreatedAction = {
                reportActionID: NumberUtils.rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: DateUtils.getDBTime(),
            };
            let julesIOUReportID = NumberUtils.rand64();
            let julesChatReport = {
                reportID: NumberUtils.rand64(),
                type: CONST.REPORT.TYPE.CHAT,
                hasOutstandingIOU: true,
                iouReportID: julesIOUReportID,
                participants: [JULES_EMAIL],
            };
            let julesCreatedAction = {
                reportActionID: NumberUtils.rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: DateUtils.getDBTime(),
            };
            jest.advanceTimersByTime(200);
            let julesExistingTransaction = {
                transactionID: NumberUtils.rand64(),
                amount: 1000,
                comment: 'This is an existing transaction',
                created: DateUtils.getDBTime(),
            };
            let julesIOUReport = {
                reportID: julesIOUReportID,
                chatReportID: julesChatReport.reportID,
                type: CONST.REPORT.TYPE.IOU,
                ownerEmail: RORY_EMAIL,
                managerEmail: JULES_EMAIL,
                currency: CONST.CURRENCY.USD,
                total: julesExistingTransaction.amount,
            };
            let julesExistingIOUAction = {
                reportActionID: NumberUtils.rand64(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorEmail: RORY_EMAIL,
                created: DateUtils.getDBTime(),
                originalMessage: {
                    IOUReportID: julesIOUReportID,
                    IOUTransactionID: julesExistingTransaction.transactionID,
                    amount: julesExistingTransaction.amount,
                    currency: CONST.CURRENCY.USD,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    participants: [RORY_EMAIL, JULES_EMAIL],
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

            return Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, {
                [`${ONYXKEYS.COLLECTION.REPORT}${carlosChatReport.reportID}`]: carlosChatReport,
                [`${ONYXKEYS.COLLECTION.REPORT}${julesChatReport.reportID}`]: julesChatReport,
                [`${ONYXKEYS.COLLECTION.REPORT}${julesIOUReport.reportID}`]: julesIOUReport,
            })
                .then(() => Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${carlosChatReport.reportID}`]: {
                        [carlosCreatedAction.reportActionID]: carlosCreatedAction,
                    },
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${julesChatReport.reportID}`]: {
                        [julesCreatedAction.reportActionID]: julesCreatedAction,
                        [julesExistingIOUAction.reportActionID]: julesExistingIOUAction,
                    },
                }))
                .then(() => Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${julesExistingTransaction.transactionID}`, julesExistingTransaction))
                .then(() => {
                    // When we split a bill offline
                    fetch.pause();
                    IOU.splitBill(
                        _.map([CARLOS_EMAIL, JULES_EMAIL, VIT_EMAIL], email => ({login: email})),
                        RORY_EMAIL,
                        amount,
                        comment,
                        CONST.CURRENCY.USD,
                        CONST.LOCALES.DEFAULT,
                    );
                    return waitForPromisesToResolve();
                })
                .then(() => new Promise((resolve) => {
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT,
                        waitForCollectionCallback: true,
                        callback: (allReports) => {
                            Onyx.disconnect(connectionID);

                            // There should now be 7 reports
                            expect(_.size(allReports)).toBe(7);

                            // 1. The chat report with Rory + Carlos
                            carlosChatReport = _.find(allReports, report => report.reportID === carlosChatReport.reportID);
                            expect(_.isEmpty(carlosChatReport)).toBe(false);
                            expect(carlosChatReport.pendingFields).toBeFalsy();

                            // 2. The IOU report with Rory + Carlos (new)
                            carlosIOUReport = _.find(allReports, report => report.type === CONST.REPORT.TYPE.IOU && report.managerEmail === CARLOS_EMAIL);
                            expect(_.isEmpty(carlosIOUReport)).toBe(false);
                            expect(carlosIOUReport.total).toBe(amountInCents / 4);

                            // 3. The chat report with Rory + Jules
                            julesChatReport = _.find(allReports, report => report.reportID === julesChatReport.reportID);
                            expect(_.isEmpty(julesChatReport)).toBe(false);
                            expect(julesChatReport.pendingFields).toBeFalsy();

                            // 4. The IOU report with Rory + Jules
                            julesIOUReport = _.find(allReports, report => report.reportID === julesIOUReport.reportID);
                            expect(_.isEmpty(julesIOUReport)).toBe(false);
                            expect(julesChatReport.pendingFields).toBeFalsy();
                            expect(julesIOUReport.total).toBe(julesExistingTransaction.amount + (amountInCents / 4));

                            // 5. The chat report with Rory + Vit (new)
                            vitChatReport = _.find(allReports, report => report.type === CONST.REPORT.TYPE.CHAT && _.isEqual(report.participants, [VIT_EMAIL]));
                            expect(_.isEmpty(vitChatReport)).toBe(false);
                            expect(vitChatReport.pendingFields).toStrictEqual({createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});

                            // 6. The IOU report with Rory + Vit (new)
                            vitIOUReport = _.find(allReports, report => report.type === CONST.REPORT.TYPE.IOU && report.managerEmail === VIT_EMAIL);
                            expect(_.isEmpty(vitIOUReport)).toBe(false);
                            expect(vitIOUReport.total).toBe(amountInCents / 4);

                            // 7. The group chat with everyone
                            groupChat = _.find(allReports, report => report.type === CONST.REPORT.TYPE.CHAT && _.isEqual(report.participants, [CARLOS_EMAIL, JULES_EMAIL, VIT_EMAIL]));
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
                            expect(vitIOUReport.chatReportID).toBe(vitChatReport.reportID)

                            resolve();
                        },
                    });
                }))
                .then(() => new Promise((resolve) => {
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);

                            // There should be reportActions on all 4 chat reports
                            expect(_.size(allReportActions)).toBe(4);

                            const carlosReportActions = allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${carlosChatReport.reportID}`];
                            const julesReportActions = allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${julesChatReport.reportID}`];
                            const vitReportActions = allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${vitChatReport.reportID}`];
                            const groupReportActions = allReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${groupChat.reportID}`];

                            // Carlos DM should have two reportActions – the existing CREATED action and an pending IOU action
                            expect(_.size(carlosReportActions)).toBe(2);
                            expect(carlosReportActions[carlosCreatedAction.reportActionID]).toStrictEqual(carlosCreatedAction);
                            carlosIOUAction = _.find(carlosReportActions, reportAction => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU);
                            expect(carlosIOUAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                            expect(carlosIOUAction.originalMessage.amount).toBe(amountInCents / 4);
                            expect(carlosIOUAction.originalMessage.comment).toBe(comment);
                            expect(Date.parse(carlosCreatedAction.created)).toBeLessThanOrEqual(Date.parse(carlosIOUAction.created));

                            // Jules DM should have three reportActions, the existing CREATED action, the existing IOU action, and a new pending IOU action
                            expect(_.size(julesReportActions)).toBe(3);
                            expect(julesReportActions[julesCreatedAction.reportActionID]).toStrictEqual(julesCreatedAction);
                            julesIOUAction = _.find(julesReportActions, reportAction => (
                                reportAction.reportActionID !== julesCreatedAction.reportActionID
                                && reportAction.reportActionID !== julesExistingIOUAction.reportActionID
                            ));
                            expect(julesIOUAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                            expect(julesIOUAction.originalMessage.amount).toBe(amountInCents / 4);
                            expect(julesIOUAction.originalMessage.comment).toBe(comment);
                            expect(Date.parse(julesCreatedAction.created)).toBeLessThanOrEqual(Date.parse(julesIOUAction.created));

                            // Vit DM should have two reportActions – a pending CREATED action and a pending IOU action
                            expect(_.size(vitReportActions)).toBe(2);
                            vitCreatedAction = _.find(vitReportActions, reportAction => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);
                            vitIOUAction = _.find(vitReportActions, reportAction => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU);
                            expect(vitCreatedAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                            expect(vitIOUAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                            expect(vitIOUAction.originalMessage.amount).toBe(amountInCents / 4);
                            expect(vitIOUAction.originalMessage.comment).toBe(comment);
                            expect(Date.parse(vitCreatedAction.created)).toBeLessThanOrEqual(Date.parse(vitIOUAction.created))

                            // Group chat should have two reportActions – a pending CREATED action and a pending IOU action w/ type SPLIT
                            expect(_.size(groupReportActions)).toBe(2);
                            groupCreatedAction = _.find(groupReportActions, reportAction => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);
                            groupIOUAction = _.find(groupReportActions, reportAction => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU);
                            expect(groupCreatedAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                            expect(groupIOUAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                            expect(groupIOUAction.originalMessage.type).toBe(CONST.IOU.REPORT_ACTION_TYPE.SPLIT);
                            expect(Date.parse(groupCreatedAction.created)).toBeLessThanOrEqual(Date.parse(groupIOUAction.created));

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

                            // There should be 4 transactions – one existing one with Jules and one for each of the three IOU reports
                            // TODO: I think this is wrong and there should only be 4 transactions
                            expect(_.size(allTransactions)).toBe(5);
                            expect(allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${julesExistingTransaction.transactionID}`]).toBeTruthy();

                            carlosTransaction = _.find(allTransactions, transaction => transaction.transactionID === carlosIOUAction.originalMessage.IOUTransactionID);
                            julesTransaction = _.find(allTransactions, transaction => transaction.transactionID === julesIOUAction.originalMessage.IOUTransactionID);
                            vitTransaction = _.find(allTransactions, transaction => transaction.transactionID === vitIOUAction.originalMessage.IOUTransactionID);

                            expect(carlosTransaction.amount).toBe(amountInCents / 4);
                            expect(julesTransaction.amount).toBe(amountInCents / 4);
                            expect(vitTransaction.amount).toBe(amountInCents / 4);

                            expect(carlosTransaction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                            expect(julesTransaction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                            expect(vitTransaction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

                            resolve();
                        },
                    })
                }))
                .then(fetch.resume)
                .then(() => new Promise((resolve) => {
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT,
                        waitForCollectionCallback: true,
                        callback: (allReports) => {
                            Onyx.disconnect(connectionID);
                            _.each(allReports, report => {
                                if (report.pendingFields) {
                                    _.each(report.pendingFields, pendingField => expect(pendingField).toBeFalsy());
                                }
                            });
                            resolve();
                        },
                    });
                }))
                .then(() => new Promise((resolve) => {
                    const connectionID = Onyx.connect({
                        key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                        waitForCollectionCallback: true,
                        callback: (allReportActions) => {
                            Onyx.disconnect(connectionID);
                            _.each(allReportActions, reportAction => expect(reportAction.pendingAction).toBeFalsy());
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
                            _.each(allTransactions, transaction => expect(transaction.pendingAction).toBeFalsy());
                            resolve();
                        },
                    });
                }));
        });
    });
});
