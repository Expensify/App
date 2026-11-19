/**
 * The policy and user data every write to a saved expense needs to recompute its violations and build its report
 * action. Each field's save hook reads it from here, so they all hand the same data to their write.
 */
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

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

function useMoneyRequestUpdateParams(transactionID: string | undefined, transactionThreadReport: OnyxEntry<OnyxTypes.Report>) {
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const policyID = transactionThreadReport?.policyID;
    const policy = usePolicy(policyID);
    const violations = useAllTransactionViolations(transactionID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`);
    const [policyTagList] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(policyID)}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionThreadReport?.parentReportID)}`);
    const [reportPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(parentReport?.policyID)}`);
    const [iouReportOwnerLogin] = usePersonalDetail(parentReport?.ownerAccountID, loginSelector);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    return {
        isVendorMatchingBetaEnabled: isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING),
        transactionThreadReport,
        parentReport,
        iouReportOwnerLogin,
        policy,
        policyTagList,
        policyCategories,
        currentUserAccountIDParam: currentUserPersonalDetails.accountID,
        currentUserEmailParam: currentUserPersonalDetails.login ?? '',
        isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
        delegateAccountID,
        reportPolicyTags,
        isTrackIntentUser,
        violations,
        getCurrencyDecimals,
        getCurrencySymbol,
        rules,
    };
}

type MoneyRequestUpdateParams = ReturnType<typeof useMoneyRequestUpdateParams>;

export default useMoneyRequestUpdateParams;
export type {MoneyRequestUpdateParams};
