import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {AgentPrompt, PersonalDetails, PersonalDetailsList, Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {NavigationState, PartialState} from '@react-navigation/native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * replaceOptimisticAgentWithActualAgent
 *
 * A new agent is written optimistically under a client-generated accountID so the Agents UI works offline, but
 * only the server can assign the real accountID (the agent's login is derived from it). CreateAgent's success
 * response therefore echoes a {optimisticAccountID: realAccountID} entry onto OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING.
 *
 * Mirroring replaceOptimisticReportWithActualReport, this module listens to that mapping and, for each entry,
 * redirects any open agent settings screen to the real accountID, remaps the owner/agent DM participants, carries
 * pending/error state from the optimistic personal detail and prompt onto the real keys, clears the optimistic
 * data and finally clears the consumed entry. The cleanup lives here rather than in createAgent()'s successData so
 * it is guaranteed to run after the redirect.
 *
 * resolveAgentAccountID() is a safety net for callers that captured an optimistic accountID before the redirect.
 */

const AGENT_SETTINGS_SCREENS = new Set<string>([SCREENS.SETTINGS.AGENTS.EDIT, SCREENS.SETTINGS.AGENTS.EDIT_NAME, SCREENS.SETTINGS.AGENTS.EDIT_PROMPT, SCREENS.SETTINGS.AGENTS.EDIT_AVATAR]);

// Kept in memory because the Onyx mapping entry is cleared once consumed, so this is the only way a late caller
// can still translate an optimistic accountID it captured earlier in the session.
const consumedOptimisticAccountIDs = new Map<number, number>();

function resolveAgentAccountID(accountID: number): number {
    return consumedOptimisticAccountIDs.get(accountID) ?? accountID;
}

// These values are only consumed inside the mapping callback below; no UI subscribes here, so connectWithoutView() is used.
let allPersonalDetails: OnyxEntry<PersonalDetailsList>;
Onyx.connectWithoutView({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        allPersonalDetails = value;
    },
});

let allAgentPrompts: OnyxCollection<AgentPrompt>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT,
    callback: (value) => {
        allAgentPrompts = value;
    },
});

let allReports: OnyxCollection<Report>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (value) => {
        allReports = value;
    },
});

// Number.isSafeInteger() also rejects the non-numeric values a malformed persisted mapping entry could hold at runtime.
function isValidAgentAccountID(accountID: number): boolean {
    return Number.isSafeInteger(accountID) && accountID > 0;
}

function replaceOptimisticAgentWithActualAgent(optimisticAccountID: number, realAccountID: number) {
    // An identity mapping would migrate the real agent's data onto itself and then delete it through the
    // optimistic-key clears below, and a malformed realAccountID would file it under a bogus key, so such entries
    // are only dropped from the mapping.
    if (!isValidAgentAccountID(optimisticAccountID) || !isValidAgentAccountID(realAccountID) || optimisticAccountID === realAccountID) {
        Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountID]: null});
        return;
    }

    // Recorded before the transition-tracker delay so resolveAgentAccountID() already covers actions fired
    // while the callback below is still pending.
    consumedOptimisticAccountIDs.set(optimisticAccountID, realAccountID);

    TransitionTracker.runAfterTransitions({
        callback: () => {
            // Redirect before clearing the optimistic data so no open screen flashes its not-found view. The whole
            // navigation state is walked because an agent screen buried under another (e.g. EDIT beneath EDIT_NAME)
            // would otherwise keep the dead ID and 404 on back navigation. Matching on screen name + accountID param
            // avoids bogus redirects of unrelated routes that happen to contain the same digits.
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

            // CreateAgent's response data already swaps the DM participants, so this only repairs reports still keyed
            // by the optimistic accountID (e.g. when that response data was lost). A server-provided real participant
            // is never clobbered.
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

            // Carry pending/error state onto the real keys before clearing the optimistic ones so the strikethrough/RBR
            // of requests queued against the optimistic agent stays visible. Base fields are the server's: a fresh
            // agent's optimistic avatar is a local file URI and a rename may already have written the real key, so an
            // optimistic base field is only copied when a pending marker shows a queued edit staged it. ADD is dropped
            // since it denotes the CreateAgent that just succeeded.
            const optimisticPersonalDetail = allPersonalDetails?.[optimisticAccountID];
            if (optimisticPersonalDetail) {
                const {avatar, avatarThumbnail, pendingAction, pendingFields, errorFields} = optimisticPersonalDetail;
                // updateAgentAvatar() marks a staged avatar with pendingFields.avatar.
                const hasPendingAvatar = !!pendingFields?.avatar;
                const migratedPersonalDetail: Partial<PersonalDetails> = {
                    ...(pendingAction && pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD ? {pendingAction} : {}),
                    ...(pendingFields ? {pendingFields} : {}),
                    ...(errorFields ? {errorFields} : {}),
                    ...(hasPendingAvatar ? {avatar, avatarThumbnail} : {}),
                };
                if (!isEmptyObject(migratedPersonalDetail)) {
                    Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[realAccountID]: migratedPersonalDetail});
                }
            }

            const optimisticAgentPrompt = allAgentPrompts?.[`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`];
            if (optimisticAgentPrompt) {
                const {prompt, pendingAction, ...optimisticPromptState} = optimisticAgentPrompt;
                // Agent update actions mark the prompt with an UPDATE/DELETE pendingAction, and updateAgentPrompt() stages the new text alongside it.
                const hasPendingEdit = !!pendingAction && pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;
                const migratedAgentPrompt: Partial<AgentPrompt> = {
                    ...optimisticPromptState,
                    ...(hasPendingEdit ? {prompt, pendingAction} : {}),
                };
                if (!isEmptyObject(migratedAgentPrompt)) {
                    Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`, migratedAgentPrompt);
                }
            }

            Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[optimisticAccountID]: null});
            Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`, null);
            Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountID]: null});
        },
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

export {replaceOptimisticAgentWithActualAgent, resolveAgentAccountID};

export default {};
