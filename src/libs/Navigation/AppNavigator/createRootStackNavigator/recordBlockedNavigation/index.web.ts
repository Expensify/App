/**
 * Lets screens react when a navigation guard blocks a browser back press.
 * React Navigation syncs the browser history back after a block. Rewriting the entry would drop the id it saved,
 * and the URL would stop following later navigations.
 */
import type {AddBlockedBrowserBackListener, RecordBlockedNavigation} from './types';

let isNavigationBlocked = false;

const recordBlockedNavigation: RecordBlockedNavigation = () => {
    isNavigationBlocked = true;

    // The record only lasts for the current task, so a block from an in-app action or a canGoBack check never matches a later popstate.
    setTimeout(() => {
        isNavigationBlocked = false;
    });
};

const addBlockedBrowserBackListener: AddBlockedBrowserBackListener = (listener) => {
    let pendingCheck: ReturnType<typeof setTimeout> | undefined;

    const handlePopState = () => {
        // The router can run before or after this listener, so the block is checked both now and after the event.
        const wasBlockedBeforeThisListener = isNavigationBlocked;
        clearTimeout(pendingCheck);
        pendingCheck = setTimeout(() => {
            if (!wasBlockedBeforeThisListener && !isNavigationBlocked) {
                return;
            }
            listener();
        });
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
        clearTimeout(pendingCheck);
        window.removeEventListener('popstate', handlePopState);
    };
};

export default recordBlockedNavigation;
export {addBlockedBrowserBackListener};
