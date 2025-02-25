import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import ValidateCodeActionModal from '@components/ValidateCodeActionModal';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import {requestValidateCodeAction} from '@libs/actions/User';
import {getLatestErrorMessage, getLatestErrorMessageField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import {clearCardListErrors, clearReportVirtualCardFraudForm, reportVirtualExpensifyCardFraud} from '@userActions/Card';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ReportVirtualCardFraudPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD>;

function ReportVirtualCardFraudPage({
    route: {
        params: {cardID = ''},
    },
}: ReportVirtualCardFraudPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [formData] = useOnyx(ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD);
    const primaryLogin = account?.primaryLogin ?? '';
    const loginData = loginList?.[primaryLogin];

    const virtualCard = cardList?.[cardID];
    const latestIssuedVirtualCardID = Object.keys(cardList ?? {})?.pop();
    const virtualCardError = getLatestErrorMessage(virtualCard);
    const validateError = getLatestErrorMessageField(virtualCard);

    const [isValidateCodeActionModalVisible, setIsValidateCodeActionModalVisible] = useState(false);

    const prevIsLoading = usePrevious(formData?.isLoading);

    useBeforeRemove(() => setIsValidateCodeActionModalVisible(false));

    useEffect(() => {
        clearReportVirtualCardFraudForm();
    }, []);

    useEffect(() => {
        if (!prevIsLoading || formData?.isLoading) {
            return;
        }
        if (!isEmptyObject(virtualCard?.errors)) {
            return;
        }

        if (latestIssuedVirtualCardID) {
            Navigation.removeScreenFromNavigationState(SCREENS.SETTINGS.WALLET.DOMAIN_CARD);
            Navigation.goBack(ROUTES.SETTINGS_REPORT_FRAUD_CONFIRMATION.getRoute(latestIssuedVirtualCardID));
            setIsValidateCodeActionModalVisible(false);
        }
    }, [formData?.isLoading, latestIssuedVirtualCardID, prevIsLoading, virtualCard?.errors]);

    const handleValidateCodeEntered = useCallback(
        (validateCode: string) => {
            if (!virtualCard) {
                return;
            }

            reportVirtualExpensifyCardFraud(virtualCard, validateCode);
        },
        [virtualCard],
    );

    const sendValidateCode = () => {
        if (loginData?.validateCodeSent) {
            return;
        }

        requestValidateCodeAction();
    };

    const handleSubmit = useCallback(() => {
        setIsValidateCodeActionModalVisible(true);
    }, [setIsValidateCodeActionModalVisible]);

    if (isEmptyObject(virtualCard) && !formData?.cardID) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper testID={ReportVirtualCardFraudPage.displayName}>
            <HeaderWithBackButton
                title={translate('reportFraudPage.title')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(cardID))}
            />
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <Text style={[styles.webViewStyles.baseFontStyle, styles.mh5]}>{translate('reportFraudPage.description')}</Text>
                <FormAlertWithSubmitButton
                    isAlertVisible={!!virtualCardError}
                    onSubmit={handleSubmit}
                    message={virtualCardError}
                    buttonText={translate('reportFraudPage.deactivateCard')}
                    containerStyles={[styles.m5]}
                />
                <ValidateCodeActionModal
                    handleSubmitForm={handleValidateCodeEntered}
                    sendValidateCode={sendValidateCode}
                    validateError={validateError}
                    clearError={() => {
                        if (!virtualCard?.cardID) {
                            return;
                        }
                        clearCardListErrors(virtualCard.cardID);
                    }}
                    onClose={() => setIsValidateCodeActionModalVisible(false)}
                    isVisible={isValidateCodeActionModalVisible}
                    title={translate('cardPage.validateCardTitle')}
                    descriptionPrimary={translate('cardPage.enterMagicCode', {contactMethod: primaryLogin})}
                    hasMagicCodeBeenSent={!!loginData?.validateCodeSent}
                    isLoading={formData?.isLoading}
                />
            </View>
        </ScreenWrapper>
    );
}

ReportVirtualCardFraudPage.displayName = 'ReportVirtualCardFraudPage';

export default ReportVirtualCardFraudPage;
