/** Dismiss account-scoped dialogs without treating token refresh or session hydration as an account switch. */
import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef} from 'react';

function useDismissModalsOnSessionChange(dismissModals: () => void) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {
        selector: (value) => (value ? {accountID: value.accountID, isAuthenticated: !!value.authToken} : undefined),
    });
    const previousSession = useRef<typeof session>(undefined);

    useEffect(() => {
        const previous = previousSession.current;
        previousSession.current = session;

        if (!previous) {
            return;
        }

        if (previous.accountID !== session?.accountID || (previous.isAuthenticated && !session?.isAuthenticated)) {
            dismissModals();
        }
    }, [session, dismissModals]);
}

export default useDismissModalsOnSessionChange;
