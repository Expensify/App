import {useState, useCallback} from 'react';
import {Alert, InteractionManager} from 'react-native';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import useLocalize from './useLocalize';
import * as FileUtils from '../libs/fileDownload/FileUtils';
import CONST from '../CONST';

export default function useReceiptValidation() {
    const {translate} = useLocalize();
    const [receiptValidation, setReceiptValidation] = useState({
        isReceiptInvalid: false,
        title: '',
        reason: '',
    });

    const resetValidation = () => {
        setReceiptValidation({
            ...receiptValidation,
            isReceiptInvalid: false,
        });
    };

    const showImageCorruptionAlert = useCallback(() => {
        Alert.alert(translate('attachmentPicker.attachmentError'), translate('attachmentPicker.errorWhileSelectingCorruptedImage'));
    }, [translate]);

    const setUploadReceiptError = useCallback((isInvalid, title, reason) => {
        InteractionManager.runAfterInteractions(() => {
            setReceiptValidation({
                isReceiptInvalid: isInvalid,
                title,
                reason,
            });
        });
    }, []);

    const validateReceipt = (file) => {
        const fileName = lodashGet(file, 'fileName', '') || lodashGet(file, 'name', '');
        const {fileExtension} = FileUtils.splitExtensionFromFileName(fileName);

        if (_.contains(CONST.API_ATTACHMENT_VALIDATIONS.UNALLOWED_EXTENSIONS, fileExtension.toLowerCase())) {
            setUploadReceiptError(true, 'attachmentPicker.wrongFileType', 'attachmentPicker.notAllowedExtension');
            return false;
        }

        const isFileCorrupted = (file.width !== undefined && file.width <= 0) || (file.height !== undefined && file.height <= 0);

        if (isFileCorrupted) {
            showImageCorruptionAlert();
            return false;
        }

        const fileSize = lodashGet(file, 'fileSize', 0) || lodashGet(file, 'size', 0);
        if (fileSize > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
            setUploadReceiptError(true, 'attachmentPicker.attachmentTooLarge', 'attachmentPicker.sizeExceeded');
            return false;
        }

        if (fileSize < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
            setUploadReceiptError(true, 'attachmentPicker.attachmentTooSmall', 'attachmentPicker.sizeNotMet');
            return false;
        }

        return true;
    };

    return {resetValidation, validateReceipt, receiptValidation};
}
