import type {ForwardedRef} from 'react';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {GestureResponderEvent, View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import {Pressable} from 'react-native';
import type PressableProps from '@components/Pressable/GenericPressable/types';
import useSingleExecution from '@hooks/useSingleExecution';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Accessibility from '@libs/Accessibility';
import HapticFeedback from '@libs/HapticFeedback';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import CONST from '@src/CONST';

function GenericPressable({
    children,
    onPress,
    onLongPress,
    onKeyDown,
    disabled,
    style,
    disabledStyle = {},
    hoverStyle = {},
    focusStyle = {},
    pressStyle = {},
    screenReaderActiveStyle = {},
    shouldUseHapticsOnLongPress = true,
    shouldUseHapticsOnPress = false,
    nextFocusRef,
    keyboardShortcut,
    shouldUseAutoHitSlop = false,
    enableInScreenReaderStates = CONST.SCREEN_READER_STATES.ALL,
    onPressIn,
    onPressOut,
    accessible = true,
    fullDisabled = false,
    interactive = true,
    isNested = false,
    ref,
    dataSet,
    forwardedFSClass,
    accessibilityState,
    ...rest
}: PressableProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isExecuting, singleExecution} = useSingleExecution();
    const isScreenReaderActive = Accessibility.useScreenReaderStatus();
    const [hitSlop, onLayout] = Accessibility.useAutoHitSlop();
    const [isHovered, setIsHovered] = useState(false);
    const isRoleButton = [rest.accessibilityRole, rest.role].includes(CONST.ROLE.BUTTON);

    const isDisabled = useMemo(() => {
        let shouldBeDisabledByScreenReader = false;
        if (enableInScreenReaderStates === CONST.SCREEN_READER_STATES.ACTIVE) {
            shouldBeDisabledByScreenReader = !isScreenReaderActive;
        }

        if (enableInScreenReaderStates === CONST.SCREEN_READER_STATES.DISABLED) {
            shouldBeDisabledByScreenReader = isScreenReaderActive;
        }

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return disabled || shouldBeDisabledByScreenReader || isExecuting;
    }, [isScreenReaderActive, enableInScreenReaderStates, disabled, isExecuting]);

    const shouldUseDisabledCursor = useMemo(() => isDisabled && !isExecuting, [isDisabled, isExecuting]);

    /**
     * Returns the cursor style based on the state of Pressable
     */
    const cursorStyle = useMemo(() => {
        if (!interactive) {
            return styles.cursorDefault;
        }
        if (shouldUseDisabledCursor) {
            return styles.cursorDisabled;
        }

        if (onPress) {
            return styles.cursorPointer;
        }

        if ([rest.accessibilityRole, rest.role].includes(CONST.ROLE.PRESENTATION) && !isNested) {
            return styles.cursorText;
        }
        return styles.cursorPointer;
    }, [onPress, interactive, shouldUseDisabledCursor, rest.accessibilityRole, rest.role, isNested, styles.cursorPointer, styles.cursorDefault, styles.cursorDisabled, styles.cursorText]);

    const onLongPressHandler = useCallback(
        (event: GestureResponderEvent) => {
            if (isDisabled) {
                return;
            }
            if (!onLongPress) {
                return;
            }
            if (shouldUseHapticsOnLongPress) {
                HapticFeedback.longPress();
            }
            if (ref && 'current' in ref && nextFocusRef) {
                ref.current?.blur();
                Accessibility.moveAccessibilityFocus(nextFocusRef);
            }
            onLongPress(event);
        },
        [shouldUseHapticsOnLongPress, onLongPress, nextFocusRef, ref, isDisabled],
    );

    const onPressHandler = useCallback(
        (event?: GestureResponderEvent | KeyboardEvent) => {
            if (isDisabled || !interactive) {
                return;
            }
            if (!onPress) {
                return;
            }
            if (shouldUseHapticsOnPress) {
                HapticFeedback.press();
            }
            if (ref && 'current' in ref && nextFocusRef) {
                ref.current?.blur();
                Accessibility.moveAccessibilityFocus(nextFocusRef);
            }
            return onPress(event);
        },
        [shouldUseHapticsOnPress, onPress, nextFocusRef, ref, isDisabled, interactive],
    );

    const voidOnPressHandler = useCallback(
        (...args: Parameters<typeof onPressHandler>) => {
            onPressHandler(...args);
        },
        [onPressHandler],
    );

    const onKeyboardShortcutPressHandler = useCallback(
        (event?: GestureResponderEvent | KeyboardEvent) => {
            onPressHandler(event);
        },
        [onPressHandler],
    );

    useEffect(() => {
        if (!keyboardShortcut) {
            return () => {};
        }
        const {shortcutKey, descriptionKey, modifiers} = keyboardShortcut;
        return KeyboardShortcut.subscribe(shortcutKey, onKeyboardShortcutPressHandler, descriptionKey, modifiers, true, false, 0, false);
    }, [keyboardShortcut, onKeyboardShortcutPressHandler]);

    const isRoleLink = rest.role === CONST.ROLE.LINK;

    /**
     * Handles keyboard events for the pressable element.
     * If a custom onKeyDown handler is provided, it delegates to that handler.
     * Otherwise, for elements with role="link", it triggers onPress when Enter is pressed
     * to comply with W3C APG Link Pattern (https://www.w3.org/WAI/ARIA/apg/patterns/link/).
     */
    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (onKeyDown) {
                onKeyDown(event as unknown as React.KeyboardEvent<Element>);
                return;
            }

            if (isRoleLink && event.key === CONST.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) {
                event.preventDefault();
                onPressHandler(event.nativeEvent as unknown as KeyboardEvent);
            }
        },
        [onKeyDown, isRoleLink, onPressHandler],
    );

    return (
        <Pressable
            hitSlop={shouldUseAutoHitSlop ? hitSlop : undefined}
            onLayout={shouldUseAutoHitSlop ? onLayout : undefined}
            ref={ref as ForwardedRef<View>}
            disabled={fullDisabled}
            onPress={!isDisabled ? singleExecution(onPressHandler) : undefined}
            onLongPress={!isDisabled && onLongPress ? onLongPressHandler : undefined}
            onKeyDown={!isDisabled ? handleKeyDown : undefined}
            onPressIn={!isDisabled ? onPressIn : undefined}
            onPressOut={!isDisabled ? onPressOut : undefined}
            dataSet={{...(isRoleButton ? {[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true} : {}), ...(dataSet ?? {})}}
            style={(state) => [
                cursorStyle,
                StyleUtils.parseStyleFromFunction(style, state),
                isScreenReaderActive && StyleUtils.parseStyleFromFunction(screenReaderActiveStyle, state),
                state.focused && StyleUtils.parseStyleFromFunction(focusStyle, state),
                (state.hovered || isHovered) && StyleUtils.parseStyleFromFunction(hoverStyle, state),
                state.pressed && StyleUtils.parseStyleFromFunction(pressStyle, state),
                isDisabled && [StyleUtils.parseStyleFromFunction(disabledStyle, state), styles.noSelect],
                isRoleButton && styles.userSelectNone,
            ]}
            // accessibility props
            accessibilityState={{
                disabled: isDisabled,
                ...accessibilityState,
            }}
            aria-disabled={isDisabled}
            aria-selected={accessibilityState?.selected}
            aria-keyshortcuts={keyboardShortcut && `${keyboardShortcut.modifiers.join('')}+${keyboardShortcut.shortcutKey}`}
            // ios-only form of inputs
            onMagicTap={!isDisabled ? voidOnPressHandler : undefined}
            onAccessibilityTap={!isDisabled ? voidOnPressHandler : undefined}
            accessible={accessible}
            fsClass={forwardedFSClass}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            onHoverOut={(event) => {
                if (event?.type === 'pointerenter' || event?.type === 'mouseenter') {
                    return;
                }
                setIsHovered(false);
                if (rest.onHoverOut) {
                    rest.onHoverOut(event);
                }
            }}
            onHoverIn={(event) => {
                setIsHovered(true);
                if (rest.onHoverIn) {
                    rest.onHoverIn(event);
                }
            }}
        >
            {(state) => (typeof children === 'function' ? children({...state, isScreenReaderActive, hovered: state.hovered || isHovered, isDisabled}) : children)}
        </Pressable>
    );
}

export default GenericPressable;
