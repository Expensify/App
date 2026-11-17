import ExpensifyCardIcon from '@assets/images/expensify-card-icon.svg';

import BaseWidgetItem from '@components/BaseWidgetItem';

import useLocalize from '@hooks/useLocalize';

import {navigateToAddCardToDigitalWallet} from '@libs/actions/Card';
import {getWalletProviderNameKey} from '@libs/CardUtils';

import CONST from '@src/CONST';
import type {Card} from '@src/types/onyx';

import React from 'react';

type ConfirmDigitalWalletAdditionProps = {
    /** The card waiting for wallet addition confirmation */
    card: Card;
};

function ConfirmDigitalWalletAddition({card}: ConfirmDigitalWalletAdditionProps) {
    const {translate} = useLocalize();

    const walletName = translate(`addCardToDigitalWallet.${getWalletProviderNameKey(card.nameValuePairs?.pendingDigitalWalletApproval?.walletProvider, true)}`);

    return (
        <BaseWidgetItem
            sentryLabel={CONST.SENTRY_LABEL.HOME_PAGE.TIME_SENSITIVE_ITEM.CONFIRM_DIGITAL_WALLET_ADDITION}
            buttonSentryLabel={CONST.SENTRY_LABEL.HOME_PAGE.TIME_SENSITIVE_ITEM_BUTTON.CONFIRM_DIGITAL_WALLET_ADDITION}
            icon={ExpensifyCardIcon}
            title={translate('addCardToDigitalWallet.approvalNeeded', {walletName})}
            subtitle={translate('homePage.timeSensitiveSection.confirmDigitalWalletAddition.subtitle')}
            ctaText={translate('addCardToDigitalWallet.review')}
            onCtaPress={() => navigateToAddCardToDigitalWallet(card.cardID)}
            buttonVariant={CONST.BUTTON_VARIANT.SUCCESS}
        />
    );
}

export default ConfirmDigitalWalletAddition;
