import PropTypes from 'prop-types';
import {attachmentViewDefaultProps, attachmentViewPropTypes} from '@components/Attachments/AttachmentView/propTypes';

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
