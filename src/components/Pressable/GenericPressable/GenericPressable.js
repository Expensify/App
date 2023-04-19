import React, {useCallback, useEffect, useMemo, forwardRef} from 'react';
import {Pressable} from 'react-native';
import _ from 'lodash';
import Accessibility from '../../../libs/Accessibility';
import HapticFeedback from '../../../libs/HapticFeedback';
import KeyboardShortcut from '../../../libs/KeyboardShortcut';
import styles from '../../../styles/styles';
import genericPressablePropTypes from './PropTypes';
import CONST from '../../../CONST';

const parseStyleFromFunction = (style, state) => (_.isFunction(style) ? style(state) : style);

const getCursorStyle = (isDisabled, isText) => {
    if (isDisabled) {
        return styles.cursorDisabled;
    }

    if (isText) {
        return styles.cursorText;
    }

    return styles.cursorPointer;
};

const GenericPressable = forwardRef((props, ref) => {
    // eslint-disable-next-line react/destructuring-assignment
    const {
        children,
        onPress,
        onLongPress,
        onKeyPress,
        disabled,
        style,
        accessibilityHint,
        shouldUseHapticsOnLongPress,
        shouldUseHapticsOnPress,
        nextFocusRef,
        keyboardShortcut,
        shouldUseAutoHitSlop,
        enableInScreenReaderStates,
        ...rest
    } = props;

    const isScreenReaderActive = Accessibility.useScreenReaderStatus();
    const [hitslop, onLayout] = Accessibility.useAutoHitSlop();

    const isDisabled = useMemo(() => {
        let shouldBeDisabledByScreenReader = false;
        switch (enableInScreenReaderStates) {
            case CONST.SCREEN_READER_STATES.ALL:
                shouldBeDisabledByScreenReader = false;
                break;
            case CONST.SCREEN_READER_STATES.DISABLED:
                shouldBeDisabledByScreenReader = !isScreenReaderActive;
                break;
            case CONST.SCREEN_READER_STATES.ACTIVE:
                shouldBeDisabledByScreenReader = isScreenReaderActive;
                break;
            default:
                break;
        }
        return props.disabled || shouldBeDisabledByScreenReader;
    }, [isScreenReaderActive, enableInScreenReaderStates, props.disabled]);

    const onLongPressHandler = useCallback(() => {
        if (!onLongPress) {
            return;
        }
        if (shouldUseHapticsOnLongPress) {
            HapticFeedback.longPress();
        }
        onLongPress();
        Accessibility.moveAccessibilityFocus(nextFocusRef);
    }, [shouldUseHapticsOnLongPress, onLongPress, nextFocusRef]);

    const onPressHandler = useCallback(() => {
        if (shouldUseHapticsOnPress) {
            HapticFeedback.press();
        }
        onPress();
        Accessibility.moveAccessibilityFocus(nextFocusRef);
    }, [shouldUseHapticsOnPress, onPress, nextFocusRef]);

    const onKeyPressHandler = useCallback((event) => {
        if (event.key !== 'Enter') {
            return;
        }
        onPressHandler();
    }, [onPressHandler]);

    useEffect(() => {
        if (!keyboardShortcut) {
            return;
        }
        const {shortcutKey, descriptionKey, modifiers} = keyboardShortcut;
        const unsubscribe = KeyboardShortcut.subscribe(shortcutKey, onPressHandler, descriptionKey, modifiers, true, false, 0, false);
        return () => {
            if (!unsubscribe) {
                return;
            }
            unsubscribe();
        };
    }, [keyboardShortcut, onPressHandler]);

    return (
        <Pressable
            hitSlop={shouldUseAutoHitSlop && hitslop}
            onLayout={onLayout}
            ref={ref}
            onPress={!isDisabled && onPressHandler}
            onLongPress={!isDisabled && onLongPressHandler}
            onKeyPress={!isDisabled && onKeyPressHandler}
            style={state => [
                getCursorStyle(isDisabled, [props.accessibilityRole, props.role].includes('text')),
                props.style,
                isScreenReaderActive && parseStyleFromFunction(props.screenReaderActiveStyle, state),
                state.focused && parseStyleFromFunction(props.focusStyle, state),
                state.hovered && parseStyleFromFunction(props.hoverStyle, state),
                state.pressed && parseStyleFromFunction(props.pressedStyle, state),
                isDisabled && [parseStyleFromFunction(props.disabledStyle, state), styles.noSelect],
            ]}

            // accessibility props
            focusable
            accessible
            tabIndex={0}
            accessibilityHint={props.accessibilityHint || props.accessibilityLabel}
            accessibilityState={{
                disabled: isDisabled,
                ...props.accessibilityState,
            }}
            aria-disabled={isDisabled}
            aria-keyshortcuts={keyboardShortcut && `${keyboardShortcut.modifiers}+${keyboardShortcut.shortcutKey}`}

            // ios-only form of inputs
            onMagicTap={!isDisabled && onPressHandler}
            onAccessibilityTap={!isDisabled && onPressHandler}

            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        >
            {state => (_.isFunction(props.children) ? props.children({...state, isScreenReaderActive, isDisabled}) : props.children) }
        </Pressable>
    );
});

GenericPressable.displayName = 'GenericPressable';
GenericPressable.propTypes = genericPressablePropTypes.propTypes;
GenericPressable.defaultProps = genericPressablePropTypes.defaultProps;

export default GenericPressable;
