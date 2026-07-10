import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';

import {buildSetPersonalDetailsAndShipExpensifyCardsParams, setPersonalDetailsAndRevealExpensifyCard} from '@libs/actions/PersonalDetails';
import {requestValidateCodeAction} from '@libs/actions/User';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DomainCardNavigatorParamList, SettingsNavigatorParamList} from '@libs/Navigation/types';
import {setRevealedVirtualCardDetails, setVirtualCardDetailsLoading} from '@libs/RevealedCardSecretsStore';

import {getNormalizedSubPageValues} from '@pages/MissingPersonalDetails/utils';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Errors} from '@src/types/onyx/OnyxCommon';

import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useState} from 'react';

type ExpensifyCardVerifyAccountPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DOMAIN_CARD_CONFIRM_MAGIC_CODE>
    | PlatformStackScreenProps<DomainCardNavigatorParamList, typeof SCREENS.DOMAIN_CARD.DOMAIN_CARD_CONFIRM_MAGIC_CODE>;

function ExpensifyCardVerifyAccountPage({route}: ExpensifyCardVerifyAccountPageProps) {
    const {cardID} = route.params;
    const {translate} = useLocalize();
    const [validateError, setValidateError] = useState<Errors>({});
    const primaryLogin = usePrimaryContactMethod();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);

    const navigateBack = () => {
        if (route.name === SCREENS.DOMAIN_CARD.DOMAIN_CARD_CONFIRM_MAGIC_CODE) {
            Navigation.goBack(ROUTES.SETTINGS_DOMAIN_CARD_DETAIL.getRoute(cardID));
            return;
        }
        Navigation.goBack(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID));
    };

    const handleRevealCardDetails = (validateCode: string) => {
        setVirtualCardDetailsLoading(cardID, true);
        // Card secrets (PAN/expiration/CVV) must NOT be persisted to disk for PCI compliance,
        // so the revealed details are kept in the in-memory RevealedCardSecretsStore instead of Onyx.

        const personalDetailsForm = getNormalizedSubPageValues(privatePersonalDetails);
        const personalDetailsParams = buildSetPersonalDetailsAndShipExpensifyCardsParams(personalDetailsForm, countryCode);

        setPersonalDetailsAndRevealExpensifyCard(personalDetailsParams, Number.parseInt(cardID, 10), validateCode)
            .then((value) => {
                setRevealedVirtualCardDetails(cardID, value);
                navigateBack();
            })
            .catch((error: TranslationPaths) => {
                setValidateError(getMicroSecondOnyxErrorWithTranslationKey(error));
            })
            .finally(() => {
                setVirtualCardDetailsLoading(cardID, false);
            });
    };

    return (
        <ValidateCodeActionContent
            title={translate('cardPage.validateCardTitle')}
            descriptionPrimary={translate('cardPage.enterMagicCode', primaryLogin)}
            sendValidateCode={() => requestValidateCodeAction({reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.REVEAL_CARD_DETAILS, reasonCardID: Number.parseInt(cardID, 10)})}
            validateCodeActionErrorField="revealExpensifyCardDetails"
            handleSubmitForm={handleRevealCardDetails}
            validateError={validateError}
            clearError={() => setValidateError({})}
            onClose={() => {
                navigateBack();
            }}
            isLoading={privatePersonalDetails?.isLoading}
        />
    );
}

export default ExpensifyCardVerifyAccountPage;
