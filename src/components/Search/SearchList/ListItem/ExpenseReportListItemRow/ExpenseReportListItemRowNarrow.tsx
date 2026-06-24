import React from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import Text from '@components/Text';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import type {ExpenseReportListItemRowNarrowProps} from './types';

function ExpenseReportListItemRowNarrow({item, onCheckboxPress = () => {}, canSelectMultiple, isSelectAllChecked, isIndeterminate, isDisabledCheckbox}: ExpenseReportListItemRowNarrowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();

    const currency = item.currency ?? CONST.CURRENCY.USD;
    const {totalDisplaySpend = 0, isAllScanning: isScanning = false} = item;

    const filteredTransactions = item.transactions?.filter((t) => t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const expenseCount = (filteredTransactions?.length ? filteredTransactions.length : undefined) ?? item.transactionCount ?? 0;
    const expenseCountText = translate('iou.expenseCount', {count: expenseCount});
    const formattedDate = DateUtils.formatWithUTCTimeZone(
        item.created ?? '',
        DateUtils.doesDateBelongToAPastYear(item.created ?? '') ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT,
    );

    const amountText = isScanning ? translate('iou.receiptStatusTitle') : convertToDisplayString(totalDisplaySpend, currency);
    const groupAccessibilityLabel = [item.reportName, amountText, formattedDate, expenseCountText].filter(Boolean).join(', ');

    return (
        <View
            style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.pt3]}
            accessible
            accessibilityLabel={groupAccessibilityLabel}
            role={CONST.ROLE.BUTTON}
        >
            {!!canSelectMultiple && (
                <Checkbox
                    onPress={onCheckboxPress}
                    isChecked={isSelectAllChecked}
                    isIndeterminate={isIndeterminate}
                    containerStyle={styles.m0}
                    disabled={isDisabledCheckbox}
                    accessibilityLabel={item.text ?? ''}
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
                    >
                        {item.reportName ?? ''}
                    </Text>
                    <Text style={[styles.lh20, styles.flexShrink0, styles.textAlignRight]}>{amountText}</Text>
                </View>
                <View style={[styles.flexRow, styles.gap2]}>
                    <Text style={[styles.mutedNormalTextLabel, styles.flex1]}>{formattedDate}</Text>
                    <Text style={[styles.mutedNormalTextLabel, styles.flexShrink0, styles.textAlignRight]}>{expenseCountText}</Text>
                </View>
            </View>
        </View>
    );
}

export default ExpenseReportListItemRowNarrow;
