import ListItemComposed from '@components/SelectionList/ListItemComposed';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import type {ListItem, UserListItemProps} from './types';

import UserListItemContent from './UserListItemContent';

/**
 * A variant of UserListItem for lists that never show a selection button.
 * Composes ListItem directly, no checkbox or radio button is rendered.
 *
 * Prefer UserListItem in most cases. Only use where a fully custom
 * right-side component handles selection (such as a standalone action button).
 */
function BareUserListItem<TItem extends ListItem>({
    item,
    isFocused,
    isFocusVisible,
    showTooltip,
    isDisabled,
    onSelectRow,
    onDismissError,
    shouldPreventEnterKeySubmit,
    rightHandSideComponent,
    onFocus,
    shouldSyncFocus,
    wrapperStyle,
    pressableStyle,
    forwardedFSClass,
    shouldDisableHoverStyle,
    shouldHighlightSelectedItem,
}: UserListItemProps<TItem>) {
    const styles = useThemeStyles();

    const renderedRightComponent = typeof rightHandSideComponent === 'function' ? rightHandSideComponent(item, isFocused) : rightHandSideComponent;
    // Disable accessible grouping when a right-side button is visible, so VoiceOver can focus it independently.
    const shouldDisableAccessibleGrouping = !!renderedRightComponent;

    return (
        <ListItemComposed
            item={item}
            shouldShowTooltip={showTooltip}
            isFocused={isFocused}
            isFocusVisible={isFocusVisible}
            isDisabled={isDisabled}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            pressableStyle={pressableStyle}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            accessible={shouldDisableAccessibleGrouping ? false : undefined}
            shouldDisableHoverStyle={shouldDisableHoverStyle}
            shouldHighlightSelectedItem={shouldHighlightSelectedItem}
        >
            <View style={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.peopleRow, wrapperStyle]}>
                <UserListItemContent
                    item={item}
                    forwardedFSClass={forwardedFSClass}
                />
                <ListItemComposed.RBRIndicator item={item} />
                {renderedRightComponent}
            </View>
            {!!item.invitedSecondaryLogin && <ListItemComposed.InvitedSecondaryLoginFooter invitedSecondaryLogin={item.invitedSecondaryLogin} />}
        </ListItemComposed>
    );
}

export default BareUserListItem;
