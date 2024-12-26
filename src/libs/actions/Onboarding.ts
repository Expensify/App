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

export {
    // eslint-disable-next-line import/prefer-default-export
    clearPersonalDetailsDraft,
    setPersonalDetails,
};
