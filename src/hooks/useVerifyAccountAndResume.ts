import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import splitPathAndQuery from '@libs/Navigation/helpers/dynamicRoutesUtils/splitPathAndQuery';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import {isUserValidatedSelector} from '@selectors/Account';
import {useEffect, useEffectEvent, useState} from 'react';

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

    useEffect(() => {
        if (!pendingAction) {
            return;
        }

        const isOnVerifyAccountScreen = () => Navigation.getActiveRouteWithoutParams() === pendingAction.verifyAccountPath;

        // Leaving the verify-account screen without validating abandons the action — it must never run without user intent.
        if (!isUserValidated) {
            return navigationRef.addListener('state', () => {
                if (isOnVerifyAccountScreen()) {
                    return;
                }
                setPendingAction(null);
            });
        }

        // Resume only if validated on the exact screen this hook opened, not another flow's verify-account screen.
        if (!isOnVerifyAccountScreen()) {
            return;
        }

        const handle = Navigation.runAfterUpcomingTransition(() => {
            setPendingAction(null);
            resumeAction(pendingAction.payload);
        });

        return () => handle.cancel();
    }, [isUserValidated, pendingAction]);

    const verifyAccountAndResume = (payload: TPayload) => {
        const verifyAccountRoute = createDynamicRoute(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path);
        const [verifyAccountPath] = splitPathAndQuery(verifyAccountRoute);
        setPendingAction(verifyAccountPath ? {payload, verifyAccountPath} : null);
        Navigation.navigate(verifyAccountRoute);
    };

    return {isUserValidated, verifyAccountAndResume};
}

export default useVerifyAccountAndResume;
