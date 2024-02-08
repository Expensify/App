import type {Form} from '@src/types/onyx';

const INPUT_IDS = {
    OWNS_MORE_THAN_25_PERCENT: 'ownsMoreThan25Percent',
    HAS_OTHER_BENEFICIAL_OWNERS: 'hasOtherBeneficialOwners',
    ACCEPT_TERMS_AND_CONDITIONS: 'acceptTermsAndConditions',
    CERTIFY_TRUE_INFORMATION: 'certifyTrueInformation',
    ROUTING_NUMBER: 'routingNumber',
    ACCOUNT_NUMBER: 'accountNumber',
    ACCEPT_TERMS: 'acceptTerms',
    COMPANY_NAME: 'companyName',
    COMPANY_PHONE: 'companyPhone',
    WEBSITE: 'website',
    COMPANY_TAX_ID: 'companyTaxID',
    INCORPORATION_TYPE: 'incorporationType',
    INCORPORATION_DATE: 'incorporationDate',
    INCORPORATION_STATE: 'incorporationState',
    HAS_NO_CONNECTION_TO_CANNABIS: 'hasNoConnectionToCannabis',
    IS_CONTROLLING_OFFICER: 'isControllingOfficer',
    AMOUNT1: 'amount1',
    AMOUNT2: 'amount2',
    AMOUNT3: 'amount3',
} as const;

type ReimbursementAccountForm = Form<{
    [INPUT_IDS.OWNS_MORE_THAN_25_PERCENT]: string;
    [INPUT_IDS.HAS_OTHER_BENEFICIAL_OWNERS]: string;
    [INPUT_IDS.ACCEPT_TERMS_AND_CONDITIONS]: string;
    [INPUT_IDS.CERTIFY_TRUE_INFORMATION]: string;
    [INPUT_IDS.ROUTING_NUMBER]: string;
    [INPUT_IDS.ACCOUNT_NUMBER]: string;
    [INPUT_IDS.ACCEPT_TERMS]: string;
    [INPUT_IDS.COMPANY_NAME]: string;
    [INPUT_IDS.COMPANY_PHONE]: string;
    [INPUT_IDS.WEBSITE]: string;
    [INPUT_IDS.COMPANY_TAX_ID]: string;
    [INPUT_IDS.INCORPORATION_TYPE]: string;
    [INPUT_IDS.INCORPORATION_DATE]: string;
    [INPUT_IDS.INCORPORATION_STATE]: string;
    [INPUT_IDS.HAS_NO_CONNECTION_TO_CANNABIS]: string;
    [INPUT_IDS.IS_CONTROLLING_OFFICER]: string;
    [INPUT_IDS.AMOUNT1]: string;
    [INPUT_IDS.AMOUNT2]: string;
    [INPUT_IDS.AMOUNT3]: string;
}>;

export type {ReimbursementAccountForm};
export default INPUT_IDS;
