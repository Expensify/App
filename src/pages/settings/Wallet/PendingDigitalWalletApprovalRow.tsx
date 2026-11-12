import useLocalize from '@hooks/useLocalize';

import {navigateToAddCardToDigitalWallet} from '@libs/actions/Card';
import {getWalletProviderNameKey} from '@libs/CardUtils';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';

import WalletPromptRow from './WalletPromptRow';

type PendingDigitalWalletApprovalRowProps = {
    /** cardID of the card waiting for the cardholder to confirm or deny the wallet addition */
    cardID: number;

    /** Wallet the addition was requested from, used to name it in the message */
    walletProvider?: ValueOf<typeof CONST.EXPENSIFY_CARD.WALLET_PROVIDER>;

    /** Spacing for the row, which differs between the surfaces that render it */
    style?: StyleProp<ViewStyle>;
};

/**
 * Prompts the cardholder to review a wallet addition. Rendered on the Wallet page's card row and on the card details
 * page.
 */
function PendingDigitalWalletApprovalRow({cardID, walletProvider, style}: PendingDigitalWalletApprovalRowProps) {
    const {translate} = useLocalize();
    const walletName = translate(`addCardToDigitalWallet.${getWalletProviderNameKey(walletProvider, true)}`);

    return (
        <WalletPromptRow
            message={translate('addCardToDigitalWallet.approvalNeeded', {walletName})}
            buttonText={translate('addCardToDigitalWallet.review')}
            onButtonPress={() => navigateToAddCardToDigitalWallet(cardID)}
            buttonSentryLabel={CONST.SENTRY_LABEL.SETTINGS_WALLET.DIGITAL_WALLET_APPROVAL_REVIEW}
            style={style}
        />
    );
}

export default PendingDigitalWalletApprovalRow;
