import ExpensifyCardIcon from '@assets/images/expensify-card-icon.svg';

import BaseWidgetItem from '@components/BaseWidgetItem';

import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';

import {getWalletProviderNameKey} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Card} from '@src/types/onyx';

import React from 'react';

type ConfirmDigitalWalletAdditionProps = {
    /** The Expensify Card whose digital wallet addition is awaiting the cardholder's confirmation */
    card: Card;
};

function ConfirmDigitalWalletAddition({card}: ConfirmDigitalWalletAdditionProps) {
    const theme = useTheme();
    const {translate} = useLocalize();

    const walletName = translate(`homePage.timeSensitiveSection.confirmDigitalWalletAddition.${getWalletProviderNameKey(card.nameValuePairs?.pendingDigitalWalletApproval?.walletProvider)}`);

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
