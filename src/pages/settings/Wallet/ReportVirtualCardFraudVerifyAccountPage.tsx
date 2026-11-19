import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useInitialOnyxValue from '@hooks/useInitialOnyxValue';
import useLocalize from '@hooks/useLocalize';
import useNonPersonalCardList from '@hooks/useNonPersonalCardList';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';

import {clearCardListErrors, reportVirtualExpensifyCardFraud} from '@libs/actions/Card';
import {requestValidateCodeAction} from '@libs/actions/User';
import {getLatestErrorFieldForAnyField} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import removeDynamicRouteFromPath from '@libs/Navigation/helpers/dynamicRoutesUtils/removeDynamicRouteFromPath';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import {clearValidateCodeActionError} from '@userActions/User';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useEffect} from 'react';

type ReportVirtualCardFraudVerifyAccountPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.SETTINGS.WALLET.DYNAMIC_REPORT_VIRTUAL_CARD_FRAUD_CONFIRM_VALIDATE_CODE
>;

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
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WALLET_CARD_REPORT_FRAUD_VERIFY_ACCOUNT.path);

    useEffect(() => {
        if (!prevIsLoading || formData?.isLoading) {
            return;
        }
        if (!isEmptyObject(cardError) || !isEmptyObject(codeError)) {
            return;
        }

        if (replacementCardID || physicalCardForm?.cardTerminatedWithoutReplacement) {
            const confirmationCardID = replacementCardID || cardID;
            // Domains opens the fraud page as a static route, so there is no dynamic suffix to remove there.
            const cardDetailsPath = removeDynamicRouteFromPath(backPath, DYNAMIC_ROUTES.WALLET_CARD_REPORT_FRAUD.path) ?? ROUTES.SETTINGS_DOMAIN_CARD_DETAIL.getRoute(cardID);
            Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.WALLET_CARD_REPORT_FRAUD_CONFIRMATION.getRoute(confirmationCardID), cardDetailsPath));
        }
    }, [backPath, cardError, cardID, codeError, formData?.isLoading, physicalCardForm?.cardTerminatedWithoutReplacement, prevIsLoading, replacementCardID]);

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
            descriptionPrimary={translate('cardPage.enterSecurityCode', primaryLogin ?? '')}
            sendValidateCode={() => requestValidateCodeAction({reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.REPORT_CARD_FRAUD, reasonCardID: Number(cardID)})}
            validateCodeActionErrorField="reportVirtualCard"
            handleSubmitForm={handleValidateCodeEntered}
            validateError={{...cardError, ...codeError}}
            clearError={handleClearError}
            onClose={() => {
                Navigation.goBack(backPath);
            }}
        />
    );
}

export default ReportVirtualCardFraudVerifyAccountPage;
