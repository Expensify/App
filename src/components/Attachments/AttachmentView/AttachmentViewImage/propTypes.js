import PropTypes from 'prop-types';
import {attachmentViewPropTypes, attachmentViewDefaultProps} from '../propTypes';

const attachmentViewImagePropTypes = {
    ...attachmentViewPropTypes,

    loadComplete: PropTypes.bool.isRequired,

    isImage: PropTypes.bool.isRequired,
};

const attachmentViewImageDefaultProps = {
    ...attachmentViewDefaultProps,

    loadComplete: false,
    isImage: false,
};

export {attachmentViewImagePropTypes, attachmentViewImageDefaultProps};
