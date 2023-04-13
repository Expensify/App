import React, {useCallback, useEffect, useMemo} from 'react';
import {Pressable} from 'react-native';
import _ from 'lodash';
import Accessibility from '../../../libs/Accessibility';
import HapticFeedback from '../../../libs/HapticFeedback';
import KeyboardShortcut from '../../../libs/KeyboardShortcut';
import styles from '../../../styles/styles';
import genericPressablePropTypes from './PropTypes';

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

const GenericPressable = (props) => {
    // eslint-disable-next-line react/destructuring-assignment
    const {
        children,
        onPress,
        onLongPress,
        onKeyPress,
        disabled,
        nativeID,
        style,
        accessibilityHint,
        shouldUseHapticsOnLongPress,
        shouldUseHapticsOnPress,
        nextFocusRef,
        keyboardShortcut,
        forwardedRef,
        shouldUseAutoHitSlop,
        enableInScreenReaderStates,
        ...rest
    } = props;

    const isScreenReaderActive = Accessibility.useScreenReaderStatus();
    const [hitslop, onLayout] = Accessibility.useAutoHitSlop();
    const isDisabled = useMemo(() => {
        let shouldBeDisabledByScreenReader = false;
        switch (enableInScreenReaderStates) {
            case 'all':
                shouldBeDisabledByScreenReader = true;
                break;
            case 'disabled':
                shouldBeDisabledByScreenReader = !isScreenReaderActive;
                break;
            case 'active':
                shouldBeDisabledByScreenReader = isScreenReaderActive;
                break;
            default:
                break;
        }
        return props.disabled || shouldBeDisabledByScreenReader;
    }, [isScreenReaderActive, enableInScreenReaderStates, props.disabled]);

    const onLongPressHandler = useCallback(() => {
        if (isDisabled) {
            return;
        }
        if (shouldUseHapticsOnLongPress) {
            HapticFeedback.longPress();
        }
        const pressFunction = onLongPress || onPress;
        pressFunction();
        Accessibility.moveAccessibilityFocus(nextFocusRef);
    }, [shouldUseHapticsOnLongPress, onLongPress, onPress, nextFocusRef, isDisabled]);

    const onPressHandler = useCallback(() => {
        if (isDisabled) {
            return;
        }
        if (shouldUseHapticsOnPress) {
            HapticFeedback.press();
        }
        onPress();
        Accessibility.moveAccessibilityFocus(nextFocusRef);
    }, [shouldUseHapticsOnPress, onPress, nextFocusRef, isDisabled]);

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

            ref={forwardedRef}
            focusable
            accessible
            onPress={onPressHandler}
            onLongPress={onLongPressHandler}
            onKeyPress={onKeyPressHandler}
            disabled={isDisabled}
            style={state => [
                getCursorStyle(props.disabled, props.accessibilityRole === 'text'),
                props.style,
                isScreenReaderActive && parseStyleFromFunction(props.screenReaderActiveStyle, state),
                state.focused && parseStyleFromFunction(props.focusStyle, state),
                state.hovered && parseStyleFromFunction(props.hoverStyle, state),
                state.pressed && parseStyleFromFunction(props.pressedStyle, state),
                isDisabled && [parseStyleFromFunction(props.disabledStyle, state), styles.cursorDisabled, styles.noSelect],
            ]}

            // accessibility props
            accessibilityHint={props.accessibilityHint || props.accessibilityLabel}
            accessibilityState={{
                disabled: props.disabled,
                ...props.accessibilityState,
            }}

            // ios-only form of inputs
            onMagicTap={onPressHandler}
            onAccessibilityTap={onPressHandler}

            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        >
            {state => (_.isFunction(props.children) ? props.children({...state, isScreenReaderActive, isDisabled}) : props.children) }
        </Pressable>
    );
};

GenericPressable.displayName = 'GenericPressable';
GenericPressable.propTypes = genericPressablePropTypes.propTypes;
GenericPressable.defaultProps = genericPressablePropTypes.defaultProps;

export default React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <GenericPressable {...props} forwardedRef={ref} />
));
