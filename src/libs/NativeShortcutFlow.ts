/**
 * Tracks whether the current money-request create flow was opened from a native home-screen
 * shortcut (force touch / long-press quick action) deeplink, e.g. "Scan receipt".
 *
 * Native shortcuts are the only create-expense entry point that reaches the app through a
 * `Linking` URL (all in-app entry points navigate via `Navigation.navigate` and go through
 * `startMoneyRequest`/`startDistanceRequest`). Detecting the shortcut at the deeplink layer is
 * therefore unambiguous and avoids racing against the draft rebuilds (`initMoneyRequest`) that
 * happen while the create flow mounts.
 *
 * The marker is:
 *  - set when a received URL matches the shortcut deeplink shape (see Mobile-Expensify's
 *    quickActionCallback, which generates `/create/create/start/1/{reportID}/scan|manual|distance-new`)
 *  - consumed by `useResetIOUType` so the rebuilt draft carries `isFromNativeShortcut`
 *  - cleared whenever an in-app flow starts a new money request, so FAB and other in-app flows
 *    keep their original post-submit navigation
 */
let isNativeShortcutFlow = false;

// Intentionally does not match the GPS trip deeplink (`.../distance-new/distance-gps`), which is
// sent by the GPS tracking notification, not a home-screen shortcut.
const NATIVE_SHORTCUT_DEEPLINK_PATTERN = /\/create\/create\/start\/[^/]+\/[^/]+\/(?:scan|manual|distance-new)\/?(?:\?.*)?$/;

function markNativeShortcutFlowIfNeeded(url: string | null | undefined): void {
    if (!url || !NATIVE_SHORTCUT_DEEPLINK_PATTERN.test(url)) {
        return;
    }
    isNativeShortcutFlow = true;
}

function endNativeShortcutFlow(): void {
    isNativeShortcutFlow = false;
}

function isNativeShortcutFlowActive(): boolean {
    return isNativeShortcutFlow;
}

export {markNativeShortcutFlowIfNeeded, endNativeShortcutFlow, isNativeShortcutFlowActive};
