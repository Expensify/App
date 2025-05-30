import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Clear Personal Details draft
 */
function clearPersonalDetailsDraft() {
    Onyx.set(ONYXKEYS.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM_DRAFT, null);
}

/**
 * Set the personal details Onyx data
 */
function setPersonalDetails(firstName: string, lastName: string) {
    Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM, {firstName, lastName});
}

/**
 * Clear Workspace Details draft
 */
function clearWorkspaceDetailsDraft() {
    Onyx.set(ONYXKEYS.FORMS.ONBOARDING_WORKSPACE_DETAILS_FORM_DRAFT, null);
}

/**
 * Set the workspace currency Onyx data
 */
function setWorkspaceCurrency(currency: string) {
    Onyx.merge(ONYXKEYS.FORMS.ONBOARDING_WORKSPACE_DETAILS_FORM_DRAFT, {currency});
}

function verifyTestDriveRecipient(email: string) {
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.VERIFY_TEST_DRIVE_RECIPIENT, {email}).then((response) => {
        if (!response?.accountExists) {
            // We can invite this user since they do not have an account yet
            return;
        }

        throw new Error(response?.message);
    });
}

export {clearPersonalDetailsDraft, setPersonalDetails, clearWorkspaceDetailsDraft, setWorkspaceCurrency, verifyTestDriveRecipient};
