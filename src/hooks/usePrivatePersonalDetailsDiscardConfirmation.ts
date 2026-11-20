/** Keep pending private-details changes protected through editing, verification, and direct links. */
import {clearDraftValues} from '@libs/actions/FormActions';
import {normalizeCountryCode} from '@libs/CountryUtils';
import hasFormChanges from '@libs/hasFormChanges';
import {getPrivatePersonalDetailsFormValues} from '@libs/PersonalDetailsUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import useFlowDiscardChangesConfirmation from './useFlowDiscardChangesConfirmation';
import useOnyx from './useOnyx';

const SCREEN_NAMES = [SCREENS.SETTINGS.PROFILE.PRIVATE_PERSONAL_DETAILS, SCREENS.SETTINGS.PROFILE.PRIVATE_PERSONAL_DETAILS_CONFIRM_VALIDATE_CODE];

function usePrivatePersonalDetailsDiscardConfirmation() {
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [draft] = useOnyx(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT);
    const [defaultCountry] = useOnyx(ONYXKEYS.COUNTRY);
    const savedValues = normalizeCountryCode(getPrivatePersonalDetailsFormValues(privatePersonalDetails));
    const initialValues = {...savedValues, country: savedValues.country || defaultCountry || ''};
    return useFlowDiscardChangesConfirmation({
        screenNames: SCREEN_NAMES,
        getHasUnsavedChanges: () => hasFormChanges(draft, initialValues),
        onDiscard: () => clearDraftValues(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM),
    });
}

export default usePrivatePersonalDetailsDiscardConfirmation;
