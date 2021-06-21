/**
 * This is a no-op component for native devices because they wouldn't be able to support keyboard shortcuts like
 * a website.
 */
const KeyboardShortcut = {
    subscribe() {
        return () => {};
    },
    unsubscribe() {},
};

export default KeyboardShortcut;
