import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type Form from './Form';

const INPUT_IDS = {
    BANK_INFO_STEP: {
        ROUTING_NUMBER: 'routingNumber',
        ACCOUNT_NUMBER: 'accountNumber',
        PLAID_MASK: 'mask',
        IS_SAVINGS: 'isSavings',
        BANK_NAME: 'bankName',
        SETUP_TYPE: 'setupType',
        PLAID_ACCOUNT_ID: 'plaidAccountID',
        PLAID_ACCESS_TOKEN: 'plaidAccessToken',
        SELECTED_PLAID_ACCOUNT_ID: 'selectedPlaidAccountID',
        FIRST_NAME: 'legalFirstName',
        LAST_NAME: 'legalLastName',
        STREET: 'addressStreet',
        STREET_SECOND: 'addressStreet2',
        CITY: 'addressCity',
        STATE: 'addressState',
        COUNTRY: 'country',
        ZIP_CODE: 'addressZipCode',
        PHONE_NUMBER: 'phoneNumber',
    },
} as const;

type InputID = DeepValueOf<typeof INPUT_IDS>;

type BankAccountStepProps = {
    [INPUT_IDS.BANK_INFO_STEP.ACCOUNT_NUMBER]: string;
    [INPUT_IDS.BANK_INFO_STEP.ROUTING_NUMBER]: string;
    [INPUT_IDS.BANK_INFO_STEP.PLAID_ACCOUNT_ID]: string;
    [INPUT_IDS.BANK_INFO_STEP.PLAID_MASK]: string;
    [INPUT_IDS.BANK_INFO_STEP.SETUP_TYPE]: string;
    [INPUT_IDS.BANK_INFO_STEP.FIRST_NAME]: string;
    [INPUT_IDS.BANK_INFO_STEP.LAST_NAME]: string;
    [INPUT_IDS.BANK_INFO_STEP.STREET]: string;
    [INPUT_IDS.BANK_INFO_STEP.STREET_SECOND]: string;
    [INPUT_IDS.BANK_INFO_STEP.CITY]: string;
    [INPUT_IDS.BANK_INFO_STEP.STATE]: string;
    [INPUT_IDS.BANK_INFO_STEP.ZIP_CODE]: string;
    [INPUT_IDS.BANK_INFO_STEP.COUNTRY]: string;
    [INPUT_IDS.BANK_INFO_STEP.PHONE_NUMBER]: string;
};

type PlaidAccountProps = {
    [INPUT_IDS.BANK_INFO_STEP.IS_SAVINGS]: boolean;
    [INPUT_IDS.BANK_INFO_STEP.BANK_NAME]: string;
    [INPUT_IDS.BANK_INFO_STEP.PLAID_ACCESS_TOKEN]: string;
    [INPUT_IDS.BANK_INFO_STEP.SELECTED_PLAID_ACCOUNT_ID]: string;
};

type OnfidoStepProps = {
    isOnfidoSetupComplete: boolean;
};
type PersonalBankAccountForm = Form<InputID, BankAccountStepProps & PlaidAccountProps> & OnfidoStepProps;

export type {PersonalBankAccountForm};

export default INPUT_IDS;
