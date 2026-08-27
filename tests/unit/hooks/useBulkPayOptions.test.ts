import {renderHook} from '@testing-library/react-native';

import mockPlaceholderIcon from '@components/Icon/PlaceholderIcon';

import useBulkPayOptions from '@hooks/useBulkPayOptions';

import * as PaymentUtils from '@libs/PaymentUtils';

import CONST from '@src/CONST';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';

jest.mock('@hooks/useActiveAdminPolicies', () => ({__esModule: true, default: () => []}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({__esModule: true, default: () => ({accountID: 1})}));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({Bank: mockPlaceholderIcon, Building: mockPlaceholderIcon, Cash: mockPlaceholderIcon, User: mockPlaceholderIcon, Wallet: mockPlaceholderIcon}),
}));
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key, localeCompare: (left: string, right: string) => left.localeCompare(right)})}));
jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: jest.fn(() => [undefined])}));
jest.mock('@hooks/usePermissions', () => ({__esModule: true, default: () => ({isBetaEnabled: () => true})}));
jest.mock('@hooks/useThemeStyles', () => ({__esModule: true, default: () => ({})}));
jest.mock('@expensify/react-native-hybrid-app', () => ({__esModule: true, default: {isHybridApp: () => false}}));

jest.mock('@libs/ReportUtils', () => ({
    getInvoiceReceiverPolicyID: jest.fn(),
    isExpenseReport: () => false,
    isIndividualInvoiceRoom: () => false,
    isInvoiceReport: () => true,
    isIOUReport: () => false,
    parseReportRouteParams: () => ({}),
}));

const BUSINESS_BANK_METHOD = {
    accountData: {type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.OPEN},
    bankCountry: CONST.COUNTRY.US,
    bankCurrency: CONST.CURRENCY.USD,
    description: 'USD business account',
    icon: mockPlaceholderIcon,
    methodID: 101,
    title: 'Business bank',
} satisfies PaymentMethod;

const DEBIT_CARD_METHOD = {
    accountType: CONST.PAYMENT_METHODS.DEBIT_CARD,
    description: 'Debit card ending in 0001',
    icon: mockPlaceholderIcon,
    methodID: 202,
    title: 'Debit card',
} satisfies PaymentMethod;

const INVOICE_PAYMENT_PROPS = {
    currency: CONST.CURRENCY.USD,
    formattedAmount: '$10.00',
    onlyShowPayElsewhere: false,
    selectedPolicyID: 'policy-1',
    selectedReportID: 'invoice-1',
} satisfies Parameters<typeof useBulkPayOptions>[0];

const mockFormatPaymentMethods = jest.spyOn(PaymentUtils, 'formatPaymentMethods');

describe('useBulkPayOptions invoice payment methods', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFormatPaymentMethods.mockReturnValue([BUSINESS_BANK_METHOD, DEBIT_CARD_METHOD]);
    });

    it('includes an open business bank and add-bank-account for supported USD while rejecting a debit-card union member', () => {
        const {result} = renderHook(() => useBulkPayOptions(INVOICE_PAYMENT_PROPS));
        const options = result.current.bulkPayButtonOptions;

        if (!options) {
            throw new Error('Expected supported-currency invoice payment options');
        }
        const bankOption = options.find((option) => option.additionalData?.bankAccountID === BUSINESS_BANK_METHOD.methodID);
        if (!bankOption) {
            throw new Error('Expected the business-bank payment option');
        }
        expect(bankOption.text).toBe(BUSINESS_BANK_METHOD.title);
        expect(options.some((option) => option.text === DEBIT_CARD_METHOD.title)).toBe(false);

        const addBankOption = options.find((option) => option.text === 'bankAccount.addBankAccount');
        if (!addBankOption) {
            throw new Error('Expected the add-bank-account option');
        }
        expect(addBankOption.onSelected).toEqual(expect.any(Function));
    });

    it('excludes bank payment and add-bank-account for unsupported JPY while retaining pay-elsewhere', () => {
        const {result} = renderHook(() => useBulkPayOptions({...INVOICE_PAYMENT_PROPS, currency: 'JPY'}));
        const options = result.current.bulkPayButtonOptions;

        if (!options) {
            throw new Error('Expected unsupported-currency invoice payment options');
        }
        expect(options.some((option) => option.text === BUSINESS_BANK_METHOD.title)).toBe(false);
        expect(options.some((option) => option.text === 'bankAccount.addBankAccount')).toBe(false);

        const payElsewhereOption = options.find((option) => option.key === CONST.IOU.PAYMENT_TYPE.ELSEWHERE);
        if (!payElsewhereOption) {
            throw new Error('Expected the pay-elsewhere option');
        }
        expect(payElsewhereOption.text).toBe('iou.payElsewhere');
    });
});
