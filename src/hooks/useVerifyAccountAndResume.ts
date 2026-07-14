import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import splitPathAndQuery from '@libs/Navigation/helpers/dynamicRoutesUtils/splitPathAndQuery';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import {isUserValidatedSelector} from '@selectors/Account';
import {useCallback, useEffect, useEffectEvent, useState} from 'react';

import useOnyx from './useOnyx';

/**
 * Returns a trigger that sends an unvalidated user to the verify-account (magic code) screen and,
 * once they validate there, calls `onResume` with the payload the trigger stored.
 */
function useVerifyAccountAndResume<TPayload>(onResume: (payload: TPayload) => void) {
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const [pendingAction, setPendingAction] = useState<{payload: TPayload; verifyAccountPath: string} | null>(null);

    // Effect event, so the resume runs the latest `onResume` (a press-time closure would see pre-validation state).
    const resumeAction = useEffectEvent(onResume);

    // Effect event, so the listener reads the freshest validation state and doesn't mistake the success-driven close of the verify-account page for an abandon.
    const handleNavigationStateChange = useEffectEvent(() => {
        if (!pendingAction || isUserValidated || Navigation.getActiveRouteWithoutParams() === pendingAction.verifyAccountPath) {
            return;
        }
        setPendingAction(null);
    });

    useEffect(() => {
        if (!pendingAction) {
            return;
        }

        // Leaving the verify-account screen without validating abandons the action, which is what makes resuming below safe without a route check.
        if (!isUserValidated) {
            return navigationRef.addListener('state', handleNavigationStateChange);
        }

        // Validation succeeded — resume even if the verify-account page already dismissed itself.
        const isVerifyAccountScreenStillOpen = Navigation.getActiveRouteWithoutParams() === pendingAction.verifyAccountPath;
        const resume = () => {
            setPendingAction(null);
            resumeAction(pendingAction.payload);
        };
        // While the page is still open its closing transition hasn't been dispatched yet, so wait for the upcoming one; otherwise the close is already in flight (or done), so only wait out active transitions.
        const handle = isVerifyAccountScreenStillOpen ? Navigation.runAfterUpcomingTransition(resume) : Navigation.runAfterTransition(resume);

        return () => handle.cancel();
    }, [isUserValidated, pendingAction]);

    const verifyAccountAndResume = useCallback((payload: TPayload) => {
        const verifyAccountRoute = createDynamicRoute(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path);
        const [verifyAccountPath] = splitPathAndQuery(verifyAccountRoute);
        setPendingAction(verifyAccountPath ? {payload, verifyAccountPath} : null);
        Navigation.navigate(verifyAccountRoute);
    }, []);

    return {isUserValidated, verifyAccountAndResume};
}

export default useVerifyAccountAndResume;
