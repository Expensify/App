import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {AgentPrompt, PersonalDetailsList, Report} from '@src/types/onyx';

import type {NavigationState, PartialState} from '@react-navigation/native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

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
 * 1. Redirects every agent settings screen anywhere in the navigation stack from the optimistic accountID to
 *    the real one, so those screens survive reconciliation instead of falling through to their not-found views.
 *    Every screen is redirected, not just the focused one, because an agent screen buried under another would
 *    otherwise keep the dead ID and 404 on back navigation.
 * 2. Remaps the participants of the DM between the owner and the agent from the optimistic accountID to the
 *    real one. CreateAgent's response data normally does this swap already, so this is a defensive no-op on the
 *    happy path. The real participant is only filled in when missing so the server's version always wins.
 * 3. Migrates the optimistic personal detail and agent prompt onto the real accountID's keys, then clears the
 *    optimistic ones. Pending edits or errors from requests queued against the optimistic agent (which the
 *    HandleUnusedOptimisticAgentAccountID middleware rewrites to the real ID) carry over this way instead of
 *    vanishing from the UI. Only the ADD pendingAction is dropped, since it denotes the CreateAgent that just
 *    succeeded. This cleanup lives here rather than in createAgent()'s successData so it is guaranteed to run
 *    after the redirect.
 * 4. Clears the consumed mapping entry, so the mapping never accumulates stale entries.
 *
 * It also exports resolveAgentAccountID(), which agent actions call as a safety net: anything that still holds
 * a consumed optimistic accountID (e.g. a screen that captured it before the redirect) gets its requests
 * rewritten to the real accountID before any optimistic data or API params are built.
 */

const AGENT_SETTINGS_SCREENS = new Set<string>([SCREENS.SETTINGS.AGENTS.EDIT, SCREENS.SETTINGS.AGENTS.EDIT_NAME, SCREENS.SETTINGS.AGENTS.EDIT_PROMPT, SCREENS.SETTINGS.AGENTS.EDIT_AVATAR]);

// In-memory (not persisted) record of consumed mappings. The Onyx mapping entry is cleared once consumed, so
// this is the only place a late caller can still translate an optimistic accountID it captured earlier in the
// session. Persisted requests don't need it because the middleware rewrites them when the mapping arrives.
const consumedOptimisticAccountIDs = new Map<number, number>();

/**
 * Returns the real accountID when the given one is an optimistic agent accountID whose mapping was already
 * consumed this session, and the input unchanged otherwise.
 */
function resolveAgentAccountID(accountID: number): number {
    return consumedOptimisticAccountIDs.get(accountID) ?? accountID;
}

let allPersonalDetails: OnyxEntry<PersonalDetailsList>;
// Personal details are cached only to migrate the optimistic agent's entry onto the real accountID. No UI subscribes here, so connectWithoutView() is used.
Onyx.connectWithoutView({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        allPersonalDetails = value;
    },
});

let allAgentPrompts: OnyxCollection<AgentPrompt>;
// Agent prompts are cached only to migrate the optimistic agent's entry onto the real accountID. No UI subscribes here, so connectWithoutView() is used.
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT,
    callback: (value) => {
        allAgentPrompts = value;
    },
});

let allReports: OnyxCollection<Report>;
// Reports are cached only to locate DMs still keyed by the optimistic accountID. No UI subscribes here, so connectWithoutView() is used.
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (value) => {
        allReports = value;
    },
});

function replaceOptimisticAgentWithActualAgent(optimisticAccountID: number, realAccountID: number) {
    // Recorded before the transition-tracker delay so resolveAgentAccountID() already covers actions fired
    // while the callback below is still pending.
    consumedOptimisticAccountIDs.set(optimisticAccountID, realAccountID);

    TransitionTracker.runAfterTransitions({
        callback: () => {
            // Redirect before clearing the optimistic data so no open screen is ever left pointing at keys
            // that no longer exist (which would flash its not-found view). The whole navigation state is
            // walked, not just the focused route: an agent settings screen buried under another (e.g. EDIT
            // beneath EDIT_NAME) must be fixed too, or going back lands on its not-found view and anything
            // submitted from it targets the dead accountID. Matched via screen name + accountID param rather
            // than a path substring, so an unrelated route that happens to contain the same digits can't
            // trigger a bogus redirect.
            if (navigationRef.isReady()) {
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
                        // The owning navigator's state key is passed as the dispatch target so routes that are
                        // not focused (e.g. beneath a modal) still receive the SET_PARAMS action.
                        if (isOptimisticAgentRoute && route.key) {
                            Navigation.setParams({accountID: realAccountID}, route.key, state?.key);
                        }
                        if (route.state) {
                            statesToVisit.push(route.state);
                        }
                    }
                }
            }

            // CreateAgent's response data already swaps the DM's participants to the real accountID, so this
            // usually finds nothing. It only repairs reports still keyed by the optimistic accountID (e.g. when
            // that response data was lost). The real participant is only filled in when missing so a
            // server-provided one is never clobbered.
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

            // Migrate the optimistic entries onto the real accountID's keys before clearing them. When nothing
            // was queued against the optimistic agent, the migrated fields equal what the server already sent,
            // so the merges are harmless no-ops. accountID and isOptimisticPersonalDetail are excluded because
            // the real entry keeps its own identity. An ADD pendingAction is excluded because it denotes the
            // CreateAgent that just succeeded, while a DELETE pendingAction or errors must survive so the
            // strikethrough/RBR from queued requests stays visible.
            const optimisticPersonalDetail = allPersonalDetails?.[optimisticAccountID];
            if (optimisticPersonalDetail) {
                const {accountID, isOptimisticPersonalDetail, ...migratedPersonalDetail} = optimisticPersonalDetail;
                if (migratedPersonalDetail.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
                    delete migratedPersonalDetail.pendingAction;
                }
                Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[realAccountID]: migratedPersonalDetail});
            }

            const optimisticAgentPrompt = allAgentPrompts?.[`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`];
            if (optimisticAgentPrompt) {
                const migratedAgentPrompt = {...optimisticAgentPrompt};
                if (migratedAgentPrompt.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
                    delete migratedAgentPrompt.pendingAction;
                }
                Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`, migratedAgentPrompt);
            }

            Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[optimisticAccountID]: null});
            Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`, null);
            Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountID]: null});
        },
    });
}

// The mapping is observed only to run the replacement. No UI subscribes to it, so connectWithoutView() is used.
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

export {replaceOptimisticAgentWithActualAgent, resolveAgentAccountID};

export default {};
