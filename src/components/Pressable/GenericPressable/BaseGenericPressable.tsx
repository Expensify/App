import React, {ForwardedRef, forwardRef, useCallback, useEffect, useMemo} from 'react';
// eslint-disable-next-line no-restricted-imports
import {GestureResponderEvent, Pressable, View, ViewStyle} from 'react-native';
import useSingleExecution from '@hooks/useSingleExecution';
import Accessibility from '@libs/Accessibility';
import HapticFeedback from '@libs/HapticFeedback';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import CONST from '@src/CONST';
import PressableProps from './types';

/**
 * Returns the cursor style based on the state of Pressable
 */
function getCursorStyle(isDisabled: boolean, isText: boolean): Pick<ViewStyle, 'cursor'> {
    if (isDisabled) {
        return styles.cursorDisabled;
    }

    if (isText) {
        return styles.cursorText;
    }

    return styles.cursorPointer;
}

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
        shouldUseHapticsOnLongPress = false,
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
    ref: ForwardedRef<View>,
) {
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
            if (ref && 'current' in ref) {
                ref.current?.blur();
            }
            onLongPress(event);

            Accessibility.moveAccessibilityFocus(nextFocusRef);
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
            if (ref && 'current' in ref) {
                ref.current?.blur();
            }
            onPress(event);

            Accessibility.moveAccessibilityFocus(nextFocusRef);
        },
        [shouldUseHapticsOnPress, onPress, nextFocusRef, ref, isDisabled],
    );

    useEffect(() => {
        if (!keyboardShortcut) {
            return () => {};
        }
        const {shortcutKey, descriptionKey, modifiers} = keyboardShortcut;
        return KeyboardShortcut.subscribe(shortcutKey, onPressHandler, descriptionKey, modifiers, true, false, 0, false);
    }, [keyboardShortcut, onPressHandler]);

    return (
        <Pressable
            hitSlop={shouldUseAutoHitSlop ? hitSlop : undefined}
            onLayout={shouldUseAutoHitSlop ? onLayout : undefined}
            ref={ref}
            onPress={!isDisabled ? singleExecution(onPressHandler) : undefined}
            onLongPress={!isDisabled && onLongPress ? onLongPressHandler : undefined}
            onKeyDown={!isDisabled ? onKeyDown : undefined}
            onPressIn={!isDisabled ? onPressIn : undefined}
            onPressOut={!isDisabled ? onPressOut : undefined}
            style={(state) => [
                getCursorStyle(shouldUseDisabledCursor, [rest.accessibilityRole, rest.role].includes('text')),
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
