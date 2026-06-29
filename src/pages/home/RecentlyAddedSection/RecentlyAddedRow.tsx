import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import ReceiptCell from '@components/TransactionItemRow/DataCells/ReceiptCell';
import TypeCell from '@components/TransactionItemRow/DataCells/TypeCell';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {RecentlyAddedExpense} from './useRecentlyAddedData';

/** Width of the date column, shared with the section's column header so labels line up with the values. */
const DATE_COLUMN_WIDTH = 72;

/** Wider date column used when a row's date includes the year (e.g. "Jun 7, 2025"), so it isn't truncated. */
const DATE_COLUMN_WIDTH_WIDE = 102;

type RecentlyAddedRowProps = {
    /** The expense to render */
    expense: RecentlyAddedExpense;

    /** Called when the row is pressed */
    onPress: () => void;

    /** Whether to render a separator line below the row */
    shouldShowSeparator: boolean;

    /** Whether the hovered receipt preview may be shown. Becomes false once the screen blurs so the preview is dismissed after opening an expense. */
    shouldShowReceiptPreview: boolean;

    /** Width of the date column, widened by the section when any visible expense's date includes the year. */
    dateColumnWidth: number;
};

function RecentlyAddedRow({expense, onPress, shouldShowSeparator, shouldShowReceiptPreview, dateColumnWidth}: RecentlyAddedRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {convertToDisplayString} = useCurrencyListActions();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const formattedDate = DateUtils.formatWithUTCTimeZone(
        expense.created,
        DateUtils.doesDateBelongToAPastYear(expense.created) ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT,
    );

    const formattedAmount = convertToDisplayString(expense.amount, expense.currency);

    const thumbnail = (
        <ReceiptCell
            transactionItem={expense.transaction}
            isSelected={false}
            shouldUseNarrowLayout={shouldUseNarrowLayout}
            shouldShowPreview={shouldShowReceiptPreview}
        />
    );

    // Mirror the Your spend rows: the arrow is dimmed at rest and reaches full opacity once the row is hovered.
    const renderArrow = (hovered: boolean) => (
        <View style={!hovered && styles.opacitySemiTransparent}>
            <Icon
                src={icons.ArrowRight}
                fill={theme.icon}
                width={variables.iconSizeNormal}
                height={variables.iconSizeNormal}
            />
        </View>
    );

    // On narrow (mobile) layout the row mirrors the Spend transaction rows: a stacked layout with the
    // merchant and amount on the first line and the date underneath, instead of the wide table columns.
    const renderRowContent = (hovered: boolean) =>
        shouldUseNarrowLayout ? (
            <>
                {thumbnail}
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
        ) : (
            <>
                {thumbnail}
                <View style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TYPE)}>
                    <TypeCell
                        transactionItem={expense.transaction}
                        shouldShowTooltip={false}
                        shouldUseNarrowLayout={false}
                    />
                </View>
                <View style={StyleUtils.getWidthStyle(dateColumnWidth)}>
                    <Text numberOfLines={1}>{formattedDate}</Text>
                </View>
                <Text
                    numberOfLines={1}
                    style={styles.flex1}
                >
                    {expense.merchant}
                </Text>
                <Text>{formattedAmount}</Text>
                {renderArrow(hovered)}
            </>
        );

    return (
        <PressableWithFeedback
            testID={`recentlyAddedRow-${expense.transactionID}`}
            accessibilityLabel={expense.merchant}
            sentryLabel="RecentlyAddedRow"
            onPress={onPress}
            wrapperStyle={styles.w100}
            hoverStyle={styles.hoveredComponentBG}
            style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.pv3, styles.ph3, styles.w100, shouldShowSeparator && styles.borderBottom]}
        >
            {({hovered}) => renderRowContent(hovered)}
        </PressableWithFeedback>
    );
}

export default RecentlyAddedRow;
export {DATE_COLUMN_WIDTH, DATE_COLUMN_WIDTH_WIDE};
