import useAutoCreateSubmitWorkspace from '@hooks/useAutoCreateSubmitWorkspace';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';

import {releaseWelcomeModalForSubmitDeeplink, suppressWelcomeModalForSubmitDeeplink} from '@libs/Navigation/guards/SubmitPlanWelcomeModalGuard';
import {getGroupPoliciesWhereReportCanBeCreated} from '@libs/PolicyUtils';

import {setSubmitMigrationModalShown} from '@userActions/User';

import ONYXKEYS from '@src/ONYXKEYS';

import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';
import {emailSelector, isSupportalSessionSelector} from '@selectors/Session';
import {useEffect} from 'react';

// Module scope rather than a ref so it survives a remount: the initial URL outlives sign-out, so signing into a second
// account would otherwise replay the intent and create that account a workspace it never asked for.
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
    const [currentUserEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});

    // Plain membership counts here, unlike the admin-level check inside useAutoCreateSubmitWorkspace, which would
    // hand a personal Submit workspace to someone who can already submit on their employer's.
    const [belongsToWorkspaceForReports] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies) => getGroupPoliciesWhereReportCanBeCreated(policies, currentUserEmail).length > 0,
    });

    // At mount, ahead of the work below that waits on HAS_LOADED_APP — the same signal that opens the guard's modal.
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
        if (!isOnboardingCompleted || isSupportalSession || belongsToWorkspaceForReports) {
            releaseWelcomeModalForSubmitDeeplink();
            return;
        }

        // Persists the suppression applied above, so the modal stays away in later sessions too.
        setSubmitMigrationModalShown();

        // `false` skips CompleteGuidedSetup, which is already done.
        autoCreateSubmitWorkspace(firstName ?? '', lastName ?? '', false);
    }, [autoCreateSubmitWorkspace, belongsToWorkspaceForReports, firstName, hasLoadedApp, isOnboardingCompleted, isSupportalSession, lastName]);

    return null;
}

export default ApplySubmitOnboardingIntent;
