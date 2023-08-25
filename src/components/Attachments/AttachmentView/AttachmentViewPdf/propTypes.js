import PropTypes from 'prop-types';
import * as AttachmentsPropTypes from '../../propTypes';

const attachmentViewPdfPropTypes = {
    /** File object maybe be instance of File or Object */
    file: AttachmentsPropTypes.attachmentFilePropType.isRequired,

    encryptedSourceUrl: PropTypes.string.isRequired,
    onToggleKeyboard: PropTypes.func.isRequired,
    onLoadComplete: PropTypes.func.isRequired,
};

const attachmentViewPdfDefaultProps = {
    file: {
        name: '',
    },
};

export {attachmentViewPdfPropTypes, attachmentViewPdfDefaultProps};
