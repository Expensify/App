import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';

/** Returns the copy for a shared file whose size the API would reject, or undefined when the size is allowed. */
function getShareFileSizeError(size: number, translate: LocalizedTranslate): {title: string; message: string} | undefined {
    if (size > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
        return {title: translate('attachmentPicker.attachmentTooLarge'), message: translate('attachmentPicker.sizeExceeded')};
    }
    if (size < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
        return {title: translate('attachmentPicker.attachmentTooSmall'), message: translate('attachmentPicker.sizeNotMet')};
    }
    return undefined;
}

export default getShareFileSizeError;
