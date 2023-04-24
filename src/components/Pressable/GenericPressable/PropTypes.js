import PropTypes from 'prop-types';
import stylePropType from '../../../styles/stylePropTypes';
import CONST from '../../../CONST';

const stylePropTypeWithFunction = PropTypes.oneOfType([
    stylePropType,
    PropTypes.func,
]);

const pressablePropTypes = {
    /**
     * onPress callback
     */
    onPress: PropTypes.func.isRequired,

    /**
     * Specifies keyboard shortcut to trigger onPressHandler
     * @example {shortcutKey: 'a', modifiers: ['ctrl', 'shift'], descriptionKey: 'keyboardShortcut.description'}
     */
    keyboardShortcut: PropTypes.shape({
        descriptionKey: PropTypes.string.isRequired,
        shortcutKey: PropTypes.string.isRequired,
        modifiers: PropTypes.arrayOf(PropTypes.string),
    }),

    /**
     * Specifies if haptic feedback should be used on press
     * @default false
     */
    shouldUseHapticsOnPress: PropTypes.bool,

    /**
     * Specifies if haptic feedback should be used on long press
     * @default false
     */
    shouldUseHapticsOnLongPress: PropTypes.bool,

    /**
     * style for when the component is disabled. Can be a function that receives the component's state (active, disabled, hover, focus, pressed, isScreenReaderActive)
     * @default {}
     * @example {backgroundColor: 'red'}
     * @example state => ({backgroundColor: state.active ? 'red' : 'blue'})
     */
    disabledStyle: stylePropTypeWithFunction,

    /**
     * style for when the component is hovered. Can be a function that receives the component's state (active, disabled, hover, focus, pressed, isScreenReaderActive)
     * @default {}
     * @example {backgroundColor: 'red'}
     * @example state => ({backgroundColor: state.active ? 'red' : 'blue'})
     */
    hoverStyle: stylePropTypeWithFunction,

    /**
     * style for when the component is focused. Can be a function that receives the component's state (active, disabled, hover, focus, pressed, isScreenReaderActive)
     * @default {}
     * @example {backgroundColor: 'red'}
     * @example state => ({backgroundColor: state.active ? 'red' : 'blue'})
     */
    focusStyle: stylePropTypeWithFunction,

    /**
     * style for when the component is pressed. Can be a function that receives the component's state (active, disabled, hover, focus, pressed, isScreenReaderActive)
     * @default {}
     * @example {backgroundColor: 'red'}
     * @example state => ({backgroundColor: state.active ? 'red' : 'blue'})
     */
    pressedStyle: stylePropTypeWithFunction,

    /**
     * style for when the component is active and the screen reader is on.
     * Can be a function that receives the component's state (active, disabled, hover, focus, pressed, isScreenReaderActive)
     * @default {}
     * @example {backgroundColor: 'red'}
     * @example state => ({backgroundColor: state.active ? 'red' : 'blue'})
     */
    screenReaderActiveStyle: stylePropTypeWithFunction,

    /**
     * Specifies if the component should be accessible when the screen reader is on
     * @default 'all'
     * @example 'all' - the component is accessible regardless of screen reader state
     * @example 'active' - the component is accessible only when the screen reader is on
     * @example 'disabled' - the component is not accessible when the screen reader is on
     */
    enableInScreenReaderStates: PropTypes.oneOf([CONST.SCREEN_READER_STATES.ALL, CONST.SCREEN_READER_STATES.ACTIVE, CONST.SCREEN_READER_STATES.DISABLED]),

    /**
     * Specifies which component should be focused after interacting with this component
     */
    nextFocusRef: PropTypes.func,
    accessibilityLabel: PropTypes.string.isRequired,

    /**
     * Specifies if the component should calculate its hitSlop automatically
     * @default true
     */
    shouldUseAutoHitSlop: PropTypes.bool,
};

const defaultProps = {
    keyboardShortcut: undefined,
    shouldUseHapticsOnPress: false,
    shouldUseHapticsOnLongPress: false,
    disabledStyle: {},
    hoverStyle: {},
    focusStyle: {},
    pressedStyle: {},
    screenReaderActiveStyle: {},
    enableInScreenReaderStates: CONST.SCREEN_READER_STATES.ALL,
    nextFocusRef: undefined,
    shouldUseAutoHitSlop: true,
};

export default {
    pressablePropTypes,
    defaultProps,
};
