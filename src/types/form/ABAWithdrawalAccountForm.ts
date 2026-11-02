import type {ValueOf} from 'type-fest';

import type Form from './Form';

const INPUT_IDS = {
    BSB_NUMBER: 'bsbNumber',
    ACCOUNT_NUMBER: 'accountNumber',
    BANK_USER_IDENTIFICATION_NUMBER: 'bankUserIdentificationNumber',
    COMPANY_NAME: 'companyName',
    SHOULD_INCLUDE_SELF_BALANCING_TRANSACTION: 'shouldIncludeSelfBalancingTransaction',
    ACCEPT_TERMS: 'acceptTerms',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type ABAWithdrawalAccountForm = Form<
    InputID,
    {
        [INPUT_IDS.BSB_NUMBER]: string;
        [INPUT_IDS.ACCOUNT_NUMBER]: string;
        [INPUT_IDS.BANK_USER_IDENTIFICATION_NUMBER]: string;
        [INPUT_IDS.COMPANY_NAME]: string;
        [INPUT_IDS.SHOULD_INCLUDE_SELF_BALANCING_TRANSACTION]: boolean;
        [INPUT_IDS.ACCEPT_TERMS]: boolean;
    }
> & {isSuccess?: boolean};

export type {ABAWithdrawalAccountForm};
export default INPUT_IDS;
