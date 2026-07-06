import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES, VERIFY_ACCOUNT} from '@src/ROUTES';

import {isUserValidatedSelector} from '@selectors/Account';
import {useEffect, useState} from 'react';

import useOnyx from './useOnyx';

/**
 * Sends an unvalidated user to the verify-account (magic code) screen and re-runs the interrupted
 * action once they successfully validate their account.
 */
function useVerifyAccountAndResume() {
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const [pendingAction, setPendingAction] = useState<{resume: () => void} | null>(null);

    useEffect(() => {
        if (!isUserValidated || !pendingAction) {
            return;
        }

        const shouldResume = Navigation.getActiveRouteWithoutParams().includes(VERIFY_ACCOUNT);

        const handle = TransitionTracker.runAfterTransitions({
            callback: () => {
                setPendingAction(null);
                if (!shouldResume) {
                    return;
                }
                pendingAction.resume();
            },
            waitForUpcomingTransition: true,
        });

        return () => handle.cancel();
    }, [isUserValidated, pendingAction]);

    const verifyAccountAndResume = (resume?: () => void) => {
        setPendingAction(resume ? {resume} : null);
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path));
    };

    return verifyAccountAndResume;
}

export default useVerifyAccountAndResume;
