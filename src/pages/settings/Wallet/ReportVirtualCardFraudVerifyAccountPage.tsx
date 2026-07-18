import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import useInitialOnyxValue from '@hooks/useInitialOnyxValue';
import useLocalize from '@hooks/useLocalize';
import useNonPersonalCardList from '@hooks/useNonPersonalCardList';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';

import {clearCardListErrors, reportVirtualExpensifyCardFraud} from '@libs/actions/Card';
import {requestValidateCodeAction} from '@libs/actions/User';
import {getLatestErrorFieldForAnyField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import {clearValidateCodeActionError} from '@userActions/User';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useEffect} from 'react';

type ReportVirtualCardFraudVerifyAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD>;

function ReportVirtualCardFraudVerifyAccountPage({
    route: {
        params: {cardID = ''},
    },
}: ReportVirtualCardFraudVerifyAccountPageProps) {
    const cardList = useNonPersonalCardList();
    const virtualCard = cardList?.[cardID];
    const {translate} = useLocalize();
    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);
    const [formData] = useOnyx(ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD);
    const [physicalCardForm] = useOnyx(ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM);
    const initialCardList = useInitialOnyxValue(ONYXKEYS.CARD_LIST);
    const replacementCardID = Object.keys(cardList ?? {}).find((key) => !Object.hasOwn(initialCardList ?? {}, key) && cardList?.[key]?.cardID) ?? '';

    const primaryLogin = usePrimaryContactMethod();
    const cardError = getLatestErrorFieldForAnyField(virtualCard);
    const codeError = getLatestErrorFieldForAnyField(validateCodeAction);
    const prevIsLoading = usePrevious(formData?.isLoading);

    useEffect(() => {
        if (!prevIsLoading || formData?.isLoading) {
            return;
        }
        if (!isEmptyObject(cardError) || !isEmptyObject(codeError)) {
            return;
        }

        if (replacementCardID || physicalCardForm?.cardTerminatedWithoutReplacement) {
            const confirmationCardID = replacementCardID || cardID;
            Navigation.removeScreenFromNavigationState(SCREENS.SETTINGS.WALLET.DOMAIN_CARD);
            Navigation.goBack(ROUTES.SETTINGS_REPORT_FRAUD_CONFIRMATION.getRoute(confirmationCardID));
        }
    }, [cardError, cardID, codeError, formData?.isLoading, physicalCardForm?.cardTerminatedWithoutReplacement, prevIsLoading, replacementCardID]);

    const handleValidateCodeEntered = (validateCode: string) => {
        if (!virtualCard) {
            return;
        }

        reportVirtualExpensifyCardFraud(virtualCard, validateCode);
    };

    const handleClearError = () => {
        clearValidateCodeActionError(ONYXKEYS.VALIDATE_ACTION_CODE);
        if (!virtualCard?.cardID) {
            return;
        }
        clearCardListErrors(virtualCard.cardID);
    };

    return (
        <ValidateCodeActionContent
            title={translate('cardPage.validateCardTitle')}
            descriptionPrimary={translate('cardPage.enterMagicCode', primaryLogin ?? '')}
            sendValidateCode={() => requestValidateCodeAction()}
            validateCodeActionErrorField="reportVirtualCard"
            handleSubmitForm={handleValidateCodeEntered}
            validateError={{...cardError, ...codeError}}
            clearError={handleClearError}
            onClose={() => {
                Navigation.goBack(ROUTES.SETTINGS_REPORT_FRAUD.getRoute(cardID));
            }}
        />
    );
}

export default ReportVirtualCardFraudVerifyAccountPage;
