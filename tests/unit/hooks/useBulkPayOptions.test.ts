import {renderHook} from '@testing-library/react-native';

import useBulkPayOptions from '@hooks/useBulkPayOptions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type BankAccount from '@src/types/onyx/BankAccount';
import type Fund from '@src/types/onyx/Fund';

import createMock from '../../utils/createMock';

let mockOnyxData: Record<string, unknown> = {};
let mockInvoiceBetaEnabled = true;

jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: (key: string) => [mockOnyxData[key]]}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({Bank: 'bank', Building: 'building', User: 'user', Cash: 'cash', Wallet: 'wallet'})}));
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key, localeCompare: (a: string, b: string) => a.localeCompare(b)})}));
jest.mock('@hooks/useThemeStyles', () => ({__esModule: true, default: () => ({})}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({__esModule: true, default: () => ({accountID: 10})}));
jest.mock('@hooks/useActiveAdminPolicies', () => ({__esModule: true, default: () => []}));
jest.mock('@hooks/usePermissions', () => ({__esModule: true, default: () => ({isBetaEnabled: () => mockInvoiceBetaEnabled})}));
const methodIDs = {business: 1, personal: 2, partial: 3, missingData: 4, debitCard: 5};
const businessAccount = createMock<BankAccount>({
    methodID: methodIDs.business,
    title: 'Business bank',
    bankCurrency: 'USD',
    bankCountry: 'US',
    accountData: {type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.OPEN, accountNumber: '1234'},
});
const personalAccount = createMock<BankAccount>({
    methodID: methodIDs.personal,
    title: 'Personal bank',
    bankCurrency: 'USD',
    bankCountry: 'US',
    accountData: {type: CONST.BANK_ACCOUNT.TYPE.PERSONAL, state: CONST.BANK_ACCOUNT.STATE.OPEN, accountNumber: '5678'},
});
const partialAccount = createMock<BankAccount>({
    methodID: methodIDs.partial,
    title: 'Partial bank',
    bankCurrency: 'USD',
    bankCountry: 'US',
    accountData: {type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.SETUP},
});
const missingDataAccount = createMock<BankAccount>({methodID: methodIDs.missingData, title: 'Missing data', bankCurrency: 'USD', bankCountry: 'US'});
const debitCard = createMock<Fund>({methodID: methodIDs.debitCard, title: 'Debit card', accountType: CONST.PAYMENT_METHODS.DEBIT_CARD, accountData: {cardNumber: '9999'}});
const invoiceReport = createMock<Report>({reportID: 'invoice', type: CONST.REPORT.TYPE.INVOICE, chatReportID: 'chat'});
const individualRoom = createMock<Report>({
    reportID: 'chat',
    chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
    invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: 10},
});
beforeEach(() => {
    mockInvoiceBetaEnabled = true;
    mockOnyxData = {};
    mockOnyxData[ONYXKEYS.BANK_ACCOUNT_LIST] = {
        [methodIDs.business]: businessAccount,
        [methodIDs.personal]: personalAccount,
        [methodIDs.partial]: partialAccount,
        [methodIDs.missingData]: missingDataAccount,
    };
    mockOnyxData[ONYXKEYS.FUND_LIST] = {[methodIDs.debitCard]: debitCard};
});

const baseProps = {
    selectedPolicyID: 'policy',
    selectedReportID: 'invoice',
    selectedReport: invoiceReport,
    selectedChatReport: individualRoom,
    currency: 'USD',
    formattedAmount: '$10',
    onlyShowPayElsewhere: false,
};

describe('useBulkPayOptions', () => {
    it('offers only eligible bank accounts in the individual invoice menus', () => {
        // Given formatted bank and debit-card producer entries, including incomplete bank accounts.
        // When the real hook builds the supported invoice menus.
        const {result} = renderHook(() => useBulkPayOptions(baseProps));
        const [personal, business] = result.current.bulkPayButtonOptions ?? [];
        // Then each menu contains its eligible bank, add-bank action, and pay elsewhere.
        expect(personal?.subMenuItems?.map((item) => item.additionalData?.bankAccountID ?? item.key ?? item.text)).toEqual([
            2,
            'bankAccount.addBankAccount',
            CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
        ]);
        expect(business?.subMenuItems?.map((item) => item.additionalData?.bankAccountID ?? item.key ?? item.text)).toEqual([
            1,
            'bankAccount.addBankAccount',
            CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
        ]);
    });

    it('offers business invoice bank options directly', () => {
        // Given a business invoice room and an eligible business bank account.
        const businessRoom = createMock<Report>({
            reportID: 'chat',
            chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
            invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, policyID: 'policy'},
        });
        // When the real hook builds the business invoice menu.
        const {result} = renderHook(() => useBulkPayOptions({...baseProps, selectedChatReport: businessRoom}));
        // Then the bank, add-bank route, and pay-elsewhere actions are direct items.
        expect(result.current.bulkPayButtonOptions?.map((item) => item.additionalData?.bankAccountID ?? item.key ?? item.text)).toEqual([
            1,
            'bankAccount.addBankAccount',
            CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
        ]);
    });

    it.each([
        {currency: 'CAD', beta: true},
        {currency: 'JPY', beta: true},
        {currency: '', beta: true},
        {currency: undefined, beta: true},
        {currency: 'usd', beta: true},
        {currency: 'USD,AUD', beta: true},
        {currency: 'USD', beta: false},
    ])('keeps eligible invoice actions for currency $currency with beta $beta', ({currency, beta}) => {
        // Given USD bank accounts and either a different supported currency, an unsupported currency, or a disabled beta.
        mockInvoiceBetaEnabled = beta;
        // When the real hook builds invoice submenus.
        const {result} = renderHook(() => useBulkPayOptions({...baseProps, currency}));
        // Then a supported CAD invoice retains add-bank and pay-elsewhere but excludes USD banks; other cases retain only pay-elsewhere.
        const expected = currency === 'CAD' ? ['bankAccount.addBankAccount', CONST.IOU.PAYMENT_TYPE.ELSEWHERE] : [CONST.IOU.PAYMENT_TYPE.ELSEWHERE];
        const items = result.current.bulkPayButtonOptions?.map((option) => option.subMenuItems?.map((item) => item.additionalData?.bankAccountID ?? item.key ?? item.text));
        expect(items).toEqual([expected, expected]);
    });

    it('keeps the business bank options limited to open matching accounts', () => {
        // Given an expense report and formatted bank and debit-card producer entries.
        const expenseReport = createMock<Report>({reportID: 'expense', type: CONST.REPORT.TYPE.EXPENSE});
        // When the real hook builds direct business bank options.
        const {result} = renderHook(() =>
            useBulkPayOptions({
                ...baseProps,
                selectedReportID: 'expense',
                selectedReport: expenseReport,
            }),
        );
        // Then partial, missing-data, personal, and debit-card entries cannot appear.
        expect(result.current.businessBankAccountOptions?.map((option) => option.methodID)).toEqual([1]);
        expect(result.current.bulkPayButtonOptions?.map((option) => option.additionalData?.bankAccountID ?? option.key)).toEqual([1, CONST.IOU.PAYMENT_TYPE.ELSEWHERE]);
    });
});
