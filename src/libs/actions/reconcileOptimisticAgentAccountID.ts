import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import type {OptimisticAgentAccountIDMapping} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

/**
 * reconcileOptimisticAgentAccountID
 *
 * THE PROBLEM:
 * Creating an agent writes it to Onyx under a temporary, client-generated accountID so the Agents list can show it
 * immediately (offline-first UX). If an agent screen (Edit, Edit Name, Edit Prompt, Edit Avatar - reachable from the
 * Agents list or from the agent's own Profile page) is opened before CreateAgent resolves, it mounts with that
 * optimistic accountID in its route params.
 *
 * THE SOLUTION:
 * Once the server assigns the real accountID, CreateAgent's response merges
 * {[optimisticAccountID]: realAccountID} into RAM_ONLY_OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING (the real agent data is
 * already written under the real accountID by that same response - only the route params need fixing). This module
 * is the single place that reacts to the mapping: it walks the whole navigation tree for every agent screen still
 * parameterized by the optimistic accountID - not just the focused one, since a screen can be stacked behind another
 * - and swaps in the real accountID, so those screens keep working instead of falling into "Hmm... it's not here" or
 * submitting a write against an accountID the backend no longer recognizes.
 */
Onyx.connectWithoutView({
    key: ONYXKEYS.RAM_ONLY_OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING,
    callback: (mapping: OptimisticAgentAccountIDMapping | undefined) => {
        if (!mapping) {
            return;
        }

        for (const [optimisticAccountIDKey, realAccountID] of Object.entries(mapping)) {
            const optimisticAccountID = Number(optimisticAccountIDKey);
            const routes = Navigation.getAgentAccountIDRoutes(optimisticAccountID);
            for (const route of routes) {
                Navigation.setParams({accountID: realAccountID}, route.routeKey, route.targetKey);
            }

            // The mapping only exists to bridge an already-open optimistic route; once swept, drop the entry so this
            // RAM-only map doesn't grow by one dead entry per agent created for the rest of the session.
            Onyx.merge(ONYXKEYS.RAM_ONLY_OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountIDKey]: null});
        }
    },
});

export default {};
