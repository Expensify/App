import PropTypes from 'prop-types';
import {PressableProps} from 'react-native';
import * as StyleUtils from '../../../styles/StyleUtils';

const stylePropTypeWithFunction = PropTypes.oneOfType([
    StyleUtils.stylePropType,
    PropTypes.func,
]);

const propTypes = {
    ...PressableProps,
    onPress: PropTypes.func.isRequired,
    keyboardShortcut: PropTypes.shape({
        descriptionKey: PropTypes.string.isRequired,
        shortcutKey: PropTypes.string.isRequired,
        modifiers: PropTypes.arrayOf(PropTypes.string),
    }),
    shouldUseHapticsOnPress: PropTypes.bool,
    shouldUseHapticsOnLongPress: PropTypes.bool,
    disabledStyle: stylePropTypeWithFunction,
    hoverStyle: stylePropTypeWithFunction,
    focusStyle: stylePropTypeWithFunction,
    pressedStyle: stylePropTypeWithFunction,
    screenReaderActiveStyle: stylePropTypeWithFunction,
    enableInScreenReaderStates: PropTypes.oneOf(['all', 'active', 'disabled']),
    nextFocusRef: PropTypes.func,
    accessibilityLabel: PropTypes.string.isRequired,
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
    enableInScreenReaderStates: 'all',
    nextFocusRef: undefined,
    shouldUseAutoHitSlop: true,
};

export default {
    propTypes,
    defaultProps,
};
