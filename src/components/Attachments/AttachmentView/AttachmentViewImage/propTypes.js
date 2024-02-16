import PropTypes from 'prop-types';
import {attachmentViewDefaultProps, attachmentViewPropTypes} from '@components/Attachments/AttachmentView/propTypes';

const attachmentViewImagePropTypes = {
    ...attachmentViewPropTypes,

    url: PropTypes.string.isRequired,

    loadComplete: PropTypes.bool.isRequired,

    isImage: PropTypes.bool.isRequired,
};

const attachmentViewImageDefaultProps = {
    ...attachmentViewDefaultProps,

    loadComplete: false,
    isImage: false,
};

export {attachmentViewImagePropTypes, attachmentViewImageDefaultProps};
