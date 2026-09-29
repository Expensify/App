import ListItemComposed from '@components/SelectionList/ListItemComposed';
import shouldShowRBRIndicator from '@components/SelectionList/utils/shouldShowRBRIndicator';

import React from 'react';

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
    onFocus,
    shouldSyncFocus,
    wrapperStyle,
    pressableStyle,
    forwardedFSClass,
    shouldDisableHoverStyle,
    shouldHighlightSelectedItem,
}: UserListItemProps<TItem>) {
    // Disable accessible grouping when a right-side button is visible, so VoiceOver can focus it independently.
    const shouldDisableAccessibleGrouping = !!item.actionElement;

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
            <ListItemComposed.Row style={wrapperStyle}>
                <UserListItemContent
                    item={item}
                    forwardedFSClass={forwardedFSClass}
                />
                {shouldShowRBRIndicator(item) && <ListItemComposed.RBRIndicator item={item} />}
                {item.actionElement}
            </ListItemComposed.Row>
            {!!item.invitedSecondaryLogin && <ListItemComposed.InvitedSecondaryLoginFooter invitedSecondaryLogin={item.invitedSecondaryLogin} />}
        </ListItemComposed>
    );
}

export default BareUserListItem;
