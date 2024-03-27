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
    },
    PERSONAL_INFO_STEP: {
        FIRST_NAME: 'firstName',
        LAST_NAME: 'lastName',
        DOB: 'dob',
        SSN_LAST_4: 'ssnLast4',
        STREET: 'requestorAddressStreet',
        CITY: 'requestorAddressCity',
        STATE: 'requestorAddressState',
        ZIP_CODE: 'requestorAddressZipCode',
        IS_ONFIDO_SETUP_COMPLETE: 'isOnfidoSetupComplete',
    },
} as const;

type InputID = DeepValueOf<typeof INPUT_IDS>;

type BankAccountStepProps = {
    [INPUT_IDS.BANK_INFO_STEP.ACCOUNT_NUMBER]: string;
    [INPUT_IDS.BANK_INFO_STEP.ROUTING_NUMBER]: string;
    [INPUT_IDS.BANK_INFO_STEP.PLAID_ACCOUNT_ID]: string;
    [INPUT_IDS.BANK_INFO_STEP.PLAID_MASK]: string;
    [INPUT_IDS.BANK_INFO_STEP.SETUP_TYPE]: string;
};

type PersonalInfoStepProps = {
    [INPUT_IDS.PERSONAL_INFO_STEP.FIRST_NAME]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.LAST_NAME]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.STREET]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.CITY]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.STATE]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.ZIP_CODE]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.DOB]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.SSN_LAST_4]: string;
    [INPUT_IDS.PERSONAL_INFO_STEP.IS_ONFIDO_SETUP_COMPLETE]: boolean;
};

type PlaidAccountProps = {
    [INPUT_IDS.BANK_INFO_STEP.IS_SAVINGS]: boolean;
    [INPUT_IDS.BANK_INFO_STEP.BANK_NAME]: string;
    [INPUT_IDS.BANK_INFO_STEP.PLAID_ACCESS_TOKEN]: string;
    [INPUT_IDS.BANK_INFO_STEP.SELECTED_PLAID_ACCOUNT_ID]: string;
};

type PersonalBankAccountForm = Form<InputID, PersonalInfoStepProps & BankAccountStepProps & PlaidAccountProps>;

export type {BankAccountStepProps, PlaidAccountProps, PersonalInfoStepProps, PersonalBankAccountForm};

export default INPUT_IDS;
