import React, {useCallback, useEffect} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import {clearCardListErrors, reportVirtualExpensifyCardFraud} from '@libs/actions/Card';
import {requestValidateCodeAction, resetValidateActionCodeSent} from '@libs/actions/User';
import {filterPersonalCards} from '@libs/CardUtils';
import {getLatestErrorFieldForAnyField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {clearValidateCodeActionError} from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ReportVirtualCardFraudVerifyAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD>;

function ReportVirtualCardFraudVerifyAccountPage({
    route: {
        params: {cardID = ''},
    },
}: ReportVirtualCardFraudVerifyAccountPageProps) {
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {selector: filterPersonalCards, canBeMissing: false});
    const virtualCard = cardList?.[cardID];
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE, {canBeMissing: true});
    const [formData] = useOnyx(ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD, {canBeMissing: true});
    const latestIssuedVirtualCardID = Object.keys(cardList ?? {})?.pop();

    const primaryLogin = account?.primaryLogin ?? '';
    const cardError = getLatestErrorFieldForAnyField(virtualCard);
    const codeError = getLatestErrorFieldForAnyField(validateCodeAction);
    const prevIsLoading = usePrevious(formData?.isLoading);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (!prevIsLoading || formData?.isLoading) {
            return;
        }
        if (!isEmptyObject(cardError) || !isEmptyObject(codeError)) {
            return;
        }

        if (latestIssuedVirtualCardID) {
            Navigation.removeScreenFromNavigationState(SCREENS.SETTINGS.WALLET.DOMAIN_CARD);
            Navigation.goBack(ROUTES.SETTINGS_REPORT_FRAUD_CONFIRMATION.getRoute(latestIssuedVirtualCardID));
        }
    }, [formData?.isLoading, latestIssuedVirtualCardID, cardError, codeError, prevIsLoading]);

    const handleValidateCodeEntered = useCallback(
        (validateCode: string) => {
            if (!virtualCard) {
                return;
            }

            reportVirtualExpensifyCardFraud(virtualCard, validateCode);
        },
        [virtualCard],
    );

    const handleClearError = useCallback(() => {
        clearValidateCodeActionError(ONYXKEYS.VALIDATE_ACTION_CODE);
        if (!virtualCard?.cardID) {
            return;
        }
        clearCardListErrors(virtualCard.cardID);
    }, [virtualCard?.cardID]);

    return (
        <ValidateCodeActionContent
            title={translate('cardPage.validateCardTitle')}
            descriptionPrimary={translate('cardPage.enterMagicCode', primaryLogin)}
            sendValidateCode={() => requestValidateCodeAction()}
            validateCodeActionErrorField="reportVirtualCard"
            handleSubmitForm={handleValidateCodeEntered}
            validateError={{...cardError, ...codeError}}
            clearError={handleClearError}
            onClose={() => {
                resetValidateActionCodeSent();
                Navigation.goBack(ROUTES.SETTINGS_REPORT_FRAUD.getRoute(cardID));
            }}
        />
    );
}

export default ReportVirtualCardFraudVerifyAccountPage;
