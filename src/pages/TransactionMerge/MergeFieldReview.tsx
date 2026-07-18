import FormHelpMessage from '@components/FormHelpMessage';
import {PressableWithoutFeedback} from '@components/Pressable';
import RadioButton from '@components/RadioButton';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {MergeFieldData, MergeFieldKey} from '@libs/MergeTransactionUtils';
import type {TransactionDetails} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

type MergeFieldReviewProps = {
    mergeField: MergeFieldData;
    onValueSelected: (transaction: Transaction, transactionDetails: TransactionDetails, field: MergeFieldKey) => void;
    errorText: string | undefined;
};

function MergeFieldReview({mergeField, onValueSelected, errorText}: MergeFieldReviewProps) {
    const {label, field, options} = mergeField;
    const styles = useThemeStyles();

    return (
        <View style={[styles.mb3, styles.pv5, styles.borderRadiusComponentLarge, styles.highlightBG]}>
            <Text style={[styles.textSupporting, styles.pb3, styles.ph5]}>{label}</Text>
            {options.map((option) => {
                const {transaction, transactionDetails, displayValue, isSelected} = option;

                return (
                    <PressableWithoutFeedback
                        key={`${field}-${transaction.transactionID}`}
                        onPress={() => onValueSelected(transaction, transactionDetails, field)}
                        accessibilityLabel={displayValue}
                        accessible={false}
                        hoverStyle={styles.hoveredComponentBG}
                        style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.pv5, styles.ph5]}
                        sentryLabel={CONST.SENTRY_LABEL.MERGE_EXPENSE.FIELD_VALUE_OPTION}
                    >
                        <Text style={[styles.flex1, styles.mr1, styles.textBold, styles.breakWord]}>{displayValue}</Text>
                        <RadioButton
                            isChecked={isSelected}
                            onPress={() => onValueSelected(transaction, transactionDetails, field)}
                            accessibilityLabel={displayValue}
                        />
                    </PressableWithoutFeedback>
                );
            })}
            {!!errorText && (
                <FormHelpMessage
                    message={errorText}
                    style={[styles.ph5]}
                />
            )}
        </View>
    );
}

export default MergeFieldReview;
