import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import {updateMoneyRequestDescription} from '@userActions/IOU/UpdateMoneyRequest';

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
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import {usePersonalDetail} from './usePersonalDetails';
import usePolicy from './usePolicy';

type UseUpdateTransactionDescriptionParams = {
    /** Saved expense being written to */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Transaction thread report of that expense */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
};

type UseUpdateTransactionDescriptionResult = {
    /** Saves `description`, written as markdown, to the expense */
    updateDescription: (description: string) => void;
};

/**
 * Saves the description of a saved expense, from wherever it is edited. The write needs a wide set of policy and user
 * data to recompute violations. Both the description page and the inline input on the expense view save through here,
 * so an edit in either leaves the expense in the same state.
 */
function useUpdateTransactionDescription({transaction, transactionThreadReport}: UseUpdateTransactionDescriptionParams): UseUpdateTransactionDescriptionResult {
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const transactionID = transaction?.transactionID;
    const policyID = transactionThreadReport?.policyID;
    const policy = usePolicy(policyID);
    const allTransactionViolations = useAllTransactionViolations(transactionID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(policyID)}`);
    const [policyVendors] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_VENDORS}${getNonEmptyStringOnyxID(policyID)}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionThreadReport?.parentReportID)}`);
    const [reportPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(parentReport?.policyID)}`);
    const [iouReportOwnerLogin] = usePersonalDetail(parentReport?.ownerAccountID, loginSelector);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    const updateDescription = (description: string) => {
        if (!transactionID) {
            return;
        }
        updateMoneyRequestDescription({
            isVendorMatchingBetaEnabled: isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING),
            transactionID,
            transaction,
            transactionThreadReport,
            parentReport,
            iouReportOwnerLogin,
            comment: description,
            policy,
            policyTagList: policyTags,
            policyCategories,
            policyVendors,
            currentUserAccountIDParam: currentUserPersonalDetails.accountID,
            currentUserEmailParam: currentUserPersonalDetails.login ?? '',
            isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
            delegateAccountID,
            reportPolicyTags,
            isTrackIntentUser,
            violations: allTransactionViolations,
            getCurrencyDecimals,
            getCurrencySymbol,
            rules,
        });
    };

    return {updateDescription};
}

export default useUpdateTransactionDescription;
