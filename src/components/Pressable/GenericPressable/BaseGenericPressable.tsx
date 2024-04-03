import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useEffect, useMemo} from 'react';
import type {GestureResponderEvent, View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import {Pressable} from 'react-native';
import useSingleExecution from '@hooks/useSingleExecution';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Accessibility from '@libs/Accessibility';
import HapticFeedback from '@libs/HapticFeedback';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import CONST from '@src/CONST';
import type {PressableRef} from './types';
import type PressableProps from './types';

function GenericPressable(
    {
        children,
        onPress = () => {},
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
        ...rest
    }: PressableProps,
    ref: PressableRef,
) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isExecuting, singleExecution} = useSingleExecution();
    const isScreenReaderActive = Accessibility.useScreenReaderStatus();
    const [hitSlop, onLayout] = Accessibility.useAutoHitSlop();

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
        if (shouldUseDisabledCursor) {
            return styles.cursorDisabled;
        }
        if ([rest.accessibilityRole, rest.role].includes(CONST.ROLE.PRESENTATION)) {
            return styles.cursorText;
        }
        return styles.cursorPointer;
    }, [styles, shouldUseDisabledCursor, rest.accessibilityRole, rest.role]);

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
            if (isDisabled) {
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
            const onPressResult = onPress(event);
            return onPressResult;
        },
        [shouldUseHapticsOnPress, onPress, nextFocusRef, ref, isDisabled],
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

    return (
        <Pressable
            hitSlop={shouldUseAutoHitSlop ? hitSlop : undefined}
            onLayout={shouldUseAutoHitSlop ? onLayout : undefined}
            ref={ref as ForwardedRef<View>}
            onPress={!isDisabled ? singleExecution(onPressHandler) : undefined}
            onLongPress={!isDisabled && onLongPress ? onLongPressHandler : undefined}
            onKeyDown={!isDisabled ? onKeyDown : undefined}
            onPressIn={!isDisabled ? onPressIn : undefined}
            onPressOut={!isDisabled ? onPressOut : undefined}
            style={(state) => [
                cursorStyle,
                StyleUtils.parseStyleFromFunction(style, state),
                isScreenReaderActive && StyleUtils.parseStyleFromFunction(screenReaderActiveStyle, state),
                state.focused && StyleUtils.parseStyleFromFunction(focusStyle, state),
                state.hovered && StyleUtils.parseStyleFromFunction(hoverStyle, state),
                state.pressed && StyleUtils.parseStyleFromFunction(pressStyle, state),
                isDisabled && [StyleUtils.parseStyleFromFunction(disabledStyle, state), styles.noSelect],
            ]}
            // accessibility props
            accessibilityState={{
                disabled: isDisabled,
                ...rest.accessibilityState,
            }}
            aria-disabled={isDisabled}
            aria-keyshortcuts={keyboardShortcut && `${keyboardShortcut.modifiers.join('')}+${keyboardShortcut.shortcutKey}`}
            // ios-only form of inputs
            onMagicTap={!isDisabled ? onPressHandler : undefined}
            onAccessibilityTap={!isDisabled ? onPressHandler : undefined}
            accessible={accessible}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        >
            {(state) => (typeof children === 'function' ? children({...state, isScreenReaderActive, isDisabled}) : children)}
        </Pressable>
    );
}

GenericPressable.displayName = 'GenericPressable';

export default forwardRef(GenericPressable);
