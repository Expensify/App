import _ from 'underscore';
import PropTypes from 'prop-types';
import {propTypes as modalPropTypes, defaultProps as defaultModalProps} from '../Modal/ModalPropTypes';

const propTypes = {
    ...(_.omit(modalPropTypes, ['type', 'popoverAnchorPosition'])),

    /** The anchor position of the popover */
    anchorPosition: PropTypes.shape({
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
    }),
};

const defaultProps = {
    ...(_.omit(defaultModalProps, ['type', 'popoverAnchorPosition'])),

    // Anchor position is optional only because it is not relevant on mobile
    anchorPosition: {},
};

export {propTypes, defaultProps};
