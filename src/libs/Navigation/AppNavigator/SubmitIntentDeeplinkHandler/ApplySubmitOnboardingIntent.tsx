import useAutoCreateSubmitWorkspace from '@hooks/useAutoCreateSubmitWorkspace';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';

import {setSubmitMigrationModalShown} from '@userActions/User';
import {setOnboardingDeeplinkIntent} from '@userActions/Welcome';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';
import {isSupportalSessionSelector} from '@selectors/Session';
import {useEffect, useRef} from 'react';

/**
 * Acts on an `intent=submit` onboarding deeplink.
 *
 * Recording the intent is what drives users who still have onboarding ahead of them: the onboarding flow reads it and
 * routes them down the EMPLOYER path, which creates the Submit workspace at the end. Users who already finished
 * onboarding never enter that flow, so for them the workspace is created here instead.
 *
 * Only rendered once the deeplink has been recognised, so the Onyx subscriptions behind `useAutoCreateSubmitWorkspace`
 * are never set up for ordinary sessions.
 */
function ApplySubmitOnboardingIntent() {
    const {firstName, lastName} = useCurrentUserPersonalDetails();
    const autoCreateSubmitWorkspace = useAutoCreateSubmitWorkspace();

    // HAS_LOADED_APP only flips true once this session's account data has landed, so waiting on it keeps the
    // eligibility checks inside useAutoCreateSubmitWorkspace (existing workspaces, restricted policy creation)
    // from running against a half-populated store and creating a duplicate workspace.
    const [hasLoadedApp] = useOnyx(ONYXKEYS.HAS_LOADED_APP);
    const [isOnboardingCompleted] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasCompletedGuidedSetupFlowSelector});
    const [isSupportalSession] = useOnyx(ONYXKEYS.SESSION, {selector: isSupportalSessionSelector});

    const hasDecided = useRef(false);

    useEffect(() => {
        if (isSupportalSession) {
            return;
        }
        setOnboardingDeeplinkIntent(CONST.ONBOARDING_INTENTS.SUBMIT);
    }, [isSupportalSession]);

    useEffect(() => {
        if (hasDecided.current || !hasLoadedApp || isOnboardingCompleted === undefined || isSupportalSession) {
            return;
        }
        // Decided once and for all on this first complete read. Without that, finishing guided setup would flip
        // isOnboardingCompleted and re-enter this branch on top of the workspace the flow just created.
        hasDecided.current = true;

        // Users who still have onboarding ahead of them get their Submit workspace from the flow itself, which reads
        // the intent recorded above. Only users who will never enter that flow need it created here.
        if (!isOnboardingCompleted) {
            return;
        }

        // The deeplink delivers the same outcome as the Submit plan welcome modal, so record the modal as seen to
        // stop it from opening on top of the workspace we're about to create.
        setSubmitMigrationModalShown();

        // Guided setup is already done, so it must not run again. When the user already owns a Submit workspace,
        // useAutoCreateSubmitWorkspace skips creation and navigates to that workspace instead, which is what makes
        // repeat clicks of the link idempotent.
        autoCreateSubmitWorkspace(firstName ?? '', lastName ?? '', false);
    }, [autoCreateSubmitWorkspace, firstName, hasLoadedApp, isOnboardingCompleted, isSupportalSession, lastName]);

    return null;
}

export default ApplySubmitOnboardingIntent;
