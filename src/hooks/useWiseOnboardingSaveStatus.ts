/**
 * The save status of the Wise onboarding intake pages, read from the running saves kept in memory and from the unsaved pages and the shared error on the
 * reimbursement account. The flow uses it to hold Confirm while pages save and to keep the user on the confirmation page while a page has not saved.
 */
import {getLatestErrorMessage} from '@libs/ErrorUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccount} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {OnyxEntry} from 'react-native-onyx';

import {isSavingWiseOnboardingPageSelector, unsavedWiseOnboardingPageKeysSelector} from '@selectors/ReimbursementAccount';

import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

const saveErrorSelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => getLatestErrorMessage(reimbursementAccount);

/**
 * Whether the Wise onboarding pages are still saving, the pages that have not saved, and the error to show when a page did not save. Wise has every page
 * once none is set.
 * A later page's save clears the shared error, so a page that is still unsaved shows the generic one.
 */
function useWiseOnboardingSaveStatus() {
    const {translate} = useLocalize();
    const [serverError] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {selector: saveErrorSelector});
    const [isSaving = false] = useOnyx(ONYXKEYS.RAM_ONLY_WISE_ONBOARDING_PENDING_SAVES, {selector: isSavingWiseOnboardingPageSelector});
    const [unsavedPageKeys = getEmptyArray<string>()] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {selector: unsavedWiseOnboardingPageKeysSelector});

    const saveError = serverError || (unsavedPageKeys.length > 0 && !isSaving ? translate('common.genericErrorMessage') : undefined);
    return {isSaving, saveError, unsavedPageKeys};
}

export default useWiseOnboardingSaveStatus;
