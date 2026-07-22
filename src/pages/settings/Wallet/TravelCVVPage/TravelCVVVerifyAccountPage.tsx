import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';

import {revealTravelCardDetails} from '@libs/actions/Card';
import {requestValidateCodeAction} from '@libs/actions/User';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getTravelInvoicingCard} from '@libs/TravelInvoicingUtils';

import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {CONST} from 'expensify-common';
import React, {useCallback} from 'react';

import {useTravelCVVActions, useTravelCVVState} from './TravelCVVContextProvider';

/**
 * TravelCVVVerifyAccountPage - Handles magic code verification for Travel CVV reveal.
 * This is a separate page following the pattern used by ExpensifyCardVerifyAccountPage.
 */
function TravelCVVVerifyAccountPage() {
    const {translate} = useLocalize();
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);

    const {isLoading, validateError} = useTravelCVVState();
    const {setCvv, setIsLoading, setValidateError} = useTravelCVVActions();

    const primaryLogin = usePrimaryContactMethod();
    const travelCard = getTravelInvoicingCard(cardList);

    const navigateBack = useCallback(() => {
        Navigation.goBack(ROUTES.SETTINGS_WALLET_TRAVEL_CVV);
    }, []);

    const handleRevealCardDetails = (validateCode: string) => {
        if (!travelCard?.cardID) {
            return;
        }

        setIsLoading(true);

        revealTravelCardDetails(+travelCard.cardID, validateCode)
            .then((cardDetails) => {
                setCvv(cardDetails.cvv ?? null);
                navigateBack();
            })
            .catch((error: TranslationPaths) => {
                setValidateError(getMicroSecondOnyxErrorWithTranslationKey(error));
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    if (!travelCard) {
        return null;
    }

    return (
        <ValidateCodeActionContent
            title={translate('cardPage.validateCardTitle')}
            descriptionPrimary={translate('cardPage.enterMagicCode', primaryLogin ?? '')}
            sendValidateCode={() => requestValidateCodeAction({reasonCode: CONST.VALIDATE_CODE_REASONS.REVEAL_CARD_DETAILS, reasonCardID: travelCard.cardID})}
            validateCodeActionErrorField="revealExpensifyCardDetails"
            handleSubmitForm={handleRevealCardDetails}
            validateError={validateError}
            clearError={() => setValidateError({})}
            onClose={() => {
                navigateBack();
            }}
            isLoading={isLoading}
        />
    );
}

export default TravelCVVVerifyAccountPage;
