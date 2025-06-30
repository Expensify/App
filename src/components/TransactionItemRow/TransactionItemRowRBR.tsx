import React from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {DotIndicator} from '@components/Icon/Expensicons';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import variables from '@styles/variables';
import type {TransactionViolations} from '@src/types/onyx';

type TransactionItemRowRBRProps = {
    /** Transaction item */
    transactionViolations?: TransactionViolations;

    /** Styles for the RBR messages container */
    containerStyles?: ViewStyle[];

    /** Error message for missing required fields in the transaction */
    missingFieldError?: string;
};

/** This component is lighter version of TransactionItemRowRBRWithOnyx that doesn't use onyx but uses transactionViolations data computed from search,
 *  thus it doesn't include violations taken from reportActions like its counterpart does. */
function TransactionItemRowRBR({transactionViolations, containerStyles, missingFieldError}: TransactionItemRowRBRProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();

    if (!transactionViolations && !missingFieldError) {
        return null;
    }

    const RBRMessages = [
        ...(missingFieldError ? [`${missingFieldError}.`] : []),
        // Some violations end with a period already so lets make sure the connected messages have only single period between them
        // and end with a single dot.
        ...(transactionViolations
            ? transactionViolations.map((violation) => {
                  const message = ViolationsUtils.getViolationTranslation(violation, translate);
                  return message.endsWith('.') ? message : `${message}.`;
              })
            : []),
    ].join(' ');
    return (
        RBRMessages.length > 0 && (
            <View
                style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, containerStyles]}
                testID="TransactionItemRowRBR"
            >
                <Icon
                    src={DotIndicator}
                    fill={theme.danger}
                    height={variables.iconSizeExtraSmall}
                    width={variables.iconSizeExtraSmall}
                />
                <View style={[styles.pre, styles.flexShrink1, {color: theme.danger}]}>
                    <RenderHTML html={`<rbr shouldShowEllipsis="1" issmall >${RBRMessages}</rbr>`} />
                </View>
            </View>
        )
    );
}

TransactionItemRowRBR.displayName = 'TransactionItemRowRBR';
export default TransactionItemRowRBR;
