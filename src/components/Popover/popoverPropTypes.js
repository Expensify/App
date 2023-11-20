import PropTypes from 'prop-types';
import _ from 'underscore';
import {defaultProps as defaultModalProps, propTypes as modalPropTypes} from '@components/Modal/modalPropTypes';
import refPropTypes from '@components/refPropTypes';
import CONST from '@src/CONST';

const propTypes = {
    ..._.omit(modalPropTypes, ['type', 'popoverAnchorPosition']),

    /** The anchor position of the popover */
    anchorPosition: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),

    /** The anchor ref of the popover */
    anchorRef: refPropTypes,

    /** A react-native-animatable animation timing for the modal display animation. */
    animationInTiming: PropTypes.number,

    /** Whether disable the animations */
    disableAnimation: PropTypes.bool,

    /** The ref of the popover */
    withoutOverlayRef: refPropTypes,
};

const defaultProps = {
    ..._.omit(defaultModalProps, ['type', 'popoverAnchorPosition']),

    animationIn: 'fadeIn',
    animationOut: 'fadeOut',
    animationInTiming: CONST.ANIMATED_TRANSITION,

    // Anchor position is optional only because it is not relevant on mobile
    anchorPosition: {},
    anchorRef: () => {},
    disableAnimation: true,
    withoutOverlayRef: () => {},
};

export {propTypes, defaultProps};
