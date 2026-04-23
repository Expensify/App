/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Onyx from 'react-native-onyx';
import type {OnyxEntry, OnyxInputValue} from 'react-native-onyx';
import {putOnHold} from '@libs/actions/IOU/Hold';
import {cancelPayment, completePaymentOnboarding, payMoneyRequest} from '@libs/actions/IOU/PayMoneyRequest';
import {requestMoney} from '@libs/actions/IOU/TrackExpense';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {createWorkspace, generatePolicyID} from '@libs/actions/Policy/Policy';
import {notifyNewAction} from '@libs/actions/Report';
// eslint-disable-next-line no-restricted-syntax
import type * as PolicyUtils from '@libs/PolicyUtils';
import {getOriginalMessage, getReportActionHtml, getReportActionText, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {buildOptimisticIOUReport, buildOptimisticIOUReportAction} from '@libs/ReportUtils';
import {buildOptimisticTransaction} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import DateUtils from '@src/libs/DateUtils';
import Navigation from '@src/libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {IntroSelected, Policy, Report} from '@src/types/onyx';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {ReportActions, ReportActionsCollectionDataSet} from '@src/types/onyx/ReportAction';
import type Transaction from '@src/types/onyx/Transaction';
import type {TransactionCollectionDataSet} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import createRandomPolicy from '../../utils/collections/policies';
import {createRandomReport} from '../../utils/collections/reports';
import getOnyxValue from '../../utils/getOnyxValue';
import type {MockFetch} from '../../utils/TestHelper';
import {getGlobalFetchMock, getOnyxData, translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

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
    navigationRef: {
        getRootState: jest.fn(),
        isReady: jest.fn(() => true),
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
jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => jest.fn());
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

jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<typeof PolicyUtils>('@libs/PolicyUtils'),
    isPaidGroupPolicy: jest.fn().mockReturnValue(true),
    isPolicyOwner: jest.fn().mockImplementation((policy?: OnyxEntry<Policy>, currentUserAccountID?: number) => !!currentUserAccountID && policy?.ownerAccountID === currentUserAccountID),
}));

const CARLOS_EMAIL = 'cmartins@expensifail.com';
const CARLOS_ACCOUNT_ID = 1;
const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;

OnyxUpdateManager();
describe('actions/IOU/PayMoneyRequest', () => {
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

    describe('payMoneyRequestElsewhere', () => {
        it('clears outstanding IOUReport', () => {
            const amount = 10000;
            const comment = 'Giv money plz';
            const currentUserAccountID = 123;
            let chatReport: OnyxEntry<Report>;
            let iouReport: OnyxEntry<Report>;
            let createIOUAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>;
            let payIOUAction: OnyxEntry<ReportAction>;
            let transaction: OnyxEntry<Transaction>;
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
                currentUserAccountIDParam: currentUserAccountID,
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
            return waitForBatchedUpdates()
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);

                                    expect(Object.values(allReports ?? {}).length).toBe(3);

                                    const chatReports = Object.values(allReports ?? {}).filter((report) => report?.type === CONST.REPORT.TYPE.CHAT);
                                    chatReport = chatReports.at(0);
                                    expect(chatReport).toBeTruthy();
                                    expect(chatReport).toHaveProperty('reportID');
                                    expect(chatReport).toHaveProperty('iouReportID');

                                    iouReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);
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
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                waitForCollectionCallback: true,
                                callback: (allReportActions) => {
                                    Onyx.disconnect(connection);

                                    const reportActionsForIOUReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.iouReportID}`];

                                    createIOUAction = Object.values(reportActionsForIOUReport ?? {}).find(
                                        (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => isMoneyRequestAction(reportAction),
                                    );
                                    expect(createIOUAction).toBeTruthy();
                                    expect(createIOUAction && getOriginalMessage(createIOUAction)?.IOUReportID).toBe(iouReport?.reportID);

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
                                    expect(Object.values(allTransactions ?? {}).length).toBe(1);
                                    transaction = Object.values(allTransactions ?? {}).find((t) => t);
                                    expect(transaction).toBeTruthy();
                                    expect(transaction?.amount).toBe(amount);
                                    expect(transaction?.reportID).toBe(iouReport?.reportID);
                                    expect(createIOUAction && getOriginalMessage(createIOUAction)?.IOUTransactionID).toBe(transaction?.transactionID);
                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    mockFetch?.pause?.();
                    if (chatReport && iouReport) {
                        payMoneyRequest({
                            paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                            chatReport,
                            iouReport,
                            introSelected: undefined,
                            iouReportCurrentNextStepDeprecated: undefined,
                            currentUserAccountID,
                            betas: [CONST.BETAS.ALL],
                            isSelfTourViewed: false,
                            userBillingGracePeriodEnds: undefined,
                            amountOwed: 0,
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

                                    expect(Object.values(allReports ?? {}).length).toBe(3);

                                    chatReport = Object.values(allReports ?? {}).find((r) => r?.type === CONST.REPORT.TYPE.CHAT);
                                    iouReport = Object.values(allReports ?? {}).find((r) => r?.type === CONST.REPORT.TYPE.IOU);

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
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                waitForCollectionCallback: true,
                                callback: (allReportActions) => {
                                    Onyx.disconnect(connection);

                                    const reportActionsForIOUReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`];
                                    expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(3);

                                    payIOUAction = Object.values(reportActionsForIOUReport ?? {}).find(
                                        (reportAction) => isMoneyRequestAction(reportAction) && getOriginalMessage(reportAction)?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY,
                                    );
                                    expect(payIOUAction).toBeTruthy();
                                    expect(payIOUAction?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

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
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);

                                    expect(Object.values(allReports ?? {}).length).toBe(3);

                                    chatReport = Object.values(allReports ?? {}).find((r) => r?.type === CONST.REPORT.TYPE.CHAT);
                                    iouReport = Object.values(allReports ?? {}).find((r) => r?.type === CONST.REPORT.TYPE.IOU);

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
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                                waitForCollectionCallback: true,
                                callback: (allReportActions) => {
                                    Onyx.disconnect(connection);

                                    const reportActionsForIOUReport = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`];
                                    expect(Object.values(reportActionsForIOUReport ?? {}).length).toBe(3);

                                    payIOUAction = Object.values(reportActionsForIOUReport ?? {}).find(
                                        (reportAction) => isMoneyRequestAction(reportAction) && getOriginalMessage(reportAction)?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY,
                                    );
                                    resolve();

                                    expect(payIOUAction).toBeTruthy();
                                    expect(payIOUAction?.pendingAction).toBeFalsy();
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
            mockFetch?.resume?.();
        });

        it('updates the expense request and expense report when paid while offline', () => {
            let expenseReport: OnyxEntry<Report>;
            let chatReport: OnyxEntry<Report>;

            mockFetch?.pause?.();
            Onyx.set(ONYXKEYS.SESSION, {email: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID});
            return waitForBatchedUpdates()
                .then(() => {
                    createWorkspace({
                        policyOwnerEmail: CARLOS_EMAIL,
                        makeMeAdmin: true,
                        policyName: "Carlos's Workspace",
                        introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                        currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                        currentUserEmailParam: CARLOS_EMAIL,
                        isSelfTourViewed: false,
                        betas: undefined,
                        hasActiveAdminPolicies: false,
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
                                    chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);

                                    resolve();
                                },
                            });
                        }),
                )
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
                                merchant,
                                comment,
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
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    if (chatReport && expenseReport) {
                        payMoneyRequest({
                            paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
                            chatReport,
                            iouReport: expenseReport,
                            introSelected: undefined,
                            iouReportCurrentNextStepDeprecated: undefined,
                            currentUserAccountID: CARLOS_ACCOUNT_ID,
                            betas: [CONST.BETAS.ALL],
                            isSelfTourViewed: false,
                            userBillingGracePeriodEnds: undefined,
                            amountOwed: 0,
                        });
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
                                waitForCollectionCallback: false,
                                callback: (allActions) => {
                                    Onyx.disconnect(connection);
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
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);
                                    const updatedIOUReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);
                                    const updatedChatReport = Object.values(allReports ?? {}).find((report) => report?.reportID === expenseReport?.chatReportID);
                                    expect(updatedIOUReport).toEqual(
                                        expect.objectContaining({
                                            lastMessageHtml: `paid $${amount / 100}.00 with Expensify`,
                                            lastMessageText: `paid $${amount / 100}.00 with Expensify`,
                                            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                                            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
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
            let expenseReport: OnyxEntry<Report>;
            let chatReport: OnyxEntry<Report>;

            Onyx.set(ONYXKEYS.SESSION, {email: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID});
            return waitForBatchedUpdates()
                .then(() => {
                    createWorkspace({
                        policyOwnerEmail: CARLOS_EMAIL,
                        makeMeAdmin: true,
                        policyName: "Carlos's Workspace",
                        introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                        currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                        currentUserEmailParam: CARLOS_EMAIL,
                        isSelfTourViewed: false,
                        betas: undefined,
                        hasActiveAdminPolicies: false,
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
                                    chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);

                                    resolve();
                                },
                            });
                        }),
                )
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
                                merchant,
                                comment,
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
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);

                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    mockFetch?.fail?.();
                    if (chatReport && expenseReport) {
                        payMoneyRequest({
                            paymentType: 'ACH',
                            chatReport,
                            iouReport: expenseReport,
                            introSelected: undefined,
                            iouReportCurrentNextStepDeprecated: undefined,
                            currentUserAccountID: CARLOS_ACCOUNT_ID,
                            betas: [CONST.BETAS.ALL],
                            isSelfTourViewed: false,
                            userBillingGracePeriodEnds: undefined,
                            amountOwed: 0,
                        });
                    }
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
                                waitForCollectionCallback: false,
                                callback: (allActions) => {
                                    Onyx.disconnect(connection);
                                    const erroredAction = Object.values(allActions ?? {}).find((action) => !isEmptyObject(action?.errors));
                                    expect(Object.values(erroredAction?.errors ?? {}).at(0)).toEqual(translateLocal('iou.error.other'));
                                    resolve();
                                },
                            });
                        }),
                );
        });
    });

    describe('payMoneyRequest', () => {
        it('should apply optimistic data correctly', async () => {
            // Given an outstanding IOU report
            const chatReport = {
                ...createRandomReport(0, undefined),
                lastReadTime: DateUtils.getDBTime(),
                lastVisibleActionCreated: DateUtils.getDBTime(),
            };
            const iouReport = {
                ...createRandomReport(1, undefined),
                chatType: undefined,
                type: CONST.REPORT.TYPE.IOU,
                total: 10,
            };
            mockFetch?.pause?.();

            jest.advanceTimersByTime(10);

            // When paying the IOU report
            payMoneyRequest({
                paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                chatReport,
                iouReport,
                introSelected: undefined,
                iouReportCurrentNextStepDeprecated: undefined,
                currentUserAccountID: CARLOS_ACCOUNT_ID,
                betas: [CONST.BETAS.ALL],
                isSelfTourViewed: false,
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
            });

            await waitForBatchedUpdates();

            // Then the optimistic data should be applied correctly
            const payReportAction = await new Promise<ReportAction | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
                    callback: (reportActions) => {
                        Onyx.disconnect(connection);
                        resolve(Object.values(reportActions ?? {}).pop());
                    },
                });
            });

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        expect(report?.lastVisibleActionCreated).toBe(chatReport.lastVisibleActionCreated);
                        expect(report?.hasOutstandingChildRequest).toBe(false);
                        expect(report?.iouReportID).toBeUndefined();
                        expect(new Date(report?.lastReadTime ?? '').getTime()).toBeGreaterThan(new Date(chatReport?.lastReadTime ?? '').getTime());
                        expect(report?.lastMessageText).toBe(getReportActionText(payReportAction));
                        expect(report?.lastMessageHtml).toBe(getReportActionHtml(payReportAction));
                        resolve();
                    },
                });
            });

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        expect(report?.hasOutstandingChildRequest).toBe(false);
                        expect(report?.statusNum).toBe(CONST.REPORT.STATUS_NUM.REIMBURSED);
                        expect(report?.lastVisibleActionCreated).toBe(payReportAction?.created);
                        expect(report?.lastMessageText).toBe(getReportActionText(payReportAction));
                        expect(report?.lastMessageHtml).toBe(getReportActionHtml(payReportAction));
                        expect(report?.pendingFields).toEqual({
                            preview: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            reimbursed: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        });
                        resolve();
                    },
                });
            });

            mockFetch?.resume?.();
        });

        it('calls notifyNewAction for the top most report', () => {
            // Given two expenses in an iou report where one of them held
            const iouReport = buildOptimisticIOUReport(1, 2, 100, '1', 'USD');
            const transaction1 = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });
            const transaction2 = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });
            const transactionCollectionDataSet: TransactionCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction1.transactionID}`]: transaction1,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction2.transactionID}`]: transaction2,
            };
            const iouActions: ReportAction[] = [];
            for (const transaction of [transaction1, transaction2]) {
                iouActions.push(
                    buildOptimisticIOUReportAction({
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        amount: transaction.amount,
                        currency: transaction.currency,
                        comment: '',
                        participants: [],
                        transactionID: transaction.transactionID,
                    }),
                );
            }
            const actions: OnyxInputValue<ReportActions> = {};
            for (const iouAction of iouActions) {
                actions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouAction.reportActionID}`] = iouAction;
            }
            const actionCollectionDataSet: ReportActionsCollectionDataSet = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`]: actions};

            return waitForBatchedUpdates()
                .then(() => Onyx.multiSet({...transactionCollectionDataSet, ...actionCollectionDataSet}))
                .then(() => {
                    putOnHold(transaction1.transactionID, 'comment', iouReport.reportID, false);
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    // When partially paying  an iou report from the chat report via the report preview
                    payMoneyRequest({
                        paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                        chatReport: {reportID: topMostReportID},
                        iouReport,
                        introSelected: undefined,
                        iouReportCurrentNextStepDeprecated: undefined,
                        currentUserAccountID: CARLOS_ACCOUNT_ID,
                        full: false,
                        betas: [CONST.BETAS.ALL],
                        isSelfTourViewed: false,
                        userBillingGracePeriodEnds: undefined,
                        amountOwed: 0,
                    });
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    // Then notifyNewAction should be called on the top most report.
                    expect(notifyNewAction).toHaveBeenCalledWith(topMostReportID, undefined, true);
                });
        });

        it('new expense report should be a draft report when paying partially and the approval is disabled', async () => {
            const adminAccountID = 1;
            const employeeAccountID = 3;
            const adminEmail = 'admin@test.com';
            const employeeEmail = 'employee@test.com';

            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [adminAccountID]: {
                    accountID: adminAccountID,
                    login: adminEmail,
                    displayName: 'Admin User',
                },
                [employeeAccountID]: {
                    accountID: employeeAccountID,
                    login: employeeEmail,
                    displayName: 'Employee User',
                },
            });

            // Create policy with no approval required
            const policy = {
                id: '1',
                name: 'Test Policy',
                role: CONST.POLICY.ROLE.ADMIN,
                owner: adminEmail,
                outputCurrency: CONST.CURRENCY.USD,
                isPolicyExpenseChatEnabled: true,
                type: CONST.POLICY.TYPE.CORPORATE,
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                employeeList: {
                    [employeeEmail]: {
                        email: employeeEmail,
                        role: CONST.POLICY.ROLE.USER,
                        submitsTo: adminEmail,
                    },
                    [adminEmail]: {
                        email: adminEmail,
                        role: CONST.POLICY.ROLE.ADMIN,
                        submitsTo: '',
                        forwardsTo: '',
                    },
                },
            };

            // Create expense report
            const expenseReport = {
                reportID: '123',
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: employeeAccountID,
                managerID: adminAccountID,
                policyID: policy.id,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                total: 1000,
                currency: 'USD',
                parentReportID: '456',
                chatReportID: '456',
            };

            const chatReport = {
                reportID: '456',
                isOwnPolicyExpenseChat: true,
                ownerAccountID: employeeAccountID,
                iouReportID: expenseReport.reportID,
                policyID: policy.id,
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport);

            const newExpenseReportID = payMoneyRequest({
                paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                chatReport,
                iouReport: expenseReport,
                introSelected: undefined,
                iouReportCurrentNextStepDeprecated: undefined,
                currentUserAccountID: CARLOS_ACCOUNT_ID,
                full: false,
                policy,
                betas: [CONST.BETAS.ALL],
                isSelfTourViewed: false,
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
            });
            await waitForBatchedUpdates();
            const newExpenseReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${newExpenseReportID}`);
            expect(newExpenseReport?.stateNum).toBe(CONST.REPORT.STATE_NUM.OPEN);
            expect(newExpenseReport?.statusNum).toBe(CONST.REPORT.STATUS_NUM.OPEN);
        });

        it('should accept isSelfTourViewed as true and apply optimistic data correctly', async () => {
            const chatReport = {
                ...createRandomReport(0, undefined),
                lastReadTime: DateUtils.getDBTime(),
                lastVisibleActionCreated: DateUtils.getDBTime(),
            };
            const iouReport = {
                ...createRandomReport(1, undefined),
                chatType: undefined,
                type: CONST.REPORT.TYPE.IOU,
                total: 10,
            };
            mockFetch?.pause?.();

            jest.advanceTimersByTime(10);

            payMoneyRequest({
                paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                chatReport,
                iouReport,
                introSelected: undefined,
                iouReportCurrentNextStepDeprecated: undefined,
                currentUserAccountID: CARLOS_ACCOUNT_ID,
                betas: [CONST.BETAS.ALL],
                isSelfTourViewed: true,
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
            });

            await waitForBatchedUpdates();

            // The IOU report should be settled with optimistic data regardless of isSelfTourViewed
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        expect(report?.hasOutstandingChildRequest).toBe(false);
                        expect(report?.statusNum).toBe(CONST.REPORT.STATUS_NUM.REIMBURSED);
                        resolve();
                    },
                });
            });

            mockFetch?.resume?.();
        });

        it('should accept isSelfTourViewed as false and apply optimistic data correctly', async () => {
            const chatReport = {
                ...createRandomReport(0, undefined),
                lastReadTime: DateUtils.getDBTime(),
                lastVisibleActionCreated: DateUtils.getDBTime(),
            };
            const iouReport = {
                ...createRandomReport(1, undefined),
                chatType: undefined,
                type: CONST.REPORT.TYPE.IOU,
                total: 10,
            };
            mockFetch?.pause?.();

            jest.advanceTimersByTime(10);

            payMoneyRequest({
                paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                chatReport,
                iouReport,
                introSelected: undefined,
                iouReportCurrentNextStepDeprecated: undefined,
                currentUserAccountID: CARLOS_ACCOUNT_ID,
                betas: [CONST.BETAS.ALL],
                isSelfTourViewed: false,
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
            });

            await waitForBatchedUpdates();

            // The IOU report should be settled with optimistic data regardless of isSelfTourViewed
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        expect(report?.hasOutstandingChildRequest).toBe(false);
                        expect(report?.statusNum).toBe(CONST.REPORT.STATUS_NUM.REIMBURSED);
                        resolve();
                    },
                });
            });

            mockFetch?.resume?.();
        });

        it('should not pay when amountOwed triggers billing restriction', async () => {
            const policyID = generatePolicyID();
            const ownerAccountID = CARLOS_ACCOUNT_ID;

            await Onyx.set(ONYXKEYS.SESSION, {email: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID});
            const policy = {
                ...createRandomPolicy(Number(policyID)),
                id: policyID,
                ownerAccountID,
                role: CONST.POLICY.ROLE.ADMIN,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);

            // Set the owner billing grace end period to the past
            const pastDate = Math.floor(Date.now() / 1000) - 86400 * 30;
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END, pastDate);
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);

            const chatReport = {
                ...createRandomReport(0, undefined),
                policyID,
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            };
            const iouReport = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.IOU,
                total: 10,
                policyID,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport);

            (Navigation.navigate as jest.Mock).mockClear();

            payMoneyRequest({
                paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                chatReport,
                iouReport,
                introSelected: undefined,
                iouReportCurrentNextStepDeprecated: undefined,
                currentUserAccountID: CARLOS_ACCOUNT_ID,
                betas: [CONST.BETAS.ALL],
                isSelfTourViewed: false,
                userBillingGracePeriodEnds: undefined,
                amountOwed: 100,
                ownerBillingGracePeriodEnd: pastDate,
            });

            await waitForBatchedUpdates();

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.RESTRICTED_ACTION.getRoute(policyID));
        });

        it('should pay successfully when amountOwed is 0', async () => {
            const chatReport = {
                ...createRandomReport(0, undefined),
                lastReadTime: DateUtils.getDBTime(),
                lastVisibleActionCreated: DateUtils.getDBTime(),
            };
            const iouReport = {
                ...createRandomReport(1, undefined),
                chatType: undefined,
                type: CONST.REPORT.TYPE.IOU,
                total: 10,
            };
            mockFetch?.pause?.();
            jest.advanceTimersByTime(10);

            payMoneyRequest({
                paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                chatReport,
                iouReport,
                introSelected: undefined,
                iouReportCurrentNextStepDeprecated: undefined,
                currentUserAccountID: CARLOS_ACCOUNT_ID,
                betas: [CONST.BETAS.ALL],
                isSelfTourViewed: false,
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
            });

            await waitForBatchedUpdates();

            // The IOU report should be settled optimistically since amountOwed is 0 (no restriction)
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        expect(report?.hasOutstandingChildRequest).toBe(false);
                        expect(report?.statusNum).toBe(CONST.REPORT.STATUS_NUM.REIMBURSED);
                        resolve();
                    },
                });
            });

            mockFetch?.resume?.();
        });
    });

    describe('a expense chat with a cancelled payment', () => {
        const amount = 10000;
        const comment = '💸💸💸💸';
        const merchant = 'NASDAQ';

        afterEach(() => {
            mockFetch?.resume?.();
        });

        it("has an iouReportID of the cancelled payment's expense report", () => {
            let expenseReport: OnyxEntry<Report>;
            let chatReport: OnyxEntry<Report>;

            // Given a signed in account, which owns a workspace, and has a policy expense chat
            Onyx.set(ONYXKEYS.SESSION, {email: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID});
            return waitForBatchedUpdates()
                .then(() => {
                    // Which owns a workspace
                    createWorkspace({
                        policyOwnerEmail: CARLOS_EMAIL,
                        makeMeAdmin: true,
                        policyName: "Carlos's Workspace",
                        introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                        currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                        currentUserEmailParam: CARLOS_EMAIL,
                        isSelfTourViewed: false,
                        betas: undefined,
                        hasActiveAdminPolicies: false,
                    });
                    return waitForBatchedUpdates();
                })
                .then(() =>
                    getOnyxData({
                        key: ONYXKEYS.COLLECTION.REPORT,
                        waitForCollectionCallback: true,
                        callback: (allReports) => {
                            chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
                        },
                    }),
                )
                .then(() => {
                    if (chatReport) {
                        // When an IOU expense is submitted to that policy expense chat
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
                                merchant,
                                comment,
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
                    }
                    return waitForBatchedUpdates();
                })
                .then(() =>
                    // And given an expense report has now been created which holds the IOU
                    getOnyxData({
                        key: ONYXKEYS.COLLECTION.REPORT,
                        waitForCollectionCallback: true,
                        callback: (allReports) => {
                            expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);
                        },
                    }),
                )
                .then(() => {
                    // When the expense report is paid elsewhere (but really, any payment option would work)
                    if (chatReport && expenseReport) {
                        payMoneyRequest({
                            paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                            chatReport,
                            iouReport: expenseReport,
                            introSelected: undefined,
                            iouReportCurrentNextStepDeprecated: undefined,
                            currentUserAccountID: CARLOS_ACCOUNT_ID,
                            betas: [CONST.BETAS.ALL],
                            isSelfTourViewed: false,
                            userBillingGracePeriodEnds: undefined,
                            amountOwed: 0,
                        });
                    }
                    return waitForBatchedUpdates();
                })
                .then(() => {
                    if (chatReport && expenseReport) {
                        // And when the payment is cancelled
                        cancelPayment(expenseReport, chatReport, {} as Policy, true, CARLOS_ACCOUNT_ID, CARLOS_EMAIL, true);
                    }
                    return waitForBatchedUpdates();
                })
                .then(() =>
                    getOnyxData({
                        key: ONYXKEYS.COLLECTION.REPORT,
                        waitForCollectionCallback: true,
                        callback: (allReports) => {
                            const chatReportData = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`];
                            // Then the policy expense chat report has the iouReportID of the IOU expense report
                            expect(chatReportData?.iouReportID).toBe(expenseReport?.reportID);
                        },
                    }),
                );
        });
    });

    describe('cancelPayment', () => {
        const amount = 10000;
        const comment = '💸💸💸💸';
        const merchant = 'NASDAQ';

        afterEach(() => {
            mockFetch?.resume?.();
        });

        it('pendingAction is not null after canceling the payment failed', async () => {
            let expenseReport: OnyxEntry<Report>;
            let chatReport: OnyxEntry<Report>;

            // Given a signed in account, which owns a workspace, and has a policy expense chat
            Onyx.set(ONYXKEYS.SESSION, {email: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID});
            // Which owns a workspace
            await waitForBatchedUpdates();
            createWorkspace({
                policyOwnerEmail: CARLOS_EMAIL,
                makeMeAdmin: true,
                policyName: "Carlos's Workspace",
                introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                currentUserEmailParam: CARLOS_EMAIL,
                isSelfTourViewed: false,
                betas: undefined,
                hasActiveAdminPolicies: false,
            });
            await waitForBatchedUpdates();

            // Get the policy expense chat report
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.REPORT,
                waitForCollectionCallback: true,
                callback: (allReports) => {
                    chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
                },
            });

            if (chatReport) {
                // When an IOU expense is submitted to that policy expense chat
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
                        merchant,
                        comment,
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
            }
            await waitForBatchedUpdates();

            // And given an expense report has now been created which holds the IOU
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.REPORT,
                waitForCollectionCallback: true,
                callback: (allReports) => {
                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);
                },
            });

            if (chatReport && expenseReport) {
                mockFetch?.pause?.();
                // And when the payment is cancelled
                cancelPayment(expenseReport, chatReport, {} as Policy, true, CARLOS_ACCOUNT_ID, CARLOS_EMAIL, true);
            }
            await waitForBatchedUpdates();

            mockFetch?.fail?.();

            await mockFetch?.resume?.();

            await getOnyxData({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
                callback: (allReportActions) => {
                    const action = Object.values(allReportActions ?? {}).find((a) => a?.actionName === CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED);
                    expect(action?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                },
            });
        });
    });

    describe('payMoneyRequest', () => {
        const amount = 10000;
        const comment = '💸💸💸💸';
        const merchant = 'NASDAQ';

        afterEach(() => {
            mockFetch?.resume?.();
        });

        it('pendingAction is not null after paying the money request', async () => {
            let expenseReport: OnyxEntry<Report>;
            let chatReport: OnyxEntry<Report>;

            // Given a signed in account, which owns a workspace, and has a policy expense chat
            Onyx.set(ONYXKEYS.SESSION, {email: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID});
            // Which owns a workspace
            await waitForBatchedUpdates();
            createWorkspace({
                policyOwnerEmail: CARLOS_EMAIL,
                makeMeAdmin: true,
                policyName: "Carlos's Workspace",
                introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                currentUserEmailParam: CARLOS_EMAIL,
                activePolicyID: '123',
                isSelfTourViewed: false,
                betas: undefined,
                hasActiveAdminPolicies: false,
            });
            await waitForBatchedUpdates();

            // Get the policy expense chat report
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.REPORT,
                waitForCollectionCallback: true,
                callback: (allReports) => {
                    chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
                },
            });

            if (chatReport) {
                // When an IOU expense is submitted to that policy expense chat
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
                        merchant,
                        comment,
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
            }
            await waitForBatchedUpdates();

            // And given an expense report has now been created which holds the IOU
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.REPORT,
                waitForCollectionCallback: true,
                callback: (allReports) => {
                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.IOU);
                },
            });

            // When the expense report is paid elsewhere (but really, any payment option would work)
            if (chatReport && expenseReport) {
                mockFetch?.pause?.();
                payMoneyRequest({
                    paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                    chatReport,
                    iouReport: expenseReport,
                    introSelected: undefined,
                    iouReportCurrentNextStepDeprecated: undefined,
                    currentUserAccountID: CARLOS_ACCOUNT_ID,
                    betas: [CONST.BETAS.ALL],
                    isSelfTourViewed: false,
                    userBillingGracePeriodEnds: undefined,
                    amountOwed: 0,
                });
            }
            await waitForBatchedUpdates();

            mockFetch?.fail?.();

            await mockFetch?.resume?.();

            await getOnyxData({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
                callback: (allReportActions) => {
                    const action = Object.values(allReportActions ?? {}).find((a) => {
                        const originalMessage = isMoneyRequestAction(a) ? getOriginalMessage(a) : undefined;
                        return originalMessage?.type === 'pay';
                    });
                    expect(action?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                },
            });
        });
    });

    describe('completePaymentOnboarding', () => {
        let completeOnboardingSpy: jest.SpyInstance;

        beforeEach(async () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            completeOnboardingSpy = jest.spyOn(require('@libs/actions/Report'), 'completeOnboarding').mockImplementation(jest.fn());
            await Onyx.set(ONYXKEYS.SESSION, {email: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID});
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [CARLOS_ACCOUNT_ID]: {
                    accountID: CARLOS_ACCOUNT_ID,
                    firstName: 'Carlos',
                    lastName: 'Test',
                },
            });
            await waitForBatchedUpdates();
        });

        afterEach(() => {
            completeOnboardingSpy.mockRestore();
        });

        it('should not call completeOnboarding when introSelected is undefined', () => {
            completePaymentOnboarding(CONST.PAYMENT_SELECTED.BBA, undefined, false, [CONST.BETAS.ALL]);
            expect(completeOnboardingSpy).not.toHaveBeenCalled();
        });

        it('should not call completeOnboarding when isInviteOnboardingComplete is true', () => {
            completePaymentOnboarding(
                CONST.PAYMENT_SELECTED.BBA,
                {
                    choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                    inviteType: CONST.ONBOARDING_INVITE_TYPES.IOU,
                    isInviteOnboardingComplete: true,
                },
                false,
                [CONST.BETAS.ALL],
            );
            expect(completeOnboardingSpy).not.toHaveBeenCalled();
        });

        it('should not call completeOnboarding when choice is missing', () => {
            completePaymentOnboarding(
                CONST.PAYMENT_SELECTED.BBA,
                {
                    inviteType: CONST.ONBOARDING_INVITE_TYPES.IOU,
                },
                false,
                [CONST.BETAS.ALL],
            );
            expect(completeOnboardingSpy).not.toHaveBeenCalled();
        });

        it('should not call completeOnboarding when inviteType is missing', () => {
            completePaymentOnboarding(
                CONST.PAYMENT_SELECTED.BBA,
                {
                    choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                },
                false,
                [CONST.BETAS.ALL],
            );
            expect(completeOnboardingSpy).not.toHaveBeenCalled();
        });

        it('should override purpose to MANAGE_TEAM for IOU invite with BBA payment', () => {
            const introSelected: IntroSelected = {
                choice: CONST.ONBOARDING_CHOICES.SUBMIT,
                inviteType: CONST.ONBOARDING_INVITE_TYPES.IOU,
                companySize: CONST.ONBOARDING_COMPANY_SIZE.MICRO,
            };
            completePaymentOnboarding(CONST.PAYMENT_SELECTED.BBA, introSelected, false, [CONST.BETAS.ALL]);

            expect(completeOnboardingSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                    paymentSelected: CONST.PAYMENT_SELECTED.BBA,
                    wasInvited: true,
                    companySize: CONST.ONBOARDING_COMPANY_SIZE.MICRO,
                    introSelected,
                    isSelfTourViewed: false,
                }),
            );
        });

        it('should override purpose to CHAT_SPLIT for INVOICE invite with PBA payment', () => {
            const introSelected: IntroSelected = {
                choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                inviteType: CONST.ONBOARDING_INVITE_TYPES.INVOICE,
                companySize: CONST.ONBOARDING_COMPANY_SIZE.SMALL,
            };
            completePaymentOnboarding(CONST.PAYMENT_SELECTED.PBA, introSelected, false, [CONST.BETAS.ALL]);

            expect(completeOnboardingSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    engagementChoice: CONST.ONBOARDING_CHOICES.CHAT_SPLIT,
                    paymentSelected: CONST.PAYMENT_SELECTED.PBA,
                    wasInvited: true,
                    companySize: CONST.ONBOARDING_COMPANY_SIZE.SMALL,
                    introSelected,
                    isSelfTourViewed: false,
                }),
            );
        });

        it('should keep original purpose for INVOICE invite with BBA payment', () => {
            const introSelected: IntroSelected = {
                choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                inviteType: CONST.ONBOARDING_INVITE_TYPES.INVOICE,
            };
            completePaymentOnboarding(CONST.PAYMENT_SELECTED.BBA, introSelected, false, [CONST.BETAS.ALL]);

            expect(completeOnboardingSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                    introSelected,
                    isSelfTourViewed: false,
                }),
            );
        });

        it('should keep original purpose for IOU invite with PBA payment', () => {
            const introSelected: IntroSelected = {
                choice: CONST.ONBOARDING_CHOICES.SUBMIT,
                inviteType: CONST.ONBOARDING_INVITE_TYPES.IOU,
            };
            completePaymentOnboarding(CONST.PAYMENT_SELECTED.PBA, introSelected, false, [CONST.BETAS.ALL]);

            expect(completeOnboardingSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    engagementChoice: CONST.ONBOARDING_CHOICES.SUBMIT,
                    introSelected,
                    isSelfTourViewed: false,
                }),
            );
        });

        it('should pass introSelected and optional params through to completeOnboarding', () => {
            const introSelected: IntroSelected = {
                choice: CONST.ONBOARDING_CHOICES.CHAT_SPLIT,
                inviteType: CONST.ONBOARDING_INVITE_TYPES.CHAT,
                companySize: CONST.ONBOARDING_COMPANY_SIZE.MEDIUM,
            };
            completePaymentOnboarding(CONST.PAYMENT_SELECTED.PBA, introSelected, false, [CONST.BETAS.ALL], 'adminsChatReport123', 'policyID456');

            expect(completeOnboardingSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    engagementChoice: CONST.ONBOARDING_CHOICES.CHAT_SPLIT,
                    adminsChatReportID: 'adminsChatReport123',
                    onboardingPolicyID: 'policyID456',
                    introSelected,
                    isSelfTourViewed: false,
                }),
            );
        });

        it('should pass isSelfTourViewed=true through to completeOnboarding when tour was viewed', () => {
            const introSelected: IntroSelected = {
                choice: CONST.ONBOARDING_CHOICES.SUBMIT,
                inviteType: CONST.ONBOARDING_INVITE_TYPES.IOU,
                companySize: CONST.ONBOARDING_COMPANY_SIZE.MICRO,
            };
            completePaymentOnboarding(CONST.PAYMENT_SELECTED.BBA, introSelected, true, [CONST.BETAS.ALL]);

            expect(completeOnboardingSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    isSelfTourViewed: true,
                    introSelected,
                }),
            );
        });
    });
});
