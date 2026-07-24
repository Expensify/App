/**
 * Tracks whether the current create flow was opened from a native home-screen shortcut deeplink.
 * Shortcuts are the only create-expense entry point that arrives via a `Linking` URL, so detecting
 * them here is unambiguous and free of races with draft rebuilds. The marker is set on a matching
 * URL, consumed (read-and-cleared) by `useResetIOUType`, and also cleared by any in-app entry point
 * (`startMoneyRequest`/`startDistanceRequest`) so FAB flows keep their original navigation.
 */
let isNativeShortcutFlow = false;

// Matches full deeplinks and the bare route form HybridApp can deliver (no leading slash).
// Intentionally excludes the GPS trip deeplink (`.../distance-gps`), which is not a shortcut.
const NATIVE_SHORTCUT_DEEPLINK_PATTERN = /(?:^|\/)create\/create\/start\/[^/]+\/[^/]+\/(?:scan|manual|distance-new)\/?(?:\?.*)?$/;

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
