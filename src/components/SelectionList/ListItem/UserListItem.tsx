import ListItemComposed from '@components/SelectionList/ListItemComposed';
import shouldShowRBRIndicator from '@components/SelectionList/utils/shouldShowRBRIndicator';

import CONST from '@src/CONST';

import React from 'react';

import type {ListItem, UserListItemProps} from './types';

import UserListItemContent from './UserListItemContent';

/**
 * A row with user/workspace avatar(s), display name, and optional subtitle. Used broadly for
 * user and workspace selection (e.g. task assignee, workspace picker, card assignee, delegates).
 */
function UserListItem<TItem extends ListItem>({
    item,
    isFocused,
    isFocusVisible,
    showTooltip,
    isDisabled,
    canSelectMultiple = false,
    onSelectRow,
    onSelectionButtonPress,
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
    selectionButtonPosition = CONST.SELECTION_BUTTON_POSITION.RIGHT,
}: UserListItemProps<TItem>) {
    const renderedRightComponent = typeof rightHandSideComponent === 'function' ? rightHandSideComponent(item, isFocused) : rightHandSideComponent;
    // Disable accessible grouping when a right-side button is visible, so VoiceOver can focus it independently.
    const shouldDisableAccessibleGrouping = !!renderedRightComponent && !canSelectMultiple;

    const selectionButton = !item.shouldHideSelectionButton && (
        <ListItemComposed.SelectionButton
            item={item}
            onPress={onSelectionButtonPress ?? onSelectRow}
            canSelectMultiple={canSelectMultiple}
            position={selectionButtonPosition}
        />
    );

    return (
        <ListItemComposed
            item={item}
            shouldShowTooltip={showTooltip}
            isFocused={isFocused}
            isFocusVisible={isFocusVisible}
            isDisabled={isDisabled}
            canSelectMultiple={canSelectMultiple}
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
                {selectionButtonPosition === CONST.SELECTION_BUTTON_POSITION.LEFT && selectionButton}
                <UserListItemContent
                    item={item}
                    forwardedFSClass={forwardedFSClass}
                />
                {shouldShowRBRIndicator(item) && <ListItemComposed.RBRIndicator item={item} />}
                {selectionButtonPosition === CONST.SELECTION_BUTTON_POSITION.RIGHT && selectionButton}
                {renderedRightComponent}
            </ListItemComposed.Row>
            {!!item.invitedSecondaryLogin && <ListItemComposed.InvitedSecondaryLoginFooter invitedSecondaryLogin={item.invitedSecondaryLogin} />}
        </ListItemComposed>
    );
}

export default UserListItem;
