import Share from 'react-native-share';

/**
 * Tracks whether the native iOS share sheet is currently presented over the app.
 *
 * An RN `Modal` (e.g. the report action context menu) can't be presented while the share sheet is up, because UIKit refuses
 * a second presentation on the same presenter. The modal would then count as open without ever being shown, and the touch
 * that started under the sheet would never end, leaving its target dimmed. So anything that wants to show a modal has to
 * close the share sheet first.
 */
let isShareSheetOpen = false;

function setShareSheetOpen(isOpen: boolean) {
    isShareSheetOpen = isOpen;
}

function getIsShareSheetOpen() {
    return isShareSheetOpen;
}

/**
 * Closes the share sheet, if there is one, and resolves once it is fully gone so a modal can be presented right after.
 * The native side always settles the promise, including when the sheet is still animating in or is already being closed.
 */
function dismissShareSheet(): Promise<void> {
    if (!isShareSheetOpen) {
        return Promise.resolve();
    }
    return Share.dismiss()
        .catch(() => {})
        .finally(() => {
            // Normally Share.open has settled by now and already cleared the flag, but if the sheet was gone by itself it may not have yet,
            // and the caller must not be left waiting on a sheet that no longer exists
            isShareSheetOpen = false;
        });
}

export {setShareSheetOpen, getIsShareSheetOpen, dismissShareSheet};
