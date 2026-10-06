import {renderHook} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';
import usePaymentOptions from '@hooks/usePaymentOptions';

import {formatPaymentMethods} from '@libs/PaymentUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, FundList, Report} from '@src/types/onyx';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';

import createMock from '../../utils/createMock';

jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({Building: 'building', User: 'user', ThumbsUp: 'approve', Bank: 'bank', Wallet: 'wallet', Cash: 'cash', CheckCircle: 'check'}),
}));
jest.mock('@hooks/useThemeStyles', () => ({__esModule: true, default: () => ({})}));
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key})}));
jest.mock('@hooks/usePermissions', () => ({__esModule: true, default: () => ({isBetaEnabled: () => true})}));
jest.mock('@libs/PaymentUtils', () => ({formatPaymentMethods: jest.fn()}));
jest.mock('@libs/ReportUtils', () => ({
    doesReportBelongToWorkspace: () => false,
    getBankAccountRoute: () => '/bank-account',
    getInvoiceReceiverPolicyID: () => 'policy-1',
    isExpenseReport: () => false,
    isIndividualInvoiceRoom: () => true,
    isInvoiceReport: (report: Report) => report.type === 'invoice',
}));

const mockUseOnyx = jest.mocked(useOnyx);
const mockFormatPaymentMethods = jest.mocked(formatPaymentMethods);
const invoice = createMock<Report>({reportID: 'invoice-1', type: CONST.REPORT.TYPE.INVOICE});
const personalMethodID = 1;
const businessMethodID = 2;
const fundMethodID = 6;
const personal = createMock<PaymentMethod>({methodID: personalMethodID, title: 'Personal ready', accountData: {type: CONST.BANK_ACCOUNT.TYPE.PERSONAL}});
const business = createMock<PaymentMethod>({methodID: businessMethodID, title: 'Business ready', accountData: {type: CONST.BANK_ACCOUNT.TYPE.BUSINESS}});
const setup = createMock<PaymentMethod>({methodID: 3, title: 'Setup', accountData: {type: CONST.BANK_ACCOUNT.TYPE.PERSONAL, state: CONST.BANK_ACCOUNT.STATE.SETUP}});
const verifying = createMock<PaymentMethod>({methodID: 4, title: 'Verifying', accountData: {type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.VERIFYING}});
const pending = createMock<PaymentMethod>({methodID: 5, title: 'Pending', accountData: {type: CONST.BANK_ACCOUNT.TYPE.PERSONAL, state: CONST.BANK_ACCOUNT.STATE.PENDING}});
const fund = createMock<PaymentMethod>({methodID: fundMethodID, title: 'Debit card', accountData: {fundID: fundMethodID}});
const bankAccounts = createMock<BankAccountList>({
    [personalMethodID]: {accountData: {type: CONST.BANK_ACCOUNT.TYPE.PERSONAL}},
    [businessMethodID]: {accountData: {type: CONST.BANK_ACCOUNT.TYPE.BUSINESS}},
});
const funds = createMock<FundList>({[fundMethodID]: {accountData: {fundID: fundMethodID}}});

function menuTitles(options: ReturnType<typeof usePaymentOptions>, index: number): string[] {
    return options.at(index)?.subMenuItems?.map((item) => item.text) ?? [];
}

describe('usePaymentOptions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseOnyx.mockImplementation((key) => {
            if (key === ONYXKEYS.BANK_ACCOUNT_LIST) {
                return [bankAccounts, {status: 'loaded'}];
            }
            if (key === ONYXKEYS.FUND_LIST) {
                return [funds, {status: 'loaded'}];
            }
            if (key === ONYXKEYS.NVP_LAST_PAYMENT_METHOD) {
                return [undefined, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });
        mockFormatPaymentMethods.mockReturnValue([personal, business, setup, verifying, pending, fund]);
    });

    it('keeps ready personal and business accounts with absent state and excludes incomplete accounts and funds', () => {
        // Given mixed bank and fund methods, when the hook builds invoice menus, then only ready banks appear.
        const {result} = renderHook(() => usePaymentOptions({iouReport: invoice, onPress: jest.fn(), currency: CONST.CURRENCY.USD, policyID: undefined}));
        expect(mockFormatPaymentMethods).toHaveBeenCalledWith(bankAccounts, funds, expect.anything(), expect.any(Function));
        expect(menuTitles(result.current, 0)).toContain('Personal ready');
        expect(menuTitles(result.current, 0)).not.toEqual(expect.arrayContaining(['Setup', 'Pending', 'Debit card', 'Business ready']));
        expect(menuTitles(result.current, 1)).toContain('Business ready');
        expect(menuTitles(result.current, 1)).not.toEqual(expect.arrayContaining(['Verifying', 'Debit card', 'Personal ready']));
    });

    it('hides Expensify invoice methods for unsupported currency', () => {
        // Given an unsupported currency, when the hook builds invoice menus, then no bank payment method is shown.
        const {result} = renderHook(() => usePaymentOptions({iouReport: invoice, onPress: jest.fn(), currency: 'JPY', policyID: undefined}));
        expect(menuTitles(result.current, 0)).not.toContain('Personal ready');
        expect(menuTitles(result.current, 1)).not.toContain('Business ready');
    });
});
