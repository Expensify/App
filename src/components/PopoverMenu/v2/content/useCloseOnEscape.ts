import {useEffect} from 'react';
import claimEscapeKeyDown from '@libs/claimEscapeKeyDown';
import suppressNextEscapeKeyUp from '@libs/suppressNextEscapeKeyUp';

/**
 * Closes the popover on Escape. Web-only via `claimEscapeKeyDown` (no-op on native);
 * the parent-modal Escape race we're defending against is web-specific.
 */
function useCloseOnEscape(isVisible: boolean, close: () => void): void {
    useEffect(() => {
        if (!isVisible) {
            return undefined;
        }
        return claimEscapeKeyDown(() => {
            suppressNextEscapeKeyUp();
            close();
        });
    }, [isVisible, close]);
}

export default useCloseOnEscape;
