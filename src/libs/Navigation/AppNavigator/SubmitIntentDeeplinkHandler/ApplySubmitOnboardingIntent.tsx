import useAutoCreateSubmitWorkspace from '@hooks/useAutoCreateSubmitWorkspace';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';

import {suppressWelcomeModalForSubmitDeeplink} from '@libs/Navigation/guards/SubmitPlanWelcomeModalGuard';

import {setSubmitMigrationModalShown} from '@userActions/User';

import ONYXKEYS from '@src/ONYXKEYS';

import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';
import {isSupportalSessionSelector} from '@selectors/Session';
import {useEffect} from 'react';

// Module scope rather than a ref so it survives this component remounting. The deeplink is read from the initial URL,
// which the provider above the navigator keeps for the life of the process, so signing out and into another account
// remounts this component with the same intent still readable and would create a workspace for that second account.
let hasAppliedIntent = false;

/**
 * Creates the Submit workspace requested by an `intent=submit` onboarding deeplink.
 *
 * The link only goes to existing users, so it acts solely on recipients who have finished guided setup. Anyone who
 * still has onboarding ahead of them is left to it, since that flow already offers the Submit outcome.
 */
function ApplySubmitOnboardingIntent() {
    const {firstName, lastName} = useCurrentUserPersonalDetails();
    const autoCreateSubmitWorkspace = useAutoCreateSubmitWorkspace();

    // Waiting on HAS_LOADED_APP keeps the eligibility checks inside useAutoCreateSubmitWorkspace from running
    // against a half-populated store, where they would miss an existing workspace and create a duplicate.
    const [hasLoadedApp] = useOnyx(ONYXKEYS.HAS_LOADED_APP);
    const [isOnboardingCompleted] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasCompletedGuidedSetupFlowSelector});
    const [isSupportalSession] = useOnyx(ONYXKEYS.SESSION, {selector: isSupportalSessionSelector});

    // Runs at mount rather than alongside the work below, which waits on HAS_LOADED_APP — the same signal the guard
    // uses to decide whether to open its modal.
    useEffect(() => {
        suppressWelcomeModalForSubmitDeeplink();
    }, []);

    useEffect(() => {
        if (hasAppliedIntent || !hasLoadedApp || isOnboardingCompleted === undefined) {
            return;
        }
        hasAppliedIntent = true;

        // Marked applied above before these checks, since they are reasons to drop the intent rather than to wait for
        // it to become actionable. Returning without consuming would leave it live for whoever signs in next.
        if (!isOnboardingCompleted || isSupportalSession) {
            return;
        }

        // Persists the suppression applied above, so the modal stays away in later sessions too.
        setSubmitMigrationModalShown();

        // `false` skips CompleteGuidedSetup, which is already done. The hook navigates to the user's existing Submit
        // workspace rather than creating a second one, which is what makes repeat clicks idempotent.
        autoCreateSubmitWorkspace(firstName ?? '', lastName ?? '', false);
    }, [autoCreateSubmitWorkspace, firstName, hasLoadedApp, isOnboardingCompleted, isSupportalSession, lastName]);

    return null;
}

export default ApplySubmitOnboardingIntent;
