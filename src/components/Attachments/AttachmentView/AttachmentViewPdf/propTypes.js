import PropTypes from 'prop-types';
import * as AttachmentsPropTypes from '@components/Attachments/propTypes';
import stylePropTypes from '@styles/stylePropTypes';

const attachmentViewPdfPropTypes = {
    /** File object maybe be instance of File or Object */
    file: AttachmentsPropTypes.attachmentFilePropType.isRequired,

    encryptedSourceUrl: PropTypes.string.isRequired,
    onToggleKeyboard: PropTypes.func.isRequired,
    onLoadComplete: PropTypes.func.isRequired,

    /** Additional style props */
    style: stylePropTypes,

    /** Styles for the error label */
    errorLabelStyles: stylePropTypes,

    /** Callback when the pdf fails to load */
    onError: PropTypes.func,

    /** Whether the attachment is used as a chat attachment */
    isUsedAsChatAttachment: PropTypes.bool,
};

const attachmentViewPdfDefaultProps = {
    file: {
        name: '',
    },
    style: [],
    errorLabelStyles: [],
    onError: () => {},
    isUsedAsChatAttachment: false,
};

export {attachmentViewPdfPropTypes, attachmentViewPdfDefaultProps};
