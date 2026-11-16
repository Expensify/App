import useIsSearchRowFocused from '@components/Search/hooks/useIsSearchRowFocused';
import ListItemComposed from '@components/SelectionList/ListItemComposed';

import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

import type {TripListItemProps} from './types';

import TripListItemRow from './TripListItemRow';

/**
 * A trip row in search results. Tapping the row or its View action opens the trip room.
 */
function TripListItem({item, columns = [], showTooltip, isDisabled, onSelectRow, onFocus, shouldSyncFocus, isLastItem}: TripListItemProps) {
    const styles = useThemeStyles();
    const isFocused = useIsSearchRowFocused(item.keyForList);
    const StyleUtils = useStyleUtils();
    const {pageGutterMargin} = useLayoutSpacing();
    const {isLargeScreenWidth} = useResponsiveLayout();

    const listItemPressableStyle = [
        styles.selectionListPressableItemWrapper,
        styles.pv3,
        styles.ph3,
        // Background is applied on the parent wrapper, so keep this transparent
        styles.bgTransparent,
        styles.mh0,
        isLargeScreenWidth && StyleUtils.getSearchTableRowPressableStyle(!!isLastItem, false, {vertical: variables.tableRowPaddingVertical}),
    ];

    return (
        <ListItemComposed
            item={item}
            shouldAllowTextSelection
            pressableStyle={listItemPressableStyle}
            containerStyle={!isLargeScreenWidth && styles.mb2}
            isFocused={isFocused}
            isDisabled={isDisabled}
            shouldShowTooltip={showTooltip}
            canSelectMultiple={false}
            onSelectRow={onSelectRow}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            pressableWrapperStyle={[
                pageGutterMargin,
                StyleUtils.getSearchRowBackgroundStyle(false),
                !isLargeScreenWidth && styles.br2,
                isLargeScreenWidth && isLastItem && [styles.tableBottomRadius, styles.overflowHidden],
            ]}
        >
            <View style={[styles.flex1, styles.userSelectNone]}>
                <TripListItemRow
                    item={item}
                    columns={columns}
                    showTooltip={!!showTooltip}
                    onViewPress={() => onSelectRow(item)}
                />
            </View>
        </ListItemComposed>
    );
}

export default TripListItem;
