import {isMobileChrome} from '@libs/Browser';

/**
 * Navigates back in history and resolves after `popstate` (only on mobile Chrome).
 * Resolves immediately on other browsers.
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
