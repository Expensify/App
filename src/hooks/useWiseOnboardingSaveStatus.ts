import {getLatestErrorMessage} from '@libs/ErrorUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccount} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {hasUnsavedWiseOnboardingPageSelector, isSavingWiseOnboardingPageSelector} from '@selectors/ReimbursementAccount';

import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

const saveErrorSelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => getLatestErrorMessage(reimbursementAccount);

/**
 * Whether the Wise onboarding pages are still saving, and the error to show when a page did not save. Wise has every page once neither is set.
 * A later page's save clears the shared error, so a page that is still unsaved shows the generic one.
 */
function useWiseOnboardingSaveStatus() {
    const {translate} = useLocalize();
    const [serverError] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {selector: saveErrorSelector});
    const [isSaving = false] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {selector: isSavingWiseOnboardingPageSelector});
    const [hasUnsavedPage] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {selector: hasUnsavedWiseOnboardingPageSelector});

    const saveError = serverError || (hasUnsavedPage && !isSaving ? translate('common.genericErrorMessage') : undefined);
    return {isSaving, saveError};
}

export default useWiseOnboardingSaveStatus;
