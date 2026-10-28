import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImageSVG from '@components/ImageSVG';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import removeDynamicRouteFromPath from '@libs/Navigation/helpers/dynamicRoutesUtils/removeDynamicRouteFromPath';
import getCardDetailsPathForCard from '@libs/Navigation/helpers/getCardDetailsPathForCard';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

type ReportVirtualCardFraudConfirmationPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_REPORT_VIRTUAL_CARD_FRAUD_CONFIRMATION>;

function ReportVirtualCardFraudConfirmationPage({
    route: {
        params: {cardID = ''},
    },
}: ReportVirtualCardFraudConfirmationPageProps) {
    const themeStyles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlassSpyMouthClosed']);
    const [physicalCardForm] = useOnyx(ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM);
    const isCardTerminatedWithoutReplacement = !!physicalCardForm?.cardTerminatedWithoutReplacement;
    const description = isCardTerminatedWithoutReplacement ? 'reportFraudConfirmationPage.descriptionCardNotReplaced' : 'reportFraudConfirmationPage.description';
    const cardDetailsPath = useDynamicBackPath(DYNAMIC_ROUTES.WALLET_CARD_REPORT_FRAUD_CONFIRMATION.path);

    const close = () => {
        if (isCardTerminatedWithoutReplacement) {
            Navigation.dismissModal();
            return;
        }

        // The fraud page stays under this one after a successful report, so its suffix has to go before the card page is pointed at the replacement card.
        const reportedCardPath = removeDynamicRouteFromPath(cardDetailsPath, DYNAMIC_ROUTES.WALLET_CARD_REPORT_FRAUD.path) ?? cardDetailsPath;
        Navigation.goBack(getCardDetailsPathForCard(reportedCardPath, cardID), {compareParams: false});
    };

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
            <View style={[themeStyles.ph5, themeStyles.mt3, themeStyles.mb5, themeStyles.flex1, themeStyles.gap2]}>
                <ScrollView contentContainerStyle={[themeStyles.flexGrow1, themeStyles.justifyContentCenter]}>
                    <ImageSVG
                        contentFit="contain"
                        src={expensifyIcons.MagnifyingGlassSpyMouthClosed}
                        style={themeStyles.alignSelfCenter}
                        width={184}
                        height={290}
                    />

                    <Text style={[themeStyles.textHeadlineH1, themeStyles.alignSelfCenter, themeStyles.mt5]}>{translate('reportFraudConfirmationPage.title')}</Text>
                    <Text style={[themeStyles.textSupporting, themeStyles.alignSelfCenter, themeStyles.mt2, themeStyles.textAlignCenter]}>{translate(description)}</Text>
                </ScrollView>
                <Button
                    onPress={close}
                    style={themeStyles.justifyContentEnd}
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                >
                    <Button.Text>{translate('reportFraudConfirmationPage.buttonText')}</Button.Text>
                </Button>
            </View>
        </ScreenWrapper>
    );
}

export default ReportVirtualCardFraudConfirmationPage;
