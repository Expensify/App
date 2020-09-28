/**
 * On web/desktop we don't really care if the app becomes
 * active or inactive as long as Pusher is always connected
 */
export default {
    registerOnAppBecameActiveCallback: () => {},
};
