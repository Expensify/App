import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import RecentlyAddedReceiptThumbnail from './RecentlyAddedReceiptThumbnail';
import type {RecentlyAddedExpense} from './useRecentlyAddedData';

const FALLBACK_THUMBNAIL_SIZE = 40;
const FALLBACK_ICON_SIZE = 20;

/** Width of the leading thumbnail column, shared with the section's column header. */
const THUMBNAIL_COLUMN_WIDTH = FALLBACK_THUMBNAIL_SIZE;

/** Width of the date column, shared with the section's column header so labels line up with the values. */
const DATE_COLUMN_WIDTH = 72;

type RecentlyAddedRowProps = {
    /** The expense to render */
    expense: RecentlyAddedExpense;

    /** Called when the row is pressed */
    onPress: () => void;

    /** Whether to render a separator line below the row */
    shouldShowSeparator: boolean;
};

function RecentlyAddedRow({expense, onPress, shouldShowSeparator}: RecentlyAddedRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {convertToDisplayString} = useCurrencyListActions();
    const icons = useMemoizedLazyExpensifyIcons(['Receipt', 'ArrowRight']);

    const formattedDate = DateUtils.formatWithUTCTimeZone(expense.created, CONST.DATE.MONTH_DAY_ABBR_FORMAT);

    const thumbnail = expense.transaction ? (
        <RecentlyAddedReceiptThumbnail transaction={expense.transaction} />
    ) : (
        <View
            style={[
                StyleUtils.getWidthAndHeightStyle(FALLBACK_THUMBNAIL_SIZE, FALLBACK_THUMBNAIL_SIZE),
                StyleUtils.getBorderRadiusStyle(variables.componentBorderRadiusSmall),
                styles.alignItemsCenter,
                styles.justifyContentCenter,
                StyleUtils.getBackgroundColorStyle(theme.border),
            ]}
        >
            <Icon
                src={icons.Receipt}
                fill={theme.icon}
                width={FALLBACK_ICON_SIZE}
                height={FALLBACK_ICON_SIZE}
            />
        </View>
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
            {thumbnail}
            <View style={StyleUtils.getWidthStyle(DATE_COLUMN_WIDTH)}>
                <Text numberOfLines={1}>{formattedDate}</Text>
            </View>
            <Text
                numberOfLines={1}
                style={styles.flex1}
            >
                {expense.merchant}
            </Text>
            <Text>{convertToDisplayString(expense.amount, expense.currency)}</Text>
            <Icon
                src={icons.ArrowRight}
                fill={theme.icon}
                width={variables.iconSizeSmall}
                height={variables.iconSizeSmall}
            />
        </PressableWithFeedback>
    );
}

export default RecentlyAddedRow;
export {THUMBNAIL_COLUMN_WIDTH, DATE_COLUMN_WIDTH};
