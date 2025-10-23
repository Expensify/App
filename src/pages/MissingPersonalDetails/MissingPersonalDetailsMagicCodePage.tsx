import React, {useEffect, useMemo} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {clearDraftValues} from '@libs/actions/FormActions';
import {clearPersonalDetailsErrors, updatePersonalDetailsAndShipExpensifyCards} from '@libs/actions/PersonalDetails';
import {requestValidateCodeAction, resetValidateActionCodeSent} from '@libs/actions/User';
import {normalizeCountryCode} from '@libs/CountryUtils';
import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetailsForm} from '@src/types/form';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {getSubstepValues} from './utils';

function MissingPersonalDetailsMagicCodePage() {
    const {translate} = useLocalize();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: false});
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT, {canBeMissing: false});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});

    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});

    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE, {canBeMissing: true});
    const privateDetailsErrors = privatePersonalDetails?.errors ?? undefined;
    const validateLoginError = getLatestError(privateDetailsErrors);
    const primaryLogin = account?.primaryLogin ?? '';
    const areAllCardsShipped = Object.values(cardList ?? {})?.every((card) => card?.state !== CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED);

    const missingDetails =
        !privatePersonalDetails?.legalFirstName ||
        !privatePersonalDetails?.legalLastName ||
        !privatePersonalDetails?.dob ||
        !privatePersonalDetails?.phoneNumber ||
        isEmptyObject(privatePersonalDetails?.addresses) ||
        privatePersonalDetails.addresses.length === 0;

    useEffect(() => {
        if (missingDetails || !!privateDetailsErrors || !areAllCardsShipped) {
            return;
        }

        clearDraftValues(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM);
        Navigation.goBack();
    }, [missingDetails, privateDetailsErrors, areAllCardsShipped]);

    const clearError = () => {
        if (isEmptyObject(validateLoginError) && isEmptyObject(validateCodeAction?.errorFields)) {
            return;
        }
        clearPersonalDetailsErrors();
    };

    const values = useMemo(() => normalizeCountryCode(getSubstepValues(privatePersonalDetails, draftValues)) as PersonalDetailsForm, [privatePersonalDetails, draftValues]);

    const handleSubmitForm = (validateCode: string) => {
        updatePersonalDetailsAndShipExpensifyCards(values, validateCode, countryCode);
    };

    return (
        <ValidateCodeActionContent
            title={translate('cardPage.validateCardTitle')}
            descriptionPrimary={translate('cardPage.enterMagicCode', {contactMethod: primaryLogin})}
            sendValidateCode={() => requestValidateCodeAction()}
            validateCodeActionErrorField="personalDetails"
            handleSubmitForm={handleSubmitForm}
            validateError={validateLoginError}
            clearError={clearError}
            onClose={() => {
                resetValidateActionCodeSent();
                Navigation.goBack(ROUTES.MISSING_PERSONAL_DETAILS);
            }}
            isLoading={privatePersonalDetails?.isLoading}
        />
    );
}

MissingPersonalDetailsMagicCodePage.displayName = 'MissingPersonalDetailsMagicCodePage';

export default MissingPersonalDetailsMagicCodePage;
