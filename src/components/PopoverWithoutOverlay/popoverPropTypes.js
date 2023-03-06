import _ from 'underscore';
import PropTypes from 'prop-types';
import {propTypes as modalPropTypes, defaultProps as defaultModalProps} from '../Modal/modalPropTypes';
import CONST from '../../CONST';

const propTypes = {
    ...(_.omit(modalPropTypes, ['type', 'popoverAnchorPosition'])),

    /** The anchor position of the popover */
    anchorPosition: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),

    /** A react-native-animatable animation timing for the modal display animation. */
    animationInTiming: PropTypes.number,

    /** Whether disable the animations */
    disableAnimation: PropTypes.bool,
};

const defaultProps = {
    ...(_.omit(defaultModalProps, ['type', 'popoverAnchorPosition'])),

    animationIn: 'fadeIn',
    animationOut: 'fadeOut',
    animationInTiming: CONST.ANIMATED_TRANSITION,

    // Anchor position is optional only because it is not relevant on mobile
    anchorPosition: {},
    disableAnimation: true,
};

export {propTypes, defaultProps};
