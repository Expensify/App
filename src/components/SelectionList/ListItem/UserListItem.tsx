import React from 'react';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import SelectableListItem from './SelectableListItem';
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
    canSelectMultiple,
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
    selectionButtonPosition,
}: UserListItemProps<TItem>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const renderedRightComponent = typeof rightHandSideComponent === 'function' ? rightHandSideComponent(item, isFocused) : rightHandSideComponent;
    // Disable accessible grouping when a right-side button is visible, so VoiceOver can focus it independently.
    const shouldDisableAccessibleGrouping = !!renderedRightComponent && !canSelectMultiple;

    return (
        <SelectableListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.peopleRow, wrapperStyle]}
            isFocused={isFocused}
            isFocusVisible={isFocusVisible}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onSelectionButtonPress={onSelectionButtonPress}
            onDismissError={onDismissError}
            shouldPreventEnterKeySubmit={shouldPreventEnterKeySubmit}
            rightHandSideComponent={rightHandSideComponent}
            errors={item.errors}
            pendingAction={item.pendingAction}
            pressableStyle={pressableStyle}
            FooterComponent={
                item.invitedSecondaryLogin ? (
                    <Text style={[styles.ml9, styles.ph5, styles.pb3, styles.textLabelSupporting]}>{translate('workspace.people.invitedBySecondaryLogin', item.invitedSecondaryLogin)}</Text>
                ) : undefined
            }
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            accessible={shouldDisableAccessibleGrouping ? false : undefined}
            shouldDisableHoverStyle={shouldDisableHoverStyle}
            shouldHighlightSelectedItem={shouldHighlightSelectedItem}
            selectionButtonPosition={selectionButtonPosition}
        >
            {(hovered?: boolean) => (
                <UserListItemContent
                    item={item}
                    isFocused={isFocused}
                    showTooltip={showTooltip}
                    isDisabled={isDisabled}
                    shouldDisableHoverStyle={shouldDisableHoverStyle}
                    shouldDisableAccessibleGrouping={shouldDisableAccessibleGrouping}
                    forwardedFSClass={forwardedFSClass}
                    hovered={!!hovered}
                />
            )}
        </SelectableListItem>
    );
}

export default UserListItem;
