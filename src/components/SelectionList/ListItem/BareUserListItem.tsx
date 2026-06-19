import React from 'react';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import BaseListItem from './BaseListItem';
import type {ListItem, UserListItemProps} from './types';
import UserListItemContent from './UserListItemContent';

/**
 * A variant of UserListItem for lists that never show a selection button.
 * Uses BaseListItem directly, no checkbox or radio button is rendered.
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
    const {translate} = useLocalize();

    const renderedRightComponent = typeof rightHandSideComponent === 'function' ? rightHandSideComponent(item, isFocused) : rightHandSideComponent;
    // Disable accessible grouping when a right-side button is visible, so VoiceOver can focus it independently.
    const shouldDisableAccessibleGrouping = !!renderedRightComponent;

    return (
        <BaseListItem
            item={item}
            wrapperStyle={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.userSelectNone, styles.peopleRow, wrapperStyle]}
            isFocused={isFocused}
            isFocusVisible={isFocusVisible}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            onSelectRow={onSelectRow}
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
        </BaseListItem>
    );
}

export default BareUserListItem;
