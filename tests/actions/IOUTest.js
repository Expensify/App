import _ from 'underscore';
import Onyx from 'react-native-onyx';
import CONST from '../../src/CONST';
import ONYXKEYS from '../../src/ONYXKEYS';
import PusherHelper from '../utils/PusherHelper';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import * as IOU from '../../src/libs/actions/IOU';
import * as TestHelper from '../utils/TestHelper';

const RORY_EMAIL = 'rory@expensifail.com';
const CARLOS_EMAIL = 'cmartins@expensifail.com';

describe('actions/IOU', () => {
    beforeAll(() => {
        PusherHelper.setup();
        Onyx.init({
            keys: ONYXKEYS,
        });
        global.fetch = TestHelper.getOnDemandFetchMock();
        // global.fetch = TestHelper.getGlobalFetchMock();
    });

    beforeEach(() => {
        // jest.resetAllMocks();
        return Onyx.clear().then(waitForPromisesToResolve);
    });

    afterEach(PusherHelper.teardown);

    describe('requestMoney', () => {
        it('creates new chat if needed', () => {
            const amount = 100;
            const comment = 'Giv money plz';
            IOU.requestMoney({}, amount, CONST.CURRENCY.USD, RORY_EMAIL, {login: CARLOS_EMAIL}, comment);
            let chatReportID;
            let iouReportID;
            let createdAction;
            let iouAction;
            let transactionID;
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
                .then(fetch.flush)
                .then(() => new Promise((resolve) => {
                    const connectionID = Onyx.connect({
                        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
                        waitForCollectionCallback: true,
                        callback: reportActionsForChatReport => {
                            Onyx.disconnect(connectionID);
                            expect(_.size(reportActionsForChatReport)).toBe(2);
                            _.each(reportActionsForChatReport, reportAction => expect(reportAction.pendingAction).not.toBeTruthy());
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
                            expect(transaction.pendingAction).not.toBeTruthy();
                            resolve();
                        },
                    });
                }));
        });

        it('updates existing chat report if there is one', () => {

        });

        it('updates existing IOU report if there is one', () => {

        });

        it('correctly implements RedBrickRoad error handling', () => {

        });
    });
});
