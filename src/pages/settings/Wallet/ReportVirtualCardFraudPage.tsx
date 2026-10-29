import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useNonPersonalCardList from '@hooks/useNonPersonalCardList';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorMessage} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DomainCardNavigatorParamList, SettingsNavigatorParamList} from '@libs/Navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import {clearReportVirtualCardFraudForm} from '@userActions/Card';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useEffect} from 'react';
import {View} from 'react-native';

type ReportVirtualCardFraudPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_REPORT_VIRTUAL_CARD_FRAUD>
    | PlatformStackScreenProps<DomainCardNavigatorParamList, typeof SCREENS.DOMAIN_CARD.DOMAIN_CARD_REPORT_FRAUD>;

function ReportVirtualCardFraudPage({route}: ReportVirtualCardFraudPageProps) {
    const {cardID = ''} = route.params;
    const isDomainCardRoute = route.name === SCREENS.DOMAIN_CARD.DOMAIN_CARD_REPORT_FRAUD;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WALLET_CARD_REPORT_FRAUD.path, !isDomainCardRoute);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const cardList = useNonPersonalCardList();
    const [formData] = useOnyx(ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD);

    const virtualCard = cardList?.[cardID];
    const virtualCardError = getLatestErrorMessage(virtualCard);

    useEffect(() => {
        clearReportVirtualCardFraudForm();
    }, []);

    const handleSubmit = () => {
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WALLET_CARD_REPORT_FRAUD_VERIFY_ACCOUNT.path));
    };

    if (isEmptyObject(virtualCard) && !formData?.cardID) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper testID="ReportVirtualCardFraudPage">
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('reportFraudPage.title')}
                    onBackButtonPress={() => {
                        if (isDomainCardRoute) {
                            Navigation.goBack(ROUTES.SETTINGS_DOMAIN_CARD_DETAIL.getRoute(cardID));
                            return;
                        }
                        Navigation.goBack(backPath);
                    }}
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
                </View>
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

export default ReportVirtualCardFraudPage;
