import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Avatar from '@components/Avatar';
import Icon from '@components/Icon';
import BaseListItem from '@components/SelectionList/ListItem/BaseListItem';
import type {ListItem, ListItemFocusEventHandler} from '@components/SelectionList/ListItem/types';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {OptionData} from '@libs/ReportUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
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
    /** For NAVIGATE items: the route to navigate to when the item is selected */
    route?: Route;
    /** For NAVIGATE items: an action to run when the item is selected, instead of navigating to a route (e.g. opening a create flow) */
    onSelectAction?: () => void;
    /** Optional small, muted text shown on the right side of the row (e.g. the workspace name for a workspace page) */
    rightText?: string;
    /** Optional small workspace avatar shown just to the left of rightText */
    rightAvatar?: {
        source: AvatarSource;
        name: string;
        id: string;
    };
    /** Optional small icon shown just to the left of rightText (used instead of rightAvatar, e.g. the tab icon for an Account or Spend page) */
    rightIcon?: IconAsset;
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
                {(!!item.rightAvatar || !!item.rightIcon || !!item.rightText) && (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.ml2, styles.flexShrink0]}>
                        {!!item.rightAvatar && (
                            <Avatar
                                source={item.rightAvatar.source}
                                type={CONST.ICON_TYPE_WORKSPACE}
                                name={item.rightAvatar.name}
                                avatarID={item.rightAvatar.id}
                                size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                                containerStyles={styles.mr1}
                            />
                        )}
                        {!item.rightAvatar && !!item.rightIcon && (
                            <Icon
                                src={item.rightIcon}
                                fill={theme.icon}
                                small
                                additionalStyles={styles.mr1}
                            />
                        )}
                        {!!item.rightText && (
                            <Text
                                numberOfLines={1}
                                style={styles.textMicroSupporting}
                            >
                                {item.rightText}
                            </Text>
                        )}
                    </View>
                )}
            </>
        </BaseListItem>
    );
}

export default SearchQueryListItem;
export {isSearchQueryItem};
export type {SearchQueryItem, SearchQueryListItemProps};
