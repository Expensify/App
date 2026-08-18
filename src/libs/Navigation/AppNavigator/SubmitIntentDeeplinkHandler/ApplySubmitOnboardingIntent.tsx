import useAutoCreateSubmitWorkspace from '@hooks/useAutoCreateSubmitWorkspace';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';

import {setSubmitMigrationModalShown} from '@userActions/User';
import {setOnboardingPurposeSelected} from '@userActions/Welcome';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';
import {isSupportalSessionSelector} from '@selectors/Session';
import {useEffect, useRef} from 'react';

/**
 * Creates the Submit workspace requested by an `intent=submit` onboarding deeplink.
 *
 * Only rendered once the deeplink has been recognised, so the Onyx subscriptions behind
 * `useAutoCreateSubmitWorkspace` are never set up for ordinary sessions.
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

    const hasAppliedIntent = useRef(false);

    useEffect(() => {
        if (hasAppliedIntent.current || !hasLoadedApp || isOnboardingCompleted === undefined || isSupportalSession) {
            return;
        }
        hasAppliedIntent.current = true;

        setOnboardingPurposeSelected(CONST.ONBOARDING_CHOICES.EMPLOYER);

        // The deeplink delivers the same outcome as the Submit plan welcome modal, so record the modal as seen to
        // stop it from opening on top of the workspace we're about to create.
        setSubmitMigrationModalShown();

        // Users who already finished onboarding must not run guided setup again. When they already own a Submit
        // workspace, useAutoCreateSubmitWorkspace skips creation and navigates to that workspace instead, which is
        // what makes repeat clicks of the link idempotent.
        autoCreateSubmitWorkspace(firstName ?? '', lastName ?? '', !isOnboardingCompleted);
    }, [autoCreateSubmitWorkspace, firstName, hasLoadedApp, isOnboardingCompleted, isSupportalSession, lastName]);

    return null;
}

export default ApplySubmitOnboardingIntent;
