import Icon from '@components/Icon';
import {useSearchColumnStyles} from '@components/Search/SearchColumnWidthsContext';
import type {SearchColumnType} from '@components/Search/types';
import {useListItemHovered} from '@components/SelectionList/ListItemContext';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {Fragment} from 'react';
import {View} from 'react-native';

import type {TripListItemType} from './types';

import ActionCell from './ActionCell';
import DateCell from './DateCell';
import TextCell from './TextCell';
import TotalCell from './TotalCell';
import TripStatusCell from './TripStatusCell';
import UserInfoCell from './UserInfoCell';

type TripListItemRowProps = {
    item: TripListItemType;

    /** Columns to show on wide screens */
    columns: SearchColumnType[];

    showTooltip: boolean;

    onViewPress: () => void;
};

/**
 * A trip row in search results showing the trip's dates, status, name, traveler and total, with a View action.
 */
function TripListItemRow({item, columns, showTooltip, onViewPress}: TripListItemRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const getSearchColumnStyles = useSearchColumnStyles();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const isHovered = useListItemHovered();

    const startDate = (
        <DateCell
            date={item.startDate ?? ''}
            showTooltip={showTooltip}
            isLargeScreenWidth={isLargeScreenWidth}
        />
    );
    const endDate = (
        <DateCell
            date={item.endDate ?? ''}
            showTooltip={showTooltip}
            isLargeScreenWidth={isLargeScreenWidth}
        />
    );
    const traveler = (
        <UserInfoCell
            accountID={item.traveler.accountID}
            avatar={item.traveler.avatar}
            displayName={item.formattedTraveler}
            isLargeScreenWidth={isLargeScreenWidth}
        />
    );
    const total = (
        <TotalCell
            total={item.total ?? 0}
            currency={item.currency ?? CONST.CURRENCY.USD}
        />
    );

    if (!isLargeScreenWidth) {
        return (
            <View style={styles.gap3}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                    <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>{traveler}</View>
                    <View style={StyleUtils.getWidthStyle(variables.w80)}>
                        <TripStatusCell
                            status={item.status}
                            badgeStyles={styles.alignSelfEnd}
                        />
                    </View>
                </View>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                    <View style={[styles.flex1, styles.gap1]}>
                        <TextCell
                            text={item.tripName}
                            isLargeScreenWidth={false}
                        />
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
                            {startDate}
                            <Text style={styles.mutedNormalTextLabel}>-</Text>
                            {endDate}
                        </View>
                    </View>
                    {total}
                </View>
            </View>
        );
    }

    const columnComponents: Partial<Record<SearchColumnType, React.ReactNode>> = {
        [CONST.SEARCH.TABLE_COLUMNS.START_DATE]: <View style={getSearchColumnStyles(CONST.SEARCH.TABLE_COLUMNS.START_DATE)}>{startDate}</View>,
        [CONST.SEARCH.TABLE_COLUMNS.END_DATE]: <View style={getSearchColumnStyles(CONST.SEARCH.TABLE_COLUMNS.END_DATE)}>{endDate}</View>,
        [CONST.SEARCH.TABLE_COLUMNS.STATUS]: (
            <View style={getSearchColumnStyles(CONST.SEARCH.TABLE_COLUMNS.STATUS)}>
                <TripStatusCell status={item.status} />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.TRIP_NAME]: (
            <View style={getSearchColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TRIP_NAME)}>
                <TextCell text={item.tripName} />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.TRAVELER]: <View style={getSearchColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TRAVELER)}>{traveler}</View>,
        [CONST.SEARCH.TABLE_COLUMNS.TOTAL]: <View style={getSearchColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL, {shouldRemoveTotalColumnFlex: true})}>{total}</View>,
        [CONST.SEARCH.TABLE_COLUMNS.ACTION]: (
            <View
                style={getSearchColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ACTION)}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
            >
                <ActionCell
                    action={CONST.SEARCH.ACTION_TYPES.VIEW}
                    onButtonPress={onViewPress}
                />
            </View>
        ),
    };

    return (
        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                {columns.map((column) => (
                    <Fragment key={column}>{columnComponents[column]}</Fragment>
                ))}
            </View>
            <Icon
                src={expensifyIcons.ArrowRight}
                width={variables.iconSizeNormal}
                height={variables.iconSizeNormal}
                fill={theme.icon}
                additionalStyles={!isHovered && styles.opacitySemiTransparent}
            />
        </View>
    );
}

export default TripListItemRow;
