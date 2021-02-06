import PropTypes from 'prop-types';
import CONST from '../../CONST';
import {windowDimensionsPropTypes} from '../withWindowDimensions';

const baseModalPropTypes = {
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

    ...windowDimensionsPropTypes,
};

const modalPropTypes = {
    // Style of modal to display
    type: PropTypes.oneOf([
        CONST.MODAL.MODAL_TYPE.CENTERED,
        CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED,
        CONST.MODAL.MODAL_TYPE.POPOVER,
        CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED,
    ]),
    ...baseModalPropTypes,
};

export {
    baseModalPropTypes,
    modalPropTypes,
};
