import lodashGet from 'lodash/get';
import _ from 'underscore';
import * as FileUtils from './fileDownload/FileUtils';
import CONST from '../CONST';
import Receipt from './actions/Receipt';
import * as Localize from './Localize';

const validateReceipt = (file) => {
    const {fileExtension} = FileUtils.splitExtensionFromFileName(lodashGet(file, 'name', ''));
    if (_.contains(CONST.API_ATTACHMENT_VALIDATIONS.UNALLOWED_EXTENSIONS, fileExtension.toLowerCase())) {
        Receipt.setUploadReceiptError(true, Localize.translateLocal('attachmentPicker.wrongFileType'), Localize.translateLocal('attachmentPicker.notAllowedExtension'));
        return false;
    }

    if (lodashGet(file, 'size', 0) > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
        Receipt.setUploadReceiptError(true, Localize.translateLocal('attachmentPicker.attachmentTooLarge'), Localize.translateLocal('attachmentPicker.sizeExceeded'));
        return false;
    }

    if (lodashGet(file, 'size', 0) < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
        Receipt.setUploadReceiptError(true, Localize.translateLocal('attachmentPicker.attachmentTooSmall'), Localize.translateLocal('attachmentPicker.sizeNotMet'));
        return false;
    }

    return true;
};

export default {validateReceipt};
