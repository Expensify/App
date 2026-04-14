import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import {clearPersonalDetailsErrors, updatePrivatePersonalDetails} from '@libs/actions/PersonalDetails';
import {requestValidateCodeAction, resetValidateActionCodeSent} from '@libs/actions/User';
import {normalizeCountryCode} from '@libs/CountryUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getCurrentAddress} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetailsForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function getFormValues(privatePersonalDetails: Parameters<typeof getCurrentAddress>[0], draftValues: PersonalDetailsForm | null | undefined): PersonalDetailsForm {
    const address = getCurrentAddress(privatePersonalDetails);
    const {street} = address ?? {};
    const [street1, street2] = street ? street.split('\n') : [undefined, undefined];
    return {
        [INPUT_IDS.LEGAL_FIRST_NAME]: draftValues?.[INPUT_IDS.LEGAL_FIRST_NAME] ?? privatePersonalDetails?.legalFirstName ?? '',
        [INPUT_IDS.LEGAL_LAST_NAME]: draftValues?.[INPUT_IDS.LEGAL_LAST_NAME] ?? privatePersonalDetails?.legalLastName ?? '',
        [INPUT_IDS.DATE_OF_BIRTH]: draftValues?.[INPUT_IDS.DATE_OF_BIRTH] ?? privatePersonalDetails?.dob ?? '',
        [INPUT_IDS.PHONE_NUMBER]: draftValues?.[INPUT_IDS.PHONE_NUMBER] ?? privatePersonalDetails?.phoneNumber ?? '',
        [INPUT_IDS.ADDRESS_LINE_1]: draftValues?.[INPUT_IDS.ADDRESS_LINE_1] ?? street1 ?? '',
        [INPUT_IDS.ADDRESS_LINE_2]: draftValues?.[INPUT_IDS.ADDRESS_LINE_2] ?? street2 ?? '',
        [INPUT_IDS.CITY]: draftValues?.[INPUT_IDS.CITY] ?? address?.city ?? '',
        [INPUT_IDS.STATE]: draftValues?.[INPUT_IDS.STATE] ?? address?.state ?? '',
        [INPUT_IDS.ZIP_POST_CODE]: draftValues?.[INPUT_IDS.ZIP_POST_CODE] ?? address?.zip ?? '',
        [INPUT_IDS.COUNTRY]: draftValues?.[INPUT_IDS.COUNTRY] ?? address?.country ?? '',
    };
}

function PrivatePersonalDetailsConfirmMagicCodePage() {
    const {translate} = useLocalize();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const primaryLogin = usePrimaryContactMethod();

    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);
    const personalDetailsError = getLatestErrorField(privatePersonalDetails, 'personalDetails');

    const clearError = () => {
        if (isEmptyObject(personalDetailsError) && isEmptyObject(validateCodeAction?.errorFields)) {
            return;
        }
        clearPersonalDetailsErrors();
    };

    const wasLoading = useRef(false);
    const hasErrors = !isEmptyObject(personalDetailsError) || !isEmptyObject(validateCodeAction?.errorFields);
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

    const values = useMemo(() => normalizeCountryCode(getFormValues(privatePersonalDetails, draftValues)) as PersonalDetailsForm, [privatePersonalDetails, draftValues]);

    const handleSubmitForm = useCallback(
        (validateCode: string) => {
            updatePrivatePersonalDetails(values, validateCode, countryCode);
        },
        [countryCode, values],
    );

    return (
        <ValidateCodeActionContent
            title={translate('delegate.makeSureItIsYou')}
            descriptionPrimary={translate('contacts.enterMagicCode', primaryLogin ?? '')}
            sendValidateCode={() => requestValidateCodeAction()}
            validateCodeActionErrorField="personalDetails"
            handleSubmitForm={handleSubmitForm}
            validateError={personalDetailsError}
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
