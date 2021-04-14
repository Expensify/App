import PropTypes from 'prop-types';
import CONST from '../../CONST';
import {windowDimensionsPropTypes} from '../withWindowDimensions';

const propTypes = {
    // Callback method fired when the user requests to close the modal
    onClose: PropTypes.func.isRequired,

    // State that determines whether to display the modal or not
    isVisible: PropTypes.bool.isRequired,

    // Modal contents
    children: PropTypes.node.isRequired,

    // Callback method fired when the user requests to submit the modal content.
    onSubmit: PropTypes.func,

    // Callback method fired when the modal is hidden
    onModalHide: PropTypes.func,

    // Callback method fired when the modal is shown
    onModalShow: PropTypes.func,

    // Style of modal to display
    type: PropTypes.oneOf([
        CONST.MODAL.MODAL_TYPE.CONFIRM,
        CONST.MODAL.MODAL_TYPE.CENTERED,
        CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED,
        CONST.MODAL.MODAL_TYPE.POPOVER,
        CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED,
    ]),

    // A react-native-animatable animation definition for the modal display animation.
    animationIn: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),

    // The anchor position of a popover modal. Has no effect on other modal types.
    popoverAnchorPosition: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    onSubmit: null,
    type: '',
    onModalHide: () => {},
    onModalShow: () => {},
    animationIn: null,
    popoverAnchorPosition: {},
};

export {propTypes, defaultProps};
