import PropTypes from 'prop-types';
import stylePropTypes from '../../styles/stylePropTypes';
import {windowDimensionsPropTypes} from '../withWindowDimensions';
import {keyboardStatePropTypes} from '../withKeyboardState';

const propTypes = {
    /** URL to full-sized image */
    sourceURL: PropTypes.string,

    /** Additional style props */
    style: stylePropTypes,

    /** Notify parent that the keyboard has opened or closed */
    onToggleKeyboard: PropTypes.func,

    ...windowDimensionsPropTypes,
    ...keyboardStatePropTypes,
};

const defaultProps = {
    sourceURL: '',
    style: {},
    onToggleKeyboard: () => {},
};

export {propTypes, defaultProps};
