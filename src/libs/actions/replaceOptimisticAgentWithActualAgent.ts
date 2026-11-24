import {isValidAgentAccountID, registerAgentAccountIDMapping, setHeldAgentRecords} from '@libs/AgentAccountIDMapping';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {getPersonalDetail, personalDetailsHydrationPromise, subscribeToPersonalDetails} from '@libs/PersonalDetailsStore';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Agent, Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/Report';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import type {NavigationState, PartialState} from '@react-navigation/native';
import type {OnyxCollection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * A new agent is stored under a client-generated optimistic accountID, because only the server can assign the real
 * one (the agent's login is based on it). CreateAgent's success response maps the optimistic accountID to the real
 * one on OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING.
 *
 * Like replaceOptimisticReportWithActualReport, this module listens to that mapping. For each entry it redirects
 * any open agent settings screen to the real accountID, remaps the agent DM participants and removes the temporary
 * agent record. The mapping stays in Onyx so other tabs and screens opened later can still resolve the optimistic ID.
 * CreateAgent's success data already removes the temporary personal detail, normally in the response's own write, so
 * this module never writes the personal details list. Each tab does its part only once it holds the real agent, and
 * only redirects its screens once nothing temporary is left (see clearOptimisticAgentsWhenSafe).
 *
 * Nothing is migrated onto the real keys: the mapping is only flushed to Onyx after the queue has drained, so any
 * pending state still on the optimistic keys is stale by then. The ReplaceOptimisticAgentAccountID middleware
 * rewrites the queued requests themselves.
 */

const AGENT_SETTINGS_SCREENS = new Set<string>([
    SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT,
    SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT_NAME,
    SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT_PROMPT,
    SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT_AVATAR,
]);

// Retained mappings are delivered again when another agent is created. Schedule each replacement only once per tab.
const processedAccountIDs = new Map<number, number>();
const pendingAccountIDs = new Map<number, number>();
let isReplacementScheduled = false;

// Mappings whose redirect and cleanup this tab could not do yet. The mapping is not delivered again when the real agent
// arrives, so they are retried when personal details or agents change, until this tab holds the real agent or the
// temporary agent record is gone. A mapping without a temporary agent record is never kept, so retained mappings cost
// nothing on app start.
const skippedAccountIDs = new Map<number, number>();
let unsubscribeFromPersonalDetails: (() => void) | undefined;

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

// Cleanup runs outside React. Read the hydrated records so retained mappings don't cause redundant writes
// on every reload. Absence of these records does not imply that report participants have been repaired.
let agents: OnyxCollection<Agent>;
const agentsHydrationPromise = new Promise<void>((resolve) => {
    Onyx.connectWithoutView({
        key: ONYXKEYS.COLLECTION.AGENT,
        callback: (value) => {
            agents = value;
            setHeldAgentRecords(value);
            resolve();
            // The real agent's record can reach this tab after its personal details.
            retrySkippedAccountIDs();
        },
    });
});

// The whole navigation state is walked because an agent screen buried under another one would otherwise keep the
// dead ID and 404 on back navigation. Matching on screen name + accountID param avoids redirecting unrelated routes
// that contain the same digits.
function redirectAgentSettingsScreens(accountIDs: Map<number, number>) {
    const statesToVisit: Array<NavigationState | PartialState<NavigationState>> = [navigationRef.getRootState()];
    while (statesToVisit.length > 0) {
        const state = statesToVisit.pop();
        for (const route of state?.routes ?? []) {
            const realAccountID = AGENT_SETTINGS_SCREENS.has(route.name) && route.params && 'accountID' in route.params ? accountIDs.get(Number(route.params.accountID)) : undefined;
            // Unfocused routes (e.g. beneath a modal) only receive SET_PARAMS when their navigator's state key is the target.
            if (realAccountID && route.key) {
                Navigation.setParams({accountID: String(realAccountID)}, route.key, state?.key);
            }
            if (route.state) {
                statesToVisit.push(route.state);
            }
        }
    }
}

// CreateAgent's response already swaps the DM participants, so this only repairs reports still keyed by the
// optimistic accountID. A server-provided real participant is never overwritten.
function remapReportParticipants(accountIDs: Map<number, number>) {
    // Scan reports once for the whole batch, including persisted mappings on startup. Looking up each participant
    // avoids a full report scan per historical agent while still repairing report-only interrupted replacements.
    for (const report of Object.values(allReports ?? {})) {
        const participants: Record<number, Participant | null> = {};
        for (const [participantID, participant] of Object.entries(report?.participants ?? {})) {
            const realAccountID = accountIDs.get(Number(participantID));
            if (!realAccountID || !participant) {
                continue;
            }
            participants[realAccountID] = report?.participants?.[realAccountID] ?? participants[realAccountID] ?? participant;
            participants[Number(participantID)] = null;
        }
        if (!report || Object.keys(participants).length === 0) {
            continue;
        }
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {participants});
    }
}

function clearOptimisticAgentData(accountIDs: Map<number, number>) {
    const updates: AnyOnyxUpdate[] = [];
    for (const optimisticAccountID of accountIDs.keys()) {
        const agentKey = `${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}` as const;
        if (agents?.[agentKey]) {
            updates.push({onyxMethod: Onyx.METHOD.SET, key: agentKey, value: null});
        }
    }
    if (updates.length > 0) {
        Onyx.update(updates);
    }
    // Keep the optimistic-to-real mappings: another tab or an old temporary URL may still need them.
}

// Another tab's writes reach this tab key by key, so the mapping can arrive before the real agent's record and details.
// The real agent's screens need both, so a tab redirects its screens and removes the temporary agent record only once it
// holds both, or once nothing temporary is left to show; until then its screens keep showing the temporary agent. Only
// the server's details count, because deleteAgent writes placeholder details without a login.
function holdsRealAgent(realAccountID: number): boolean {
    return !!getPersonalDetail(realAccountID)?.login && !!agents?.[`${ONYXKEYS.COLLECTION.AGENT}${realAccountID}`];
}

function hasTemporaryAgentRecord(optimisticAccountID: number): boolean {
    return !!agents?.[`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`];
}

function clearOptimisticAgentsWhenSafe(accountIDs: Map<number, number>) {
    const accountIDsToRedirect = new Map<number, number>();
    const accountIDsToClear = new Map<number, number>();
    for (const [optimisticAccountID, realAccountID] of accountIDs) {
        skippedAccountIDs.delete(optimisticAccountID);
        const hasTemporaryAgent = hasTemporaryAgentRecord(optimisticAccountID);
        if (holdsRealAgent(realAccountID)) {
            accountIDsToRedirect.set(optimisticAccountID, realAccountID);
            accountIDsToClear.set(optimisticAccountID, realAccountID);
        } else if (hasTemporaryAgent) {
            skippedAccountIDs.set(optimisticAccountID, realAccountID);
        } else if (!getPersonalDetail(optimisticAccountID)) {
            // Nothing temporary is left to show, so the real ID is the only one a screen can use.
            accountIDsToRedirect.set(optimisticAccountID, realAccountID);
        }
    }

    // Repair buried routes too; the hook only repairs a screen once it mounts.
    if (accountIDsToRedirect.size > 0 && navigationRef.isReady()) {
        redirectAgentSettingsScreens(accountIDsToRedirect);
    }

    if (skippedAccountIDs.size === 0) {
        unsubscribeFromPersonalDetails?.();
        unsubscribeFromPersonalDetails = undefined;
    } else if (!unsubscribeFromPersonalDetails) {
        unsubscribeFromPersonalDetails = subscribeToPersonalDetails(retrySkippedAccountIDs);
    }

    // The retry runs on every personal details or agent change, so it must not scan the reports when there is nothing to
    // clear.
    if (accountIDsToClear.size === 0) {
        return;
    }
    remapReportParticipants(accountIDsToClear);
    clearOptimisticAgentData(accountIDsToClear);
}

function retrySkippedAccountIDs() {
    if (skippedAccountIDs.size === 0) {
        return;
    }
    clearOptimisticAgentsWhenSafe(new Map(skippedAccountIDs));
}

function replaceOptimisticAgentWithActualAgent(optimisticAccountID: number, realAccountID: number) {
    // An identity mapping would clear the real agent's data below, and a malformed realAccountID would redirect
    // screens to a bogus key, so such entries are only dropped from the mapping.
    if (!isValidAgentAccountID(optimisticAccountID) || !isValidAgentAccountID(realAccountID) || optimisticAccountID === realAccountID) {
        Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountID]: null});
        return;
    }

    // Recorded before the waits below so resolveAgentAccountID() already covers actions fired while the cleanup is
    // pending. This is the only path that runs for a persisted mapping loaded on app start.
    registerAgentAccountIDMapping(optimisticAccountID, realAccountID);

    if (processedAccountIDs.get(optimisticAccountID) === realAccountID) {
        return;
    }
    processedAccountIDs.set(optimisticAccountID, realAccountID);

    pendingAccountIDs.set(optimisticAccountID, realAccountID);
    if (isReplacementScheduled) {
        return;
    }
    isReplacementScheduled = true;

    // Wait for hydration before deciding which cleanup is still needed. Batch retained mappings so startup
    // walks the report collection and navigation tree once, rather than once per agent created in the past.
    Promise.all([reportsHydrationPromise, personalDetailsHydrationPromise, agentsHydrationPromise, Navigation.isNavigationReady()]).then(() => {
        TransitionTracker.runAfterTransitions({
            callback: () => {
                const accountIDs = new Map(pendingAccountIDs);
                pendingAccountIDs.clear();
                isReplacementScheduled = false;

                clearOptimisticAgentsWhenSafe(accountIDs);
            },
        });
    });
}

// This callback performs navigation and cleanup independently of UI subscribers. The persisted value also
// restores action ID resolution and repairs any optimistic routes on app start.
Onyx.connectWithoutView({
    key: ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING,
    callback: (mapping) => {
        if (!mapping) {
            return;
        }

        for (const [optimisticAccountID, mappedAccountID] of Object.entries(mapping)) {
            // Removed invalid entries are skipped. Clearing them again would just fire this callback once more.
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
