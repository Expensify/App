import React, {useCallback} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {revealVirtualCardDetails} from '@libs/actions/Card';
import {requestValidateCodeAction, resetValidateActionCodeSent} from '@libs/actions/User';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getTravelInvoicingCard} from '@libs/TravelInvoicingUtils';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {useTravelCVVActions, useTravelCVVState} from './TravelCVVContextProvider';

/**
 * TravelCVVVerifyAccountPage - Handles magic code verification for Travel CVV reveal.
 * This is a separate page following the pattern used by ExpensifyCardVerifyAccountPage.
 */
function TravelCVVVerifyAccountPage() {
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const [cardList] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});

    // Get state and actions from context
    const {isLoading, validateError} = useTravelCVVState();
    const {setCvv, setIsLoading, setValidateError} = useTravelCVVActions();

    const primaryLogin = account?.primaryLogin ?? '';
    const travelCard = getTravelInvoicingCard(cardList);

    const navigateBack = useCallback(() => {
        Navigation.goBack(ROUTES.SETTINGS_WALLET_TRAVEL_CVV);
    }, []);

    const handleRevealCardDetails = (validateCode: string) => {
        if (!travelCard?.cardID) {
            return;
        }

        setIsLoading(true);

        // Call revealVirtualCardDetails and only extract CVV
        // eslint-disable-next-line rulesdir/no-thenable-actions-in-views
        revealVirtualCardDetails(+travelCard.cardID, validateCode)
            .then((cardDetails) => {
                // Only store CVV - never persist PAN or other details
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

    return (
        <ValidateCodeActionContent
            title={translate('cardPage.validateCardTitle')}
            descriptionPrimary={translate('cardPage.enterMagicCode', primaryLogin)}
            sendValidateCode={() => requestValidateCodeAction()}
            validateCodeActionErrorField="revealExpensifyCardDetails"
            handleSubmitForm={handleRevealCardDetails}
            validateError={validateError}
            clearError={() => setValidateError({})}
            onClose={() => {
                resetValidateActionCodeSent();
                navigateBack();
            }}
            isLoading={isLoading}
        />
    );
}

export default TravelCVVVerifyAccountPage;
