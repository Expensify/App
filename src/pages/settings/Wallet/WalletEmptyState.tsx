import React from 'react';
import type {FeatureListItem} from '@components/FeatureList';
import FeatureList from '@components/FeatureList';
import HeaderPageLayout from '@components/HeaderPageLayout';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type WalletEmptyStateProps = {
    /** The function that is called when a menu item is pressed */
    onAddPaymentMethod: () => void;
};

const WALLET_FEATURES: FeatureListItem[] = [
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
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <HeaderPageLayout
            backgroundColor={theme.PAGE_THEMES[SCREENS.SETTINGS.WALLET.ROOT].backgroundColor}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
            title={translate('common.wallet')}
            shouldShowBackButton={shouldUseNarrowLayout}
            shouldShowOfflineIndicatorInWideScreen
            style={shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection}
            testID={WalletEmptyState.displayName}
        >
            <FeatureList
                menuItems={WALLET_FEATURES}
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
