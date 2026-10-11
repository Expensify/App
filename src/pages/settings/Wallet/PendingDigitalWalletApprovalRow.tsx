import Button from '@components/Button';
import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
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

/**
 * Prompts the cardholder to review a wallet addition. Rendered on the Wallet page's card row and on the card details
 * page, and laid out like the other call-to-action rows in the Wallet list so the two read as the same kind of prompt.
 */
function PendingDigitalWalletApprovalRow({cardID, walletProvider, style}: PendingDigitalWalletApprovalRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);
    const walletName = translate(`addCardToDigitalWallet.${getWalletProviderNameKey(walletProvider, true)}`);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, style]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1, styles.mr2]}>
                <Icon
                    src={icons.DotIndicator}
                    fill={theme.success}
                    additionalStyles={[styles.mr2]}
                />
                <Text style={[styles.mutedNormalTextLabel, styles.label, styles.textSuccess, styles.flexShrink1]}>{translate('addCardToDigitalWallet.approvalNeeded', {walletName})}</Text>
            </View>
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
