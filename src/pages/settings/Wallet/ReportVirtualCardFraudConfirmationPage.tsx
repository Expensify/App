import React, {useCallback} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImageSVG from '@components/ImageSVG';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ReportVirtualCardFraudConfirmationPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD_CONFIRMATION>;

function ReportVirtualCardFraudConfirmationPage({
    route: {
        params: {cardID = ''},
    },
}: ReportVirtualCardFraudConfirmationPageProps) {
    const themeStyles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlassSpyMouthClosed']);

    const close = useCallback(() => {
        Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID));
    }, [cardID]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            includePaddingTop
            shouldEnableMaxHeight
            testID="ReportVirtualCardFraudConfirmationPage"
            offlineIndicatorStyle={themeStyles.mtAuto}
        >
            <HeaderWithBackButton
                title={translate('reportFraudConfirmationPage.title')}
                onBackButtonPress={close}
            />

            <View style={[themeStyles.ph5, themeStyles.mt3, themeStyles.mb5, themeStyles.flex1]}>
                <View style={[themeStyles.justifyContentCenter, themeStyles.flex1]}>
                    <ImageSVG
                        contentFit="contain"
                        src={expensifyIcons.MagnifyingGlassSpyMouthClosed}
                        style={themeStyles.alignSelfCenter}
                        width={184}
                        height={290}
                    />

                    <Text style={[themeStyles.textHeadlineH1, themeStyles.alignSelfCenter, themeStyles.mt5]}>{translate('reportFraudConfirmationPage.title')}</Text>
                    <Text style={[themeStyles.textSupporting, themeStyles.alignSelfCenter, themeStyles.mt2, themeStyles.textAlignCenter]}>
                        {translate('reportFraudConfirmationPage.description')}
                    </Text>
                </View>

                <Button
                    text={translate('reportFraudConfirmationPage.buttonText')}
                    onPress={close}
                    style={themeStyles.justifyContentEnd}
                    success
                    large
                />
            </View>
        </ScreenWrapper>
    );
}

export default ReportVirtualCardFraudConfirmationPage;
