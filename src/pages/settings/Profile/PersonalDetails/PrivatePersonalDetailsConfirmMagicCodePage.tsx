import React, {useEffect, useRef} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import {clearPersonalDetailsErrors, updatePrivatePersonalDetails} from '@libs/actions/PersonalDetails';
import {requestValidateCodeAction, resetValidateActionCodeSent} from '@libs/actions/User';
import {normalizeCountryCode} from '@libs/CountryUtils';
import {getLatestErrorField, getLatestErrorMessageField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getPrivatePersonalDetailsFormValues} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetailsForm} from '@src/types/form';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function PrivatePersonalDetailsConfirmMagicCodePage() {
    const {translate} = useLocalize();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const primaryLogin = usePrimaryContactMethod();

    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);
    // Errors may be written to either errorFields (preferred) or errors depending on
    // how the backend reports the failure, so check both.
    const personalDetailsErrorField = getLatestErrorField(privatePersonalDetails, 'personalDetails');
    const personalDetailsError = getLatestErrorMessageField(privatePersonalDetails);
    const submitError = !isEmptyObject(personalDetailsErrorField) ? personalDetailsErrorField : personalDetailsError;
    const hasErrors = !isEmptyObject(submitError) || !isEmptyObject(validateCodeAction?.errorFields);

    const clearError = () => {
        if (!hasErrors) {
            return;
        }
        clearPersonalDetailsErrors();
    };

    const wasLoading = useRef(false);
    useEffect(() => {
        if (privatePersonalDetails?.isLoading) {
            wasLoading.current = true;
            return;
        }
        if (wasLoading.current && !hasErrors) {
            wasLoading.current = false;
            resetValidateActionCodeSent();
            Navigation.goBack(ROUTES.SETTINGS_PROFILE.route);
        }
        wasLoading.current = false;
    }, [privatePersonalDetails?.isLoading, hasErrors]);

    const values = normalizeCountryCode(getPrivatePersonalDetailsFormValues(privatePersonalDetails, draftValues)) as PersonalDetailsForm;

    const handleSubmitForm = (validateCode: string) => {
        updatePrivatePersonalDetails(values, validateCode, countryCode);
    };

    return (
        <ValidateCodeActionContent
            title={translate('delegate.makeSureItIsYou')}
            descriptionPrimary={translate('contacts.enterMagicCode', primaryLogin ?? '')}
            sendValidateCode={() => requestValidateCodeAction()}
            validateCodeActionErrorField="personalDetails"
            handleSubmitForm={handleSubmitForm}
            validateError={submitError}
            clearError={clearError}
            onClose={() => {
                resetValidateActionCodeSent();
                Navigation.goBack(ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.route);
            }}
            isLoading={privatePersonalDetails?.isLoading}
        />
    );
}

PrivatePersonalDetailsConfirmMagicCodePage.displayName = 'PrivatePersonalDetailsConfirmMagicCodePage';

export default PrivatePersonalDetailsConfirmMagicCodePage;
