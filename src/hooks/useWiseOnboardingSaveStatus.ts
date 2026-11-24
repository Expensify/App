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

import useOnyx from './useOnyx';

const saveErrorSelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => getLatestErrorMessage(reimbursementAccount);

/**
 * Whether the Wise onboarding pages are still saving, the steps that have not saved, and the error the server sent for a save. Wise has every page once no
 * step the form still asks for is unsaved, which only the screen can tell, since a step's pages can leave the form after it was marked.
 */
function useWiseOnboardingSaveStatus() {
    const [serverError] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {selector: saveErrorSelector});
    const [isSaving = false] = useOnyx(ONYXKEYS.RAM_ONLY_WISE_ONBOARDING_PENDING_SAVES, {selector: isSavingWiseOnboardingPageSelector});
    const [unsavedPageKeys = getEmptyArray<string>()] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {selector: unsavedWiseOnboardingPageKeysSelector});
    return {isSaving, serverError, unsavedPageKeys};
}

export default useWiseOnboardingSaveStatus;
