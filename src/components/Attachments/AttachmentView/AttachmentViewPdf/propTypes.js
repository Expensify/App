import PropTypes from 'prop-types';
import * as AttachmentsPropTypes from '../../propTypes';
import stylePropTypes from '../../../../styles/stylePropTypes';

const attachmentViewPdfPropTypes = {
    /** File object maybe be instance of File or Object */
    file: AttachmentsPropTypes.attachmentFilePropType.isRequired,

    encryptedSourceUrl: PropTypes.string.isRequired,
    onToggleKeyboard: PropTypes.func.isRequired,
    onLoadComplete: PropTypes.func.isRequired,

    /** Styles for the error label */
    errorLabelStyles: stylePropTypes,
};

const attachmentViewPdfDefaultProps = {
    file: {
        name: '',
    },
    errorLabelStyles: [],
};

export {attachmentViewPdfPropTypes, attachmentViewPdfDefaultProps};
