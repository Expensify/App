import PropTypes from 'prop-types';
import stylePropTypes from '../../styles/stylePropTypes';
import {windowDimensionsPropTypes} from '../withWindowDimensions';

const propTypes = {
    /** URL to full-sized image */
    sourceURL: PropTypes.string,

    /** Additional style props */
    style: stylePropTypes,

    /** Notify parent that the keyboard has opened or closed */
    onToggleKeyboard: PropTypes.func,

    /** Handles press events like toggling attachment arrows natively */
    onPress: PropTypes.func,

    /** Handles scale changed event in PDF component */
    onScaleChanged: PropTypes.func,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    sourceURL: '',
    style: {},
    onPress: () => {},
    onToggleKeyboard: () => {},
    onScaleChanged: () => {},
};

export {propTypes, defaultProps};
