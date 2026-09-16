import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {navigateToAddCardToDigitalWallet} from '@libs/actions/Card';
import {getWalletProviderNameKey} from '@libs/CardUtils';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

type PendingDigitalWalletApprovalRowProps = {
    /** cardID of the card waiting for the cardholder to confirm or deny the wallet addition */
    cardID: number;

    /** Wallet the addition was requested from, used to name it in the message */
    walletProvider?: ValueOf<typeof CONST.EXPENSIFY_CARD.WALLET_PROVIDER>;

    /** Spacing for the row, which differs between the surfaces that render it */
    style?: StyleProp<ViewStyle>;
};

/** Prompts the cardholder to review a wallet addition. Rendered on the Wallet page's card row and on the card details page. */
function PendingDigitalWalletApprovalRow({cardID, walletProvider, style}: PendingDigitalWalletApprovalRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const walletName = translate(`addCardToDigitalWallet.${getWalletProviderNameKey(walletProvider, true)}`);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, style]}>
            <DotIndicatorMessage
                style={[styles.flex1, styles.mr3]}
                textStyles={styles.textSuccess}
                messages={{pendingDigitalWalletApproval: translate('addCardToDigitalWallet.approvalNeeded', {walletName})}}
                type="success"
            />
            <Button
                size={CONST.BUTTON_SIZE.SMALL}
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                onPress={() => navigateToAddCardToDigitalWallet(cardID)}
            >
                <Button.Text>{translate('addCardToDigitalWallet.review')}</Button.Text>
            </Button>
        </View>
    );
}

export default PendingDigitalWalletApprovalRow;
