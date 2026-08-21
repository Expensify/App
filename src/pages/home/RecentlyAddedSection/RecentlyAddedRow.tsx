import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import ReceiptCell from '@components/TransactionItemRow/DataCells/ReceiptCell';
import TypeCell from '@components/TransactionItemRow/DataCells/TypeCell';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {RecentlyAddedExpense} from './useRecentlyAddedData';

type RecentlyAddedRowProps = {
    /** The expense to render */
    expense: RecentlyAddedExpense;

    /** Called when the row is pressed */
    onPress: () => void;

    /** Whether to render a separator line below the row */
    shouldShowSeparator: boolean;

    /** Whether the hovered receipt preview may be shown. Becomes false once the screen blurs so the preview is dismissed after opening an expense. */
    shouldShowReceiptPreview: boolean;

    /** Horizontal padding that aligns the row content with the widget title while the full-width pressable spans the whole widget */
    rowStyle: StyleProp<ViewStyle>;
};

function RecentlyAddedRow({expense, onPress, shouldShowSeparator, shouldShowReceiptPreview, rowStyle}: RecentlyAddedRowProps) {
    const styles = useThemeStyles();
    const {convertToDisplayString} = useCurrencyListActions();
    const {dateFnsLocale} = useLocalize();

    const formattedDate = DateUtils.formatWithUTCTimeZone(
        expense.created,
        DateUtils.doesDateBelongToAPastYear(expense.created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT,
        dateFnsLocale,
    );

    const formattedAmount = convertToDisplayString(expense.amount, expense.currency);

    // The row always uses the stacked ("mobile") layout because it lives in the narrow right column on web/desktop
    // too: a thumbnail, then the merchant + amount on the first line and the date + type underneath. This mirrors the
    // Your spend transaction rows.
    const rowContent = (
        <>
            <ReceiptCell
                transactionItem={expense.transaction}
                isSelected={false}
                shouldUseNarrowLayout
                shouldShowPreview={shouldShowReceiptPreview}
            />
            <View style={[styles.flex1, styles.flexColumn, styles.gap1]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap2]}>
                    <Text
                        numberOfLines={1}
                        style={styles.flexShrink1}
                    >
                        {expense.merchant}
                    </Text>
                    <Text>{formattedAmount}</Text>
                </View>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap2]}>
                    <Text
                        numberOfLines={1}
                        style={styles.mutedNormalTextLabel}
                    >
                        {formattedDate}
                    </Text>
                    <TypeCell
                        transactionItem={expense.transaction}
                        shouldShowTooltip={false}
                        shouldUseNarrowLayout
                    />
                </View>
            </View>
        </>
    );

    // A pending-delete expense is on its way out, so its row must not navigate anywhere (offline it stays
    // visible with strikethrough; online OfflineWithFeedback hides it entirely).
    const isPendingDelete = expense.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

    return (
        <OfflineWithFeedback pendingAction={expense.pendingAction}>
            <PressableWithFeedback
                testID={`recentlyAddedRow-${expense.transactionID}`}
                accessibilityLabel={expense.merchant}
                sentryLabel="RecentlyAddedRow"
                onPress={isPendingDelete ? () => {} : onPress}
                wrapperStyle={styles.w100}
                hoverStyle={styles.hoveredComponentBG}
                style={[
                    styles.flexRow,
                    styles.alignItemsCenter,
                    styles.gap3,
                    styles.pv3,
                    styles.w100,
                    rowStyle,
                    shouldShowSeparator && styles.borderBottom,
                    isPendingDelete && styles.cursorDefault,
                ]}
            >
                {rowContent}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

export default RecentlyAddedRow;
