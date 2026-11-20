/**
 * Tracks whether the native iOS share sheet is open, from the moment it is requested until it is closed.
 *
 * An RN `Modal` (e.g. the report action context menu) can't be presented while the share sheet is up or about to be, because UIKit
 * refuses a second presentation on the same presenter. The modal would then count as open without ever being shown, and the touch
 * that started under the sheet would never end, leaving its target dimmed. So anything that wants to show a modal has to
 * check this first and skip showing it.
 *
 * The flag is set right before the sheet is opened, not for the whole download, so a context menu stays available while a large file
 * is downloading. This leaves a very narrow window: a menu requested in the same JS tick as the sheet, before React has rendered it,
 * is not caught.
 */
let activeShareSheets = 0;

function startShareSheet() {
    activeShareSheets += 1;
}

function endShareSheet() {
    activeShareSheets = Math.max(0, activeShareSheets - 1);
}

function getIsShareSheetOpen() {
    return activeShareSheets > 0;
}

export {startShareSheet, endShareSheet, getIsShareSheetOpen};
