import lodashGet from 'lodash/get';
import _ from 'underscore';
import * as FileUtils from './fileDownload/FileUtils';
import CONST from '../CONST';
import Receipt from './actions/Receipt';

const isValidFile = (translate, _file) => {
    const {fileExtension} = FileUtils.splitExtensionFromFileName(lodashGet(_file, 'name', ''));
    if (_.contains(CONST.API_ATTACHMENT_VALIDATIONS.UNALLOWED_EXTENSIONS, fileExtension.toLowerCase())) {
        Receipt.onUploadReceiptError(true, translate('attachmentPicker.wrongFileType'), translate('attachmentPicker.notAllowedExtension'));
        return false;
    }

    if (lodashGet(_file, 'size', 0) > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
        Receipt.onUploadReceiptError(true, translate('attachmentPicker.attachmentTooLarge'), translate('attachmentPicker.sizeExceeded'));
        return false;
    }

    if (lodashGet(_file, 'size', 0) < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
        Receipt.onUploadReceiptError(true, translate('attachmentPicker.attachmentTooSmall'), translate('attachmentPicker.sizeNotMet'));
        return false;
    }

    return true;
};

export default {isValidFile};
