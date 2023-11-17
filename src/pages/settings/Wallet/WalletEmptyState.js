import PropTypes from 'prop-types';
import React from 'react';
import Button from '@components/Button';
import FeatureList from '@components/FeatureList';
import * as Illustrations from '@components/Icon/Illustrations';
import IllustratedHeaderPageLayout from '@components/IllustratedHeaderPageLayout';
import LottieAnimations from '@components/LottieAnimations';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import useTheme from '@styles/themes/useTheme';
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
    const {translate} = useLocalize();
    return (
        <IllustratedHeaderPageLayout
            backgroundColor={theme.PAGE_BACKGROUND_COLORS[SCREENS.SETTINGS.WALLET]}
            illustration={LottieAnimations.FastMoney}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
            title={translate('common.wallet')}
            footer={
                <Button
                    accessibilityLabel={translate('paymentMethodList.addPaymentMethod')}
                    success
                    text={translate('paymentMethodList.addPaymentMethod')}
                    onPress={onAddPaymentMethod}
                />
            }
        >
            <FeatureList
                menuItems={WALLET_FEATURES}
                headline="walletPage.getPaidFaster"
                description="walletPage.addPaymentMethod"
            />
        </IllustratedHeaderPageLayout>
    );
}

WalletEmptyState.displayName = 'WalletEmptyState';
WalletEmptyState.propTypes = propTypes;

export default WalletEmptyState;
