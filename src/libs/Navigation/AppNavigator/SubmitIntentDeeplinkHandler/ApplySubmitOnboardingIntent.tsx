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

    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current || !hasLoadedApp || isOnboardingCompleted === undefined || isSupportalSession) {
            return;
        }
        hasRun.current = true;

        if (!isOnboardingCompleted) {
            return;
        }

        // The deeplink delivers the same outcome as the Submit plan welcome modal, so keep that modal from opening too.
        setSubmitMigrationModalShown();

        // `false` skips CompleteGuidedSetup, which is already done. The hook navigates to the user's existing Submit
        // workspace rather than creating a second one, which is what makes repeat clicks idempotent.
        autoCreateSubmitWorkspace(firstName ?? '', lastName ?? '', false);
    }, [autoCreateSubmitWorkspace, firstName, hasLoadedApp, isOnboardingCompleted, isSupportalSession, lastName]);

    return null;
}

export default ApplySubmitOnboardingIntent;
