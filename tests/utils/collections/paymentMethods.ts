import GenericBank from '@assets/images/bank-icons/generic-bank-account.svg';

import CONST from '@src/CONST';
import type AccountData from '@src/types/onyx/AccountData';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';

type BankPaymentMethod = Extract<PaymentMethod, {bankCurrency: string}>;

type PaymentMethodOverrides = Partial<Omit<BankPaymentMethod, 'accountData' | 'methodID'>> & {
    accountData?: AccountData;
    methodID?: number;
    bankCurrency?: string;
    bankCountry?: string;
};

type MalformedPaymentMethodOverrides = (Omit<PaymentMethodOverrides, 'accountData'> & {accountData: null}) | (Omit<PaymentMethodOverrides, 'methodID'> & {methodID: null});

/**
 * Creates a mock PaymentMethod (bank account shape) for unit tests.
 * Defaults represent a valid open business bank account so tests can override only the fields they need.
 */
function createMockPaymentMethod(overrides: PaymentMethodOverrides | MalformedPaymentMethodOverrides = {}): PaymentMethod {
    const defaults = {
        accountData: {
            type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
            state: CONST.BANK_ACCOUNT.STATE.OPEN,
        },
        methodID: 123,
        title: 'Business Account',
        description: 'USD • Ending in 0000',
        icon: GenericBank,
        iconStyles: [],
        iconSize: 40,
        bankCurrency: CONST.CURRENCY.USD,
        bankCountry: CONST.COUNTRY.US,
    } satisfies PaymentMethod;

    if (overrides.accountData === null) {
        const {accountData, ...validOverrides} = overrides;
        return {
            ...defaults,
            ...validOverrides,
            // @ts-expect-error -- undefined icons intentionally preserve the established fixture shape.
            icon: overrides.icon,
            // @ts-expect-error -- null account data intentionally exercises the runtime guard.
            accountData,
        };
    }

    if (overrides.methodID === null) {
        const {methodID, ...validOverrides} = overrides;
        return {
            ...defaults,
            ...validOverrides,
            // @ts-expect-error -- undefined icons intentionally preserve the established fixture shape.
            icon: overrides.icon,
            // @ts-expect-error -- null method IDs intentionally exercise the runtime guard.
            methodID,
        };
    }

    return {
        ...defaults,
        ...overrides,
        // @ts-expect-error -- undefined icons intentionally preserve the established fixture shape.
        icon: overrides.icon,
    };
}

export default createMockPaymentMethod;
