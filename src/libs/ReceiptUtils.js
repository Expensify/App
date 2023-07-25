import lodashGet from 'lodash/get';
import _ from 'underscore';
import * as FileUtils from './fileDownload/FileUtils';
import CONST from '../CONST';
import Receipt from './actions/Receipt';

const isValidReceipt = (file, props) => {
    const {fileExtension} = FileUtils.splitExtensionFromFileName(lodashGet(file, 'name', ''));
    if (_.contains(CONST.API_ATTACHMENT_VALIDATIONS.UNALLOWED_EXTENSIONS, fileExtension.toLowerCase())) {
        Receipt.setUploadReceiptError(true, props.translate('attachmentPicker.wrongFileType'), props.translate('attachmentPicker.notAllowedExtension'));
        return false;
    }

    if (lodashGet(file, 'size', 0) > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
        Receipt.setUploadReceiptError(true, props.translate('attachmentPicker.attachmentTooLarge'), props.translate('attachmentPicker.sizeExceeded'));
        return false;
    }

    if (lodashGet(file, 'size', 0) < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
        Receipt.setUploadReceiptError(true, props.translate('attachmentPicker.attachmentTooSmall'), props.translate('attachmentPicker.sizeNotMet'));
        return false;
    }

    return true;
};

export default {isValidReceipt};
