import {createNewReport} from '@libs/actions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';

import {useCurrencyListActions} from './useCurrencyList';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

/**
 * Returns a stable callback that creates a new expense report for a given policyID.
 * Returns the full optimistic report data so callers can navigate or use the result as needed.
 */
function useCreateNewReport() {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const {getCurrencyDecimals} = useCurrencyListActions();

    return (policyID: string, shouldDismissEmptyReportsConfirmation = false) => {
        const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
        return createNewReport(
            currentUserPersonalDetails,
            // A new report has no expenses yet, so it can't have violations.
            false,
            isASAPSubmitBetaEnabled,
            policy,
            isTrackIntentUser,
            getCurrencyDecimals,
            rules,
            false,
            shouldDismissEmptyReportsConfirmation,
        );
    };
}

export default useCreateNewReport;
