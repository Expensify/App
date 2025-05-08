import {isMobileChrome} from '@libs/Browser';

/**
 * This function is used to trigger a browser back navigation and resolves a promise once the navigation is complete (only on mobile Chrome).
 * More details - https://github.com/Expensify/App/issues/58946.
 */
export default function backHistory() {
    return new Promise<void>((resolve) => {
        if (!isMobileChrome()) {
            resolve();
            return;
        }

        const onPopState = () => {
            window.removeEventListener('popstate', onPopState);
            resolve();
        };

        window.addEventListener('popstate', onPopState);
        window.history.back();
    });
}
