import PropTypes from 'prop-types';
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

const propTypes = {
    /** The function that is called when a menu item is pressed */
    onAddPaymentMethod: PropTypes.func.isRequired,
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

function WalletEmptyState({onAddPaymentMethod}) {
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
WalletEmptyState.propTypes = propTypes;

export default WalletEmptyState;
