import {useCallback} from 'react';
import {useMultifactorAuthentication} from '@components/MultifactorAuthentication/Context';

/**
 * Returns a focus-trap `escapeDeactivates` callback that opens the MFA cancel-confirmation modal.
 *
 * `focus-trap` listens on `keydown`, but `ReanimatedModal` listens on `keyup`. Without intervention,
 * the same ESC press that opens the modal would also trigger the keyup listener that just got
 * attached, closing the modal immediately. We swallow that one keyup via a one-shot capture-phase
 * listener registered on `document` before `requestCancel` runs.
 *
 * Returning `false` keeps the trap active so focus stays inside the MFA screen while the
 * confirmation modal is up.
 */
function useMFACancelOnEscape(): () => boolean {
    const {requestCancel} = useMultifactorAuthentication();

    return useCallback(() => {
        const suppressEscapeKeyup = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.stopImmediatePropagation();
            }
            document.removeEventListener('keyup', suppressEscapeKeyup, true);
        };
        document.addEventListener('keyup', suppressEscapeKeyup, true);
        requestCancel();
        return false;
    }, [requestCancel]);
}

export default useMFACancelOnEscape;
