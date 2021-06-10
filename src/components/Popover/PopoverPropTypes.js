import _ from 'underscore';
import PropTypes from 'prop-types';
import {propTypes as modalPropTypes, defaultProps as defaultModalProps} from '../Modal/ModalPropTypes';
import CONST from '../../CONST';

const propTypes = {
    ...(_.omit(modalPropTypes, 'type', 'popoverAnchorPosition')),

    /** The anchor position of the popover */
    anchorPosition: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),

    /** Modal type to override the default Popover type */
    type: PropTypes.oneOf(_.values(CONST.MODAL.MODAL_TYPE)),
};

const defaultProps = {
    ...(_.omit(defaultModalProps, 'type', 'popoverAnchorPosition')),

    // Anchor position is optional only because it is not relevant on mobile
    anchorPosition: {},
    type: CONST.MODAL.MODAL_TYPE.POPOVER,
};

export {propTypes, defaultProps};
