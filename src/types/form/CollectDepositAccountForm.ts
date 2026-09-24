import type {BaseForm} from './Form';

/** Inputs come from the country field mappings, so values are keyed by the parameter name the API expects. */
type CollectDepositAccountForm = BaseForm & Record<string, string>;

const INPUT_IDS = {
    BANK_COUNTRY: 'bankCountry',
    BANK_CURRENCY: 'bankCurrency',
    ROUTING_NUMBER: 'routingNumber',
    ACCOUNT_NUMBER: 'accountNumber',
    ADDRESS_STATE: 'addressState',
} as const;

export type {CollectDepositAccountForm};
export default INPUT_IDS;
