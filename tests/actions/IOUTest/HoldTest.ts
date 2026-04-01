/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Onyx from 'react-native-onyx';
import type {OnyxEntry, OnyxInputValue} from 'react-native-onyx';
import {putOnHold, putTransactionsOnHold, unholdRequest} from '@libs/actions/IOU/Hold';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
// eslint-disable-next-line no-restricted-syntax
import type * as PolicyUtils from '@libs/PolicyUtils';
import {getReportActionMessage, getSortedReportActions} from '@libs/ReportActionsUtils';
import {buildOptimisticIOUReport, buildOptimisticIOUReportAction, buildTransactionThread} from '@libs/ReportUtils';
import {buildOptimisticTransaction} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import Navigation from '@src/libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {ReportActions, ReportActionsCollectionDataSet} from '@src/types/onyx/ReportAction';
import type {TransactionCollectionDataSet} from '@src/types/onyx/Transaction';
import createRandomPolicy from '../../utils/collections/policies';
import type {MockFetch} from '../../utils/TestHelper';
import {getGlobalFetchMock} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const topMostReportID = '23423423';
jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    dismissModalWithReport: jest.fn(),
    goBack: jest.fn(),
    getTopmostReportId: jest.fn(() => topMostReportID),
    setNavigationActionToMicrotaskQueue: jest.fn(),
    removeScreenByKey: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getReportRouteByID: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(),
    getActiveRoute: jest.fn(),
    navigationRef: {
        getRootState: jest.fn(),
    },
}));

jest.mock('@react-navigation/native');

jest.mock('@src/libs/actions/Report', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalModule = jest.requireActual('@src/libs/actions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...originalModule,
        notifyNewAction: jest.fn(),
    };
});

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());

jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<typeof PolicyUtils>('@libs/PolicyUtils'),
    isPaidGroupPolicy: jest.fn().mockReturnValue(true),
    isPolicyOwner: jest.fn().mockImplementation((policy?: OnyxEntry<Policy>, currentUserAccountID?: number) => !!currentUserAccountID && policy?.ownerAccountID === currentUserAccountID),
}));

const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;

OnyxUpdateManager();

describe('actions/IOU/Hold', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}},
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

    describe('putOnHold', () => {
        test("should update the transaction thread report's lastVisibleActionCreated to the optimistically added hold comment report action created timestamp", () => {
            const iouReport = buildOptimisticIOUReport(1, 2, 100, '1', 'USD');
            const transaction = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });

            const transactionCollectionDataSet: TransactionCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };
            const iouAction: ReportAction = buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: transaction.amount,
                currency: transaction.currency,
                comment: '',
                participants: [],
                transactionID: transaction.transactionID,
            });
            const transactionThread = buildTransactionThread(iouAction, iouReport);

            const actions: OnyxInputValue<ReportActions> = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouAction.reportActionID}`]: iouAction};
            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${transactionThread.reportID}`]: transactionThread,
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`]: iouReport,
            };
            const actionCollectionDataSet: ReportActionsCollectionDataSet = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`]: actions};
            const comment = 'hold reason';

            return waitForBatchedUpdates()
                .then(() => Onyx.multiSet({...reportCollectionDataSet, ...transactionCollectionDataSet, ...actionCollectionDataSet}))
                .then(() => {
                    // When an expense is put on hold
                    putOnHold(transaction.transactionID, comment, transactionThread.reportID, false);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    return new Promise<void>((resolve) => {
                        const connection = Onyx.connect({
                            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThread.reportID}`,
                            callback: (report) => {
                                Onyx.disconnect(connection);
                                const lastVisibleActionCreated = report?.lastVisibleActionCreated;
                                const connection2 = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread.reportID}`,
                                    callback: (reportActions) => {
                                        Onyx.disconnect(connection2);
                                        resolve();
                                        const lastAction = getSortedReportActions(Object.values(reportActions ?? {}), true).at(0);
                                        const message = getReportActionMessage(lastAction);
                                        // Then the transaction thread report lastVisibleActionCreated should equal the hold comment action created timestamp.
                                        expect(message?.text).toBe(comment);
                                        expect(lastVisibleActionCreated).toBe(lastAction?.created);
                                    },
                                });
                            },
                        });
                    });
                });
        });

        test('should create transaction thread optimistically when initialReportID is undefined', () => {
            const iouReport = buildOptimisticIOUReport(1, 2, 100, '1', 'USD');
            const transaction = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });
            const transactionCollectionDataSet: TransactionCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };
            const iouAction: ReportAction = buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: transaction.amount,
                currency: transaction.currency,
                comment: '',
                participants: [],
                transactionID: transaction.transactionID,
            });
            const actions: OnyxInputValue<ReportActions> = {[iouAction.reportActionID]: iouAction};
            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`]: iouReport,
            };
            const actionCollectionDataSet: ReportActionsCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`]: actions,
            };
            const comment = 'hold reason for new thread';

            return waitForBatchedUpdates()
                .then(() => Onyx.multiSet({...reportCollectionDataSet, ...transactionCollectionDataSet, ...actionCollectionDataSet}))
                .then(() => {
                    // When an expense is put on hold without existing transaction thread (undefined initialReportID)
                    putOnHold(transaction.transactionID, comment, undefined, false);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    return new Promise<void>((resolve) => {
                        const connection = Onyx.connect({
                            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
                            callback: (reportActions) => {
                                Onyx.disconnect(connection);
                                const updatedIOUAction = reportActions?.[iouAction.reportActionID];
                                // Verify that IOU action now has childReportID set optimistically
                                expect(updatedIOUAction?.childReportID).toBeDefined();
                                resolve();
                            },
                        });
                    });
                });
        });
    });

    describe('putTransactionsOnHold', () => {
        test('should call putOnHold for each transaction ID', () => {
            const iouReport = buildOptimisticIOUReport(1, 2, 300, '1', 'USD');
            const transaction1 = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });
            const transaction2 = buildOptimisticTransaction({
                transactionParams: {
                    amount: 200,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });

            const iouAction1: ReportAction = buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: transaction1.amount,
                currency: transaction1.currency,
                comment: '',
                participants: [],
                transactionID: transaction1.transactionID,
            });
            const iouAction2: ReportAction = buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: transaction2.amount,
                currency: transaction2.currency,
                comment: '',
                participants: [],
                transactionID: transaction2.transactionID,
            });
            const transactionThread1 = buildTransactionThread(iouAction1, iouReport);
            const transactionThread2 = buildTransactionThread(iouAction2, iouReport);

            const transactionCollectionDataSet: TransactionCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction1.transactionID}`]: transaction1,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction2.transactionID}`]: transaction2,
            };
            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`]: iouReport,
                [`${ONYXKEYS.COLLECTION.REPORT}${transactionThread1.reportID}`]: transactionThread1,
                [`${ONYXKEYS.COLLECTION.REPORT}${transactionThread2.reportID}`]: transactionThread2,
            };
            const actionCollectionDataSet: ReportActionsCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`]: {
                    [iouAction1.reportActionID]: iouAction1,
                    [iouAction2.reportActionID]: iouAction2,
                },
            };
            const comment = 'bulk hold reason';

            return waitForBatchedUpdates()
                .then(() => Onyx.multiSet({...reportCollectionDataSet, ...transactionCollectionDataSet, ...actionCollectionDataSet}))
                .then(() => {
                    // When multiple transactions are put on hold
                    putTransactionsOnHold([transaction1.transactionID, transaction2.transactionID], comment, iouReport.reportID, false);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    return new Promise<void>((resolve) => {
                        let checkedCount = 0;
                        const checkBothTransactions = () => {
                            checkedCount += 1;
                            if (checkedCount === 2) {
                                resolve();
                            }
                        };

                        const connection1 = Onyx.connect({
                            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction1.transactionID}`,
                            callback: (updatedTransaction1) => {
                                Onyx.disconnect(connection1);
                                // Both transactions should have pending hold action set
                                expect(updatedTransaction1?.comment?.hold).toBeDefined();
                                checkBothTransactions();
                            },
                        });
                        const connection2 = Onyx.connect({
                            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction2.transactionID}`,
                            callback: (updatedTransaction2) => {
                                Onyx.disconnect(connection2);
                                expect(updatedTransaction2?.comment?.hold).toBeDefined();
                                checkBothTransactions();
                            },
                        });
                    });
                })
                .then(() => mockFetch?.resume?.());
        });

        test('should invoke navigation for each transaction when isOffline is true', () => {
            const iouReport = buildOptimisticIOUReport(1, 2, 300, '1', 'USD');
            const transaction1 = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });
            const transaction2 = buildOptimisticTransaction({
                transactionParams: {
                    amount: 200,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });
            const iouAction1: ReportAction = buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: transaction1.amount,
                currency: transaction1.currency,
                comment: '',
                participants: [],
                transactionID: transaction1.transactionID,
            });
            const iouAction2: ReportAction = buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: transaction2.amount,
                currency: transaction2.currency,
                comment: '',
                participants: [],
                transactionID: transaction2.transactionID,
            });
            const transactionThread1 = buildTransactionThread(iouAction1, iouReport);
            const transactionThread2 = buildTransactionThread(iouAction2, iouReport);

            const transactionCollectionDataSet: TransactionCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction1.transactionID}`]: transaction1,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction2.transactionID}`]: transaction2,
            };
            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`]: iouReport,
                [`${ONYXKEYS.COLLECTION.REPORT}${transactionThread1.reportID}`]: transactionThread1,
                [`${ONYXKEYS.COLLECTION.REPORT}${transactionThread2.reportID}`]: transactionThread2,
            };
            const actionCollectionDataSet: ReportActionsCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`]: {
                    [iouAction1.reportActionID]: iouAction1,
                    [iouAction2.reportActionID]: iouAction2,
                },
            };
            const comment = 'offline hold reason';

            return waitForBatchedUpdates()
                .then(() => Onyx.multiSet({...reportCollectionDataSet, ...transactionCollectionDataSet, ...actionCollectionDataSet}))
                .then(() => {
                    jest.mocked(Navigation.setNavigationActionToMicrotaskQueue).mockClear();
                    // When transactions are put on hold while offline (isOffline: true)
                    putTransactionsOnHold([transaction1.transactionID, transaction2.transactionID], comment, iouReport.reportID, true);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    // Navigation should be called once for each transaction (putOnHold called for each)
                    expect(Navigation.setNavigationActionToMicrotaskQueue).toHaveBeenCalledTimes(2);
                    return mockFetch?.resume?.();
                });
        });
    });

    describe('putOnHold with isOffline', () => {
        test('should pass isOffline to getDisplayedReportID affecting which reportID is used for navigation', () => {
            const iouReport = buildOptimisticIOUReport(1, 2, 100, '1', 'USD');
            const transaction = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });
            const iouAction: ReportAction = buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: transaction.amount,
                currency: transaction.currency,
                comment: '',
                participants: [],
                transactionID: transaction.transactionID,
            });
            const transactionThread = buildTransactionThread(iouAction, iouReport);

            const transactionCollectionDataSet: TransactionCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };
            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${transactionThread.reportID}`]: transactionThread,
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`]: iouReport,
            };
            const actionCollectionDataSet: ReportActionsCollectionDataSet = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`]: {[iouAction.reportActionID]: iouAction}};
            const comment = 'hold reason';

            return waitForBatchedUpdates()
                .then(() => Onyx.multiSet({...reportCollectionDataSet, ...transactionCollectionDataSet, ...actionCollectionDataSet}))
                .then(() => {
                    jest.mocked(Navigation.setNavigationActionToMicrotaskQueue).mockClear();
                    putOnHold(transaction.transactionID, comment, transactionThread.reportID, false);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    // Navigation should be called for isOffline: false
                    expect(Navigation.setNavigationActionToMicrotaskQueue).toHaveBeenCalledTimes(1);

                    jest.mocked(Navigation.setNavigationActionToMicrotaskQueue).mockClear();
                    putOnHold(transaction.transactionID, comment, transactionThread.reportID, true);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    // Navigation should also be called for isOffline: true
                    expect(Navigation.setNavigationActionToMicrotaskQueue).toHaveBeenCalledTimes(1);
                });
        });
    });

    describe('unholdRequest', () => {
        test("should update the transaction thread report's lastVisibleActionCreated to the optimistically added unhold report action created timestamp", () => {
            const policyID = '577';
            const policy: Policy = {
                ...createRandomPolicy(Number(policyID)),
            };
            const iouReport: Report = {
                ...buildOptimisticIOUReport(1, 2, 100, '1', 'USD'),
                policyID,
            };
            const transaction = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });

            const transactionCollectionDataSet: TransactionCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };
            const iouAction: ReportAction = buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: transaction.amount,
                currency: transaction.currency,
                comment: '',
                participants: [],
                transactionID: transaction.transactionID,
            });
            const transactionThread = buildTransactionThread(iouAction, iouReport);

            const actions: OnyxInputValue<ReportActions> = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouAction.reportActionID}`]: iouAction};
            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${transactionThread.reportID}`]: transactionThread,
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`]: iouReport,
            };
            const actionCollectionDataSet: ReportActionsCollectionDataSet = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`]: actions};
            const comment = 'hold reason';

            return waitForBatchedUpdates()
                .then(() => Onyx.multiSet({...reportCollectionDataSet, ...transactionCollectionDataSet, ...actionCollectionDataSet}))
                .then(() => {
                    putOnHold(transaction.transactionID, comment, transactionThread.reportID, false);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    // When an expense is unhold
                    unholdRequest(transaction.transactionID, transactionThread.reportID, policy, false);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    return new Promise<void>((resolve) => {
                        const connection = Onyx.connect({
                            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThread.reportID}`,
                            callback: (report) => {
                                Onyx.disconnect(connection);
                                const lastVisibleActionCreated = report?.lastVisibleActionCreated;
                                const connection2 = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread.reportID}`,
                                    callback: (reportActions) => {
                                        Onyx.disconnect(connection2);
                                        resolve();
                                        const lastAction = getSortedReportActions(Object.values(reportActions ?? {}), true).at(0);
                                        // Then the transaction thread report lastVisibleActionCreated should equal the unhold action created timestamp.
                                        expect(lastAction?.actionName).toBe(CONST.REPORT.ACTIONS.TYPE.UNHOLD);
                                        expect(lastVisibleActionCreated).toBe(lastAction?.created);
                                    },
                                });
                            },
                        });
                    });
                });
        });

        test('should rollback unhold request on API failure', () => {
            const policyID = '577';
            const policy: Policy = {
                ...createRandomPolicy(Number(policyID)),
            };
            const iouReport: Report = {
                ...buildOptimisticIOUReport(1, 2, 100, '1', 'USD'),
                policyID,
            };
            const transaction = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });

            const transactionCollectionDataSet: TransactionCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
            };
            const iouAction: ReportAction = buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: transaction.amount,
                currency: transaction.currency,
                comment: '',
                participants: [],
                transactionID: transaction.transactionID,
            });
            const transactionThread = buildTransactionThread(iouAction, iouReport);

            const actions: OnyxInputValue<ReportActions> = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouAction.reportActionID}`]: iouAction};
            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${transactionThread.reportID}`]: transactionThread,
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`]: iouReport,
            };
            const actionCollectionDataSet: ReportActionsCollectionDataSet = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`]: actions};
            const comment = 'hold reason';

            return waitForBatchedUpdates()
                .then(() => Onyx.multiSet({...reportCollectionDataSet, ...transactionCollectionDataSet, ...actionCollectionDataSet}))
                .then(() => {
                    putOnHold(transaction.transactionID, comment, transactionThread.reportID, false);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    mockFetch.fail();
                    mockFetch?.resume?.();
                    unholdRequest(transaction.transactionID, transactionThread.reportID, policy, false);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    return new Promise<void>((resolve) => {
                        const connection = Onyx.connect({
                            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
                            callback: (updatedTransaction) => {
                                Onyx.disconnect(connection);
                                expect(updatedTransaction?.pendingAction).toBeFalsy();
                                expect(updatedTransaction?.comment?.hold).toBeTruthy();
                                expect(Object.values(updatedTransaction?.errors ?? {})).toEqual(
                                    Object.values(getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericUnholdExpenseFailureMessage') ?? {}),
                                );

                                resolve();
                            },
                        });
                    });
                });
        });
    });
});
