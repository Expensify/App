import {render} from '@testing-library/react-native';

import BillPaymentButton from '@components/BillPaymentButton';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';

import type * as Localize from '@libs/Localize';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

// The real English copy, so the test reads the option labels users see
const mockTranslate = <TPath extends TranslationPaths>(key: TPath, ...parameters: TranslationParameters<TPath>) =>
    jest.requireActual<typeof Localize>('@libs/Localize').translate(CONST.LOCALES.EN, key, ...parameters);

jest.mock('@components/ButtonWithDropdownMenu', () => ({__esModule: true, default: jest.fn(() => null)}));
jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: TranslationPaths, ...parameters: TranslationParameters<TranslationPaths>) => mockTranslate(key, ...parameters),
}));
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({convertToDisplayString: (amount: number, currency: string) => `${currency} ${(amount / 100).toFixed(2)}`}),
}));

const businessBankAccount: BankAccountList = {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- Bank account lists are keyed by bankAccountID
    '7992': createMock<BankAccountList[string]>({
        methodID: 7992,
        title: 'Citibank',
        bankCurrency: CONST.CURRENCY.USD,
        accountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
        accountData: {bankAccountID: 7992, allowDebit: true, state: CONST.BANK_ACCOUNT.STATE.OPEN, accountNumber: '0000007992', type: CONST.BANK_ACCOUNT.TYPE.BUSINESS},
    }),
};

function makeBill(currency: string): Report {
    return createMock<Report>({reportID: '1', type: CONST.REPORT.TYPE.BILL, policyID: 'policy1', currency, total: -12500});
}

async function renderOptions(report: Report) {
    render(<BillPaymentButton report={report} />);
    await waitForBatchedUpdates();
    const props = jest.mocked(ButtonWithDropdownMenu).mock.calls.at(-1)?.at(0);
    const options = props?.options ?? [];
    return {customText: props?.customText, texts: options.map((option) => option.text), options};
}

describe('BillPaymentButton', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it('lists the business bank account and Mark as paid, with the amount on the button', async () => {
        // Given a payer with a business bank account
        await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, businessBankAccount);

        // When the Pay button renders for a USD bill
        const {customText, texts, options} = await renderOptions(makeBill(CONST.CURRENCY.USD));

        // Then it shows the amount, the bank account with its last four digits, and Mark as paid, as in Classic
        expect(customText).toBe('Pay USD 125.00');
        expect(texts).toEqual(['Citibank', 'Mark as paid']);
        expect(options.at(0)?.description).toContain('7992');
    });

    it('offers Pay with business account when the payer has no business bank account', async () => {
        // Given a payer without a business bank account
        // When the Pay button renders for a USD bill
        const {texts} = await renderOptions(makeBill(CONST.CURRENCY.USD));

        // Then the payer can start adding a business bank account, or mark the bill as paid
        expect(texts).toEqual(['Pay with business account', 'Mark as paid']);
    });

    it('does not offer an Expensify Card settlement account that is marked inside its account data', async () => {
        // Given the payer's only business bank account settles Expensify Card spend, marked in accountData
        const settlementAccount = businessBankAccount['7992'];
        await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
            // eslint-disable-next-line @typescript-eslint/naming-convention -- Bank account lists are keyed by bankAccountID
            '7992': {...settlementAccount, accountData: {...settlementAccount.accountData, isExpensifyCardSettlementAccount: true}},
        });

        // When the Pay button renders for a USD bill
        const {texts} = await renderOptions(makeBill(CONST.CURRENCY.USD));

        // Then the settlement account isn't a payment source, so the payer starts adding a business bank account instead
        expect(texts).toEqual(['Pay with business account', 'Mark as paid']);
    });

    it('only offers Mark as paid on a bill that is not in USD', async () => {
        // Given a payer with a business bank account
        await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, businessBankAccount);

        // When the Pay button renders for a GBP bill
        const {texts} = await renderOptions(makeBill('GBP'));

        // Then the bill can only be marked as paid, because ReimburseReport pays bills by ACH only in USD
        expect(texts).toEqual(['Mark as paid']);
    });
});
