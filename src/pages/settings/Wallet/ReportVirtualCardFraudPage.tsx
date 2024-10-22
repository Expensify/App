import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import ValidateCodeActionModal from '@components/ValidateCodeActionModal';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as Card from '@userActions/Card';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ReportVirtualCardFraudPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD>;

function ReportVirtualCardFraudPage({
    route: {
        params: {cardID = ''},
    },
}: ReportVirtualCardFraudPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [formData] = useOnyx(ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD);
    const [isValidateCodeActionModalVisible, setIsValidateCodeActionModalVisible] = useState(false);

    const virtualCard = cardList?.[cardID];
    const virtualCardError = ErrorUtils.getLatestErrorMessage(virtualCard);

    const prevIsLoading = usePrevious(formData?.isLoading);

    useEffect(() => {
        if (!prevIsLoading || formData?.isLoading) {
            return;
        }
        if (!isEmptyObject(virtualCard?.errors)) {
            return;
        }

        Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(cardID));
    }, [cardID, formData?.isLoading, prevIsLoading, virtualCard?.errors]);

    if (isEmptyObject(virtualCard)) {
        return <NotFoundPage />;
    }

    const openValidateCodeModal = () => {
        setIsValidateCodeActionModalVisible(true);
    };

    const handleValidateCodeEntered = (validateCode: string) => {
        Card.reportVirtualExpensifyCardFraud(virtualCard.cardID, validateCode).finally(() => {
            setIsValidateCodeActionModalVisible(false);
        });
    };

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
                    onSubmit={openValidateCodeModal}
                    message={virtualCardError}
                    isLoading={formData?.isLoading}
                    buttonText={translate('reportFraudPage.deactivateCard')}
                    containerStyles={[styles.m5]}
                />
            </View>
            <ValidateCodeActionModal
                handleSubmitForm={handleValidateCodeEntered}
                clearError={() => {}}
                onClose={() => setIsValidateCodeActionModalVisible(false)}
                isVisible={isValidateCodeActionModalVisible}
                title={translate('cardPage.validateCardTitle')}
                description={translate('cardPage.enterMagicCode', {contactMethod: account?.primaryLogin ?? ''})}
            />
        </ScreenWrapper>
    );
}

ReportVirtualCardFraudPage.displayName = 'ReportVirtualCardFraudPage';

export default ReportVirtualCardFraudPage;
