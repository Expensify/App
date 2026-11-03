import Button from '@components/Button';
import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import navigateToWiseMoreInfoNeeded from '@libs/Navigation/helpers/navigateToWiseMoreInfoNeeded';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

/**
 * The Wallet bank account row's prompt for an account Wise asked for more info on, before it can enable global reimbursements.
 */
type WiseMoreInfoNeededRowProps = {
    bankAccountID: number;

    /** Spacing for the row, which follows the list it sits in */
    style?: StyleProp<ViewStyle>;
};

/**
 * Prompts the admin under the Wallet bank account row to send Wise the info it asked for, so global reimbursements can be enabled.
 * Laid out like the other call-to-action rows in the Wallet list so they read as the same kind of prompt.
 */
function WiseMoreInfoNeededRow({bankAccountID, style}: WiseMoreInfoNeededRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, style]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1, styles.mr2]}>
                <Icon
                    src={icons.DotIndicator}
                    fill={theme.success}
                    additionalStyles={[styles.mr2]}
                />
                <Text style={[styles.mutedNormalTextLabel, styles.label, styles.textSuccess, styles.flexShrink1]}>{translate('walletPage.wiseMoreInfoNeeded')}</Text>
            </View>
            <Button
                size={CONST.BUTTON_SIZE.SMALL}
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                onPress={() => navigateToWiseMoreInfoNeeded(bankAccountID)}
                sentryLabel={CONST.SENTRY_LABEL.SETTINGS_WALLET.WISE_MORE_INFO_NEEDED_REVIEW}
            >
                <Button.Text>{translate('common.review')}</Button.Text>
            </Button>
        </View>
    );
}

export default WiseMoreInfoNeededRow;
