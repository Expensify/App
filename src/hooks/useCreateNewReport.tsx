import {accountIDSelector, emailSelector} from '@selectors/Session';
import {useCallback} from 'react';
import {createNewReport} from '@libs/actions/Report';
import {hasViolations as hasViolationsUtil} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [email] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    const hasViolations = hasViolationsUtil(undefined, transactionViolations, accountID ?? CONST.DEFAULT_NUMBER_ID, email ?? '');

    return useCallback(
        (policyID: string, shouldDismissEmptyReportsConfirmation = false) => {
            const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
            return createNewReport(currentUserPersonalDetails, hasViolations, isASAPSubmitBetaEnabled, policy, betas, false, shouldDismissEmptyReportsConfirmation);
        },
        [betas, currentUserPersonalDetails, hasViolations, isASAPSubmitBetaEnabled, policies],
    );
}

export default useCreateNewReport;
