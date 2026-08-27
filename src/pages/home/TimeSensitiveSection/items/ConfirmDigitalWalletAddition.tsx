import ExpensifyCardIcon from '@assets/images/expensify-card-icon.svg';

import BaseWidgetItem from '@components/BaseWidgetItem';

import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Card} from '@src/types/onyx';

import React from 'react';

type ConfirmDigitalWalletAdditionProps = {
    card: Card;
};

function ConfirmDigitalWalletAddition({card}: ConfirmDigitalWalletAdditionProps) {
    const theme = useTheme();
    const {translate} = useLocalize();

    // The card provider reports Google Wallet as ANDROID_PAY, and doesn't always tell us which wallet asked
    const walletProvider = card.nameValuePairs?.pendingDigitalWalletApproval?.walletProvider;
    let walletName = translate('homePage.timeSensitiveSection.confirmDigitalWalletAddition.digitalWallet');
    if (walletProvider === CONST.EXPENSIFY_CARD.WALLET_PROVIDER.APPLE_PAY) {
        walletName = translate('homePage.timeSensitiveSection.confirmDigitalWalletAddition.appleWallet');
    } else if (walletProvider === CONST.EXPENSIFY_CARD.WALLET_PROVIDER.ANDROID_PAY) {
        walletName = translate('homePage.timeSensitiveSection.confirmDigitalWalletAddition.googleWallet');
    }

    return (
        <BaseWidgetItem
            icon={ExpensifyCardIcon}
            iconBackgroundColor={theme.widgetIconBG}
            iconFill={theme.widgetIconFill}
            title={translate('homePage.timeSensitiveSection.confirmDigitalWalletAddition.title', {walletName})}
            subtitle={translate('homePage.timeSensitiveSection.confirmDigitalWalletAddition.subtitle')}
            ctaText={translate('homePage.timeSensitiveSection.confirmDigitalWalletAddition.cta')}
            onCtaPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_ADD_TO_DIGITAL_WALLET.getRoute(String(card.cardID)))}
            buttonVariant={CONST.BUTTON_VARIANT.SUCCESS}
        />
    );
}

export default ConfirmDigitalWalletAddition;
