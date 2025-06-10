import {isMobileChrome} from '@libs/Browser';

/**
 * This function is used to trigger a browser back navigation and calls the callback once the navigation is complete (only on mobile Chrome).
 * More details - https://github.com/Expensify/App/issues/58946.
 */
export default function backHistory(callback: () => void) {
    if (!isMobileChrome()) {
        callback();
        return;
    }
    const onPopState = () => {
        window.removeEventListener('popstate', onPopState);
        callback();
    };

    window.addEventListener('popstate', onPopState);
    window.history.back();
}
