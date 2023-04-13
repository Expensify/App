import React from 'react';
import {Pressable} from 'react-native';
import _ from 'lodash';
import Accessibility from '../../../libs/Accessibility';
import HapticFeedback from '../../../libs/HapticFeedback';
import KeyboardShortcut from '../../../libs/KeyboardShortcut';
import styles from '../../../styles/styles';
import genericPressablePropTypes from './propTypes';

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
        ...rest
    } = props;

    const isScreenReaderActive = Accessibility.useScreenReaderStatus();
    const [hitslop, onLayout] = Accessibility.useAutoHitSlop();
    const shouldScreenReaderDisableComponent = React.useMemo(() => {
        switch (props.screenReaderActive) {
            case 'always_active':
                return true;
            case 'disabled':
                return !isScreenReaderActive;
            case 'active':
                return isScreenReaderActive;
            default:
                return false;
        }
    }, [isScreenReaderActive, props.screenReaderActive]);

    const onLongPressHandler = () => {
        if (shouldUseHapticsOnLongPress) {
            HapticFeedback.longPress();
        }
        const pressFunction = onLongPress || onPress;
        pressFunction();
        Accessibility.moveAccessibilityFocus(props.nextFocusRef);
    };

    const onPressHandler = React.useCallback(() => {
        if (shouldUseHapticsOnPress) {
            HapticFeedback.press();
        }
        onPress();
        Accessibility.moveAccessibilityFocus(nextFocusRef);
    }, [shouldUseHapticsOnPress, onPress, nextFocusRef]);

    const onKeyPressHandler = (event) => {
        if (event.key !== 'Enter') {
            return;
        }
        onPressHandler();
    };

    React.useEffect(() => {
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
            disabled={props.disabled || shouldScreenReaderDisableComponent}
            style={state => [
                getCursorStyle(props.disabled, props.accessibilityRole === 'text'),
                props.style,
                isScreenReaderActive && props.screenReaderActiveStyle,
                state.focused && parseStyleFromFunction(props.focusStyle, state),
                state.hovered && parseStyleFromFunction(props.hoverStyle, state),
                state.pressed && parseStyleFromFunction(props.pressedStyle, state),
                props.disabled && [parseStyleFromFunction(props.disabledStyle, state), styles.cursorDisabled, styles.noSelect],
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
            {state => (_.isFunction(props.children) ? props.children({...state, isScreenReaderActive}) : props.children) }
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
