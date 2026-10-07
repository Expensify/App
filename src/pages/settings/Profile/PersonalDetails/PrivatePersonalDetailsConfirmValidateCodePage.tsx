import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';

import {clearDraftValues} from '@libs/actions/FormActions';
import {clearPersonalDetailsErrors, updatePrivatePersonalDetails} from '@libs/actions/PersonalDetails';
import {requestValidateCodeAction} from '@libs/actions/User';
import {normalizeCountryCode} from '@libs/CountryUtils';
import {getLatestErrorField, getLatestErrorMessageField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackNavigationState, PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getPrivatePersonalDetailsFormValues} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {PersonalDetailsForm} from '@src/types/form';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useEffect, useRef} from 'react';

type PrivatePersonalDetailsConfirmValidateCodePageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.SETTINGS.PROFILE.PRIVATE_PERSONAL_DETAILS_CONFIRM_VALIDATE_CODE
>;

/**
 * Finds the screen that opened the private personal details form. The domain card detail page lives in its own RHP
 * navigator, so when the form is the first screen of the settings stack, look at the previous RHP navigator instead.
 */
function getOpenerRoute(navigation: PrivatePersonalDetailsConfirmValidateCodePageProps['navigation']) {
    const settingsNavigatorState: PlatformStackNavigationState<SettingsNavigatorParamList> = navigation.getState();
    const privatePersonalDetailsIndex = settingsNavigatorState.routes.findLastIndex((route) => route.name === SCREENS.SETTINGS.PROFILE.PRIVATE_PERSONAL_DETAILS);
    if (privatePersonalDetailsIndex > 0) {
        return settingsNavigatorState.routes.at(privatePersonalDetailsIndex - 1);
    }
    if (privatePersonalDetailsIndex < 0) {
        return undefined;
    }
    const rightModalNavigatorState = navigation.getParent()?.getState();
    if (!rightModalNavigatorState || rightModalNavigatorState.index < 1) {
        return undefined;
    }
    return rightModalNavigatorState.routes.at(rightModalNavigatorState.index - 1)?.state?.routes.at(-1);
}

/**
 * The card detail and lost/damaged card flows open the private personal details form to update the shipping address,
 * so return there after a successful save instead of to the Profile page.
 */
function getBackRouteAfterSave(navigation: PrivatePersonalDetailsConfirmValidateCodePageProps['navigation']): Route {
    const openerRoute = getOpenerRoute(navigation);
    const openerParams = openerRoute?.params;
    if (!openerParams || !('cardID' in openerParams) || typeof openerParams.cardID !== 'string') {
        return ROUTES.SETTINGS_PROFILE.route;
    }
    switch (openerRoute.name) {
        case SCREENS.SETTINGS.REPORT_CARD_LOST_OR_DAMAGED: {
            const isFromDomainCardDetail = 'isFromDomainCardDetail' in openerParams && !!openerParams.isFromDomainCardDetail;
            return ROUTES.SETTINGS_WALLET_REPORT_CARD_LOST_OR_DAMAGED.getRoute(openerParams.cardID, isFromDomainCardDetail);
        }
        case SCREENS.SETTINGS.WALLET.DOMAIN_CARD:
            return ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(openerParams.cardID);
        case SCREENS.DOMAIN_CARD.DOMAIN_CARD_DETAIL:
            return ROUTES.SETTINGS_DOMAIN_CARD_DETAIL.getRoute(openerParams.cardID);
        default:
            return ROUTES.SETTINGS_PROFILE.route;
    }
}

function PrivatePersonalDetailsConfirmValidateCodePage({navigation}: PrivatePersonalDetailsConfirmValidateCodePageProps) {
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
            clearDraftValues(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM);
            Navigation.goBack(getBackRouteAfterSave(navigation));
        }
        wasLoading.current = false;
    }, [privatePersonalDetails?.isLoading, hasErrors, navigation]);

    // The parent page defers clearing the form draft to this page so the submission payload survives navigating
    // to the validateCode RHP. Clear it whenever we leave this page without validating, so an unvalidated edit
    // doesn't reappear in the RHP form on remount. This covers the header back arrow, swipe-back, and hardware
    // back, and is idempotent with the success path above (which already clears the draft before navigating away).
    useEffect(() => () => clearDraftValues(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM), []);

    const values = normalizeCountryCode(getPrivatePersonalDetailsFormValues(privatePersonalDetails, draftValues)) as PersonalDetailsForm;

    const handleSubmitForm = (validateCode: string) => {
        updatePrivatePersonalDetails(values, validateCode, countryCode);
    };

    return (
        <ValidateCodeActionContent
            title={translate('delegate.makeSureItIsYou')}
            descriptionPrimary={translate('contacts.enterSecurityCode', primaryLogin ?? '')}
            sendValidateCode={() => requestValidateCodeAction({reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.UPDATE_PERSONAL_DETAILS})}
            validateCodeReasonCode={COMMON_CONST.VALIDATE_CODE_REASONS.UPDATE_PERSONAL_DETAILS}
            validateCodeActionErrorField="personalDetails"
            handleSubmitForm={handleSubmitForm}
            validateError={submitError}
            clearError={clearError}
            onClose={() => {
                // Plain goBack pops the confirm-validate-code RHP screen. Passing the SETTINGS_PRIVATE_PERSONAL_DETAILS route
                // here would compare params against the existing PrivatePersonalDetails route (which carries a
                // fieldToFocus param), miss, and REPLACE — leaving a duplicate PrivatePersonalDetails on the stack
                // so the next back-press only pops the duplicate.
                Navigation.goBack();
            }}
            isLoading={privatePersonalDetails?.isLoading}
        />
    );
}

PrivatePersonalDetailsConfirmValidateCodePage.displayName = 'PrivatePersonalDetailsConfirmValidateCodePage';

export default PrivatePersonalDetailsConfirmValidateCodePage;
