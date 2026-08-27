import Checkbox from '@components/Checkbox';
import {COPYABLE_TEXT_DATA_SET} from '@components/CopyableText/selection';
import getExpenseReportRowDisplayValues from '@components/Search/SearchList/ListItem/getExpenseReportRowDisplayValues';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {ExpenseReportListItemRowNarrowProps} from './types';

function ExpenseReportListItemRowNarrow({item, onCheckboxPress = () => {}, canSelectMultiple, isSelectAllChecked, isIndeterminate, isDisabledCheckbox}: ExpenseReportListItemRowNarrowProps) {
    const styles = useThemeStyles();
    const {translate, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();

    const {amount: amountText, date: formattedDate, expenseCountText} = getExpenseReportRowDisplayValues(item, {translate, dateFnsLocale, convertToDisplayString});

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.pt3]}>
            {!!canSelectMultiple && (
                <Checkbox
                    onPress={onCheckboxPress}
                    isChecked={isSelectAllChecked}
                    isIndeterminate={isIndeterminate}
                    containerStyle={styles.m0}
                    disabled={isDisabledCheckbox}
                    accessibilityLabel={item.reportName ?? ''}
                    shouldStopMouseDownPropagation
                    style={[styles.cursorUnset, isDisabledCheckbox && styles.cursorDisabled]}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.EXPENSE_REPORT_CHECKBOX}
                />
            )}
            <View style={[styles.flexColumn, styles.gap1, styles.flex1]}>
                <View style={[styles.flexRow, styles.gap2]}>
                    <Text
                        numberOfLines={2}
                        style={[styles.lh20, styles.flex1]}
                        selectable
                        dataSet={COPYABLE_TEXT_DATA_SET}
                    >
                        {item.reportName ?? ''}
                    </Text>
                    <Text
                        style={[styles.lh20, styles.flexShrink0, styles.textAlignRight]}
                        selectable
                        dataSet={COPYABLE_TEXT_DATA_SET}
                    >
                        {amountText}
                    </Text>
                </View>
                <View style={[styles.flexRow, styles.gap2]}>
                    <Text
                        style={[styles.mutedNormalTextLabel, styles.flex1]}
                        selectable
                        dataSet={COPYABLE_TEXT_DATA_SET}
                    >
                        {formattedDate}
                    </Text>
                    <Text
                        style={[styles.mutedNormalTextLabel, styles.flexShrink0, styles.textAlignRight]}
                        selectable
                        dataSet={COPYABLE_TEXT_DATA_SET}
                    >
                        {expenseCountText}
                    </Text>
                </View>
            </View>
        </View>
    );
}

export default ExpenseReportListItemRowNarrow;
