import {clearQuickActionDraft, clearQuickActionDraftAmount} from '@libs/actions/IOU/QuickActionDraft';

import CONST from '@src/CONST';

/**
 * Matches the create URLs opened by the home-screen quick actions ("Create expense", "Scan receipt", "Track distance"),
 * for example `create/create/start/1/<reportID>/manual`. They open the create screen straight for
 * OPTIMISTIC_TRANSACTION_ID, so they skip the `start/...` redirect that clears the previous draft.
 * GPS links (`.../distance-gps`) are left out on purpose, because they reopen a trip that is still being tracked.
 */
const QUICK_ACTION_CREATE_PATH_REGEX = new RegExp(`/create/[^/]+/start/${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}/[^/]+/(manual|scan|distance-new/?)$`);

function isQuickActionCreateLink(url: string): boolean {
    const pathname = url.split(/[?#]/).at(0) ?? '';
    return QUICK_ACTION_CREATE_PATH_REGEX.test(pathname);
}

/**
 * Removes the draft left by an earlier unfinished expense before a quick-action link opens the create screen, so the
 * screen builds a fresh one instead of showing the old amount.
 */
function clearDraftForQuickActionLink(url: string) {
    if (!isQuickActionCreateLink(url)) {
        return;
    }
    clearQuickActionDraft();
}

/**
 * Clears the amount when a quick-action link is dropped because its create screen is already open. The screen stays
 * mounted, so the amount is reset in place instead of removing the whole draft.
 */
function clearAmountForQuickActionLink(url: string) {
    if (!isQuickActionCreateLink(url)) {
        return;
    }
    clearQuickActionDraftAmount();
}

export {clearDraftForQuickActionLink, clearAmountForQuickActionLink};
