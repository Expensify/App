/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import type {OnyxEntry, OnyxMultiSetInput} from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useReportWithTransactionsAndViolations from '@hooks/useReportWithTransactionsAndViolations';
import {
    approveMoneyRequest,
    canApproveIOU,
    canCancelPayment,
    canIOUBePaid,
    canUnapproveIOU,
    getBadgeFromIOUReport,
    getIOUReportActionWithBadge,
    getReportOriginalCreationTimestamp,
    retractReport,
    submitReport,
    unapproveExpenseReport,
} from '@libs/actions/IOU/ReportWorkflow';
import {requestMoney} from '@libs/actions/IOU/TrackExpense';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {createWorkspace, deleteWorkspace, generatePolicyID, setWorkspaceApprovalMode} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as API from '@src/libs/API';
import DateUtils from '@src/libs/DateUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report, ReportNameValuePairs} from '@src/types/onyx';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import type {OnyxData} from '@src/types/onyx/Request';
import type Transaction from '@src/types/onyx/Transaction';
import type {InvoiceTestData} from '../../data/Invoice';
import * as InvoiceData from '../../data/Invoice';
import createRandomPolicy from '../../utils/collections/policies';
import createRandomReportAction from '../../utils/collections/reportActions';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import getOnyxValue from '../../utils/getOnyxValue';
import type {MockFetch} from '../../utils/TestHelper';
import {getGlobalFetchMock, getOnyxData, localeCompare} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

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

const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;
const CARLOS_EMAIL = 'cmartins@expensifail.com';
const CARLOS_ACCOUNT_ID = 1;

OnyxUpdateManager();

describe('actions/IOU/ReportWorkflow', () => {
    let mockFetch: MockFetch;

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

    beforeEach(() => {
        global.fetch = getGlobalFetchMock();
        mockFetch = fetch as MockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        mockFetch?.mockClear();
    });

    describe('submitReport', () => {
        it('correctly submits a report', () => {
            const amount = 10000;
            const comment = '💸💸💸💸';
            const merchant = 'NASDAQ';
            let expenseReport: OnyxEntry<Report>;
            let chatReport: OnyxEntry<Report>;
            return waitForBatchedUpdates()
                .then(async () => {
                    const policyID = generatePolicyID();
                    createWorkspace({
                        policyOwnerEmail: CARLOS_EMAIL,
                        makeMeAdmin: true,
                        policyName: "Carlos's Workspace",
                        policyID,
                        introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                        currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                        currentUserEmailParam: CARLOS_EMAIL,
                        isSelfTourViewed: false,
                        betas: undefined,
                        hasActiveAdminPolicies: false,
                    });

                    const policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
                    // Change the approval mode for the policy since default is Submit and Close
                    setWorkspaceApprovalMode(policy, CARLOS_EMAIL, CONST.POLICY.APPROVAL_MODE.BASIC, RORY_ACCOUNT_ID, RORY_EMAIL);
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
                                participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID, isPolicyExpenseChat: true, reportID: chatReport.reportID},
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
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE);
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
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE);

                                    // Verify report is a draft
                                    expect(expenseReport?.stateNum).toBe(0);
                                    expect(expenseReport?.statusNum).toBe(0);
                                    resolve();
                                },
                            });
                        }),
                )
                .then(async () => {
                    if (expenseReport) {
                        const nextStep = await getOnyxValue(`${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`);
                        submitReport({
                            expenseReport,
                            policy: {} as Policy,
                            currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                            currentUserEmailParam: CARLOS_EMAIL,
                            hasViolations: true,
                            isASAPSubmitBetaEnabled: true,
                            expenseReportCurrentNextStepDeprecated: nextStep,
                            userBillingGracePeriodEnds: undefined,
                            amountOwed: 0,
                            ownerBillingGracePeriodEnd: undefined,
                            delegateEmail: undefined,
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
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE);
                                    // Report was submitted correctly
                                    expect(expenseReport?.stateNum).toBe(1);
                                    expect(expenseReport?.statusNum).toBe(1);
                                    resolve();
                                },
                            });
                        }),
                );
        });
        it('merges policyRecentlyUsedCurrencies into recently used currencies', () => {
            const amount = 10000;
            const comment = 'Test expense';
            const merchant = 'Test Merchant';
            const initialCurrencies = [CONST.CURRENCY.USD, CONST.CURRENCY.EUR];
            let chatReport: OnyxEntry<Report>;

            return waitForBatchedUpdates()
                .then(async () => {
                    const policyID = generatePolicyID();
                    createWorkspace({
                        policyOwnerEmail: CARLOS_EMAIL,
                        makeMeAdmin: true,
                        policyName: "Carlos's Workspace",
                        policyID,
                        introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                        currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                        currentUserEmailParam: CARLOS_EMAIL,
                        isSelfTourViewed: false,
                        betas: undefined,
                        hasActiveAdminPolicies: false,
                    });

                    const policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
                    setWorkspaceApprovalMode(policy, CARLOS_EMAIL, CONST.POLICY.APPROVAL_MODE.BASIC, RORY_ACCOUNT_ID, RORY_EMAIL, {});
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
                                participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID, isPolicyExpenseChat: true, reportID: chatReport.reportID},
                            },
                            transactionParams: {
                                amount,
                                attendees: [],
                                currency: CONST.CURRENCY.GBP,
                                created: '',
                                merchant,
                                comment,
                            },
                            shouldGenerateTransactionThreadReport: true,
                            isASAPSubmitBetaEnabled: false,
                            currentUserAccountIDParam: 123,
                            currentUserEmailParam: 'existing@example.com',
                            transactionViolations: {},
                            policyRecentlyUsedCurrencies: initialCurrencies,
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
                .then(async () => {
                    const recentlyUsedCurrencies = await getOnyxValue(ONYXKEYS.RECENTLY_USED_CURRENCIES);
                    expect(recentlyUsedCurrencies).toEqual([CONST.CURRENCY.GBP, ...initialCurrencies]);
                });
        });
        it('correctly submits a report with Submit and Close approval mode', () => {
            const amount = 10000;
            const comment = '💸💸💸💸';
            const merchant = 'NASDAQ';
            let expenseReport: OnyxEntry<Report>;
            let chatReport: OnyxEntry<Report>;
            let policy: OnyxEntry<Policy>;

            return (
                waitForBatchedUpdates()
                    .then(() => {
                        createWorkspace({
                            policyOwnerEmail: CARLOS_EMAIL,
                            makeMeAdmin: true,
                            policyName: "Carlos's Workspace",
                            policyID: undefined,
                            engagementChoice: CONST.ONBOARDING_CHOICES.CHAT_SPLIT,
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
                                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID, isPolicyExpenseChat: true, reportID: chatReport.reportID},
                                },
                                transactionParams: {
                                    amount,
                                    attendees: [],
                                    currency: CONST.CURRENCY.USD,
                                    created: '',
                                    merchant,
                                    comment,
                                    reimbursable: true,
                                },
                                shouldGenerateTransactionThreadReport: true,
                                isASAPSubmitBetaEnabled: false,
                                currentUserAccountIDParam: 123,
                                currentUserEmailParam: 'existing@example.com',
                                transactionViolations: {},
                                policyRecentlyUsedCurrencies: [],
                                isSelfTourViewed: false,
                                quickAction: undefined,
                                existingTransactionDraft: undefined,
                                draftTransactionIDs: [],
                                betas: [],
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
                                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID, isPolicyExpenseChat: true, reportID: chatReport.reportID},
                                },
                                transactionParams: {
                                    amount,
                                    attendees: [],
                                    currency: CONST.CURRENCY.USD,
                                    created: '',
                                    merchant,
                                    comment,
                                    reimbursable: true,
                                },
                                shouldGenerateTransactionThreadReport: true,
                                isASAPSubmitBetaEnabled: false,
                                currentUserAccountIDParam: 123,
                                currentUserEmailParam: 'existing@example.com',
                                transactionViolations: {},
                                policyRecentlyUsedCurrencies: [],
                                isSelfTourViewed: false,
                                quickAction: undefined,
                                existingTransactionDraft: undefined,
                                draftTransactionIDs: [],
                                betas: [],
                                personalDetails: {},
                            });
                        }
                        return waitForBatchedUpdates();
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.POLICY,
                                    waitForCollectionCallback: true,
                                    callback: (allPolicies) => {
                                        Onyx.disconnect(connection);
                                        policy = Object.values(allPolicies ?? {}).find((p): p is OnyxEntry<Policy> => p?.name === "Carlos's Workspace");
                                        expect(policy).toBeTruthy();
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
                                        expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE);

                                        Onyx.merge(`report_${expenseReport?.reportID}`, {
                                            statusNum: 0,
                                            stateNum: 0,
                                        });
                                        resolve();
                                    },
                                });
                            }),
                    )
                    // Switch session to Carlos (admin) to test canIOUBePaid from the payer's perspective
                    .then(() => Onyx.merge(ONYXKEYS.SESSION, {accountID: CARLOS_ACCOUNT_ID, email: CARLOS_EMAIL}))
                    .then(() => waitForBatchedUpdates())
                    .then(() => {
                        expect(canIOUBePaid(expenseReport, chatReport, policy, {}, [], true)).toBe(true);
                        expect(canIOUBePaid(expenseReport, chatReport, policy, {}, [], false)).toBe(true);
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT,
                                    waitForCollectionCallback: true,
                                    callback: (allReports) => {
                                        Onyx.disconnect(connection);
                                        expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE);

                                        resolve();
                                        // Verify report is a draft
                                        expect(expenseReport?.stateNum).toBe(0);
                                        expect(expenseReport?.statusNum).toBe(0);

                                        expect(canIOUBePaid(expenseReport, chatReport, policy, {}, [], true)).toBe(false);
                                        expect(canIOUBePaid(expenseReport, chatReport, policy, {}, [], false)).toBe(false);
                                    },
                                });
                            }),
                    )
                    .then(async () => {
                        if (expenseReport) {
                            const nextStep = await getOnyxValue(`${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`);
                            submitReport({
                                expenseReport,
                                policy,
                                currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                                currentUserEmailParam: CARLOS_EMAIL,
                                hasViolations: true,
                                isASAPSubmitBetaEnabled: true,
                                expenseReportCurrentNextStepDeprecated: nextStep,
                                userBillingGracePeriodEnds: undefined,
                                amountOwed: 0,
                                ownerBillingGracePeriodEnd: undefined,
                                delegateEmail: undefined,
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
                                        expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE);

                                        resolve();
                                        // Report is closed since the default policy settings is Submit and Close
                                        expect(expenseReport?.stateNum).toBe(2);
                                        expect(expenseReport?.statusNum).toBe(2);

                                        expect(canIOUBePaid(expenseReport, chatReport, policy, {}, [], true)).toBe(true);
                                        expect(canIOUBePaid(expenseReport, chatReport, policy, {}, [], false)).toBe(true);
                                    },
                                });
                            }),
                    )
                    .then(() => {
                        if (policy) {
                            const reportToArchive = [];
                            if (expenseReport) {
                                reportToArchive.push(expenseReport);
                            }
                            if (chatReport) {
                                reportToArchive.push(chatReport);
                            }

                            deleteWorkspace({
                                policies: {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy},
                                policyID: policy.id,
                                personalPolicyID: undefined,
                                activePolicyID: undefined,
                                policyName: policy.name,
                                lastAccessedWorkspacePolicyID: undefined,
                                policyCardFeeds: undefined,
                                reportsToArchive: reportToArchive,
                                transactionViolations: undefined,
                                reimbursementAccountError: undefined,
                                lastUsedPaymentMethods: undefined,
                                localeCompare,
                                currentUserAccountID: CARLOS_ACCOUNT_ID,
                                accountIDToLogin: {},
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
                                        chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);

                                        expect(canIOUBePaid(expenseReport, chatReport, policy, {}, [], true)).toBe(false);
                                        expect(canIOUBePaid(expenseReport, chatReport, policy, {}, [], false)).toBe(false);
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });
        it('correctly implements error handling', () => {
            const amount = 10000;
            const comment = '💸💸💸💸';
            const merchant = 'NASDAQ';
            let expenseReport: OnyxEntry<Report>;
            let chatReport: OnyxEntry<Report>;
            let policy: OnyxEntry<Policy>;

            return (
                waitForBatchedUpdates()
                    .then(() => {
                        createWorkspace({
                            policyOwnerEmail: CARLOS_EMAIL,
                            makeMeAdmin: true,
                            policyName: "Carlos's Workspace",
                            policyID: undefined,
                            engagementChoice: CONST.ONBOARDING_CHOICES.CHAT_SPLIT,
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
                                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID, isPolicyExpenseChat: true, reportID: chatReport.reportID},
                                },
                                transactionParams: {
                                    amount,
                                    attendees: [],
                                    currency: CONST.CURRENCY.USD,
                                    created: '',
                                    merchant,
                                    comment,
                                    reimbursable: true,
                                },
                                shouldGenerateTransactionThreadReport: true,
                                isASAPSubmitBetaEnabled: false,
                                currentUserAccountIDParam: 123,
                                currentUserEmailParam: 'existing@example.com',
                                transactionViolations: {},
                                policyRecentlyUsedCurrencies: [],
                                isSelfTourViewed: false,
                                quickAction: undefined,
                                existingTransactionDraft: undefined,
                                draftTransactionIDs: [],
                                betas: [],
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
                                    participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID, isPolicyExpenseChat: true, reportID: chatReport.reportID},
                                },
                                transactionParams: {
                                    amount,
                                    attendees: [],
                                    currency: CONST.CURRENCY.USD,
                                    created: '',
                                    merchant,
                                    comment,
                                    reimbursable: true,
                                },
                                shouldGenerateTransactionThreadReport: true,
                                isASAPSubmitBetaEnabled: false,
                                currentUserAccountIDParam: 123,
                                currentUserEmailParam: 'existing@example.com',
                                transactionViolations: {},
                                policyRecentlyUsedCurrencies: [],
                                isSelfTourViewed: false,
                                quickAction: undefined,
                                existingTransactionDraft: undefined,
                                draftTransactionIDs: [],
                                betas: [],
                                personalDetails: {},
                            });
                        }
                        return waitForBatchedUpdates();
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.POLICY,
                                    waitForCollectionCallback: true,
                                    callback: (allPolicies) => {
                                        Onyx.disconnect(connection);
                                        policy = Object.values(allPolicies ?? {}).find((p): p is OnyxEntry<Policy> => p?.name === "Carlos's Workspace");
                                        expect(policy).toBeTruthy();
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
                                        expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE);

                                        Onyx.merge(`report_${expenseReport?.reportID}`, {
                                            statusNum: 0,
                                            stateNum: 0,
                                        });
                                        resolve();
                                    },
                                });
                            }),
                    )
                    // Switch session to Carlos (admin) to test canIOUBePaid from the payer's perspective
                    .then(() => Onyx.merge(ONYXKEYS.SESSION, {accountID: CARLOS_ACCOUNT_ID, email: CARLOS_EMAIL}))
                    .then(() => waitForBatchedUpdates())
                    .then(() => {
                        expect(canIOUBePaid(expenseReport, chatReport, policy, {}, [], true)).toBe(true);
                        expect(canIOUBePaid(expenseReport, chatReport, policy, {}, [], false)).toBe(true);
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connection = Onyx.connect({
                                    key: ONYXKEYS.COLLECTION.REPORT,
                                    waitForCollectionCallback: true,
                                    callback: (allReports) => {
                                        Onyx.disconnect(connection);
                                        expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE);

                                        // Verify report is a draft
                                        expect(expenseReport?.stateNum).toBe(0);
                                        expect(expenseReport?.statusNum).toBe(0);
                                        resolve();
                                    },
                                });
                            }),
                    )
                    .then(async () => {
                        mockFetch?.fail?.();
                        if (expenseReport) {
                            const nextStep = await getOnyxValue(`${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`);
                            submitReport({
                                expenseReport,
                                policy: {} as Policy,
                                currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                                currentUserEmailParam: CARLOS_EMAIL,
                                hasViolations: true,
                                isASAPSubmitBetaEnabled: true,
                                expenseReportCurrentNextStepDeprecated: nextStep,
                                userBillingGracePeriodEnds: undefined,
                                amountOwed: 0,
                                ownerBillingGracePeriodEnd: undefined,
                                delegateEmail: undefined,
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
                                        expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE);

                                        // Report was submitted with some fail
                                        expect(expenseReport?.stateNum).toBe(0);
                                        expect(expenseReport?.statusNum).toBe(0);
                                        expect(canIOUBePaid(expenseReport, chatReport, policy, {}, [], true)).toBe(false);
                                        expect(canIOUBePaid(expenseReport, chatReport, policy, {}, [], false)).toBe(false);
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });

        it('should not set stateNum, statusNum, or nextStep optimistically when submitting with Dynamic External Workflow policy', () => {
            const amount = 10000;
            const comment = '💸💸💸💸';
            const merchant = 'NASDAQ';
            let expenseReport: OnyxEntry<Report>;
            let chatReport: OnyxEntry<Report>;
            let policy: OnyxEntry<Policy>;
            let nextStepBeforeSubmit: Report['nextStep'];
            const policyID = generatePolicyID();
            createWorkspace({
                policyOwnerEmail: CARLOS_EMAIL,
                makeMeAdmin: true,
                policyName: 'Test Workspace with Dynamic External Workflow',
                policyID,
                introSelected: undefined,
                currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                currentUserEmailParam: CARLOS_EMAIL,
                isSelfTourViewed: false,
                betas: undefined,
                hasActiveAdminPolicies: false,
            });
            return waitForBatchedUpdates()
                .then(async () => {
                    policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
                    setWorkspaceApprovalMode(policy, CARLOS_EMAIL, CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL, RORY_ACCOUNT_ID, RORY_EMAIL, {});
                    return waitForBatchedUpdates();
                })
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.POLICY,
                                waitForCollectionCallback: true,
                                callback: (allPolicies) => {
                                    Onyx.disconnect(connection);
                                    policy = Object.values(allPolicies ?? {}).find((p): p is OnyxEntry<Policy> => p?.id === policyID);
                                    expect(policy).toBeTruthy();
                                    expect(policy?.approvalMode).toBe(CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL);
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
                                    chatReport = Object.values(allReports ?? {}).find(
                                        (report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT && report.policyID === policyID,
                                    );
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
                                participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID, isPolicyExpenseChat: true, reportID: chatReport.reportID},
                            },
                            transactionParams: {
                                amount,
                                attendees: [],
                                currency: CONST.CURRENCY.USD,
                                created: '',
                                merchant,
                                comment,
                                reimbursable: true,
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
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE && report?.policyID === policyID);
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
                            const connection = Onyx.connect({
                                key: ONYXKEYS.COLLECTION.REPORT,
                                waitForCollectionCallback: true,
                                callback: (allReports) => {
                                    Onyx.disconnect(connection);
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE && report?.policyID === policyID);

                                    expect(expenseReport?.stateNum).toBe(0);
                                    expect(expenseReport?.statusNum).toBe(0);
                                    nextStepBeforeSubmit = expenseReport?.nextStep;
                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    if (expenseReport) {
                        submitReport({
                            expenseReport,
                            policy,
                            currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                            currentUserEmailParam: CARLOS_EMAIL,
                            hasViolations: true,
                            isASAPSubmitBetaEnabled: true,
                            expenseReportCurrentNextStepDeprecated: undefined,
                            userBillingGracePeriodEnds: undefined,
                            amountOwed: 0,
                            ownerBillingGracePeriodEnd: undefined,
                            delegateEmail: undefined,
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
                                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE && report?.policyID === policyID);

                                    expect(expenseReport?.stateNum).toBe(CONST.REPORT.STATE_NUM.OPEN);
                                    expect(expenseReport?.statusNum).toBe(CONST.REPORT.STATUS_NUM.OPEN);
                                    expect(expenseReport?.nextStep).toEqual(nextStepBeforeSubmit);
                                    expect(expenseReport?.pendingFields?.nextStep).toBeUndefined();

                                    resolve();
                                },
                            });
                        }),
                );
        });

        it('should not submit when amountOwed triggers billing restriction', async () => {
            const policyID = generatePolicyID();
            const ownerAccountID = CARLOS_ACCOUNT_ID;

            // Set up a policy owned by the current user
            await Onyx.set(ONYXKEYS.SESSION, {email: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID});
            const policy = {
                ...createRandomPolicy(Number(policyID)),
                id: policyID,
                ownerAccountID,
                role: CONST.POLICY.ROLE.ADMIN,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);

            // Set the owner billing grace end period to the past
            const pastDate = Math.floor(Date.now() / 1000) - 86400 * 30; // 30 days ago
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END, pastDate);
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);

            const expenseReport = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                ownerAccountID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);

            // Clear previous Navigation.navigate calls
            (Navigation.navigate as jest.Mock).mockClear();

            // Submit with amountOwed > 0 should trigger restriction
            submitReport({
                expenseReport,
                policy,
                currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                currentUserEmailParam: CARLOS_EMAIL,
                hasViolations: false,
                isASAPSubmitBetaEnabled: true,
                expenseReportCurrentNextStepDeprecated: undefined,
                userBillingGracePeriodEnds: undefined,
                amountOwed: 100,
                ownerBillingGracePeriodEnd: pastDate,
                delegateEmail: undefined,
            });

            await waitForBatchedUpdates();

            // Verify Navigation.navigate was called with the restricted action route
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.RESTRICTED_ACTION.getRoute(policyID));
        });

        it('should submit successfully when amountOwed is 0', async () => {
            const policyID = generatePolicyID();

            await Onyx.set(ONYXKEYS.SESSION, {email: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID});
            const policy = {
                ...createRandomPolicy(Number(policyID)),
                id: policyID,
                ownerAccountID: CARLOS_ACCOUNT_ID,
                role: CONST.POLICY.ROLE.ADMIN,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);

            // Set the owner billing grace end period to the past
            const pastDate = Math.floor(Date.now() / 1000) - 86400 * 30;
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END, pastDate);
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 0);

            createWorkspace({
                policyOwnerEmail: CARLOS_EMAIL,
                makeMeAdmin: true,
                policyName: "Carlos's Workspace",
                policyID,
                introSelected: {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM},
                currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                currentUserEmailParam: CARLOS_EMAIL,
                isSelfTourViewed: false,
                betas: undefined,
                hasActiveAdminPolicies: false,
            });

            setWorkspaceApprovalMode(policy, CARLOS_EMAIL, CONST.POLICY.APPROVAL_MODE.BASIC, RORY_ACCOUNT_ID, RORY_EMAIL, {});
            await waitForBatchedUpdates();

            let chatReport: OnyxEntry<Report>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.REPORT,
                waitForCollectionCallback: true,
                callback: (allReports) => {
                    chatReport = Object.values(allReports ?? {}).find((report) => report?.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT && report?.policyID === policyID);
                },
            });

            if (chatReport) {
                requestMoney({
                    report: chatReport,
                    participantParams: {
                        payeeEmail: RORY_EMAIL,
                        payeeAccountID: RORY_ACCOUNT_ID,
                        participant: {login: CARLOS_EMAIL, accountID: CARLOS_ACCOUNT_ID, isPolicyExpenseChat: true, reportID: chatReport.reportID},
                    },
                    transactionParams: {
                        amount: 10000,
                        attendees: [],
                        currency: CONST.CURRENCY.USD,
                        created: '',
                        merchant: 'Test',
                        comment: 'Test expense',
                    },
                    shouldGenerateTransactionThreadReport: true,
                    isASAPSubmitBetaEnabled: false,
                    currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                    currentUserEmailParam: CARLOS_EMAIL,
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

            let expenseReport: OnyxEntry<Report>;
            await getOnyxData({
                key: ONYXKEYS.COLLECTION.REPORT,
                waitForCollectionCallback: true,
                callback: (allReports) => {
                    expenseReport = Object.values(allReports ?? {}).find((report) => report?.type === CONST.REPORT.TYPE.EXPENSE && report?.policyID === policyID);
                },
            });

            if (expenseReport) {
                await Onyx.merge(`report_${expenseReport.reportID}`, {statusNum: 0, stateNum: 0});
                await waitForBatchedUpdates();

                (Navigation.navigate as jest.Mock).mockClear();

                const nextStep = await getOnyxValue(`${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`);
                const ownerBillingGracePeriodEnd = Math.floor(Date.now() / 1000) - 86400 * 30;
                submitReport({
                    expenseReport,
                    policy,
                    currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                    currentUserEmailParam: CARLOS_EMAIL,
                    hasViolations: false,
                    isASAPSubmitBetaEnabled: true,
                    expenseReportCurrentNextStepDeprecated: nextStep,
                    userBillingGracePeriodEnds: undefined,
                    amountOwed: 0,
                    ownerBillingGracePeriodEnd,
                    delegateEmail: undefined,
                });

                await waitForBatchedUpdates();

                // Should NOT navigate to restricted action
                expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.RESTRICTED_ACTION.getRoute(policyID));
            }
        });
    });

    describe('delegateAccountID forwarding', () => {
        const DELEGATE_EMAIL = 'delegate@example.com';
        const DELEGATE_ACCOUNT_ID = 99;

        beforeEach(async () => {
            jest.clearAllMocks();
            jest.spyOn(API, 'write');
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [DELEGATE_ACCOUNT_ID]: {
                    accountID: DELEGATE_ACCOUNT_ID,
                    login: DELEGATE_EMAIL,
                    displayName: 'Delegate User',
                },
            });
            await waitForBatchedUpdates();
        });

        it('submitReport includes delegateAccountID when delegateEmail is provided', () => {
            const expenseReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                total: 10000,
                currency: CONST.CURRENCY.USD,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };

            submitReport({
                expenseReport,
                policy: {} as Policy,
                currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                currentUserEmailParam: CARLOS_EMAIL,
                hasViolations: false,
                isASAPSubmitBetaEnabled: false,
                expenseReportCurrentNextStepDeprecated: undefined,
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
                ownerBillingGracePeriodEnd: undefined,
                delegateEmail: DELEGATE_EMAIL,
            });

            // eslint-disable-next-line rulesdir/no-multiple-api-calls -- Inspecting mock call args to verify optimistic data structure
            const calls = (API.write as jest.Mock).mock.calls;
            const [, , onyxData] = calls.at(0) as [unknown, unknown, OnyxData<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>];
            const optimisticData = onyxData.optimisticData ?? [];

            const reportActionsUpdate = optimisticData.find((update: {key: string}) => update.key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`);
            expect(reportActionsUpdate).toBeDefined();

            const reportAction = Object.values(reportActionsUpdate?.value as Record<string, ReportAction>).at(0);
            expect(reportAction?.delegateAccountID).toBe(DELEGATE_ACCOUNT_ID);
        });

        it('submitReport sets delegateAccountID to undefined when delegateEmail is undefined', () => {
            const expenseReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                total: 10000,
                currency: CONST.CURRENCY.USD,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };

            submitReport({
                expenseReport,
                policy: {} as Policy,
                currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                currentUserEmailParam: CARLOS_EMAIL,
                hasViolations: false,
                isASAPSubmitBetaEnabled: false,
                expenseReportCurrentNextStepDeprecated: undefined,
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
                ownerBillingGracePeriodEnd: undefined,
                delegateEmail: undefined,
            });

            // eslint-disable-next-line rulesdir/no-multiple-api-calls -- Inspecting mock call args to verify optimistic data structure
            const calls = (API.write as jest.Mock).mock.calls;
            const [, , onyxData] = calls.at(0) as [unknown, unknown, OnyxData<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>];
            const optimisticData = onyxData.optimisticData ?? [];

            const reportActionsUpdate = optimisticData.find((update: {key: string}) => update.key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`);
            expect(reportActionsUpdate).toBeDefined();

            const reportAction = Object.values(reportActionsUpdate?.value as Record<string, ReportAction>).at(0);
            expect(reportAction?.delegateAccountID).toBeUndefined();
        });

        it('unapproveExpenseReport includes delegateAccountID when delegateEmail is provided', () => {
            const expenseReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                total: 10000,
                currency: CONST.CURRENCY.USD,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            };

            unapproveExpenseReport(expenseReport, {} as Policy, CARLOS_ACCOUNT_ID, CARLOS_EMAIL, false, false, undefined, DELEGATE_EMAIL);

            // eslint-disable-next-line rulesdir/no-multiple-api-calls -- Inspecting mock call args to verify optimistic data structure
            const calls = (API.write as jest.Mock).mock.calls;
            const [, , onyxData] = calls.at(0) as [unknown, unknown, OnyxData<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>];
            const optimisticData = onyxData.optimisticData ?? [];

            const reportActionsUpdate = optimisticData.find((update: {key: string}) => update.key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`);
            expect(reportActionsUpdate).toBeDefined();

            const reportAction = Object.values(reportActionsUpdate?.value as Record<string, ReportAction>).at(0);
            expect(reportAction?.delegateAccountID).toBe(DELEGATE_ACCOUNT_ID);
        });

        it('retractReport includes delegateAccountID when delegateEmail is provided', () => {
            const chatReport: Report = {
                ...createRandomReport(0, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
            };
            const expenseReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                total: 10000,
                currency: CONST.CURRENCY.USD,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };

            retractReport(expenseReport, chatReport, {} as Policy, CARLOS_ACCOUNT_ID, CARLOS_EMAIL, false, false, undefined, DELEGATE_EMAIL);

            // eslint-disable-next-line rulesdir/no-multiple-api-calls -- Inspecting mock call args to verify optimistic data structure
            const calls = (API.write as jest.Mock).mock.calls;
            const [, , onyxData] = calls.at(0) as [unknown, unknown, OnyxData<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>];
            const optimisticData = onyxData.optimisticData ?? [];

            const reportActionsUpdate = optimisticData.find((update: {key: string}) => update.key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`);
            expect(reportActionsUpdate).toBeDefined();

            const reportAction = Object.values(reportActionsUpdate?.value as Record<string, ReportAction>).at(0);
            expect(reportAction?.delegateAccountID).toBe(DELEGATE_ACCOUNT_ID);
        });

        it('approveMoneyRequest includes delegateAccountID when delegateEmail is provided', () => {
            const expenseReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                total: 10000,
                currency: CONST.CURRENCY.USD,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };

            approveMoneyRequest({
                expenseReport,
                expenseReportPolicy: createRandomPolicy(Number(expenseReport.policyID)),
                policy: {} as Policy,
                currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                currentUserEmailParam: CARLOS_EMAIL,
                hasViolations: false,
                isASAPSubmitBetaEnabled: false,
                expenseReportCurrentNextStepDeprecated: undefined,
                betas: [CONST.BETAS.ALL],
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
                ownerBillingGracePeriodEnd: undefined,
                delegateEmail: DELEGATE_EMAIL,
            });

            // eslint-disable-next-line rulesdir/no-multiple-api-calls -- Inspecting mock call args to verify optimistic data structure
            const calls = (API.write as jest.Mock).mock.calls;
            const [, , onyxData] = calls.at(0) as [unknown, unknown, OnyxData<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>];
            const optimisticData = onyxData.optimisticData ?? [];

            const reportActionsUpdate = optimisticData.find((update: {key: string}) => update.key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`);
            expect(reportActionsUpdate).toBeDefined();

            const reportAction = Object.values(reportActionsUpdate?.value as Record<string, ReportAction>).at(0);
            expect(reportAction?.delegateAccountID).toBe(DELEGATE_ACCOUNT_ID);
        });

        it('approveMoneyRequest sets delegateAccountID to undefined when delegateEmail is undefined', () => {
            const expenseReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                total: 10000,
                currency: CONST.CURRENCY.USD,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };

            approveMoneyRequest({
                expenseReport,
                expenseReportPolicy: createRandomPolicy(Number(expenseReport.policyID)),
                policy: {} as Policy,
                currentUserAccountIDParam: CARLOS_ACCOUNT_ID,
                currentUserEmailParam: CARLOS_EMAIL,
                hasViolations: false,
                isASAPSubmitBetaEnabled: false,
                expenseReportCurrentNextStepDeprecated: undefined,
                betas: [CONST.BETAS.ALL],
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
                ownerBillingGracePeriodEnd: undefined,
                delegateEmail: undefined,
            });

            // eslint-disable-next-line rulesdir/no-multiple-api-calls -- Inspecting mock call args to verify optimistic data structure
            const calls = (API.write as jest.Mock).mock.calls;
            const [, , onyxData] = calls.at(0) as [unknown, unknown, OnyxData<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>];
            const optimisticData = onyxData.optimisticData ?? [];

            const reportActionsUpdate = optimisticData.find((update: {key: string}) => update.key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`);
            expect(reportActionsUpdate).toBeDefined();

            const reportAction = Object.values(reportActionsUpdate?.value as Record<string, ReportAction>).at(0);
            expect(reportAction?.delegateAccountID).toBeUndefined();
        });
    });

    describe('canIOUBePaid', () => {
        it('For invoices from archived workspaces', async () => {
            const {policy, convertedInvoiceChat: chatReport}: InvoiceTestData = InvoiceData;

            const chatReportRNVP: ReportNameValuePairs = {private_isArchived: DateUtils.getDBTime()};

            const invoiceReceiver = chatReport?.invoiceReceiver as {type: string; policyID: string; accountID: number};

            const iouReport = {...createRandomReport(1, undefined), type: CONST.REPORT.TYPE.INVOICE, statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED};

            const invoiceReceiverPolicy = {
                ...createRandomPolicy(Number(invoiceReceiver.policyID), CONST.POLICY.TYPE.TEAM),
                id: invoiceReceiver.policyID,
                role: CONST.POLICY.ROLE.ADMIN,
            };

            expect(canIOUBePaid(iouReport, chatReport, policy, {}, [], true, undefined, invoiceReceiverPolicy)).toBe(true);
            expect(canIOUBePaid(iouReport, chatReport, policy, {}, [], false, undefined, invoiceReceiverPolicy)).toBe(true);

            // When the invoice is archived
            expect(canIOUBePaid(iouReport, chatReport, policy, {}, [], true, chatReportRNVP, invoiceReceiverPolicy)).toBe(false);
            expect(canIOUBePaid(iouReport, chatReport, policy, {}, [], false, chatReportRNVP, invoiceReceiverPolicy)).toBe(false);
        });
    });

    describe('canApproveIOU', () => {
        it('should return false if we have only pending card transactions', async () => {
            const policyID = '2';
            const reportID = '1';
            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            };
            const fakeReport: Report = {
                ...createRandomReport(Number(reportID), undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
            };
            const fakeTransaction1: Transaction = {
                ...createRandomTransaction(0),
                reportID,
                bank: CONST.EXPENSIFY_CARD.BANK,
                status: CONST.TRANSACTION.STATUS.PENDING,
            };
            const fakeTransaction2: Transaction = {
                ...createRandomTransaction(1),
                reportID,
                bank: CONST.EXPENSIFY_CARD.BANK,
                status: CONST.TRANSACTION.STATUS.PENDING,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, fakeReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction1.transactionID}`, fakeTransaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction2.transactionID}`, fakeTransaction2);

            await waitForBatchedUpdates();

            expect(canApproveIOU(fakeReport, fakePolicy, {})).toBeFalsy();
            // Then should return false when passing transactions directly as the fourth parameter instead of relying on Onyx data
            const {result} = renderHook(() => useReportWithTransactionsAndViolations(reportID), {wrapper: OnyxListItemProvider});
            await waitForBatchedUpdatesWithAct();
            expect(canApproveIOU(result.current.at(0) as Report, fakePolicy, {}, result.current.at(1) as Transaction[])).toBeFalsy();
        });
        it('should return false if we have only scanning transactions', async () => {
            const policyID = '2';
            const reportID = '1';
            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            };
            const fakeReport: Report = {
                ...createRandomReport(Number(reportID), undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                managerID: RORY_ACCOUNT_ID,
            };
            const fakeTransaction1: Transaction = {
                ...createRandomTransaction(0),
                reportID,
                amount: 0,
                modifiedAmount: '',
                receipt: {
                    source: 'test',
                    state: CONST.IOU.RECEIPT_STATE.SCANNING,
                },
                merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                modifiedMerchant: undefined,
            };
            const fakeTransaction2: Transaction = {
                ...createRandomTransaction(1),
                reportID,
                amount: 0,
                modifiedAmount: '',
                receipt: {
                    source: 'test',
                    state: CONST.IOU.RECEIPT_STATE.SCANNING,
                },
                merchant: '',
                modifiedMerchant: undefined,
            };

            await Onyx.set(ONYXKEYS.COLLECTION.REPORT, {
                [`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`]: fakeReport,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, fakeReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction1.transactionID}`, fakeTransaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction2.transactionID}`, fakeTransaction2);

            await waitForBatchedUpdates();

            expect(canApproveIOU(fakeReport, fakePolicy, {})).toBeFalsy();
            // Then should return false when passing transactions directly as the fourth parameter instead of relying on Onyx data
            const {result} = renderHook(() => useReportWithTransactionsAndViolations(reportID), {wrapper: OnyxListItemProvider});
            await waitForBatchedUpdatesWithAct();
            expect(canApproveIOU(result.current.at(0) as Report, fakePolicy, {}, result.current.at(1) as Transaction[])).toBeFalsy();
        });
        it('should return false if all transactions are pending card or scanning transaction', async () => {
            const policyID = '2';
            const reportID = '1';
            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            };
            const fakeReport: Report = {
                ...createRandomReport(Number(reportID), undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                managerID: RORY_ACCOUNT_ID,
            };
            const fakeTransaction1: Transaction = {
                ...createRandomTransaction(0),
                reportID,
                bank: CONST.EXPENSIFY_CARD.BANK,
                status: CONST.TRANSACTION.STATUS.PENDING,
            };
            const fakeTransaction2: Transaction = {
                ...createRandomTransaction(1),
                reportID,
                amount: 0,
                modifiedAmount: '',
                receipt: {
                    source: 'test',
                    state: CONST.IOU.RECEIPT_STATE.SCANNING,
                },
                merchant: '',
                modifiedMerchant: undefined,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, fakeReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction1.transactionID}`, fakeTransaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction2.transactionID}`, fakeTransaction2);

            await waitForBatchedUpdates();

            expect(canApproveIOU(fakeReport, fakePolicy, {})).toBeFalsy();
            // Then should return false when passing transactions directly as the fourth parameter instead of relying on Onyx data
            const {result} = renderHook(() => useReportWithTransactionsAndViolations(reportID), {wrapper: OnyxListItemProvider});
            await waitForBatchedUpdatesWithAct();
            expect(canApproveIOU(result.current.at(0) as Report, fakePolicy, {}, result.current.at(1) as Transaction[])).toBeFalsy();
        });
        it('should return true if at least one transaction is not pending card or scanning transaction', async () => {
            const policyID = '2';
            const reportID = '1';
            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            };
            const fakeReport: Report = {
                ...createRandomReport(Number(reportID), undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                managerID: RORY_ACCOUNT_ID,
            };
            const fakeTransaction1: Transaction = {
                ...createRandomTransaction(0),
                reportID,
                bank: CONST.EXPENSIFY_CARD.BANK,
                status: CONST.TRANSACTION.STATUS.PENDING,
            };
            const fakeTransaction2: Transaction = {
                ...createRandomTransaction(1),
                reportID,
                amount: 0,
                receipt: {
                    source: 'test',
                    state: CONST.IOU.RECEIPT_STATE.SCANNING,
                },
                merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                modifiedMerchant: undefined,
            };
            const fakeTransaction3: Transaction = {
                ...createRandomTransaction(2),
                reportID,
                amount: 100,
                status: CONST.TRANSACTION.STATUS.POSTED,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`, fakeReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction1.transactionID}`, fakeTransaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction2.transactionID}`, fakeTransaction2);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction3.transactionID}`, fakeTransaction3);

            await waitForBatchedUpdates();

            expect(canApproveIOU(fakeReport, fakePolicy, {})).toBeTruthy();
            // Then should return true when passing transactions directly as the fourth parameter instead of relying on Onyx data
            const {result} = renderHook(() => useReportWithTransactionsAndViolations(reportID), {wrapper: OnyxListItemProvider});
            await waitForBatchedUpdatesWithAct();
            expect(canApproveIOU(result.current.at(0) as Report, fakePolicy, {}, result.current.at(1) as Transaction[])).toBeTruthy();
        });

        it('should return false if the report is closed', async () => {
            // Given a closed report, a policy, and a transaction
            const policyID = '2';
            const reportID = '1';
            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            };
            const fakeReport: Report = {
                ...createRandomReport(Number(reportID), undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                managerID: RORY_ACCOUNT_ID,
            };
            const fakeTransaction: Transaction = {
                ...createRandomTransaction(1),
            };
            Onyx.multiSet({
                [ONYXKEYS.COLLECTION.REPORT]: fakeReport,
                [ONYXKEYS.COLLECTION.TRANSACTION]: fakeTransaction,
            });
            await waitForBatchedUpdates();
            // Then, canApproveIOU should return false since the report is closed
            expect(canApproveIOU(fakeReport, fakePolicy, {})).toBeFalsy();
            // Then should return false when passing transactions directly as the fourth parameter instead of relying on Onyx data
            expect(canApproveIOU(fakeReport, fakePolicy, {}, [fakeTransaction])).toBeFalsy();
        });
    });

    describe('canUnapproveIOU', () => {
        it('should return false if the report is waiting for a bank account', () => {
            const fakeReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: 'A',
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                isWaitingOnBankAccount: true,
                managerID: RORY_ACCOUNT_ID,
            };
            expect(canUnapproveIOU(fakeReport, undefined)).toBeFalsy();
        });
    });

    describe('canCancelPayment', () => {
        it('should return true if the report is waiting for a bank account', () => {
            // Using ID_FAKE to test the isWaitingOnBankAccount logic without workspace membership concerns
            const fakeReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: CONST.POLICY.ID_FAKE,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                isWaitingOnBankAccount: true,
                managerID: RORY_ACCOUNT_ID,
            };
            expect(canCancelPayment(fakeReport, {accountID: RORY_ACCOUNT_ID}, undefined)).toBeTruthy();
        });
    });

    describe('canIOUBePaid', () => {
        it('should return false if the report has negative total and onlyShowPayElsewhere is false', async () => {
            const policyChat = createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
            const fakePolicy: Policy = {
                ...createRandomPolicy(1),
                id: 'AA',
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                role: CONST.POLICY.ROLE.ADMIN,
            };

            const fakeReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: 'AA',
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                ownerAccountID: CARLOS_ACCOUNT_ID,
                managerID: RORY_ACCOUNT_ID,
                isWaitingOnBankAccount: false,
                total: 100, // positive amount in the DB means negative amount in the UI
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            expect(canIOUBePaid(fakeReport, policyChat, fakePolicy, {}, [], false)).toBeFalsy();
            expect(canIOUBePaid(fakeReport, policyChat, fakePolicy, {}, [], true)).toBeTruthy();
        });

        it('allows admins to mark report with only non-reimbursable expenses as paid (onlyShowPayElsewhere=true)', async () => {
            const policyChat = createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
            const reportID = '999';

            const fakePolicy: Policy = {
                ...createRandomPolicy(1),
                id: 'AA',
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                role: CONST.POLICY.ROLE.ADMIN,
            };

            const fakeReport: Report = {
                ...createRandomReport(Number(reportID), undefined),
                reportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: 'AA',
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                ownerAccountID: CARLOS_ACCOUNT_ID,
                managerID: RORY_ACCOUNT_ID,
                isWaitingOnBankAccount: false,
                total: 100,
                nonReimbursableTotal: 100,
            };

            const onlyNonReimbursableTransactions: Transaction[] = [
                {
                    ...createRandomTransaction(1),
                    reportID,
                    amount: 100,
                    currency: 'USD',
                    reimbursable: false,
                },
            ];

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            expect(canIOUBePaid(fakeReport, policyChat, fakePolicy, {}, [], false)).toBeFalsy();
            expect(canIOUBePaid(fakeReport, policyChat, fakePolicy, {}, onlyNonReimbursableTransactions, false)).toBeFalsy();
            expect(canIOUBePaid(fakeReport, policyChat, fakePolicy, {}, onlyNonReimbursableTransactions, true)).toBeTruthy();
        });

        it('should return false for report with only non-reimbursable expenses when amount is 0 (onlyShowPayElsewhere=true)', async () => {
            const policyChat = createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
            const reportID = '998';

            const fakePolicy: Policy = {
                ...createRandomPolicy(1),
                id: 'AA',
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                role: CONST.POLICY.ROLE.ADMIN,
            };

            const fakeReport: Report = {
                ...createRandomReport(Number(reportID), undefined),
                reportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: 'AA',
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                ownerAccountID: CARLOS_ACCOUNT_ID,
                managerID: RORY_ACCOUNT_ID,
                isWaitingOnBankAccount: false,
                total: 0,
                nonReimbursableTotal: 0,
            };

            const zeroAmountNonReimbursableTransactions: Transaction[] = [
                {
                    ...createRandomTransaction(1),
                    reportID,
                    amount: 0,
                    currency: 'USD',
                    reimbursable: false,
                },
            ];

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);

            expect(canIOUBePaid(fakeReport, policyChat, fakePolicy, {}, zeroAmountNonReimbursableTransactions, false)).toBeFalsy();
            expect(canIOUBePaid(fakeReport, policyChat, fakePolicy, {}, zeroAmountNonReimbursableTransactions, true)).toBeFalsy();
        });
    });

    describe('retractReport', () => {
        it('should restore the chat report iouReportID', async () => {
            // Given a chat report with no iouReportID
            const chatReport: Report = {
                ...createRandomReport(0, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                iouReportID: undefined,
            };
            const policy: OnyxEntry<Policy> = createRandomPolicy(1);

            const expenseReport: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
            };

            // When retracting the submitted expense report
            retractReport(expenseReport, chatReport, policy, 1, 'test@example.com', false, false, undefined, undefined);

            // Then the chat report iouReportID should be set back to the retracted expense report
            const iouReportID = await new Promise<string | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        resolve(report?.iouReportID);
                    },
                });
            });
            expect(iouReportID).toBe(expenseReport.reportID);
        });
    });
    describe('approveMoneyRequest with take control', () => {
        const adminAccountID = 1;
        const managerAccountID = 2;
        const employeeAccountID = 3;
        const seniorManagerAccountID = 4;
        const adminEmail = 'admin@test.com';
        const managerEmail = 'manager@test.com';
        const employeeEmail = 'employee@test.com';
        const seniorManagerEmail = 'seniormanager@test.com';

        let expenseReport: Report;
        let policy: Policy;

        beforeEach(async () => {
            await Onyx.clear();

            // Set up personal details
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [adminAccountID]: {
                    accountID: adminAccountID,
                    login: adminEmail,
                    displayName: 'Admin User',
                },
                [seniorManagerAccountID]: {
                    accountID: seniorManagerAccountID,
                    login: seniorManagerEmail,
                    displayName: 'Senior Manager User',
                },
                [managerAccountID]: {
                    accountID: managerAccountID,
                    login: managerEmail,
                    displayName: 'Manager User',
                },
                [employeeAccountID]: {
                    accountID: employeeAccountID,
                    login: employeeEmail,
                    displayName: 'Employee User',
                },
            });

            // Set up session as admin (who will approve)
            await Onyx.set(ONYXKEYS.SESSION, {
                email: adminEmail,
                accountID: adminAccountID,
            });

            // Create policy with approval hierarchy
            policy = {
                id: '1',
                name: 'Test Policy',
                role: CONST.POLICY.ROLE.ADMIN,
                owner: adminEmail,
                ownerAccountID: adminAccountID,
                outputCurrency: CONST.CURRENCY.USD,
                isPolicyExpenseChatEnabled: true,
                type: CONST.POLICY.TYPE.CORPORATE,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
                employeeList: {
                    [employeeEmail]: {
                        email: employeeEmail,
                        role: CONST.POLICY.ROLE.USER,
                        submitsTo: managerEmail,
                    },
                    [managerEmail]: {
                        email: managerEmail,
                        role: CONST.POLICY.ROLE.USER,
                        forwardsTo: seniorManagerEmail,
                    },
                    [seniorManagerEmail]: {
                        email: seniorManagerEmail,
                        role: CONST.POLICY.ROLE.USER,
                        forwardsTo: adminEmail,
                    },
                    [adminEmail]: {
                        email: adminEmail,
                        role: CONST.POLICY.ROLE.ADMIN,
                        forwardsTo: '',
                    },
                },
            };

            // Create expense report
            expenseReport = {
                reportID: '123',
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: employeeAccountID,
                managerID: managerAccountID,
                policyID: policy.id,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                total: 1000,
                currency: 'USD',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
        });

        afterEach(async () => {
            await Onyx.clear();
        });

        it('should set report to approved when admin takes control and approves', async () => {
            // Admin takes control
            const takeControlAction = {
                reportActionID: 'takeControl1',
                actionName: CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL,
                actorAccountID: adminAccountID,
                created: '2023-01-01T10:00:00.000Z',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`, {
                [takeControlAction.reportActionID]: takeControlAction,
            });

            // Admin approves the report
            approveMoneyRequest({
                expenseReport,
                expenseReportPolicy: policy,
                policy,
                currentUserAccountIDParam: adminAccountID,
                currentUserEmailParam: adminEmail,
                hasViolations: false,
                isASAPSubmitBetaEnabled: false,
                expenseReportCurrentNextStepDeprecated: undefined,
                betas: [CONST.BETAS.ALL],
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
                ownerBillingGracePeriodEnd: undefined,
                delegateEmail: undefined,
            });
            await waitForBatchedUpdates();

            // Should be approved since admin took control and is the last approver
            const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`);
            expect(updatedReport?.stateNum).toBe(CONST.REPORT.STATE_NUM.APPROVED);
            expect(updatedReport?.statusNum).toBe(CONST.REPORT.STATUS_NUM.APPROVED);
        });

        it('should invalidate take control when report is resubmitted after take control', async () => {
            // Admin takes control first
            const takeControlAction = {
                reportActionID: 'takeControl3',
                actionName: CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL,
                actorAccountID: adminAccountID,
                created: '2023-01-01T10:00:00.000Z',
            };

            // Employee resubmits after take control (invalidates it)
            const submittedAction = {
                reportActionID: 'submitted1',
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                actorAccountID: employeeAccountID,
                created: '2023-01-01T11:00:00.000Z', // After take control
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`, {
                [takeControlAction.reportActionID]: takeControlAction,
                [submittedAction.reportActionID]: submittedAction,
            });

            // Set session as manager (normal approver)
            await Onyx.set(ONYXKEYS.SESSION, {
                email: managerEmail,
                accountID: managerAccountID,
            });

            // Manager approves the report
            approveMoneyRequest({
                expenseReport,
                expenseReportPolicy: policy,
                policy,
                currentUserAccountIDParam: managerAccountID,
                currentUserEmailParam: managerEmail,
                hasViolations: false,
                isASAPSubmitBetaEnabled: false,
                expenseReportCurrentNextStepDeprecated: undefined,
                betas: [CONST.BETAS.ALL],
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
                ownerBillingGracePeriodEnd: undefined,
                delegateEmail: undefined,
            });
            await waitForBatchedUpdates();

            // Should be submitted to senior manager (normal flow) since take control was invalidated
            const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`);
            expect(updatedReport?.stateNum).toBe(CONST.REPORT.STATE_NUM.SUBMITTED);
            expect(updatedReport?.statusNum).toBe(CONST.REPORT.STATUS_NUM.SUBMITTED);

            // Get the optimistic next step
            const nextStep = await getOnyxValue(`${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`);

            // The next step message should be defined
            expect(nextStep?.message).toBeDefined();

            // Since take control was invalidated by resubmission, the normal approval chain applies
            // The next step should indicate waiting for the senior manager to approve
            const fullMessage = nextStep?.message?.map((part) => part.text).join('');
            expect(fullMessage).toBe('Waiting for Senior Manager User to approve %expenses.');
        });

        it('should mention an admin to pay expenses in optimistic next step message when admin takes control and approves', async () => {
            // Admin takes control
            const takeControlAction = {
                reportActionID: 'takeControl2',
                actionName: CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL,
                actorAccountID: adminAccountID,
                created: '2023-01-01T10:00:00.000Z',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`, {
                [takeControlAction.reportActionID]: takeControlAction,
            });

            // Admin approves the report
            approveMoneyRequest({
                expenseReport,
                expenseReportPolicy: policy,
                policy,
                currentUserAccountIDParam: adminAccountID,
                currentUserEmailParam: adminEmail,
                hasViolations: false,
                isASAPSubmitBetaEnabled: false,
                expenseReportCurrentNextStepDeprecated: undefined,
                betas: [CONST.BETAS.ALL],
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
                ownerBillingGracePeriodEnd: undefined,
                delegateEmail: undefined,
            });
            await waitForBatchedUpdates();

            // Get the optimistic next step
            const nextStep = await getOnyxValue(`${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`);

            // The next step message should be defined
            expect(nextStep?.message).toBeDefined();

            // Since the report is fully approved when admin takes control and approves,
            // the next step should be about payment, which should mention "you" since the admin is the payer
            // The message should equal "Waiting for you to pay %expenses."
            const fullMessage = nextStep?.message?.map((part) => part.text).join('');
            expect(fullMessage).toBe('Waiting for you to pay %expenses.');
        });
    });

    describe('approveMoneyRequest with normal approval chain', () => {
        const adminAccountID = 1;
        const managerAccountID = 2;
        const employeeAccountID = 3;
        const adminEmail = 'admin@test.com';
        const managerEmail = 'manager@test.com';
        const employeeEmail = 'employee@test.com';

        let expenseReport: Report;
        let policy: Policy;

        beforeEach(async () => {
            await Onyx.clear();

            // Set up personal details
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [adminAccountID]: {
                    accountID: adminAccountID,
                    login: adminEmail,
                    displayName: 'Admin User',
                },
                [managerAccountID]: {
                    accountID: managerAccountID,
                    login: managerEmail,
                    displayName: 'Manager User',
                },
                [employeeAccountID]: {
                    accountID: employeeAccountID,
                    login: employeeEmail,
                    displayName: 'Employee User',
                },
            });

            // Create policy with approval hierarchy
            policy = {
                id: '1',
                name: 'Test Policy',
                role: CONST.POLICY.ROLE.ADMIN,
                owner: adminEmail,
                outputCurrency: CONST.CURRENCY.USD,
                isPolicyExpenseChatEnabled: true,
                type: CONST.POLICY.TYPE.CORPORATE,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                employeeList: {
                    [employeeEmail]: {
                        email: employeeEmail,
                        role: CONST.POLICY.ROLE.USER,
                        submitsTo: managerEmail,
                    },
                    [managerEmail]: {
                        email: managerEmail,
                        role: CONST.POLICY.ROLE.USER,
                        submitsTo: adminEmail,
                        forwardsTo: adminEmail,
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
            expenseReport = {
                reportID: '123',
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: employeeAccountID,
                managerID: managerAccountID,
                policyID: policy.id,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                total: 1000,
                currency: 'USD',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
        });

        afterEach(async () => {
            await Onyx.clear();
        });

        it('should follow normal approval chain when manager approves without take control', async () => {
            // Set session as manager (first approver in the chain)
            await Onyx.set(ONYXKEYS.SESSION, {
                email: managerEmail,
                accountID: managerAccountID,
            });

            // Manager approves the report (no take control actions)
            approveMoneyRequest({
                expenseReport,
                expenseReportPolicy: policy,
                policy,
                currentUserAccountIDParam: managerAccountID,
                currentUserEmailParam: managerEmail,
                hasViolations: false,
                isASAPSubmitBetaEnabled: false,
                expenseReportCurrentNextStepDeprecated: undefined,
                betas: [CONST.BETAS.ALL],
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
                ownerBillingGracePeriodEnd: undefined,
                delegateEmail: undefined,
            });
            await waitForBatchedUpdates();

            // Should be submitted to admin (next in approval chain) since manager is not the final approver
            const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`);
            expect(updatedReport?.stateNum).toBe(CONST.REPORT.STATE_NUM.SUBMITTED);
            expect(updatedReport?.statusNum).toBe(CONST.REPORT.STATUS_NUM.SUBMITTED);
            expect(updatedReport?.managerID).toBe(adminAccountID); // Should be forwarded to admin
        });

        it('should handle multi-step approval chain correctly', async () => {
            // First, manager approves
            await Onyx.set(ONYXKEYS.SESSION, {
                email: managerEmail,
                accountID: managerAccountID,
            });

            approveMoneyRequest({
                expenseReport,
                expenseReportPolicy: policy,
                policy,
                currentUserAccountIDParam: managerAccountID,
                currentUserEmailParam: managerEmail,
                hasViolations: false,
                isASAPSubmitBetaEnabled: false,
                expenseReportCurrentNextStepDeprecated: undefined,
                betas: [CONST.BETAS.ALL],
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
                ownerBillingGracePeriodEnd: undefined,
                delegateEmail: undefined,
            });
            await waitForBatchedUpdates();

            // Should be submitted to admin
            let updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`);
            expect(updatedReport?.stateNum).toBe(CONST.REPORT.STATE_NUM.SUBMITTED);
            expect(updatedReport?.statusNum).toBe(CONST.REPORT.STATUS_NUM.SUBMITTED);
            expect(updatedReport?.managerID).toBe(adminAccountID);

            // Then, admin approves
            await Onyx.set(ONYXKEYS.SESSION, {
                email: adminEmail,
                accountID: adminAccountID,
            });

            approveMoneyRequest({
                expenseReport: updatedReport,
                expenseReportPolicy: policy,
                policy,
                currentUserAccountIDParam: adminAccountID,
                currentUserEmailParam: adminEmail,
                hasViolations: false,
                isASAPSubmitBetaEnabled: false,
                expenseReportCurrentNextStepDeprecated: undefined,
                betas: [CONST.BETAS.ALL],
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
                ownerBillingGracePeriodEnd: undefined,
                delegateEmail: undefined,
            });
            await waitForBatchedUpdates();

            // Should be fully approved
            updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`);
            expect(updatedReport?.stateNum).toBe(CONST.REPORT.STATE_NUM.APPROVED);
            expect(updatedReport?.statusNum).toBe(CONST.REPORT.STATUS_NUM.APPROVED);
        });

        it('should fully approve report when single approver approves', async () => {
            // Create a policy with only one approver in the chain
            const singleApproverPolicy: Policy = {
                ...policy,
                employeeList: {
                    [employeeEmail]: {
                        email: employeeEmail,
                        role: CONST.POLICY.ROLE.USER,
                        submitsTo: managerEmail,
                    },
                    [managerEmail]: {
                        email: managerEmail,
                        role: CONST.POLICY.ROLE.ADMIN,
                        submitsTo: '',
                        forwardsTo: '',
                    },
                },
            };

            // Create expense report with manager as the only approver
            const singleApproverReport: Report = {
                ...expenseReport,
                reportID: '456',
                managerID: managerAccountID,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${singleApproverPolicy.id}`, singleApproverPolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${singleApproverReport.reportID}`, singleApproverReport);

            // Set session as the single approver (manager)
            await Onyx.set(ONYXKEYS.SESSION, {
                email: managerEmail,
                accountID: managerAccountID,
            });

            // Manager approves the report
            approveMoneyRequest({
                expenseReport: singleApproverReport,
                expenseReportPolicy: singleApproverPolicy,
                policy: singleApproverPolicy,
                currentUserAccountIDParam: managerAccountID,
                currentUserEmailParam: managerEmail,
                hasViolations: false,
                isASAPSubmitBetaEnabled: false,
                expenseReportCurrentNextStepDeprecated: undefined,
                betas: [CONST.BETAS.ALL],
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
                ownerBillingGracePeriodEnd: undefined,
                delegateEmail: undefined,
            });
            await waitForBatchedUpdates();

            // Should be fully approved since manager is the final approver in the chain
            const updatedReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${singleApproverReport.reportID}`);
            expect(updatedReport?.stateNum).toBe(CONST.REPORT.STATE_NUM.APPROVED);
            expect(updatedReport?.statusNum).toBe(CONST.REPORT.STATUS_NUM.APPROVED);
        });
    });

    describe('approveMoneyRequest partially', () => {
        const adminAccountID = 1;
        const employeeAccountID = 3;
        const adminEmail = 'admin@test.com';
        const employeeEmail = 'employee@test.com';

        let expenseReport: Report;
        let policy: Policy;
        let chatReport: Report;
        beforeEach(async () => {
            await Onyx.clear();

            // Set up personal details
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

            // Create policy with approval required
            policy = {
                id: '1',
                name: 'Test Policy',
                role: CONST.POLICY.ROLE.ADMIN,
                owner: adminEmail,
                outputCurrency: CONST.CURRENCY.USD,
                isPolicyExpenseChatEnabled: true,
                type: CONST.POLICY.TYPE.CORPORATE,
                approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
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
            expenseReport = {
                reportID: '123',
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: employeeAccountID,
                managerID: adminAccountID,
                policyID: policy.id,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                total: 1000,
                currency: 'USD',
                parentReportID: '456',
                chatReportID: '456',
            };

            chatReport = {
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
        });

        afterEach(async () => {
            await Onyx.clear();
        });

        it('the new expense report should be an outstanding report when approving partially', async () => {
            await Onyx.set(ONYXKEYS.SESSION, {
                email: adminEmail,
                accountID: adminAccountID,
            });

            const newExpenseReportID = approveMoneyRequest({
                expenseReport,
                expenseReportPolicy: policy,
                policy,
                currentUserAccountIDParam: adminAccountID,
                currentUserEmailParam: adminEmail,
                hasViolations: false,
                isASAPSubmitBetaEnabled: false,
                expenseReportCurrentNextStepDeprecated: undefined,
                betas: [CONST.BETAS.ALL],
                userBillingGracePeriodEnds: undefined,
                amountOwed: 0,
                full: false,
                ownerBillingGracePeriodEnd: undefined,
                delegateEmail: undefined,
            });
            await waitForBatchedUpdates();

            const newExpenseReport = await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${newExpenseReportID}`);
            expect(newExpenseReport?.stateNum).toBe(CONST.REPORT.STATE_NUM.SUBMITTED);
            expect(newExpenseReport?.statusNum).toBe(CONST.REPORT.STATUS_NUM.SUBMITTED);
        });
    });

    describe('getReportOriginalCreationTimestamp', () => {
        it('should return undefined when report is undefined', () => {
            const result = getReportOriginalCreationTimestamp(undefined);
            expect(result).toBeUndefined();
        });

        it('should return timestamp from CREATED action when it exists', async () => {
            const createdTimestamp = '2024-01-15 12:00:00.000';
            const report = createRandomReport(1, undefined);
            const reportAction1 = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: createdTimestamp,
            };
            const reportAction2 = {
                ...createRandomReportAction(2),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            };
            const reportAction3 = {
                ...createRandomReportAction(3),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            };

            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`]: {
                    [reportAction1.reportActionID]: reportAction1,
                    [reportAction2.reportActionID]: reportAction2,
                    [reportAction3.reportActionID]: reportAction3,
                },
            } as unknown as OnyxMultiSetInput);
            await waitForBatchedUpdates();

            const result = getReportOriginalCreationTimestamp(report);
            expect(result).toBe(createdTimestamp);
        });

        it('should return report.created when CREATED action does not exist', async () => {
            const reportCreatedTimestamp = '2024-01-15 10:00:00.000';
            const report = {
                ...createRandomReport(1, undefined),
                created: reportCreatedTimestamp,
            };
            const reportAction1 = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            };

            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`]: {
                    [reportAction1.reportActionID]: reportAction1,
                },
            } as unknown as OnyxMultiSetInput);
            await waitForBatchedUpdates();

            const result = getReportOriginalCreationTimestamp(report);
            expect(result).toBe(reportCreatedTimestamp);
        });
    });

    describe('getIOUReportActionWithBadge', () => {
        it('should exclude deleted actions', async () => {
            const chatReportID = '1';
            const iouReportID = '2';
            const policyID = '3';
            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                id: policyID,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                type: CONST.POLICY.TYPE.TEAM,
            };

            const fakeChatReport: Report = {
                ...createRandomReport(Number(chatReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: chatReportID,
                policyID,
            };

            const fakeIouReport: Report = {
                ...createRandomReport(Number(iouReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: iouReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                managerID: RORY_ACCOUNT_ID,
            };

            const fakeTransaction: Transaction = {
                ...createRandomTransaction(0),
                reportID: iouReportID,
                amount: 100,
                status: CONST.TRANSACTION.STATUS.POSTED,
                bank: '',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, fakeChatReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, fakeIouReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction.transactionID}`, fakeTransaction);

            const deletedReportAction = {
                reportActionID: '0',
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                created: '2024-08-08 18:00:00.000',
                childReportID: iouReportID,
            };

            const validReportAction = {
                reportActionID: iouReportID,
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                created: '2024-08-08 19:00:00.000',
                childReportID: iouReportID,
                message: [
                    {
                        type: 'TEXT',
                        text: 'Hello world!',
                    },
                ],
            };

            const MOCK_REPORT_ACTIONS: ReportActions = {
                [deletedReportAction.reportActionID]: deletedReportAction,
                [validReportAction.reportActionID]: validReportAction,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`, MOCK_REPORT_ACTIONS);
            await waitForBatchedUpdates();

            const result = getIOUReportActionWithBadge(fakeChatReport, fakePolicy, {}, undefined);
            expect(result.reportAction).toMatchObject(validReportAction);
            expect(result.actionBadge).toBe(CONST.REPORT.ACTION_BADGE.APPROVE);
        });

        it('should return APPROVE actionBadge for submitted expense report when user is manager', async () => {
            const chatReportID = '100';
            const iouReportID = '101';
            const policyID = '102';

            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                id: policyID,
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            };

            const fakeChatReport: Report = {
                ...createRandomReport(Number(chatReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: chatReportID,
                policyID,
            };

            const fakeIouReport: Report = {
                ...createRandomReport(Number(iouReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: iouReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                managerID: RORY_ACCOUNT_ID,
            };

            const fakeTransaction: Transaction = {
                ...createRandomTransaction(0),
                reportID: iouReportID,
                amount: 100,
                status: CONST.TRANSACTION.STATUS.POSTED,
                bank: '',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, fakeChatReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, fakeIouReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction.transactionID}`, fakeTransaction);

            const reportPreviewAction = {
                reportActionID: iouReportID,
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                created: '2024-08-08 19:00:00.000',
                childReportID: iouReportID,
                message: [{type: 'TEXT', text: 'Report preview'}],
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`, {
                [reportPreviewAction.reportActionID]: reportPreviewAction,
            });
            await waitForBatchedUpdates();

            const result = getIOUReportActionWithBadge(fakeChatReport, fakePolicy, {}, undefined);
            expect(result.reportAction).toMatchObject(reportPreviewAction);
            expect(result.actionBadge).toBe(CONST.REPORT.ACTION_BADGE.APPROVE);
        });

        it('should return PAY actionBadge for approved expense report when user is payer', async () => {
            const chatReportID = '200';
            const iouReportID = '201';
            const policyID = '202';

            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                id: policyID,
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                role: CONST.POLICY.ROLE.ADMIN,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
            };

            const fakeChatReport: Report = {
                ...createRandomReport(Number(chatReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: chatReportID,
                policyID,
            };

            const fakeIouReport: Report = {
                ...createRandomReport(Number(iouReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: iouReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                managerID: RORY_ACCOUNT_ID,
                total: -10000,
                nonReimbursableTotal: 0,
                isWaitingOnBankAccount: false,
            };

            const fakeTransaction: Transaction = {
                ...createRandomTransaction(0),
                reportID: iouReportID,
                amount: 100,
                status: CONST.TRANSACTION.STATUS.POSTED,
                bank: '',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, fakeChatReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, fakeIouReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction.transactionID}`, fakeTransaction);

            const reportPreviewAction = {
                reportActionID: iouReportID,
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                created: '2024-08-08 19:00:00.000',
                childReportID: iouReportID,
                message: [{type: 'TEXT', text: 'Report preview'}],
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`, {
                [reportPreviewAction.reportActionID]: reportPreviewAction,
            });
            await waitForBatchedUpdates();

            const result = getIOUReportActionWithBadge(fakeChatReport, fakePolicy, {}, undefined);
            expect(result.reportAction).toMatchObject(reportPreviewAction);
            expect(result.actionBadge).toBe(CONST.REPORT.ACTION_BADGE.PAY);
        });

        it('should return SUBMIT actionBadge for open report waiting for submission', async () => {
            const chatReportID = '300';
            const iouReportID = '301';
            const policyID = '302';

            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                id: policyID,
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                role: CONST.POLICY.ROLE.USER,
                harvesting: {enabled: false},
            };

            const fakeChatReport: Report = {
                ...createRandomReport(Number(chatReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: chatReportID,
                policyID,
                isOwnPolicyExpenseChat: true,
            };

            const fakeIouReport: Report = {
                ...createRandomReport(Number(iouReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: iouReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                ownerAccountID: RORY_ACCOUNT_ID,
                managerID: RORY_ACCOUNT_ID,
            };

            const fakeTransaction: Transaction = {
                ...createRandomTransaction(0),
                reportID: iouReportID,
                amount: 100,
                status: CONST.TRANSACTION.STATUS.POSTED,
                bank: '',
                merchant: 'TestMerchant',
                modifiedMerchant: 'TestMerchant',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, fakeChatReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, fakeIouReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction.transactionID}`, fakeTransaction);

            const reportPreviewAction = {
                reportActionID: iouReportID,
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                created: '2024-08-08 19:00:00.000',
                childReportID: iouReportID,
                message: [{type: 'TEXT', text: 'Report preview'}],
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`, {
                [reportPreviewAction.reportActionID]: reportPreviewAction,
            });
            await waitForBatchedUpdates();

            const result = getIOUReportActionWithBadge(fakeChatReport, fakePolicy, {}, undefined);
            expect(result.reportAction).toMatchObject(reportPreviewAction);
            expect(result.actionBadge).toBe(CONST.REPORT.ACTION_BADGE.SUBMIT);
        });

        it('should return PAY badge for negative expense (credit) via onlyShowPayElsewhere path', async () => {
            const chatReportID = '500';
            const iouReportID = '501';
            const policyID = '502';

            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                id: policyID,
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                role: CONST.POLICY.ROLE.ADMIN,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
            };

            const fakeChatReport: Report = {
                ...createRandomReport(Number(chatReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: chatReportID,
                policyID,
            };

            // For a negative/credit expense, total is positive on expense reports
            // getMoneyRequestSpendBreakdown flips sign: reimbursableSpend = -total = -5000 (negative)
            // The first canIOUBePaid call (onlyShowPayElsewhere=false) returns false because reimbursableSpend < 0
            // The second canIOUBePaid call (onlyShowPayElsewhere=true) returns true via canShowMarkedAsPaidForNegativeAmount
            const fakeIouReport: Report = {
                ...createRandomReport(Number(iouReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: iouReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                managerID: RORY_ACCOUNT_ID,
                total: 5000,
                nonReimbursableTotal: 0,
                isWaitingOnBankAccount: false,
            };

            const fakeTransaction: Transaction = {
                ...createRandomTransaction(0),
                reportID: iouReportID,
                amount: 100,
                status: CONST.TRANSACTION.STATUS.POSTED,
                bank: '',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, fakeChatReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, fakeIouReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction.transactionID}`, fakeTransaction);

            const reportPreviewAction = {
                reportActionID: iouReportID,
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                created: '2024-08-08 19:00:00.000',
                childReportID: iouReportID,
                message: [{type: 'TEXT', text: 'Report preview'}],
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`, {
                [reportPreviewAction.reportActionID]: reportPreviewAction,
            });
            await waitForBatchedUpdates();

            const result = getIOUReportActionWithBadge(fakeChatReport, fakePolicy, {}, undefined);
            expect(result.reportAction).toMatchObject(reportPreviewAction);
            expect(result.actionBadge).toBe(CONST.REPORT.ACTION_BADGE.PAY);
        });

        it('should return undefined actionBadge for REIMBURSEMENT_NO policy with non-SUBMITTED status', async () => {
            const chatReportID = '600';
            const iouReportID = '601';
            const policyID = '602';

            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                id: policyID,
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                role: CONST.POLICY.ROLE.ADMIN,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO,
            };

            const fakeChatReport: Report = {
                ...createRandomReport(Number(chatReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: chatReportID,
                policyID,
            };

            // REIMBURSEMENT_NO + APPROVED (not SUBMITTED):
            // First canIOUBePaid call (onlyShowPayElsewhere=false) returns false (early-exit for REIMBURSEMENT_NO)
            // Second canIOUBePaid call (onlyShowPayElsewhere=true) also returns false (statusNum !== SUBMITTED)
            // So no PAY badge is shown
            const fakeIouReport: Report = {
                ...createRandomReport(Number(iouReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: iouReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                managerID: RORY_ACCOUNT_ID,
                total: -5000,
                nonReimbursableTotal: 0,
                isWaitingOnBankAccount: false,
            };

            const fakeTransaction: Transaction = {
                ...createRandomTransaction(0),
                reportID: iouReportID,
                amount: 100,
                status: CONST.TRANSACTION.STATUS.POSTED,
                bank: '',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, fakeChatReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, fakeIouReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction.transactionID}`, fakeTransaction);

            const reportPreviewAction = {
                reportActionID: iouReportID,
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                created: '2024-08-08 19:00:00.000',
                childReportID: iouReportID,
                message: [{type: 'TEXT', text: 'Report preview'}],
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`, {
                [reportPreviewAction.reportActionID]: reportPreviewAction,
            });
            await waitForBatchedUpdates();

            const result = getIOUReportActionWithBadge(fakeChatReport, fakePolicy, {}, undefined);
            expect(result.reportAction).toBeUndefined();
            expect(result.actionBadge).toBeUndefined();
        });

        it('should return undefined actionBadge when report is settled', async () => {
            const chatReportID = '400';
            const iouReportID = '401';
            const policyID = '402';

            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                id: policyID,
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            };

            const fakeChatReport: Report = {
                ...createRandomReport(Number(chatReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: chatReportID,
                policyID,
            };

            // Settled (reimbursed) report — can't pay, can't approve, can't submit
            const fakeIouReport: Report = {
                ...createRandomReport(Number(iouReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: iouReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                managerID: RORY_ACCOUNT_ID,
            };

            const fakeTransaction: Transaction = {
                ...createRandomTransaction(0),
                reportID: iouReportID,
                amount: 100,
                status: CONST.TRANSACTION.STATUS.POSTED,
                bank: '',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, fakeChatReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, fakeIouReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction.transactionID}`, fakeTransaction);

            const reportPreviewAction = {
                reportActionID: iouReportID,
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                created: '2024-08-08 19:00:00.000',
                childReportID: iouReportID,
                message: [{type: 'TEXT', text: 'Report preview'}],
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`, {
                [reportPreviewAction.reportActionID]: reportPreviewAction,
            });
            await waitForBatchedUpdates();

            const result = getIOUReportActionWithBadge(fakeChatReport, fakePolicy, {}, undefined);
            expect(result.reportAction).toBeUndefined();
            expect(result.actionBadge).toBeUndefined();
        });
    });

    describe('getBadgeFromIOUReport', () => {
        it('should return APPROVE badge for submitted expense report when user is manager', async () => {
            const iouReportID = '1100';
            const chatReportID = '1101';
            const policyID = '1102';

            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                id: policyID,
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            };

            const fakeChatReport: Report = {
                ...createRandomReport(Number(chatReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: chatReportID,
                policyID,
            };

            const fakeIouReport: Report = {
                ...createRandomReport(Number(iouReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: iouReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                managerID: RORY_ACCOUNT_ID,
            };

            const fakeTransaction: Transaction = {
                ...createRandomTransaction(0),
                reportID: iouReportID,
                amount: 100,
                status: CONST.TRANSACTION.STATUS.POSTED,
                bank: '',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, fakeChatReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, fakeIouReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction.transactionID}`, fakeTransaction);
            await waitForBatchedUpdates();

            const result = getBadgeFromIOUReport(fakeIouReport, fakeChatReport, fakePolicy, {}, undefined);
            expect(result).toBe(CONST.REPORT.ACTION_BADGE.APPROVE);
        });

        it('should return PAY badge for approved expense report when user is payer', async () => {
            const iouReportID = '1200';
            const chatReportID = '1201';
            const policyID = '1202';

            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                id: policyID,
                type: CONST.POLICY.TYPE.TEAM,
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                role: CONST.POLICY.ROLE.ADMIN,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
            };

            const fakeChatReport: Report = {
                ...createRandomReport(Number(chatReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: chatReportID,
                policyID,
            };

            const fakeIouReport: Report = {
                ...createRandomReport(Number(iouReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: iouReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                managerID: RORY_ACCOUNT_ID,
                total: -10000,
                nonReimbursableTotal: 0,
                isWaitingOnBankAccount: false,
            };

            const fakeTransaction: Transaction = {
                ...createRandomTransaction(0),
                reportID: iouReportID,
                amount: 100,
                status: CONST.TRANSACTION.STATUS.POSTED,
                bank: '',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, fakeChatReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, fakeIouReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${fakeTransaction.transactionID}`, fakeTransaction);
            await waitForBatchedUpdates();

            const result = getBadgeFromIOUReport(fakeIouReport, fakeChatReport, fakePolicy, {}, undefined);
            expect(result).toBe(CONST.REPORT.ACTION_BADGE.PAY);
        });

        it('should return undefined badge for settled report', async () => {
            const iouReportID = '1300';
            const chatReportID = '1301';
            const policyID = '1302';

            const fakePolicy: Policy = {
                ...createRandomPolicy(Number(policyID)),
                id: policyID,
                type: CONST.POLICY.TYPE.TEAM,
            };

            const fakeChatReport: Report = {
                ...createRandomReport(Number(chatReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: chatReportID,
                policyID,
            };

            const fakeIouReport: Report = {
                ...createRandomReport(Number(iouReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                reportID: iouReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                managerID: RORY_ACCOUNT_ID,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, fakeChatReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, fakeIouReport);
            await waitForBatchedUpdates();

            const result = getBadgeFromIOUReport(fakeIouReport, fakeChatReport, fakePolicy, {}, undefined);
            expect(result).toBeUndefined();
        });
    });
});
