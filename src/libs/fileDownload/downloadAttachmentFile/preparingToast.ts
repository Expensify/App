import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import Growl from '@libs/Growl';

/**
 * Tells the user that the download started. The attachment is not on the device yet, so the share sheet (iOS) or the success alert (Android) comes later.
 */
function showPreparingToast(translate: LocalizedTranslate) {
    Growl.success({bodyText: translate('fileDownload.preparing'), shouldShowSpinner: true});
}

export {showPreparingToast};
