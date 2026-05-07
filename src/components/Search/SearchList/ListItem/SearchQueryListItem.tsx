import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Icon from '@components/Icon';
import BaseListItem from '@components/SelectionList/ListItem/BaseListItem';
import type {ListItem, ListItemFocusEventHandler} from '@components/SelectionList/ListItem/types';
import TextWithTooltip from '@components/TextWithTooltip';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {OptionData} from '@libs/ReportUtils';
import type CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

type SearchQueryItem = ListItem & {
    singleIcon?: IconAsset;
    /** Whether to apply the theme fill color to the icon. Set to false for multi-colored icons like avatars. Defaults to true. */
    shouldIconApplyFill?: boolean;
    searchItemType?: ValueOf<typeof CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE>;
    searchQuery?: string;
    autocompleteID?: string;
    roomType?: ValueOf<typeof CONST.SEARCH.DATA_TYPES>;
    mapKey?: string;
};

type SearchQueryListItemProps = {
    item: SearchQueryItem;
    isFocused?: boolean;
    showTooltip: boolean;
    onSelectRow: (item: SearchQueryItem) => void;
    onFocus?: ListItemFocusEventHandler;
    shouldSyncFocus?: boolean;
    shouldDisableHoverStyle?: boolean;
};

function isSearchQueryItem(item: OptionData | SearchQueryItem): item is SearchQueryItem {
    return 'searchItemType' in item;
}

/**
 * A row with an optional icon, title, and subtitle used in the search router for autocomplete
 * suggestions, saved searches, and recent queries.
 */
function SearchQueryListItem({item, isFocused, showTooltip, onSelectRow, onFocus, shouldSyncFocus, shouldDisableHoverStyle}: SearchQueryListItemProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <BaseListItem
            item={item}
            pressableStyle={[[styles.searchQueryListItemStyle, item.isSelected && styles.activeComponentBG, item.cursorStyle]]}
            wrapperStyle={[styles.flexRow, styles.flex1, styles.justifyContentBetween, styles.userSelectNone, styles.alignItemsCenter]}
            isFocused={isFocused}
            onSelectRow={onSelectRow}
            keyForList={item.keyForList}
            onFocus={onFocus}
            hoverStyle={item.isSelected && styles.activeComponentBG}
            shouldSyncFocus={shouldSyncFocus}
            showTooltip={showTooltip}
            shouldDisableHoverStyle={shouldDisableHoverStyle}
            shouldHighlightSelectedItem
        >
            <>
                {!!item.singleIcon && (
                    <Icon
                        src={item.singleIcon}
                        fill={item.shouldIconApplyFill !== false ? theme.icon : undefined}
                        additionalStyles={styles.mr3}
                        medium
                    />
                )}
                <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStretch]}>
                    <TextWithTooltip
                        shouldShowTooltip={showTooltip ?? false}
                        text={item.text ?? ''}
                        style={[
                            styles.optionDisplayName,
                            isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
                            styles.sidebarLinkTextBold,
                            styles.pre,
                            item.alternateText ? styles.mb1 : null,
                            styles.justifyContentCenter,
                        ]}
                    />
                    {!!item.alternateText && (
                        <TextWithTooltip
                            shouldShowTooltip={showTooltip ?? false}
                            text={item.alternateText}
                            style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                        />
                    )}
                </View>
            </>
        </BaseListItem>
    );
}

export default SearchQueryListItem;
export {isSearchQueryItem};
export type {SearchQueryItem, SearchQueryListItemProps};
