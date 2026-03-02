import CONST from '@src/CONST';
import type AccountData from '@src/types/onyx/AccountData';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';

type PaymentMethodOverrides = Partial<Omit<PaymentMethod, 'accountData' | 'methodID'>> & {
    accountData?: AccountData | null;
    methodID?: number | null;
};

/**
 * Creates a mock PaymentMethod (bank account shape) for unit tests.
 * Defaults represent a valid open business bank account so tests can override only the fields they need.
 */
function createMockPaymentMethod(overrides: PaymentMethodOverrides = {}): PaymentMethod {
    const defaults = {
        accountData: {
            type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
            state: CONST.BANK_ACCOUNT.STATE.OPEN,
        },
        methodID: 123,
        title: 'Business Account',
        description: 'USD • Ending in 0000',
        icon: undefined,
        iconStyles: [],
        iconSize: 40,
        bankCurrency: CONST.CURRENCY.USD,
        bankCountry: CONST.COUNTRY.US,
    };
    return {...defaults, ...overrides} as PaymentMethod;
}

export default createMockPaymentMethod;
