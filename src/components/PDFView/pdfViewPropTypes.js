import PropTypes from 'prop-types';
import stylePropTypes from '../../styles/stylePropTypes';
import {windowDimensionsPropTypes} from '../withWindowDimensions';

const propTypes = {
    /** URL to full-sized image */
    sourceURL: PropTypes.string,

    /** PDF file name */
    fileName: PropTypes.string,

    /** Additional style props */
    style: stylePropTypes,

    /** Notify parent that the keyboard has opened or closed */
    onToggleKeyboard: PropTypes.func,

    /** Handles press events like toggling attachment arrows natively */
    onPress: PropTypes.func,

    /** Handles scale changed event in PDF component */
    onScaleChanged: PropTypes.func,

    /** Handles load complete event in PDF component */
    onLoadComplete: PropTypes.func,

    /** Should focus to the password input  */
    isFocused: PropTypes.bool,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    sourceURL: '',
    fileName: '',
    style: {},
    onPress: undefined,
    onToggleKeyboard: () => {},
    onScaleChanged: () => {},
    onLoadComplete: () => {},
    isFocused: false,
};

export {propTypes, defaultProps};
