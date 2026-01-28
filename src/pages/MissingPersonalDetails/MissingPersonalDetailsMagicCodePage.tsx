import React, {useCallback, useEffect, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {clearDraftValues} from '@libs/actions/FormActions';
import {clearPersonalDetailsErrors, updatePersonalDetailsAndShipExpensifyCards} from '@libs/actions/PersonalDetails';
import {requestValidateCodeAction, resetValidateActionCodeSent} from '@libs/actions/User';
import {isPersonalCard} from '@libs/CardUtils';
import {normalizeCountryCode} from '@libs/CountryUtils';
import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {arePersonalDetailsMissing} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {primaryLoginSelector} from '@src/selectors/Account';
import type {PersonalDetailsForm} from '@src/types/form';
import type {CardList} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {getSubPageValues} from './utils';

const areAllCardsShippedSelector = (cardList: OnyxEntry<CardList>) =>
    Object.values(cardList ?? {})?.every((card) => card?.state !== CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED && !isPersonalCard(card));

function MissingPersonalDetailsMagicCodePage() {
    const {translate} = useLocalize();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: false});
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT, {canBeMissing: false});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});

    const [areAllCardsShipped] = useOnyx(ONYXKEYS.CARD_LIST, {selector: areAllCardsShippedSelector, canBeMissing: true});
    const [primaryLogin] = useOnyx(ONYXKEYS.ACCOUNT, {selector: primaryLoginSelector, canBeMissing: true});

    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE, {canBeMissing: true});
    const privateDetailsErrors = privatePersonalDetails?.errors ?? undefined;
    const validateLoginError = getLatestError(privateDetailsErrors);

    const missingDetails = arePersonalDetailsMissing(privatePersonalDetails);

    useEffect(() => {
        if (missingDetails || !!privateDetailsErrors || !areAllCardsShipped) {
            return;
        }

        clearDraftValues(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM);
        Navigation.dismissModal();
    }, [missingDetails, privateDetailsErrors, areAllCardsShipped]);

    const clearError = () => {
        if (isEmptyObject(validateLoginError) && isEmptyObject(validateCodeAction?.errorFields)) {
            return;
        }
        clearPersonalDetailsErrors();
    };

    const values = useMemo(() => normalizeCountryCode(getSubPageValues(privatePersonalDetails, draftValues)) as PersonalDetailsForm, [privatePersonalDetails, draftValues]);

    const handleSubmitForm = useCallback(
        (validateCode: string) => {
            updatePersonalDetailsAndShipExpensifyCards(values, validateCode, countryCode);
        },
        [countryCode, values],
    );

    return (
        <ValidateCodeActionContent
            title={translate('cardPage.validateCardTitle')}
            descriptionPrimary={translate('cardPage.enterMagicCode', primaryLogin ?? '')}
            sendValidateCode={() => requestValidateCodeAction()}
            validateCodeActionErrorField="personalDetails"
            handleSubmitForm={handleSubmitForm}
            validateError={validateLoginError}
            clearError={clearError}
            onClose={() => {
                resetValidateActionCodeSent();
                Navigation.goBack(ROUTES.MISSING_PERSONAL_DETAILS.getRoute());
            }}
            isLoading={privatePersonalDetails?.isLoading}
        />
    );
}

export default MissingPersonalDetailsMagicCodePage;
