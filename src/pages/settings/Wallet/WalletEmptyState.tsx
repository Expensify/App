import React from 'react';
import FeatureList from '@components/FeatureList';
import HeaderPageLayout from '@components/HeaderPageLayout';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type WalletEmptyStateProps = {
    /** The function that is called when a menu item is pressed */
    onAddPaymentMethod: () => void;
};

const WALLET_FEATURES = [
    {
        icon: Illustrations.MoneyIntoWallet,
        translationKey: 'walletPage.getPaidBackFaster',
    },
    {
        icon: Illustrations.OpenSafe,
        translationKey: 'walletPage.secureAccessToYourMoney',
    },
    {
        icon: Illustrations.HandEarth,
        translationKey: 'walletPage.receiveMoney',
    },
];

function WalletEmptyState({onAddPaymentMethod}: WalletEmptyStateProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

    return (
        <HeaderPageLayout
            backgroundColor={theme.PAGE_THEMES[SCREENS.SETTINGS.WALLET.ROOT].backgroundColor}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
            title={translate('common.wallet')}
            shouldShowBackButton={isSmallScreenWidth}
            shouldShowOfflineIndicatorInWideScreen
            style={isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection}
        >
            <FeatureList
                menuItems={WALLET_FEATURES}
                // @ts-expect-error TODO: Remove once FeatureList (https://github.com/Expensify/App/issues/25039) is migrated to TS
                illustration={LottieAnimations.FastMoney}
                illustrationBackgroundColor={theme.fallbackIconColor}
                title={translate('walletPage.getPaidFaster')}
                subtitle={translate('walletPage.addPaymentMethod')}
                ctaText={translate('paymentMethodList.addPaymentMethod')}
                ctaAccessibilityLabel={translate('paymentMethodList.addPaymentMethod')}
                onCtaPress={onAddPaymentMethod}
            />
        </HeaderPageLayout>
    );
}

WalletEmptyState.displayName = 'WalletEmptyState';

export default WalletEmptyState;
