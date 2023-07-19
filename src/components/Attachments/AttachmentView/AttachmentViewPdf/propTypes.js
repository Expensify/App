import PropTypes from 'prop-types';
import {attachmentViewPropTypes, attachmentViewDefaultProps} from '../propTypes';

const attachmentViewPdfPropTypes = {
    ...attachmentViewPropTypes,

    encryptedSourceUrl: PropTypes.string.isRequired,
    onToggleKeyboard: PropTypes.func.isRequired,
    onLoadComplete: PropTypes.func.isRequired,
};

const attachmentViewPdfDefaultProps = attachmentViewDefaultProps;

export {attachmentViewPdfPropTypes, attachmentViewPdfDefaultProps};
