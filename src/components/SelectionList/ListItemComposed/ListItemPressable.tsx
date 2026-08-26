import {getButtonRole} from '@components/Button/utils';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {BaseListItemProps, ListItem} from '@components/SelectionList/ListItem/types';
import {ListItemContext} from '@components/SelectionList/ListItemContext';
import getListItemAccessibilityProps from '@components/SelectionList/utils/getListItemAccessibilityProps';

import useHover from '@hooks/useHover';
import {useMouseActions, useMouseState} from '@hooks/useMouseContext';
import useStyleUtils from '@hooks/useStyleUtils';
import useSyncFocus from '@hooks/useSyncFocus';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';
import type {View} from 'react-native';

import React, {useRef} from 'react';

type ListItemPressableProps<TItem extends ListItem> = Pick<
    BaseListItemProps<TItem>,
    | 'item'
    | 'pressableStyle'
    | 'pressableWrapperStyle'
    | 'containerStyle'
    | 'isDisabled'
    | 'shouldPreventEnterKeySubmit'
    | 'canSelectMultiple'
    | 'onSelectRow'
    | 'onDismissError'
    | 'keyForList'
    | 'errors'
    | 'errorRowStyles'
    | 'pendingAction'
    | 'isFocused'
    | 'isFocusVisible'
    | 'shouldSyncFocus'
    | 'shouldShowBlueBorderOnFocus'
    | 'onFocus'
    | 'hoverStyle'
    | 'onLongPressRow'
    | 'shouldHighlightSelectedItem'
    | 'shouldDisableHoverStyle'
    | 'accessible'
    | 'accessibilityLabel'
    | 'accessibilityRole'
    | 'shouldUseOptionRole'
    | 'isSelected'
> & {
    /** Whether content inside the row should show tooltips (provided to children via ListItemContext) */
    shouldShowTooltip: boolean;

    /** Row content */
    children?: ReactNode;
};

/**
 * The interaction core every list item row builds on: offline/error feedback, press/hover/focus states,
 * keyboard activation, and accessibility roles. Carries zero layout opinions - callers own the row
 * structure through children.
 */
function ListItemPressable<TItem extends ListItem>({
    item,
    pressableStyle,
    pressableWrapperStyle,
    containerStyle,
    isDisabled = false,
    shouldPreventEnterKeySubmit = false,
    canSelectMultiple = false,
    onSelectRow,
    onDismissError = () => {},
    keyForList,
    errors,
    errorRowStyles,
    pendingAction,
    children,
    isFocused,
    isFocusVisible = isFocused,
    shouldSyncFocus = true,
    shouldShowBlueBorderOnFocus = false,
    onFocus = () => {},
    hoverStyle,
    onLongPressRow,
    shouldHighlightSelectedItem = false,
    shouldDisableHoverStyle,
    accessible,
    accessibilityLabel,
    accessibilityRole = getButtonRole(true),
    shouldUseOptionRole,
    isSelected,
    shouldShowTooltip,
}: ListItemPressableProps<TItem>) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {
        bind: {onMouseEnter, onMouseLeave},
    } = useHover();
    const {isMouseDownOnInput} = useMouseState();
    const {setMouseUp} = useMouseActions();
    const pressableRef = useRef<View>(null);

    // Sync focus on an item
    useSyncFocus(pressableRef, !!isFocused, shouldSyncFocus);

    // List items use role="option" which doesn't natively respond to Enter key presses.
    // When the list-level keyboard shortcut is disabled (disableKeyboardShortcuts), we handle
    // Enter activation here at the item level so each row can still be activated individually
    // without interfering with other focusable controls (e.g. footer inputs) on the same screen.
    const selectRowOnEnterKey = (event: React.KeyboardEvent) => {
        if (
            shouldPreventEnterKeySubmit ||
            accessible === false ||
            event.key !== CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey ||
            event.shiftKey ||
            event.metaKey ||
            event.ctrlKey ||
            item.isInteractive === false
        ) {
            return;
        }

        event.preventDefault();
        onSelectRow(item);
    };

    const clearHoverAndMouseDownState = (e: React.MouseEvent<Element, MouseEvent>) => {
        onMouseLeave();
        e.stopPropagation();
        setMouseUp();
    };

    // Selection can be provided explicitly (e.g. rows whose selection isn't stored on the item) and otherwise falls back to the item.
    const isRowSelected = isSelected ?? item.isSelected;

    const {role, tabIndex, accessibilityState, accessibleAndAccessibilityLabel, ariaCurrent} = getListItemAccessibilityProps({
        role: accessibilityRole,
        accessible,
        accessibilityLabel,
        tabIndex: item.tabIndex,
        item,
        isFocused,
        canSelectMultiple,
        shouldUseOptionRole,
        isSelected: isRowSelected,
    });

    return (
        <OfflineWithFeedback
            onClose={() => onDismissError(item)}
            pendingAction={pendingAction}
            errors={errors}
            errorRowStyles={[styles.mh5, errorRowStyles]}
            contentContainerStyle={containerStyle}
        >
            <PressableWithFeedback
                sentryLabel={CONST.SENTRY_LABEL.SELECTION_LIST.BASE_LIST_ITEM}
                onMouseEnter={onMouseEnter}
                ref={pressableRef}
                lang={item.lang}
                accessibilityLanguage={item.lang}
                onLongPress={() => {
                    onLongPressRow?.(item);
                }}
                onPress={(e) => {
                    if (isMouseDownOnInput) {
                        e?.stopPropagation(); // Preventing the click action
                        return;
                    }
                    if (shouldPreventEnterKeySubmit && e && 'key' in e && e.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) {
                        return;
                    }
                    onSelectRow(item, undefined, e);
                }}
                disabled={isDisabled && !isRowSelected}
                interactive={item.isInteractive}
                isNested
                hoverDimmingValue={1}
                pressDimmingValue={item.isInteractive === false ? 1 : variables.pressDimValue}
                hoverStyle={!shouldDisableHoverStyle ? [(!item.isDisabled || isRowSelected) && item.isInteractive !== false && styles.hoveredComponentBG, hoverStyle] : undefined}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true, [CONST.INNER_BOX_SHADOW_ELEMENT]: shouldShowBlueBorderOnFocus}}
                onMouseDown={(e) => {
                    const target = e?.target;
                    if (target instanceof HTMLElement && target.tagName === CONST.ELEMENT_NAME.INPUT) {
                        return;
                    }
                    e.preventDefault();
                }}
                id={keyForList ?? ''}
                testID={`${CONST.BASE_LIST_ITEM_TEST_ID}${item.keyForList}`}
                style={[
                    pressableStyle,
                    isFocusVisible &&
                        StyleUtils.getItemBackgroundColorStyle(
                            shouldHighlightSelectedItem && !!isRowSelected,
                            !!isFocusVisible,
                            !!item.isDisabled,
                            theme.activeComponentBG,
                            theme.hoverComponentBG,
                        ),
                ]}
                onFocus={onFocus}
                role={role}
                tabIndex={tabIndex}
                {...accessibleAndAccessibilityLabel}
                accessibilityState={accessibilityState}
                aria-current={ariaCurrent}
                onMouseLeave={clearHoverAndMouseDownState}
                // When the list-level Enter shortcut is disabled (disableKeyboardShortcuts), items with role="option"
                // won't natively fire click on Enter, so we handle it manually via onKeyDown.
                onKeyDown={!shouldPreventEnterKeySubmit ? selectRowOnEnterKey : undefined}
                wrapperStyle={pressableWrapperStyle}
            >
                <ListItemContext.Provider value={{isFocusVisible: !!isFocusVisible, shouldShowTooltip}}>{children}</ListItemContext.Provider>
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

export default ListItemPressable;
