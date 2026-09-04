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
 * replaceOptimisticAgentWithActualAgent
 *
 * A new agent is written optimistically under a client-generated accountID so the Agents UI works offline, but
 * only the server can assign the real accountID (the agent's login is derived from it). CreateAgent's success
 * response therefore echoes a {optimisticAccountID: realAccountID} entry onto OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING.
 *
 * Requests queued against the optimistic agent are rewritten to the real accountID by the
 * ReplaceOptimisticAgentAccountID middleware as soon as that response arrives, i.e. before the sequential queue
 * processes them, so their success/failure data lands on the real keys directly. Write responses are only flushed
 * to Onyx once the queue has drained, so by the time the mapping is observable here every such request has already
 * completed and any pending marker still sitting on the optimistic keys is stale. Copying it onto the real keys
 * would chain after the queued success data and leave the real agent permanently pending, or resurrect an agent
 * that was deleted in the meantime, which is why nothing is migrated.
 *
 * Mirroring replaceOptimisticReportWithActualReport, this module listens to that mapping and, for each entry,
 * redirects any open agent settings screen to the real accountID, remaps the owner/agent DM participants, clears
 * the optimistic data and finally clears the consumed entry. The cleanup lives here rather than in createAgent()'s
 * successData so it is guaranteed to run after the redirect.
 *
 * AgentAccountIDMapping's resolveAgentAccountID() is a safety net for callers that captured an optimistic
 * accountID before the redirect.
 */

const AGENT_SETTINGS_SCREENS = new Set<string>([SCREENS.SETTINGS.AGENTS.EDIT, SCREENS.SETTINGS.AGENTS.EDIT_NAME, SCREENS.SETTINGS.AGENTS.EDIT_PROMPT, SCREENS.SETTINGS.AGENTS.EDIT_AVATAR]);

// Reports are only read inside the mapping callback below; no UI subscribes here, so connectWithoutView() is used.
// On app start the mapping subscription can deliver its persisted value before this collection has been hydrated,
// and repairing DM participants against an empty collection would silently skip them, so consumers wait for this
// promise. Onyx always fires the callback at least once (with undefined when nothing is stored), so it cannot hang.
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

// The whole navigation state is walked because an agent screen buried under another (e.g. EDIT beneath EDIT_NAME)
// would otherwise keep the dead ID and 404 on back navigation. Matching on screen name + accountID param avoids
// bogus redirects of unrelated routes that happen to contain the same digits.
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

// CreateAgent's response data already swaps the DM participants, so this only repairs reports still keyed by the
// optimistic accountID (e.g. when that response data was lost). A server-provided real participant is never clobbered.
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
    // An identity mapping would clear the real agent's data through the optimistic-key clears below, and a malformed
    // realAccountID would redirect screens to a bogus key, so such entries are only dropped from the mapping.
    if (!isValidAgentAccountID(optimisticAccountID) || !isValidAgentAccountID(realAccountID) || optimisticAccountID === realAccountID) {
        Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountID]: null});
        return;
    }

    // Recorded before the waits below so resolveAgentAccountID() already covers actions fired while the cleanup is
    // still pending. The middleware also registers the mapping when the response passes through it, but this path is
    // the only one that runs for a persisted mapping consumed on app start.
    registerAgentAccountIDMapping(optimisticAccountID, realAccountID);

    // The redirect needs a mounted navigation container and the participant repair needs the report collection, and
    // neither is guaranteed when a persisted mapping is consumed during app start. The optimistic data is cleared in
    // the same callback so an open agent screen can never be left pointing at a deleted key.
    Promise.all([reportsHydrationPromise, Navigation.isNavigationReady()]).then(() => {
        TransitionTracker.runAfterTransitions({
            callback: () => {
                // Redirect before clearing the optimistic data so no open screen flashes its not-found view. The
                // container is only ever unmounted here after a sign-out, which wipes this data anyway.
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

// No UI subscribes to the mapping, so connectWithoutView() is used. Firing with the persisted value on app start also
// consumes any entry that arrived while the module wasn't loaded yet (e.g. the app was killed before the cleanup ran).
Onyx.connectWithoutView({
    key: ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING,
    callback: (mapping) => {
        if (!mapping) {
            return;
        }

        for (const [optimisticAccountID, mappedAccountID] of Object.entries(mapping)) {
            // Already-consumed (nullish) entries are skipped because clearing them again would only fire this callback once more.
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
