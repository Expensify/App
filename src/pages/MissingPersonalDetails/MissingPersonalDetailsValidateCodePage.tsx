import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';

import {clearCardListErrors} from '@libs/actions/Card';
import {clearDraftValues} from '@libs/actions/FormActions';
import {
    buildSetPersonalDetailsAndShipExpensifyCardsParams,
    clearPersonalDetailsErrors,
    setPersonalDetailsAndRevealExpensifyCard,
    updatePersonalDetailsAndShipExpensifyCards,
    updatePrivatePersonalDetailsForWallet,
} from '@libs/actions/PersonalDetails';
import {requestValidateCodeAction} from '@libs/actions/User';
import type ResendValidateCodeParams from '@libs/API/parameters/ResendValidateCodeParams';
import {normalizeCountryCode} from '@libs/CountryUtils';
import {getLatestError, getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MissingPersonalDetailsParamList} from '@libs/Navigation/types';
import {arePersonalDetailsMissing} from '@libs/PersonalDetailsUtils';
import {setRevealedVirtualCardDetails} from '@libs/RevealedCardSecretsStore';
import {completeWalletEnrollment, isWalletEnrollmentActive} from '@libs/WalletEnrollment';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CardList} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useEffect, useRef, useState} from 'react';

import {getSubPageValues} from './utils';

type MissingPersonalDetailsValidateCodePageProps = PlatformStackScreenProps<MissingPersonalDetailsParamList, typeof SCREENS.DYNAMIC_MISSING_PERSONAL_DETAILS_CONFIRM_VALIDATE_CODE>;

function MissingPersonalDetailsValidateCodePage({
    route: {
        key: verificationKey,
        params: {cardID = '', walletEnrollmentID},
    },
}: MissingPersonalDetailsValidateCodePageProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const isSavingWalletRef = useRef(false);
    const [isSavingWallet, setIsSavingWallet] = useState(false);
    const basePath = useDynamicBackPath(DYNAMIC_ROUTES.MISSING_PERSONAL_DETAILS_CONFIRM_VALIDATE_CODE.path);
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);

    const targetCardSelector = (cardList: OnyxEntry<CardList>) => (cardID ? cardList?.[cardID] : undefined);
    const [targetCard] = useOnyx(ONYXKEYS.CARD_LIST, {selector: targetCardSelector});
    const isVirtualCard = !!targetCard?.nameValuePairs?.isVirtual;

    // Dismissal keys off the card this flow is for, not every Expensify card: a different card that failed to ship must
    // not keep the user stuck here once their own card has shipped.
    const isTargetCardShipped = !!targetCard && targetCard.state !== CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED;
    const primaryLogin = usePrimaryContactMethod();

    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);
    const privateDetailsErrors = privatePersonalDetails?.errors ?? undefined;
    const validateLoginError = getLatestError(privateDetailsErrors);
    const [revealCardError, setRevealCardError] = useState<Errors>({});

    // When the physical card the user is completing details for fails to ship, the backend writes an RBR to its Onyx entry.
    // Surface it inline on this modal so the user sees why, since dismissal is gated on the card actually shipping.
    const cardErrors = targetCard?.errors ?? undefined;

    const missingDetails = arePersonalDetailsMissing(privatePersonalDetails);

    useEffect(() => {
        if (walletEnrollmentID || isVirtualCard || missingDetails || !!privateDetailsErrors || !isTargetCardShipped) {
            return;
        }

        clearDraftValues(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM);
        Navigation.dismissModal();
    }, [walletEnrollmentID, isVirtualCard, missingDetails, privateDetailsErrors, isTargetCardShipped]);

    const clearError = () => {
        setRevealCardError({});
        if (!isEmptyObject(cardErrors) && cardID) {
            clearCardListErrors(Number(cardID));
        }
        if (isEmptyObject(validateLoginError) && isEmptyObject(validateCodeAction?.errorFields)) {
            return;
        }
        clearPersonalDetailsErrors();
    };

    const values = normalizeCountryCode(getSubPageValues(privatePersonalDetails, draftValues));

    const handleSubmitForm = (validateCode: string) => {
        if (walletEnrollmentID) {
            if (isOffline || isSavingWalletRef.current || !isWalletEnrollmentActive(walletEnrollmentID, cardID, verificationKey)) {
                return;
            }
            isSavingWalletRef.current = true;
            setIsSavingWallet(true);
            updatePrivatePersonalDetailsForWallet(values, validateCode, countryCode)
                .then(() => {
                    if (!completeWalletEnrollment(walletEnrollmentID, cardID, verificationKey)) {
                        return;
                    }
                    clearDraftValues(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM);
                })
                .catch(() => {
                    if (!isWalletEnrollmentActive(walletEnrollmentID, cardID, verificationKey)) {
                        return;
                    }
                    setRevealCardError(getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'));
                })
                .finally(() => {
                    isSavingWalletRef.current = false;
                    if (isWalletEnrollmentActive(walletEnrollmentID, cardID, verificationKey)) {
                        setIsSavingWallet(false);
                    }
                });
            return;
        }
        if (isVirtualCard) {
            setPersonalDetailsAndRevealExpensifyCard(buildSetPersonalDetailsAndShipExpensifyCardsParams(values, countryCode), Number(cardID), validateCode)
                .then((details) => {
                    setRevealedVirtualCardDetails(cardID, details);
                    clearDraftValues(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM);
                    Navigation.closeRHPFlow();
                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WALLET_DOMAIN_CARD.getRoute(cardID), ROUTES.SETTINGS_WALLET));
                })
                .catch((error: TranslationPaths) => {
                    setRevealCardError(getMicroSecondOnyxErrorWithTranslationKey(error));
                });
            return;
        }
        updatePersonalDetailsAndShipExpensifyCards(values, validateCode, countryCode);
    };

    // The validate code generated here must carry the reasonCode of the command handleSubmitForm will
    // call: virtual cards verify via SetPersonalDetailsAndRevealExpensifyCard (reveal_card_details)
    // and physical cards via SetPersonalDetailsAndShipExpensifyCards (ship_card)
    let resendValidateCodeParams: ResendValidateCodeParams = {reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.SHIP_CARD};
    if (walletEnrollmentID) {
        resendValidateCodeParams = {reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.UPDATE_PERSONAL_DETAILS};
    } else if (isVirtualCard) {
        resendValidateCodeParams = {reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.REVEAL_CARD_DETAILS, reasonCardID: Number(cardID)};
    }

    let validateError = validateLoginError;
    if (!isEmptyObject(revealCardError)) {
        validateError = revealCardError;
    } else if (!walletEnrollmentID && !isEmptyObject(cardErrors)) {
        validateError = cardErrors;
    }

    return (
        <ValidateCodeActionContent
            title={translate('cardPage.validateCardTitle')}
            descriptionPrimary={translate('cardPage.enterSecurityCode', primaryLogin ?? '')}
            sendValidateCode={() => requestValidateCodeAction(resendValidateCodeParams)}
            validateCodeActionErrorField={CONST.MISSING_PERSONAL_DETAILS_VALIDATE_CODE_FIELD}
            validateCodeReasonCode={resendValidateCodeParams.reasonCode}
            handleSubmitForm={handleSubmitForm}
            validateError={validateError}
            clearError={clearError}
            onClose={() => {
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MISSING_PERSONAL_DETAILS.getRoute(cardID, undefined, undefined, walletEnrollmentID), basePath), {forceReplace: true});
            }}
            isLoading={walletEnrollmentID ? isSavingWallet : privatePersonalDetails?.isLoading}
        />
    );
}

export default MissingPersonalDetailsValidateCodePage;
