import PropTypes from 'prop-types';
import _ from 'underscore';
import CONST from '../../CONST';
import {windowDimensionsPropTypes} from '../withWindowDimensions';
import stylePropTypes from '../../styles/stylePropTypes';

const propTypes = {
    /** Decides whether the modal should cover fullscreen. FullScreen modal has backdrop */
    fullscreen: PropTypes.bool,

    /** Should we close modal on outside click */
    shouldCloseOnOutsideClick: PropTypes.bool,

    /** Should we announce the Modal visibility changes? */
    shouldSetModalVisibility: PropTypes.bool,

    /** Callback method fired when the user requests to close the modal */
    onClose: PropTypes.func.isRequired,

    /** State that determines whether to display the modal or not */
    isVisible: PropTypes.bool.isRequired,

    /** Modal contents */
    children: PropTypes.node.isRequired,

    /** Callback method fired when the user requests to submit the modal content. */
    onSubmit: PropTypes.func,

    /** Callback method fired when the modal is hidden */
    onModalHide: PropTypes.func,

    /** Callback method fired when the modal is shown */
    onModalShow: PropTypes.func,

    /** Style of modal to display */
    type: PropTypes.oneOf(_.values(CONST.MODAL.MODAL_TYPE)),

    /** A react-native-animatable animation definition for the modal display animation. */
    animationIn: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),

    /** A react-native-animatable animation definition for the modal hide animation. */
    animationOut: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),

    /** The anchor position of a popover modal. Has no effect on other modal types. */
    popoverAnchorPosition: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),

    /** Modal container styles  */
    innerContainerStyle: stylePropTypes,

    /** Whether the modal should go under the system statusbar */
    statusBarTranslucent: PropTypes.bool,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    fullscreen: true,
    shouldCloseOnOutsideClick: false,
    shouldSetModalVisibility: true,
    onSubmit: null,
    type: '',
    onModalHide: () => {},
    onModalShow: () => {},
    animationIn: null,
    animationOut: null,
    popoverAnchorPosition: {},
    innerContainerStyle: {},
    statusBarTranslucent: true,
};

export {propTypes, defaultProps};
