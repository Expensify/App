import React from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {DotIndicator} from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import variables from '@styles/variables';
import type Transaction from '@src/types/onyx/Transaction';

function TransactionItemRowRBR({transaction, containerStyles}: {transaction: Transaction; containerStyles?: ViewStyle[]}) {
    const styles = useThemeStyles();
    const transactionViolations = useTransactionViolations(transaction?.transactionID);
    const {translate} = useLocalize();
    const theme = useTheme();

    const RBRmessages = transactionViolations
        .map((violation, index) => {
            const translation = ViolationsUtils.getViolationTranslation(violation, translate);
            return index > 0 ? translation.charAt(0).toLowerCase() + translation.slice(1) : translation;
        })
        .join(', ');

    return (
        transactionViolations.length > 0 && (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, containerStyles]}>
                <Icon
                    src={DotIndicator}
                    fill={theme.danger}
                    height={variables.iconSizeExtraSmall}
                    width={variables.iconSizeExtraSmall}
                />
                <Text
                    numberOfLines={1}
                    style={[styles.textMicroSupporting, styles.pre, styles.flexShrink1, {color: theme.danger}]}
                >
                    {RBRmessages}
                </Text>
            </View>
        )
    );
}

export default TransactionItemRowRBR;
