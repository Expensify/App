import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import Button from '@components/Button';
import FeatureList from '@components/FeatureList';
import IllustratedHeaderPageLayout from '@components/IllustratedHeaderPageLayout';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import useThemeIllustrations from '@styles/illustrations/useThemeIllustrations';
import useTheme from '@styles/themes/useTheme';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

const propTypes = {
    /** The function that is called when a menu item is pressed */
    onAddPaymentMethod: PropTypes.func.isRequired,
};

function WalletEmptyState({onAddPaymentMethod}) {
    const theme = useTheme();
    const illustrations = useThemeIllustrations();
    const {translate} = useLocalize();

    const WALLET_FEATURES = useMemo(
        () => [
            {
                icon: illustrations.MoneyIntoWallet,
                translationKey: 'walletPage.getPaidBackFaster',
            },
            {
                icon: illustrations.OpenSafe,
                translationKey: 'walletPage.secureAccessToYourMoney',
            },
            {
                icon: illustrations.HandEarth,
                translationKey: 'walletPage.receiveMoney',
            },
        ],
        [illustrations],
    );

    return (
        <IllustratedHeaderPageLayout
            backgroundColor={theme.PAGE_BACKGROUND_COLORS[SCREENS.SETTINGS.WALLET]}
            illustration={illustrations.LottieAnimations.FastMoney}
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
