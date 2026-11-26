import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import Growl from '@libs/Growl';

/** Identifies the growl of one download, to hide exactly this growl when the download is ready */
type GrowlNonce = ReturnType<typeof Growl.success>;

/**
 * Tells the user that the download started. The attachment is not on the device yet, so the share sheet (iOS) or the success alert (Android) comes later.
 * The growl stays until the download is ready (see hideDownloadingGrowl) or the user dismisses it.
 */
function showDownloadingGrowl(translate: LocalizedTranslate): GrowlNonce {
    return Growl.success({
        bodyText: translate('fileDownload.inProgress'),
        duration: Infinity,
        shouldShowSpinner: true,
        // The growl dismisses itself when the button is pressed, there is nothing else to do
        action: {label: translate('common.dismiss'), onPress: () => {}},
    });
}

/**
 * Removes the growl once the download is ready, so it does not linger under the share sheet.
 * The nonce is known only once the growl is shown, so this waits for it, and then it can not run before the growl is shown.
 */
function hideDownloadingGrowl(growlNonce: GrowlNonce | undefined) {
    growlNonce?.then((nonce) => {
        if (nonce === undefined) {
            return;
        }
        Growl.hide(nonce);
    });
}

export {showDownloadingGrowl, hideDownloadingGrowl};
export type {GrowlNonce};
