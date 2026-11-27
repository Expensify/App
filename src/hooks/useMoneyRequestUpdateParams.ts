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
import Onyx from 'react-native-onyx';

import useAllTransactionViolations from './useAllTransactionViolations';
import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDelegateAccountID from './useDelegateAccountID';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';
import {usePersonalDetail} from './usePersonalDetails';
import usePolicy from './usePolicy';

function useMoneyRequestUpdateParams(transactionID: string | undefined, transactionThreadReport: OnyxEntry<OnyxTypes.Report>) {
    const {translate} = useLocalize();
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const policyID = transactionThreadReport?.policyID;
    const policy = usePolicy(policyID);
    const violations = useAllTransactionViolations(transactionID);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionThreadReport?.parentReportID)}`);
    const [iouReportOwnerLogin] = usePersonalDetail(parentReport?.ownerAccountID, loginSelector);

    // Only a write uses these, so they are read once when it runs. Subscribing to them would re-render every page and
    // field that saves through here whenever one changes, though none of them shows it. A field whose policy isn't the
    // report's, e.g. the tax of an unreported expense, passes its own.
    const readSaveOnlyParams = async (savePolicyID = policyID) => {
        const [policyCategories, policyTagList, reportPolicyTags, rules, introSelected] = await Onyx.multiGet([
            `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(savePolicyID)}`,
            `${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(savePolicyID)}`,
            `${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(parentReport?.policyID)}`,
            ONYXKEYS.COLLECTION.RULE,
            ONYXKEYS.NVP_INTRO_SELECTED,
        ]);
        return {policyCategories, policyTagList, reportPolicyTags, rules, isTrackIntentUser: isTrackIntentUserSelector(introSelected)};
    };

    return {
        translate,
        isVendorMatchingBetaEnabled: isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING),
        transactionThreadReport,
        parentReport,
        iouReportOwnerLogin,
        policy,
        currentUserAccountIDParam: currentUserPersonalDetails.accountID,
        currentUserEmailParam: currentUserPersonalDetails.login ?? '',
        isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
        delegateAccountID,
        violations,
        getCurrencyDecimals,
        getCurrencySymbol,
        readSaveOnlyParams,
    };
}

type MoneyRequestUpdateParams = ReturnType<typeof useMoneyRequestUpdateParams>;

export default useMoneyRequestUpdateParams;
export type {MoneyRequestUpdateParams};
