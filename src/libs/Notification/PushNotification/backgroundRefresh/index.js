/**
 * Runs our reconnectApp action if the app is in the background.
 *
 * We use this to refresh the app in the background after receiving a push notification (native only). Since the full app
 * wakes on iOS and by extension runs reconnectApp already, this is a no-op on everything but Android.
 */
export default function backgroundRefresh() {}
