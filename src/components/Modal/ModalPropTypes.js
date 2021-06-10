import PropTypes from 'prop-types';
import _ from 'underscore';
import CONST from '../../CONST';
import {windowDimensionsPropTypes} from '../withWindowDimensions';

const propTypes = {
    /** Should we close modal on outside click */
    shouldCloseOnOutsideClick: PropTypes.bool,

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

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    shouldCloseOnOutsideClick: false,
    onSubmit: null,
    type: '',
    onModalHide: () => {},
    onModalShow: () => {},
    animationIn: null,
    animationOut: null,
    popoverAnchorPosition: {},
};

export {propTypes, defaultProps};
