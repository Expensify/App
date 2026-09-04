import {registerAgentAccountIDMapping} from '@libs/AgentAccountIDMapping';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

import type {NavigationState, PartialState} from '@react-navigation/native';
import type {OnyxCollection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * A new agent is stored under a client-generated optimistic accountID, because only the server can assign the real
 * one (the agent's login is based on it). CreateAgent's success response maps the optimistic accountID to the real
 * one on OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING.
 *
 * Like replaceOptimisticReportWithActualReport, this module listens to that mapping. For each entry it redirects
 * any open agent settings screen to the real accountID, remaps the agent DM participants, clears the optimistic
 * data, and clears the consumed entry. The cleanup lives here instead of createAgent()'s successData so it always
 * runs after the redirect.
 *
 * Nothing is migrated onto the real keys: the mapping is only flushed to Onyx after the queue has drained, so any
 * pending state still on the optimistic keys is stale by then. The ReplaceOptimisticAgentAccountID middleware
 * rewrites the queued requests themselves.
 */

const AGENT_SETTINGS_SCREENS = new Set<string>([SCREENS.SETTINGS.AGENTS.EDIT, SCREENS.SETTINGS.AGENTS.EDIT_NAME, SCREENS.SETTINGS.AGENTS.EDIT_PROMPT, SCREENS.SETTINGS.AGENTS.EDIT_AVATAR]);

// Reports are only read inside the mapping callback, so connectWithoutView() is used. On app start the mapping can
// arrive before this collection is hydrated, so consumers wait for this promise. Onyx always fires the callback at
// least once, so it cannot hang.
let allReports: OnyxCollection<Report>;
// Definite assignment: the Promise executor runs synchronously, so this is set before anything reads it.
let resolveReportsHydration!: () => void;
const reportsHydrationPromise = new Promise<void>((resolve) => {
    resolveReportsHydration = resolve;
});
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (value) => {
        allReports = value;
        resolveReportsHydration();
    },
});

// Number.isSafeInteger() also rejects the non-numeric values a malformed persisted mapping entry could hold at runtime.
function isValidAgentAccountID(accountID: number): boolean {
    return Number.isSafeInteger(accountID) && accountID > 0;
}

// The whole navigation state is walked because an agent screen buried under another one would otherwise keep the
// dead ID and 404 on back navigation. Matching on screen name + accountID param avoids redirecting unrelated routes
// that contain the same digits.
function redirectAgentSettingsScreens(optimisticAccountID: number, realAccountID: number) {
    const statesToVisit: Array<NavigationState | PartialState<NavigationState>> = [navigationRef.getRootState()];
    while (statesToVisit.length > 0) {
        const state = statesToVisit.pop();
        for (const route of state?.routes ?? []) {
            const isOptimisticAgentRoute =
                AGENT_SETTINGS_SCREENS.has(route.name) &&
                !!route.params &&
                typeof route.params === 'object' &&
                'accountID' in route.params &&
                Number(route.params.accountID) === optimisticAccountID;
            // Unfocused routes (e.g. beneath a modal) only receive SET_PARAMS when their navigator's state key is the target.
            if (isOptimisticAgentRoute && route.key) {
                Navigation.setParams({accountID: realAccountID}, route.key, state?.key);
            }
            if (route.state) {
                statesToVisit.push(route.state);
            }
        }
    }
}

// CreateAgent's response already swaps the DM participants, so this only repairs reports still keyed by the
// optimistic accountID. A server-provided real participant is never overwritten.
function remapReportParticipants(optimisticAccountID: number, realAccountID: number) {
    for (const report of Object.values(allReports ?? {})) {
        const optimisticParticipant = report?.participants?.[optimisticAccountID];
        if (!optimisticParticipant) {
            continue;
        }
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {
            participants: {
                [realAccountID]: report.participants?.[realAccountID] ?? optimisticParticipant,
                [optimisticAccountID]: null,
            },
        });
    }
}

function replaceOptimisticAgentWithActualAgent(optimisticAccountID: number, realAccountID: number) {
    // An identity mapping would clear the real agent's data below, and a malformed realAccountID would redirect
    // screens to a bogus key, so such entries are only dropped from the mapping.
    if (!isValidAgentAccountID(optimisticAccountID) || !isValidAgentAccountID(realAccountID) || optimisticAccountID === realAccountID) {
        Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountID]: null});
        return;
    }

    // Recorded before the waits below so resolveAgentAccountID() already covers actions fired while the cleanup is
    // pending. This is the only path that runs for a persisted mapping consumed on app start.
    registerAgentAccountIDMapping(optimisticAccountID, realAccountID);

    // Neither navigation nor the report collection is guaranteed to be ready when a persisted mapping is consumed
    // on app start. The optimistic data is cleared in the same callback so an open agent screen can never be left
    // pointing at a deleted key.
    Promise.all([reportsHydrationPromise, Navigation.isNavigationReady()]).then(() => {
        TransitionTracker.runAfterTransitions({
            callback: () => {
                // Redirect before clearing the optimistic data so no open screen flashes its not-found view.
                if (navigationRef.isReady()) {
                    redirectAgentSettingsScreens(optimisticAccountID, realAccountID);
                }

                remapReportParticipants(optimisticAccountID, realAccountID);

                Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[optimisticAccountID]: null});
                Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`, null);
                Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountID]: null});
            },
        });
    });
}

// No UI subscribes to the mapping, so connectWithoutView() is used. Firing with the persisted value on app start
// also consumes any entry left over from a previous session.
Onyx.connectWithoutView({
    key: ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING,
    callback: (mapping) => {
        if (!mapping) {
            return;
        }

        for (const [optimisticAccountID, mappedAccountID] of Object.entries(mapping)) {
            // Already-consumed (nullish) entries are skipped; clearing them again would just fire this callback once more.
            const realAccountID: unknown = mappedAccountID;
            if (realAccountID === null || realAccountID === undefined) {
                continue;
            }
            replaceOptimisticAgentWithActualAgent(Number(optimisticAccountID), mappedAccountID);
        }
    },
});

export {replaceOptimisticAgentWithActualAgent};

export default {};
