import Onyx from 'react-native-onyx';
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

export {
    // eslint-disable-next-line import/prefer-default-export
    clearPersonalDetailsDraft,
    setPersonalDetails,
    clearWorkspaceDetailsDraft,
    setWorkspaceCurrency,
};
