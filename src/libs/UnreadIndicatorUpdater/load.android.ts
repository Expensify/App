/**
 * `updateUnread` is a no-op on Android (there is no tab title or app icon badge to update), so we skip loading
 * the updater entirely. This keeps the module and its Onyx subscriptions out of the Android bundle, avoiding a
 * walk over every report on each update only to discard the result.
 */
export default function loadUnreadIndicatorUpdater() {}
