import React, {useEffect} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import openBankConnection from '@pages/settings/Wallet/PersonalCards/steps/BankConnection/openBankConnection';
import type SCREENS from '@src/SCREENS';
import useFixPersonalCardConnection from './useFixPersonalCardConnection';

type FixPersonalCardConnectionPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.PERSONAL_CARD_FIX_CONNECTION>;

let customWindow: Window | null = null;

function FixPersonalCardConnectionPage({route}: FixPersonalCardConnectionPageProps) {
    const {cardID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['PendingBank']);
    const {bankDisplayName, url, isOffline} = useFixPersonalCardConnection(cardID);

    const onOpenBankConnectionFlow = () => {
        if (!url) {
            return;
        }
        customWindow = openBankConnection(url);
    };

    const handleBackButtonPress = () => {
        customWindow?.close();
        Navigation.goBack();
    };

    useEffect(() => {
        if (!url || isOffline) {
            return;
        }
        customWindow = openBankConnection(url);

        return () => {
            customWindow?.close();
        };
    }, [url, isOffline]);

    return (
        <ScreenWrapper
            testID="FixPersonalCardConnectionPage"
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={translate('personalCard.fixCard')}
                onBackButtonPress={handleBackButtonPress}
            />
            <FullPageOfflineBlockingView addBottomSafeAreaPadding>
                <BlockingView
                    icon={illustrations.PendingBank}
                    iconWidth={styles.pendingBankCardIllustration.width}
                    iconHeight={styles.pendingBankCardIllustration.height}
                    title={translate('workspace.moreFeatures.companyCards.pendingBankTitle')}
                    CustomSubtitle={
                        <Text style={[styles.textAlignCenter, styles.textSupporting]}>
                            {bankDisplayName && translate('workspace.moreFeatures.companyCards.pendingBankDescription', bankDisplayName)}
                            <TextLink onPress={onOpenBankConnectionFlow}>{translate('workspace.moreFeatures.companyCards.pendingBankLink')}</TextLink>.
                        </Text>
                    }
                    onLinkPress={onOpenBankConnectionFlow}
                    addBottomSafeAreaPadding
                />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

FixPersonalCardConnectionPage.displayName = 'FixPersonalCardConnectionPage';

export default FixPersonalCardConnectionPage;
