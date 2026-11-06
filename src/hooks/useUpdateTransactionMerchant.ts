import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import {updateMoneyRequestMerchant} from '@userActions/IOU/UpdateMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {loginSelector} from '@selectors/PersonalDetails';

import useAllTransactionViolations from './useAllTransactionViolations';
import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDelegateAccountID from './useDelegateAccountID';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import {usePersonalDetail} from './usePersonalDetails';
import usePolicy from './usePolicy';

type UseUpdateTransactionMerchantParams = {
    /** ID of the saved expense being written to */
    transactionID: string | undefined;

    /** Transaction thread report of that expense */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
};

type UseUpdateTransactionMerchantResult = {
    /** Saves `merchant` to the expense. An empty merchant is saved as the partial-merchant placeholder */
    updateMerchant: (merchant: string) => void;
};

/**
 * Saves the merchant of a saved expense, from wherever it is edited. The write needs a wide set of policy and user
 * data to recompute violations. Both the merchant page and the inline input on the expense view save through here, so
 * an edit in either leaves the expense in the same state.
 */
function useUpdateTransactionMerchant({transactionID, transactionThreadReport}: UseUpdateTransactionMerchantParams): UseUpdateTransactionMerchantResult {
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const {isOffline} = useNetwork();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const policyID = transactionThreadReport?.policyID;
    const policy = usePolicy(policyID);
    const allTransactionViolations = useAllTransactionViolations(transactionID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(policyID)}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionThreadReport?.parentReportID)}`);
    const [reportPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(parentReport?.policyID)}`);
    const [iouReportOwnerLogin] = usePersonalDetail(parentReport?.ownerAccountID, loginSelector);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    const updateMerchant = (merchant: string) => {
        if (!transactionID) {
            return;
        }
        updateMoneyRequestMerchant({
            isVendorMatchingBetaEnabled: isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING),
            transactionID,
            transactionThreadReport,
            parentReport,
            iouReportOwnerLogin,
            value: merchant || CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
            policy,
            policyTagList: policyTags,
            policyCategories,
            currentUserAccountIDParam: currentUserPersonalDetails.accountID,
            currentUserEmailParam: currentUserPersonalDetails.login ?? '',
            isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
            isOffline,
            delegateAccountID,
            reportPolicyTags,
            isTrackIntentUser,
            violations: allTransactionViolations,
            getCurrencyDecimals,
            getCurrencySymbol,
            rules,
        });
    };

    return {updateMerchant};
}

export default useUpdateTransactionMerchant;
