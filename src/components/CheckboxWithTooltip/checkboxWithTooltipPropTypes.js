import PropTypes from 'prop-types';
import {windowDimensionsPropTypes} from '../withWindowDimensions';
import CONST from '../../CONST';
import stylePropTypes from '../../styles/stylePropTypes';

const propTypes = {
    /** Whether the checkbox is checked */
    isChecked: PropTypes.bool.isRequired,

    /** Called when the checkbox or label is pressed */
    onPress: PropTypes.func.isRequired,

    /** Flag to determine to toggle or not the tooltip */
    toggleTooltip: PropTypes.bool,

    /** The text to display in the tooltip. */
    text: PropTypes.string.isRequired,

    /** Type of the growl to be displayed in case of mobile devices  */
    growlType: PropTypes.string,

    /** Container styles */
    style: stylePropTypes,

    /** Wheter the checkbox is disabled */
    disabled: PropTypes.bool,

    /** Props inherited from withWindowDimensions */
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    style: [],
    disabled: false,
    toggleTooltip: true,
    growlType: CONST.GROWL.WARNING,
};

export {
    propTypes,
    defaultProps,
};
