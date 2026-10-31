import recordBlockedNavigation, {addBlockedBrowserBackListener} from '@libs/Navigation/AppNavigator/createRootStackNavigator/recordBlockedNavigation/index.web';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

/** Stands in for React Navigation's popstate listener, which the app adds first and which passes a browser back press to the router. */
function addRouterPopStateListener(onPopState: () => void) {
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
}

describe('recordBlockedNavigation (web)', () => {
    const removeListeners: Array<() => void> = [];

    afterEach(async () => {
        for (const removeListener of removeListeners.splice(0)) {
            removeListener();
        }
        // Lets the record of a blocked navigation expire, so each test starts without one.
        await waitForBatchedUpdates();
    });

    it('should call the listener when the router blocks a browser back press', async () => {
        // Given the router blocks the navigation that a browser back press dispatches
        removeListeners.push(addRouterPopStateListener(recordBlockedNavigation));
        const listener = jest.fn();
        removeListeners.push(addBlockedBrowserBackListener(listener));

        // When the user presses the browser back button
        window.dispatchEvent(new PopStateEvent('popstate'));

        // Then the listener runs once, after the press has been handled, so React Navigation can restore the history entry first
        expect(listener).not.toHaveBeenCalled();
        await waitForBatchedUpdates();
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should call the listener when the router handles the press after this listener', async () => {
        // Given the screen subscribed before React Navigation's popstate listener was added, so the router runs second
        const listener = jest.fn();
        removeListeners.push(addBlockedBrowserBackListener(listener));
        removeListeners.push(addRouterPopStateListener(recordBlockedNavigation));

        // When the user presses the browser back button and the router blocks it
        window.dispatchEvent(new PopStateEvent('popstate'));
        await waitForBatchedUpdates();

        // Then the listener still runs once, because the order of popstate listeners is not guaranteed
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should not call the listener when it is removed before the check runs', async () => {
        // Given the router blocks a browser back press
        removeListeners.push(addRouterPopStateListener(recordBlockedNavigation));
        const listener = jest.fn();
        const removeListener = addBlockedBrowserBackListener(listener);

        // When the screen loses focus right after the press, before the check runs
        window.dispatchEvent(new PopStateEvent('popstate'));
        removeListener();
        await waitForBatchedUpdates();

        // Then the listener doesn't run, so the screen that lost focus doesn't navigate
        expect(listener).not.toHaveBeenCalled();
    });

    it('should not call the listener when the browser back press is not blocked', async () => {
        // Given nothing blocks the navigation, as when React Navigation moves through the history itself
        const listener = jest.fn();
        removeListeners.push(addBlockedBrowserBackListener(listener));

        // When popstate fires
        window.dispatchEvent(new PopStateEvent('popstate'));
        await waitForBatchedUpdates();

        // Then the listener doesn't run, because no back press was blocked
        expect(listener).not.toHaveBeenCalled();
    });

    it('should not call the listener for a popstate after an earlier blocked in-app navigation', async () => {
        // Given an in-app navigation or a canGoBack check was blocked in an earlier task
        const listener = jest.fn();
        removeListeners.push(addBlockedBrowserBackListener(listener));
        recordBlockedNavigation();
        await waitForBatchedUpdates();

        // When the user later presses the browser back button and nothing blocks it
        window.dispatchEvent(new PopStateEvent('popstate'));
        await waitForBatchedUpdates();

        // Then the listener doesn't run, because the earlier block wasn't a browser back press
        expect(listener).not.toHaveBeenCalled();
    });

    it('should not call a listener after it is removed', async () => {
        // Given a screen subscribed and then lost focus
        removeListeners.push(addRouterPopStateListener(recordBlockedNavigation));
        const listener = jest.fn();
        const removeListener = addBlockedBrowserBackListener(listener);
        removeListener();

        // When the router blocks a browser back press
        window.dispatchEvent(new PopStateEvent('popstate'));
        await waitForBatchedUpdates();

        // Then the removed listener doesn't run
        expect(listener).not.toHaveBeenCalled();
    });
});
