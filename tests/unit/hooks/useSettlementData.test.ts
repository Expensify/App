import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useSettlementData from '@hooks/useSettlementData';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList} from '@src/types/onyx';
import {
    createSettlementBankAccountList,
    createSettlementExpenseReport,
    createSettlementInvoiceReport,
    createSettlementIOUReport,
    SETTLEMENT_TEST_BANK_ACCOUNT_ID,
    SETTLEMENT_TEST_POLICY_ID,
} from '../../utils/collections/settlementTestHelpers';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(() => ({accountID: 1, login: 'test@user.com', email: 'test@user.com'})),
}));

jest.mock('@src/hooks/useResponsiveLayout');

describe('useSettlementData', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    describe('report type flags', () => {
        it('detects expense report', async () => {
            const {result} = renderHook(() => useSettlementData({iouReport: createSettlementExpenseReport(), policyID: SETTLEMENT_TEST_POLICY_ID}));

            await waitFor(() => {
                expect(result.current.isExpenseReport).toBe(true);
                expect(result.current.isInvoiceReport).toBe(false);
            });
        });

        it('detects invoice report', async () => {
            const {result} = renderHook(() => useSettlementData({iouReport: createSettlementInvoiceReport(), policyID: SETTLEMENT_TEST_POLICY_ID}));

            await waitFor(() => {
                expect(result.current.isInvoiceReport).toBe(true);
                expect(result.current.isExpenseReport).toBe(false);
            });
        });

        it('detects IOU report (neither expense nor invoice)', async () => {
            const {result} = renderHook(() => useSettlementData({iouReport: createSettlementIOUReport(), policyID: SETTLEMENT_TEST_POLICY_ID}));

            await waitFor(() => {
                expect(result.current.isExpenseReport).toBe(false);
                expect(result.current.isInvoiceReport).toBe(false);
            });
        });
    });

    describe('canUseWallet', () => {
        it('returns true for IOU report with supported currency', async () => {
            const {result} = renderHook(() => useSettlementData({iouReport: createSettlementIOUReport(), currency: CONST.CURRENCY.USD}));

            await waitFor(() => {
                expect(result.current.canUseWallet).toBe(true);
            });
        });

        it('returns false for expense reports', async () => {
            const {result} = renderHook(() => useSettlementData({iouReport: createSettlementExpenseReport(), currency: CONST.CURRENCY.USD}));

            await waitFor(() => {
                expect(result.current.canUseWallet).toBe(false);
            });
        });

        it('returns false for invoice reports', async () => {
            const {result} = renderHook(() => useSettlementData({iouReport: createSettlementInvoiceReport(), currency: CONST.CURRENCY.USD}));

            await waitFor(() => {
                expect(result.current.canUseWallet).toBe(false);
            });
        });
    });

    describe('getFilteredBankItems', () => {
        it('filters business bank accounts and excludes partially setup accounts', async () => {
            const openAccountID = 11111;
            const setupAccountID = 22222;
            const bankAccountList: BankAccountList = {
                [openAccountID]: {
                    methodID: openAccountID,
                    bankCurrency: CONST.CURRENCY.USD,
                    bankCountry: 'US',
                    title: 'Open Business',
                    description: 'Open account',
                    accountData: {
                        bankAccountID: openAccountID,
                        type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
                        state: CONST.BANK_ACCOUNT.STATE.OPEN,
                        accountNumber: '000001111',
                        routingNumber: '123456789',
                        addressName: 'Open',
                    },
                },
                [setupAccountID]: {
                    methodID: setupAccountID,
                    bankCurrency: CONST.CURRENCY.USD,
                    bankCountry: 'US',
                    title: 'Setup Business',
                    description: 'Setup account',
                    accountData: {
                        bankAccountID: setupAccountID,
                        type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
                        state: CONST.BANK_ACCOUNT.STATE.SETUP,
                        accountNumber: '000002222',
                        routingNumber: '123456789',
                        addressName: 'Setup',
                    },
                },
            } as BankAccountList;

            await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);

            const {result} = renderHook(() => useSettlementData({policyID: SETTLEMENT_TEST_POLICY_ID}));

            await waitFor(() => {
                const items = result.current.getFilteredBankItems(true, (method) => method.title);
                expect(items).toHaveLength(1);
                expect(items.at(0)).toBe('Open Business');
            });
        });

        it('filters personal bank accounts when payAsBusiness is false', async () => {
            const personalAccountID = 33333;
            const businessAccountID = 44444;
            const bankAccountList: BankAccountList = {
                [personalAccountID]: {
                    methodID: personalAccountID,
                    bankCurrency: CONST.CURRENCY.USD,
                    bankCountry: 'US',
                    title: 'Personal Account',
                    description: 'Personal',
                    accountData: {
                        bankAccountID: personalAccountID,
                        type: CONST.BANK_ACCOUNT.TYPE.PERSONAL,
                        state: CONST.BANK_ACCOUNT.STATE.OPEN,
                        accountNumber: '000003333',
                        routingNumber: '123456789',
                        addressName: 'Personal',
                    },
                },
                [businessAccountID]: {
                    methodID: businessAccountID,
                    bankCurrency: CONST.CURRENCY.USD,
                    bankCountry: 'US',
                    title: 'Business Account',
                    description: 'Business',
                    accountData: {
                        bankAccountID: businessAccountID,
                        type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
                        state: CONST.BANK_ACCOUNT.STATE.OPEN,
                        accountNumber: '000004444',
                        routingNumber: '123456789',
                        addressName: 'Business',
                    },
                },
            } as BankAccountList;

            await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);

            const {result} = renderHook(() => useSettlementData({policyID: SETTLEMENT_TEST_POLICY_ID}));

            await waitFor(() => {
                const personalItems = result.current.getFilteredBankItems(false, (method) => method.title);
                expect(personalItems).toHaveLength(1);
                expect(personalItems.at(0)).toBe('Personal Account');

                const businessItems = result.current.getFilteredBankItems(true, (method) => method.title);
                expect(businessItems).toHaveLength(1);
                expect(businessItems.at(0)).toBe('Business Account');
            });
        });

        it('applies custom mapper to filtered results', async () => {
            await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, createSettlementBankAccountList('9876'));

            const {result} = renderHook(() => useSettlementData({policyID: SETTLEMENT_TEST_POLICY_ID}));

            await waitFor(() => {
                const items = result.current.getFilteredBankItems(true, (method) => ({
                    name: method.title,
                    id: method.methodID,
                }));
                expect(items).toHaveLength(1);
                expect(items.at(0)).toEqual({name: 'Test Bank Account', id: SETTLEMENT_TEST_BANK_ACCOUNT_ID});
            });
        });

        it('returns empty array when no bank accounts exist', async () => {
            const {result} = renderHook(() => useSettlementData({policyID: SETTLEMENT_TEST_POLICY_ID}));

            await waitFor(() => {
                const items = result.current.getFilteredBankItems(true, (method) => method.title);
                expect(items).toHaveLength(0);
            });
        });

        it('returns empty array when all accounts are partially setup', async () => {
            const setupAccountID = 55555;
            const verifyingAccountID = 66666;
            const bankAccountList: BankAccountList = {
                [setupAccountID]: {
                    methodID: setupAccountID,
                    bankCurrency: CONST.CURRENCY.USD,
                    bankCountry: 'US',
                    title: 'Setup Account',
                    description: 'Setup',
                    accountData: {
                        bankAccountID: setupAccountID,
                        type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
                        state: CONST.BANK_ACCOUNT.STATE.SETUP,
                        accountNumber: '000005555',
                        routingNumber: '123456789',
                        addressName: 'Setup',
                    },
                },
                [verifyingAccountID]: {
                    methodID: verifyingAccountID,
                    bankCurrency: CONST.CURRENCY.USD,
                    bankCountry: 'US',
                    title: 'Verifying Account',
                    description: 'Verifying',
                    accountData: {
                        bankAccountID: verifyingAccountID,
                        type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
                        state: CONST.BANK_ACCOUNT.STATE.VERIFYING,
                        accountNumber: '000006666',
                        routingNumber: '123456789',
                        addressName: 'Verifying',
                    },
                },
            } as BankAccountList;

            await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);

            const {result} = renderHook(() => useSettlementData({policyID: SETTLEMENT_TEST_POLICY_ID}));

            await waitFor(() => {
                const items = result.current.getFilteredBankItems(true, (method) => method.title);
                expect(items).toHaveLength(0);
            });
        });
    });

    describe('shouldShowPayElsewhereOption', () => {
        it('returns true when payment options are not hidden and report is not invoice', async () => {
            const {result} = renderHook(() => useSettlementData({iouReport: createSettlementIOUReport(), shouldHidePaymentOptions: false}));

            await waitFor(() => {
                expect(result.current.shouldShowPayElsewhereOption).toBe(true);
            });
        });

        it('returns false when payment options are hidden', async () => {
            const {result} = renderHook(() => useSettlementData({iouReport: createSettlementIOUReport(), shouldHidePaymentOptions: true}));

            await waitFor(() => {
                expect(result.current.shouldShowPayElsewhereOption).toBe(false);
            });
        });

        it('returns false for invoice reports', async () => {
            const {result} = renderHook(() => useSettlementData({iouReport: createSettlementInvoiceReport(), shouldHidePaymentOptions: false}));

            await waitFor(() => {
                expect(result.current.shouldShowPayElsewhereOption).toBe(false);
            });
        });
    });

    describe('policyIDKey fallback', () => {
        it('falls back to iouReport.policyID by default when report does not belong to workspace', async () => {
            const workspacePolicyID = 'workspace-abc';
            const iouReport = createSettlementIOUReport({policyID: workspacePolicyID});

            const {result} = renderHook(() => useSettlementData({iouReport, policyID: 'unrelated-policy'}));

            await waitFor(() => {
                // Default: falls back to iouReport.policyID (SettlementButton behavior)
                expect(result.current.policyIDKey).toBe(workspacePolicyID);
            });
        });

        it('falls back to CONST.POLICY.ID_FAKE when shouldUseFakePolicyFallback is true', async () => {
            const workspacePolicyID = 'workspace-abc';
            const iouReport = createSettlementIOUReport({policyID: workspacePolicyID});

            const {result} = renderHook(() => useSettlementData({iouReport, policyID: 'unrelated-policy', shouldUseFakePolicyFallback: true}));

            await waitFor(() => {
                // usePaymentOptions behavior: always uses ID_FAKE for non-workspace reports
                expect(result.current.policyIDKey).toBe(CONST.POLICY.ID_FAKE);
            });
        });
    });

    describe('currency handling', () => {
        it('does not default undefined currency to USD for showPayViaExpensifyOptions', async () => {
            // useBulkPayOptions passes undefined currency when report currency hasn't loaded yet.
            // Defaulting to USD would prematurely expose pay-via-Expensify options.
            const {result} = renderHook(() => useSettlementData({currency: undefined}));

            await waitFor(() => {
                expect(result.current.showPayViaExpensifyOptions).toBe(false);
            });
        });
    });
});
