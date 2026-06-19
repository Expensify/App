import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {getIsP2PForAmount, getReportOrReportDraftForAmount, submitAmount} from '@pages/iou/request/step/AmountSubmission';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Policy, Report, Transaction} from '@src/types/onyx';
import {createRandomReport} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CURRENT_USER_ACCOUNT_ID = 5;
const OTHER_USER_ACCOUNT_ID = 10;

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((cb: () => void) => cb()),
    dismissModal: jest.fn(),
    revealRouteBeforeDismissingModal: jest.fn(),
    navigationRef: {
        getCurrentRoute: jest.fn(() => undefined),
        getRootState: jest.fn(() => ({})),
    },
}));

// Run the executeWrite callback synchronously so we can assert on what the handler ultimately invokes.
jest.mock('@libs/Navigation/helpers/submitWithDismissFirst', () => ({
    submitWithDismissFirst: jest.fn(({executeWrite}: {executeWrite: (overrides: {shouldHandleNavigation: boolean}) => void}) => {
        executeWrite({shouldHandleNavigation: false});
    }),
}));

jest.mock('@libs/Navigation/helpers/cleanupAfterSkipConfirmSubmit', () => jest.fn());

const mockSendMoneyElsewhere = jest.fn();
const mockSendMoneyWithWallet = jest.fn();
jest.mock('@userActions/IOU/SendMoney', () => ({
    sendMoneyElsewhere: (...args: unknown[]): void => {
        mockSendMoneyElsewhere(...args);
    },
    sendMoneyWithWallet: (...args: unknown[]): void => {
        mockSendMoneyWithWallet(...args);
    },
}));

const mockTrackExpense = jest.fn();
const mockRequestMoney = jest.fn();
jest.mock('@userActions/IOU/TrackExpense', () => ({
    trackExpense: (...args: unknown[]): void => {
        mockTrackExpense(...args);
    },
    requestMoney: (...args: unknown[]): void => {
        mockRequestMoney(...args);
    },
}));

const mockSetDraftSplitTransaction = jest.fn();
jest.mock('@userActions/IOU/Split', () => ({
    setDraftSplitTransaction: (...args: unknown[]): void => {
        mockSetDraftSplitTransaction(...args);
    },
    setSplitShares: jest.fn(),
    resetSplitShares: jest.fn(),
}));

const mockUpdateMoneyRequestAmountAndCurrency = jest.fn();
jest.mock('@userActions/IOU/UpdateMoneyRequest', () => ({
    updateMoneyRequestAmountAndCurrency: (...args: unknown[]): void => {
        mockUpdateMoneyRequestAmountAndCurrency(...args);
    },
}));

jest.mock('@userActions/IOU/MoneyRequest', () => {
    const actual = jest.requireActual<Record<string, unknown>>('@userActions/IOU/MoneyRequest');
    return {
        ...actual,
        setMoneyRequestAmount: jest.fn(),
        setMoneyRequestParticipantsFromReport: jest.fn(() => Promise.resolve()),
        setMoneyRequestTaxAmount: jest.fn(),
        setMoneyRequestTaxRate: jest.fn(),
    };
});

const mockSetTransactionReport = jest.fn();
jest.mock('@userActions/Transaction', () => ({
    setTransactionReport: (...args: unknown[]): void => {
        mockSetTransactionReport(...args);
    },
}));

describe('AmountSubmission', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('getReportOrReportDraftForAmount', () => {
        it('returns undefined when reportID is undefined', () => {
            expect(getReportOrReportDraftForAmount(undefined)).toBeUndefined();
        });

        it('returns undefined when reportID is an empty string', () => {
            expect(getReportOrReportDraftForAmount('')).toBeUndefined();
        });

        it('returns the report from COLLECTION.REPORT when it exists', async () => {
            const reportID = 'report-1';
            const testReport: Report = {...createRandomReport(1, undefined), reportID};
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, testReport);
            await waitForBatchedUpdates();

            const result = getReportOrReportDraftForAmount(reportID);
            expect(result?.reportID).toBe(reportID);
        });

        it('falls back to COLLECTION.REPORT_DRAFT when not in REPORT', async () => {
            const reportID = 'draft-1';
            const draftReport: Report = {...createRandomReport(2, undefined), reportID};
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`, draftReport);
            await waitForBatchedUpdates();

            const result = getReportOrReportDraftForAmount(reportID);
            expect(result?.reportID).toBe(reportID);
        });

        it('prefers COLLECTION.REPORT over COLLECTION.REPORT_DRAFT when both have the reportID', async () => {
            const reportID = 'both-1';
            const realReport: Report = {...createRandomReport(3, undefined), reportID, reportName: 'real'};
            const draftReport: Report = {...createRandomReport(4, undefined), reportID, reportName: 'draft'};
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, realReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`, draftReport);
            await waitForBatchedUpdates();

            const result = getReportOrReportDraftForAmount(reportID);
            expect(result?.reportName).toBe('real');
        });

        it('returns undefined when neither collection has the reportID', () => {
            expect(getReportOrReportDraftForAmount('nonexistent')).toBeUndefined();
        });
    });

    describe('getIsP2PForAmount', () => {
        it('returns true for a P2P chat with another participant', () => {
            const p2pChat: Report = {
                ...createRandomReport(11, undefined),
                participants: {
                    [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [OTHER_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            const result = getIsP2PForAmount({chatReportForP2P: p2pChat, currentUserAccountID: CURRENT_USER_ACCOUNT_ID});
            expect(result).toBe(true);
        });

        it('returns false for a self-DM', () => {
            const selfDMChat: Report = createRandomReport(12, CONST.REPORT.CHAT_TYPE.SELF_DM);

            const result = getIsP2PForAmount({chatReportForP2P: selfDMChat, currentUserAccountID: CURRENT_USER_ACCOUNT_ID});
            expect(result).toBe(false);
        });

        it('returns false for a policy expense chat', () => {
            const policyExpenseChat: Report = createRandomReport(13, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);

            const result = getIsP2PForAmount({chatReportForP2P: policyExpenseChat, currentUserAccountID: CURRENT_USER_ACCOUNT_ID});
            expect(result).toBe(false);
        });

        it('returns false when chatReportForP2P is undefined', () => {
            const result = getIsP2PForAmount({chatReportForP2P: undefined, currentUserAccountID: CURRENT_USER_ACCOUNT_ID});
            expect(result).toBe(false);
        });

        it('returns false when the chat report only contains the current user as participant', () => {
            const soloReport: Report = {
                ...createRandomReport(14, undefined),
                participants: {
                    [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            const result = getIsP2PForAmount({chatReportForP2P: soloReport, currentUserAccountID: CURRENT_USER_ACCOUNT_ID});
            expect(result).toBe(false);
        });
    });

    describe('submitAmount', () => {
        const buildBaseArgs = (overrides: Partial<Parameters<typeof submitAmount>[0]> = {}): Parameters<typeof submitAmount>[0] => {
            const baseReport: Report = {
                ...createRandomReport(100, undefined),
                reportID: 'report-100',
                participants: {
                    [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [OTHER_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };
            const currentUserPersonalDetails: PersonalDetails = {
                accountID: CURRENT_USER_ACCOUNT_ID,
                login: 'me@test.com',
                localCurrencyCode: CONST.CURRENCY.USD,
            };
            return {
                report: baseReport,
                transaction: undefined,
                splitDraftTransaction: undefined,
                policy: undefined,
                selectedCurrency: CONST.CURRENCY.USD,
                decimals: 2,
                iouType: CONST.IOU.TYPE.SUBMIT,
                transactionID: 'tx-1',
                reportID: 'report-100',
                action: CONST.IOU.ACTION.CREATE,
                backTo: undefined,
                backToReport: undefined,
                shouldKeepUserInput: false,
                shouldSkipConfirmation: false,
                isReportArchived: false,
                currentUserPersonalDetails,
                delegateAccountID: undefined,
                selfDMReport: undefined,
                defaultExpensePolicy: undefined,
                personalPolicy: undefined,
                navigateBack: jest.fn(),
                amount: '10',
                paymentMethod: undefined,
                ...overrides,
            };
        };

        beforeEach(() => {
            mockSendMoneyElsewhere.mockClear();
            mockSendMoneyWithWallet.mockClear();
            mockTrackExpense.mockClear();
            mockRequestMoney.mockClear();
            mockSetDraftSplitTransaction.mockClear();
            mockUpdateMoneyRequestAmountAndCurrency.mockClear();
            mockSetTransactionReport.mockClear();
        });

        it('calls sendMoneyElsewhere on non-edit + skip-confirm + PAY (non-wallet)', () => {
            submitAmount(
                buildBaseArgs({
                    iouType: CONST.IOU.TYPE.PAY,
                    shouldSkipConfirmation: true,
                    paymentMethod: undefined,
                }),
            );

            expect(mockSendMoneyElsewhere).toHaveBeenCalledTimes(1);
            expect(mockSendMoneyWithWallet).not.toHaveBeenCalled();
        });

        it('calls sendMoneyWithWallet on non-edit + skip-confirm + PAY + EXPENSIFY payment method', () => {
            submitAmount(
                buildBaseArgs({
                    iouType: CONST.IOU.TYPE.PAY,
                    shouldSkipConfirmation: true,
                    paymentMethod: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                }),
            );

            expect(mockSendMoneyWithWallet).toHaveBeenCalledTimes(1);
            expect(mockSendMoneyElsewhere).not.toHaveBeenCalled();
        });

        it('calls trackExpense on non-edit + skip-confirm + TRACK', () => {
            submitAmount(
                buildBaseArgs({
                    iouType: CONST.IOU.TYPE.TRACK,
                    shouldSkipConfirmation: true,
                }),
            );

            expect(mockTrackExpense).toHaveBeenCalledTimes(1);
        });

        it('calls requestMoney on non-edit + skip-confirm + SUBMIT', () => {
            submitAmount(
                buildBaseArgs({
                    iouType: CONST.IOU.TYPE.SUBMIT,
                    shouldSkipConfirmation: true,
                }),
            );

            expect(mockRequestMoney).toHaveBeenCalledTimes(1);
        });

        it('calls requestMoney on non-edit + skip-confirm + REQUEST', () => {
            submitAmount(
                buildBaseArgs({
                    iouType: CONST.IOU.TYPE.REQUEST,
                    shouldSkipConfirmation: true,
                }),
            );

            expect(mockRequestMoney).toHaveBeenCalledTimes(1);
        });

        it('calls setTransactionReport when CREATE iouType + no report context + default expense policy applies', () => {
            const defaultExpensePolicy: OnyxEntry<Policy> = {
                id: 'policy-1',
                type: CONST.POLICY.TYPE.TEAM,
                role: CONST.POLICY.ROLE.ADMIN,
                name: 'Test Workspace',
                owner: 'me@test.com',
                outputCurrency: CONST.CURRENCY.USD,
                isPolicyExpenseChatEnabled: true,
                autoReporting: false,
            } as Policy;

            submitAmount(
                buildBaseArgs({
                    iouType: CONST.IOU.TYPE.CREATE,
                    report: undefined,
                    transaction: undefined,
                    defaultExpensePolicy,
                }),
            );

            expect(mockSetTransactionReport).toHaveBeenCalledTimes(1);
        });

        it('navigateBack is called on edit when amount and currency are unchanged', () => {
            const navigateBack = jest.fn();
            const tx: Transaction = {
                transactionID: 'tx-1',
                amount: -1000,
                currency: CONST.CURRENCY.USD,
                created: '2024-01-01',
                merchant: 'Test',
                reportID: 'report-100',
                comment: {},
            };

            submitAmount(
                buildBaseArgs({
                    action: CONST.IOU.ACTION.EDIT,
                    transaction: tx,
                    selectedCurrency: CONST.CURRENCY.USD,
                    amount: '10',
                    navigateBack,
                }),
            );

            expect(navigateBack).toHaveBeenCalledTimes(1);
            expect(mockUpdateMoneyRequestAmountAndCurrency).not.toHaveBeenCalled();
        });

        it('calls setDraftSplitTransaction on edit + split bill', () => {
            const splitDraft: Transaction = {
                transactionID: 'split-1',
                amount: -1000,
                currency: CONST.CURRENCY.USD,
                created: '2024-01-01',
                merchant: 'Test',
                reportID: 'report-100',
                comment: {},
            };

            submitAmount(
                buildBaseArgs({
                    action: CONST.IOU.ACTION.EDIT,
                    iouType: CONST.IOU.TYPE.SPLIT,
                    transaction: splitDraft,
                    splitDraftTransaction: splitDraft,
                    selectedCurrency: CONST.CURRENCY.USD,
                    amount: '25',
                }),
            );

            expect(mockSetDraftSplitTransaction).toHaveBeenCalledTimes(1);
            expect(mockUpdateMoneyRequestAmountAndCurrency).not.toHaveBeenCalled();
        });

        it('calls updateMoneyRequestAmountAndCurrency on edit + non-split when amount changes', () => {
            const tx: Transaction = {
                transactionID: 'tx-1',
                amount: -1000,
                currency: CONST.CURRENCY.USD,
                created: '2024-01-01',
                merchant: 'Test',
                reportID: 'report-100',
                comment: {},
            };

            submitAmount(
                buildBaseArgs({
                    action: CONST.IOU.ACTION.EDIT,
                    transaction: tx,
                    selectedCurrency: CONST.CURRENCY.USD,
                    amount: '99',
                }),
            );

            expect(mockUpdateMoneyRequestAmountAndCurrency).toHaveBeenCalledTimes(1);
            expect(mockUpdateMoneyRequestAmountAndCurrency).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionID: 'tx-1',
                    currency: CONST.CURRENCY.USD,
                }),
            );
        });
    });

    describe('submitAmount reads collection state from module caches', () => {
        beforeEach(() => {
            mockSendMoneyElsewhere.mockClear();
            mockSendMoneyWithWallet.mockClear();
            mockTrackExpense.mockClear();
            mockRequestMoney.mockClear();
            mockSetDraftSplitTransaction.mockClear();
            mockUpdateMoneyRequestAmountAndCurrency.mockClear();
            mockSetTransactionReport.mockClear();
        });

        const buildBaseArgs = (overrides: Partial<Parameters<typeof submitAmount>[0]> = {}): Parameters<typeof submitAmount>[0] => {
            const baseReport: Report = {
                ...createRandomReport(200, undefined),
                reportID: 'report-200',
                participants: {
                    [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [OTHER_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };
            const currentUserPersonalDetails: PersonalDetails = {
                accountID: CURRENT_USER_ACCOUNT_ID,
                login: 'me@test.com',
                localCurrencyCode: CONST.CURRENCY.USD,
            };
            return {
                report: baseReport,
                transaction: undefined,
                splitDraftTransaction: undefined,
                policy: undefined,
                selectedCurrency: CONST.CURRENCY.USD,
                decimals: 2,
                iouType: CONST.IOU.TYPE.SUBMIT,
                transactionID: 'tx-1',
                reportID: 'report-200',
                action: CONST.IOU.ACTION.CREATE,
                backTo: undefined,
                backToReport: undefined,
                shouldKeepUserInput: false,
                shouldSkipConfirmation: false,
                isReportArchived: false,
                currentUserPersonalDetails,
                delegateAccountID: undefined,
                selfDMReport: undefined,
                defaultExpensePolicy: undefined,
                personalPolicy: undefined,
                navigateBack: jest.fn(),
                amount: '10',
                paymentMethod: undefined,
                ...overrides,
            };
        };

        it('requestMoney receives cached transactionViolations on skip-confirm SUBMIT', async () => {
            const violations = [{name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION, type: CONST.VIOLATION_TYPES.VIOLATION}];
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}tv-100`, violations);
            await waitForBatchedUpdates();

            submitAmount(buildBaseArgs({iouType: CONST.IOU.TYPE.SUBMIT, shouldSkipConfirmation: true}));

            expect(mockRequestMoney).toHaveBeenCalledTimes(1);
            expect(mockRequestMoney).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionViolations: expect.objectContaining({
                        [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}tv-100`]: violations,
                    }),
                }),
            );
        });

        it('trackExpense receives draftTransactionIDs derived from cached TRANSACTION_DRAFT', async () => {
            const draft: Transaction = {
                transactionID: 'draft-track-1',
                amount: -200,
                currency: CONST.CURRENCY.USD,
                created: '2024-01-01',
                merchant: 'draft',
                reportID: 'r1',
                comment: {},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}draft-track-1`, draft);
            await waitForBatchedUpdates();

            submitAmount(buildBaseArgs({iouType: CONST.IOU.TYPE.TRACK, shouldSkipConfirmation: true}));

            expect(mockTrackExpense).toHaveBeenCalledTimes(1);
            expect(mockTrackExpense).toHaveBeenCalledWith(
                expect.objectContaining({
                    draftTransactionIDs: expect.arrayContaining(['draft-track-1']),
                }),
            );
        });

        it('edit non-split reads parentReport, parentReportNextStep, policyCategories from caches', async () => {
            const parentReport: Report = {...createRandomReport(300, undefined), reportID: 'parent-300'};
            const nextStep = {};
            const policyCategories = {Travel: {name: 'Travel', enabled: true, areCommentsRequired: false, glCode: '', externalID: ''}};

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}parent-300`, parentReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.NEXT_STEP}parent-300`, nextStep);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}policy-cat-1`, policyCategories);
            await waitForBatchedUpdates();

            const tx: Transaction = {
                transactionID: 'tx-1',
                amount: -1000,
                currency: CONST.CURRENCY.USD,
                created: '2024-01-01',
                merchant: 'Test',
                reportID: 'report-200',
                comment: {},
            };
            const reportWithPolicyAndParent: Report = {
                ...createRandomReport(200, undefined),
                reportID: 'report-200',
                parentReportID: 'parent-300',
                policyID: 'policy-cat-1',
            };

            submitAmount(
                buildBaseArgs({
                    action: CONST.IOU.ACTION.EDIT,
                    report: reportWithPolicyAndParent,
                    transaction: tx,
                    selectedCurrency: CONST.CURRENCY.USD,
                    amount: '99',
                }),
            );

            expect(mockUpdateMoneyRequestAmountAndCurrency).toHaveBeenCalledTimes(1);
            expect(mockUpdateMoneyRequestAmountAndCurrency).toHaveBeenCalledWith(
                expect.objectContaining({
                    parentReport,
                    parentReportNextStep: nextStep,
                    policyCategories,
                }),
            );
        });

        it('edit non-split computes duplicate-tx inline from cached TRANSACTION + TRANSACTION_VIOLATIONS', async () => {
            // Seed a duplicate violation and the duplicated transactions in the caches.
            const dupViolation = {
                name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
                type: CONST.VIOLATION_TYPES.VIOLATION,
                data: {duplicates: ['dup-tx-1']},
            };
            const dupTransaction: Transaction = {
                transactionID: 'dup-tx-1',
                amount: -100,
                currency: CONST.CURRENCY.USD,
                created: '2024-01-01',
                merchant: 'duplicate',
                reportID: 'report-200',
                comment: {},
            };
            const mainTransaction: Transaction = {
                transactionID: 'tx-1',
                amount: -1000,
                currency: CONST.CURRENCY.USD,
                created: '2024-01-01',
                merchant: 'main',
                reportID: 'report-200',
                comment: {},
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}tx-1`, [dupViolation]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}tx-1`, mainTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}dup-tx-1`, dupTransaction);
            await waitForBatchedUpdates();

            submitAmount(
                buildBaseArgs({
                    action: CONST.IOU.ACTION.EDIT,
                    transaction: mainTransaction,
                    selectedCurrency: CONST.CURRENCY.USD,
                    amount: '99',
                }),
            );

            expect(mockUpdateMoneyRequestAmountAndCurrency).toHaveBeenCalledTimes(1);
            expect(mockUpdateMoneyRequestAmountAndCurrency).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactions: expect.objectContaining({
                        [`${ONYXKEYS.COLLECTION.TRANSACTION}tx-1`]: mainTransaction,
                        [`${ONYXKEYS.COLLECTION.TRANSACTION}dup-tx-1`]: dupTransaction,
                    }),
                    transactionViolations: expect.objectContaining({
                        [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}tx-1`]: [dupViolation],
                    }),
                }),
            );
        });
    });
});
