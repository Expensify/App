import React, {useRef} from 'react';
import {View} from 'react-native';
import {getButtonRole} from '@components/Button/utils';
import Icon from '@components/Icon';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {PressableWithFeedbackProps} from '@components/Pressable/PressableWithFeedback';
import getAccessibilityLabel from '@components/SelectionList/utils/getAccessibilityLabel';
import {getItemRole} from '@components/SelectionList/utils/getItemRole';
import {getSelectableState} from '@components/SelectionList/utils/getSelectableState';
import useHover from '@hooks/useHover';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import {useMouseActions, useMouseState} from '@hooks/useMouseContext';
import useStyleUtils from '@hooks/useStyleUtils';
import useSyncFocus from '@hooks/useSyncFocus';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getBrowser, isMobile} from '@libs/Browser';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {BaseListItemProps, ListItem} from './types';

type AccessibilityProps = Pick<PressableWithFeedbackProps, 'accessible' | 'role' | 'tabIndex'>;

type CalculatedAccessibilityProps = Pick<PressableWithFeedbackProps, 'role' | 'tabIndex' | 'accessibilityState'> & {
    accessibleAndAccessibilityLabel: Pick<PressableWithFeedbackProps, 'accessible' | 'accessibilityLabel'>;
    ariaCurrent: boolean | undefined;
};

function getAccessibilityProps<TItem extends ListItem>({
    role,
    tabIndex,
    accessible,
    item,
    isFocused,
    canSelectMultiple,
}: AccessibilityProps & Pick<BaseListItemProps<TItem>, 'item' | 'isFocused' | 'canSelectMultiple'>) {
    // For single-select lists, use role="option" with aria-selected so screen readers announce "selected"/"not selected".
    // For multi-select (checkbox/radio), keep existing role and state.
    const isSelectableOption = !canSelectMultiple && role !== CONST.ROLE.CHECKBOX && role !== CONST.ROLE.RADIO;
    const effectiveRole = getItemRole(role, isSelectableOption);

    const isCheckableRole = effectiveRole === CONST.ROLE.CHECKBOX || effectiveRole === CONST.ROLE.RADIO;
    const accessibilityState = isCheckableRole ? {checked: !!item.isSelected, selected: !!isFocused} : getSelectableState(!!item.isSelected);
    const ariaCurrent = !isCheckableRole && item.isSelected && getBrowser() === CONST.BROWSER.CHROME && !isMobile() ? true : undefined;

    if (accessible === false) {
        return {
            role: CONST.ROLE.PRESENTATION,
            tabIndex: -1,
            accessibilityState,
            accessibleAndAccessibilityLabel: {accessible: false},
            ariaCurrent,
        } satisfies CalculatedAccessibilityProps;
    }

    const accessibilityLabel = getAccessibilityLabel(item);

    return {
        role: effectiveRole,
        tabIndex,
        accessibilityState,
        accessibleAndAccessibilityLabel: {accessible: undefined, accessibilityLabel},
        ariaCurrent,
    } satisfies CalculatedAccessibilityProps;
}

function BaseListItem<TItem extends ListItem>({
    item,
    pressableStyle,
    wrapperStyle,
    pressableWrapperStyle,
    containerStyle,
    isDisabled = false,
    shouldPreventEnterKeySubmit = false,
    canSelectMultiple = false,
    onSelectRow,
    onDismissError = () => {},
    rightHandSideComponent,
    keyForList,
    errors,
    errorRowStyles,
    pendingAction,
    FooterComponent,
    children,
    isFocused,
    shouldSyncFocus = true,
    shouldDisplayRBR = true,
    shouldShowBlueBorderOnFocus = false,
    onFocus = () => {},
    hoverStyle,
    onLongPressRow,
    testID,
    shouldUseDefaultRightHandSideCheckmark = true,
    shouldHighlightSelectedItem = true,
    shouldDisableHoverStyle,
    shouldShowRightCaret = false,
    accessible,
    accessibilityRole = getButtonRole(true),
    forwardedFSClass,
}: BaseListItemProps<TItem>) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {hovered, bind} = useHover();
    const {isMouseDownOnInput} = useMouseState();
    const {setMouseUp} = useMouseActions();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'Checkmark', 'DotIndicator']);
    const pressableRef = useRef<View>(null);

    // Sync focus on an item
    useSyncFocus(pressableRef, !!isFocused, shouldSyncFocus);

    // List items use role="option" which doesn't natively respond to Enter key presses.
    // When the list-level keyboard shortcut is disabled (disableKeyboardShortcuts), we handle
    // Enter activation here at the item level so each row can still be activated individually
    // without interfering with other focusable controls (e.g. footer inputs) on the same screen.
    const handleKeyDown = (event: React.KeyboardEvent) => {
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

    const handleMouseLeave = (e: React.MouseEvent<Element, MouseEvent>) => {
        bind.onMouseLeave();
        e.stopPropagation();
        setMouseUp();
    };

    const rightHandSideComponentRender = () => {
        if (canSelectMultiple || !rightHandSideComponent) {
            return null;
        }

        if (typeof rightHandSideComponent === 'function') {
            return rightHandSideComponent(item, isFocused);
        }

        return rightHandSideComponent;
    };

    const shouldShowCheckmark = !canSelectMultiple && !!item.isSelected && !rightHandSideComponent && shouldUseDefaultRightHandSideCheckmark;

    const shouldShowRBRIndicator = (!item.isSelected || !!item.canShowSeveralIndicators) && !!item.brickRoadIndicator && shouldDisplayRBR;

    const shouldShowHiddenCheckmark = shouldShowRBRIndicator && !shouldShowCheckmark && !!item.canShowSeveralIndicators;

    const {role, tabIndex, accessibilityState, accessibleAndAccessibilityLabel, ariaCurrent} = getAccessibilityProps({
        role: accessibilityRole,
        accessible,
        tabIndex: item.tabIndex,
        item,
        isFocused,
        canSelectMultiple,
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
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...bind}
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
                    onSelectRow(item);
                }}
                disabled={isDisabled && !item.isSelected}
                interactive={item.isInteractive}
                isNested
                hoverDimmingValue={1}
                pressDimmingValue={item.isInteractive === false ? 1 : variables.pressDimValue}
                hoverStyle={!shouldDisableHoverStyle ? [!item.isDisabled && item.isInteractive !== false && styles.hoveredComponentBG, hoverStyle] : undefined}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true, [CONST.INNER_BOX_SHADOW_ELEMENT]: shouldShowBlueBorderOnFocus}}
                onMouseDown={(e) => {
                    if ((e?.target as HTMLElement)?.tagName === CONST.ELEMENT_NAME.INPUT) {
                        return;
                    }
                    e.preventDefault();
                }}
                id={keyForList ?? ''}
                style={[
                    pressableStyle,
                    isFocused &&
                        shouldHighlightSelectedItem &&
                        StyleUtils.getItemBackgroundColorStyle(!!item.isSelected, !!isFocused, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG),
                ]}
                onFocus={onFocus}
                role={role}
                tabIndex={tabIndex}
                // eslint-disable-next-line react/jsx-props-no-spreading -- we can't pass those props here on their own because this Component expects a discriminated Union
                {...accessibleAndAccessibilityLabel}
                accessibilityState={accessibilityState}
                aria-current={ariaCurrent}
                onMouseLeave={handleMouseLeave}
                // When the list-level Enter shortcut is disabled (disableKeyboardShortcuts), items with role="option"
                // won't natively fire click on Enter, so we handle it manually via onKeyDown.
                onKeyDown={!shouldPreventEnterKeySubmit ? handleKeyDown : undefined}
                wrapperStyle={pressableWrapperStyle}
                testID={`${CONST.BASE_LIST_ITEM_TEST_ID}${item.keyForList}`}
            >
                <View
                    testID={testID}
                    style={[
                        wrapperStyle,
                        isFocused &&
                            shouldHighlightSelectedItem &&
                            StyleUtils.getItemBackgroundColorStyle(!!item.isSelected, !!isFocused, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG),
                    ]}
                    fsClass={forwardedFSClass}
                >
                    {typeof children === 'function' ? children(hovered) : children}

                    {shouldShowRBRIndicator && (
                        <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.ml3]}>
                            <Icon
                                testID={CONST.DOT_INDICATOR_TEST_ID}
                                src={icons.DotIndicator}
                                fill={item.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO ? theme.iconSuccessFill : theme.danger}
                            />
                        </View>
                    )}

                    {(shouldShowCheckmark || shouldShowHiddenCheckmark) && (
                        <View
                            style={[styles.flexRow, styles.alignItemsCenter, styles.ml3, shouldShowHiddenCheckmark ? styles.opacity0 : undefined]}
                            accessible={false}
                        >
                            <View>
                                <Icon
                                    src={icons.Checkmark}
                                    fill={theme.success}
                                />
                            </View>
                        </View>
                    )}

                    {rightHandSideComponentRender()}
                    {shouldShowRightCaret && (
                        <View style={[styles.justifyContentCenter, styles.alignItemsCenter, styles.ml2]}>
                            <Icon
                                src={icons.ArrowRight}
                                fill={theme.icon}
                                additionalStyles={[styles.alignSelfCenter, !hovered && styles.opacitySemiTransparent]}
                                width={variables.iconSizeNormal}
                                height={variables.iconSizeNormal}
                            />
                        </View>
                    )}
                </View>
                {FooterComponent}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

export default BaseListItem;
