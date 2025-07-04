import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type * as OnyxTypes from '@src/types/onyx';

let allPolicies: OnyxCollection<OnyxTypes.Policy>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => (allPolicies = value),
});

/**
 * Reset user's USD reimbursement account. This will delete the bank account
 */
function resetUSDBankAccount(bankAccountID: number | undefined, session: OnyxEntry<OnyxTypes.Session>, policyID: string | undefined) {
    if (!bankAccountID) {
        throw new Error('Missing bankAccountID when attempting to reset free plan bank account');
    }
    if (!session?.email) {
        throw new Error('Missing credentials when attempting to reset free plan bank account');
    }

    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] ?? ({} as OnyxTypes.Policy);

    API.write(
        WRITE_COMMANDS.RESTART_BANK_ACCOUNT_SETUP,
        {
            bankAccountID,
            ownerEmail: session.email,
            policyID,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                    value: {
                        shouldShowResetModal: false,
                        isLoading: true,
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                        achData: null,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    value: {
                        achAccount: null,
                    },
                },
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.ONFIDO_TOKEN,
                    value: '',
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.ONFIDO_APPLICANT_ID,
                    value: '',
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.PLAID_DATA,
                    value: CONST.PLAID.DEFAULT_DATA,
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.PLAID_LINK_TOKEN,
                    value: '',
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                    value: CONST.REIMBURSEMENT_ACCOUNT.DEFAULT_DATA,
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
                    value: {
                        [INPUT_IDS.BENEFICIAL_OWNER_INFO_STEP.OWNS_MORE_THAN_25_PERCENT]: false,
                        [INPUT_IDS.BENEFICIAL_OWNER_INFO_STEP.HAS_OTHER_BENEFICIAL_OWNERS]: false,
                        [INPUT_IDS.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNERS]: '',
                        [INPUT_IDS.BANK_INFO_STEP.ACCOUNT_NUMBER]: '',
                        [INPUT_IDS.BANK_INFO_STEP.ROUTING_NUMBER]: '',
                        [INPUT_IDS.BANK_INFO_STEP.PLAID_ACCOUNT_ID]: '',
                        [INPUT_IDS.BANK_INFO_STEP.PLAID_MASK]: '',
                        [INPUT_IDS.BUSINESS_INFO_STEP.COMPANY_NAME]: '',
                        [INPUT_IDS.BUSINESS_INFO_STEP.STREET]: '',
                        [INPUT_IDS.BUSINESS_INFO_STEP.CITY]: '',
                        [INPUT_IDS.BUSINESS_INFO_STEP.STATE]: '',
                        [INPUT_IDS.BUSINESS_INFO_STEP.ZIP_CODE]: '',
                        [INPUT_IDS.BUSINESS_INFO_STEP.COMPANY_PHONE]: '',
                        [INPUT_IDS.BUSINESS_INFO_STEP.COMPANY_WEBSITE]: undefined,
                        [INPUT_IDS.BUSINESS_INFO_STEP.COMPANY_TAX_ID]: '',
                        [INPUT_IDS.BUSINESS_INFO_STEP.INCORPORATION_TYPE]: '',
                        [INPUT_IDS.BUSINESS_INFO_STEP.INCORPORATION_DATE]: '',
                        [INPUT_IDS.BUSINESS_INFO_STEP.INCORPORATION_STATE]: '',
                        [INPUT_IDS.BUSINESS_INFO_STEP.HAS_NO_CONNECTION_TO_CANNABIS]: false,
                        [INPUT_IDS.PERSONAL_INFO_STEP.FIRST_NAME]: '',
                        [INPUT_IDS.PERSONAL_INFO_STEP.LAST_NAME]: '',
                        [INPUT_IDS.PERSONAL_INFO_STEP.STREET]: '',
                        [INPUT_IDS.PERSONAL_INFO_STEP.CITY]: '',
                        [INPUT_IDS.PERSONAL_INFO_STEP.STATE]: '',
                        [INPUT_IDS.PERSONAL_INFO_STEP.ZIP_CODE]: '',
                        [INPUT_IDS.PERSONAL_INFO_STEP.IS_ONFIDO_SETUP_COMPLETE]: false,
                        [INPUT_IDS.PERSONAL_INFO_STEP.DOB]: '',
                        [INPUT_IDS.PERSONAL_INFO_STEP.SSN_LAST_4]: '',
                        [INPUT_IDS.COMPLETE_VERIFICATION.ACCEPT_TERMS_AND_CONDITIONS]: false,
                        [INPUT_IDS.COMPLETE_VERIFICATION.CERTIFY_TRUE_INFORMATION]: false,
                        [INPUT_IDS.COMPLETE_VERIFICATION.IS_AUTHORIZED_TO_USE_BANK_ACCOUNT]: false,
                        [INPUT_IDS.BANK_INFO_STEP.IS_SAVINGS]: false,
                        [INPUT_IDS.BANK_INFO_STEP.BANK_NAME]: '',
                        [INPUT_IDS.BANK_INFO_STEP.PLAID_ACCESS_TOKEN]: '',
                        [INPUT_IDS.BANK_INFO_STEP.SELECTED_PLAID_ACCOUNT_ID]: '',
                        [INPUT_IDS.AMOUNT1]: '',
                        [INPUT_IDS.AMOUNT2]: '',
                        [INPUT_IDS.AMOUNT3]: '',
                    },
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                    value: {isLoading: false, pendingAction: null},
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    value: {
                        achAccount: policy?.achAccount,
                    },
                },
            ],
        },
    );
}

export default resetUSDBankAccount;
