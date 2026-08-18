import useAutoCreateSubmitWorkspace from '@hooks/useAutoCreateSubmitWorkspace';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';

import {setSubmitMigrationModalShown} from '@userActions/User';

import ONYXKEYS from '@src/ONYXKEYS';

import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';
import {isSupportalSessionSelector} from '@selectors/Session';
import {useEffect, useRef} from 'react';

/**
 * Creates the Submit workspace requested by an `intent=submit` onboarding deeplink.
 *
 * The link is only sent to existing users, so it acts solely on recipients who have already been through guided
 * setup: for them the workspace is created outright and they land wherever the "Submit to my employer" flow normally
 * leaves them. Anyone who still has onboarding ahead of them is left to it untouched, since that flow already offers
 * the Submit outcome.
 *
 * Only rendered once the deeplink has been recognized, so the Onyx subscriptions behind `useAutoCreateSubmitWorkspace`
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

    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current || !hasLoadedApp || isOnboardingCompleted === undefined || isSupportalSession) {
            return;
        }
        hasRun.current = true;

        // Recipients who never finished guided setup are left to the normal onboarding flow, which already offers
        // the Submit outcome.
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
