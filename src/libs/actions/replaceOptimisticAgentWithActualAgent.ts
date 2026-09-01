import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import Onyx from 'react-native-onyx';

/**
 * replaceOptimisticAgentWithActualAgent
 *
 * When a user creates an agent, we optimistically write its personal detail and agent prompt under a
 * client-generated accountID so the Agents UI works immediately (offline-first UX). The real accountID can only
 * be assigned by the server (the agent's login is derived from it), so CreateAgent's success response echoes a
 * {optimisticAccountID: realAccountID} entry onto OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING.
 *
 * This module mirrors replaceOptimisticReportWithActualReport: it listens to that mapping key, and for each
 * entry it
 * 1. Redirects the user to the real accountID if they are currently viewing the optimistic agent's settings
 *    screen, so the open page survives reconciliation instead of falling through to its not-found view.
 * 2. Clears the optimistic personal detail and agent prompt. This cleanup lives here rather than in
 *    createAgent()'s successData so it is guaranteed to run after the redirect.
 * 3. Clears the consumed mapping entry, so the mapping never accumulates stale entries.
 */

const AGENT_SETTINGS_SCREENS = new Set<string>([SCREENS.SETTINGS.AGENTS.EDIT, SCREENS.SETTINGS.AGENTS.EDIT_NAME, SCREENS.SETTINGS.AGENTS.EDIT_PROMPT, SCREENS.SETTINGS.AGENTS.EDIT_AVATAR]);

function replaceOptimisticAgentWithActualAgent(optimisticAccountID: number, realAccountID: number) {
    TransitionTracker.runAfterTransitions({
        callback: () => {
            // Matched via screen name + accountID param rather than a path substring, so an unrelated route that
            // happens to contain the same digits can't trigger a bogus redirect.
            const currentRoute = navigationRef.isReady() ? navigationRef.getCurrentRoute() : undefined;
            const params = currentRoute?.params;
            const isViewingOptimisticAgent =
                !!currentRoute?.name &&
                AGENT_SETTINGS_SCREENS.has(currentRoute.name) &&
                !!params &&
                typeof params === 'object' &&
                'accountID' in params &&
                Number(params.accountID) === optimisticAccountID;

            // Redirect before clearing the optimistic data so the open screen is never left pointing at keys
            // that no longer exist (which would flash its not-found view).
            if (isViewingOptimisticAgent) {
                Navigation.setParams({accountID: realAccountID});
            }

            Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[optimisticAccountID]: null});
            Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`, null);
            Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountID]: null});
        },
    });
}

// The mapping is observed only to run the replacement; no UI subscribes to it, so connectWithoutView() is used.
// The callback also fires with the persisted value on app start, which consumes any entry that arrived while the
// module wasn't loaded yet (e.g. the app was killed between the server response and the cleanup).
Onyx.connectWithoutView({
    key: ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING,
    callback: (mapping) => {
        if (!mapping) {
            return;
        }

        for (const [optimisticAccountID, realAccountID] of Object.entries(mapping)) {
            replaceOptimisticAgentWithActualAgent(Number(optimisticAccountID), realAccountID);
        }
    },
});

export {replaceOptimisticAgentWithActualAgent};

export default {};
