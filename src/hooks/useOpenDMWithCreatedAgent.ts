import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef} from 'react';

import useChatWithAgent from './useChatWithAgent';
import useOnyx from './useOnyx';

type PendingCreatedAgent = {
    optimisticAccountID: number;
    // The agents that already existed before this one was created. Null until the collection has loaded and
    // includes our optimistic entry, so agents that load later aren't treated as the new one.
    knownAgentAccountIDs: Set<number> | null;
};

function getAgentAccountIDFromKey(key: string): number {
    return Number(key.slice(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT.length));
}

/**
 * Waits for the agent created by the most recent `createAgent` call to appear in Onyx, then opens its DM.
 * The client can't pick an agent's real accountID; it's set by the server, so we watch for it to arrive.
 * If creation fails, we go back instead so the error shows on the Agents list.
 *
 * Returns a function to start watching, given the optimistic accountID that `createAgent` returned.
 */
function useOpenDMWithCreatedAgent() {
    const chatWithAgent = useChatWithAgent();
    const [agentPrompts, agentPromptsMetadata] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT);
    const pendingCreatedAgentRef = useRef<PendingCreatedAgent | null>(null);

    useEffect(() => {
        const pendingCreatedAgent = pendingCreatedAgentRef.current;
        if (!pendingCreatedAgent) {
            return;
        }

        // Wait for the collection to finish loading, or an existing agent could be matched as the new one.
        if (agentPromptsMetadata.status !== 'loaded') {
            return;
        }

        const optimisticAgentKey = `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${pendingCreatedAgent.optimisticAccountID}`;

        // Record which agents already exist, using the first loaded snapshot that includes our optimistic entry.
        // Doing it here instead of when watching starts means agents that load later aren't treated as the new one.
        if (!pendingCreatedAgent.knownAgentAccountIDs) {
            if (!agentPrompts?.[optimisticAgentKey]) {
                return;
            }
            pendingCreatedAgent.knownAgentAccountIDs = new Set(Object.keys(agentPrompts).map(getAgentAccountIDFromKey));
            return;
        }
        const {knownAgentAccountIDs} = pendingCreatedAgent;

        // Creation failed: the optimistic entry now has an error. Go back so the error shows on the Agents list.
        if (agentPrompts?.[optimisticAgentKey]?.errors) {
            pendingCreatedAgentRef.current = null;
            Navigation.goBack();
            return;
        }

        const createdAgentKey = Object.keys(agentPrompts ?? {}).find((key) => {
            const accountID = getAgentAccountIDFromKey(key);

            // Skip agents that already existed and this request's own optimistic entry.
            if (accountID === pendingCreatedAgent.optimisticAccountID || knownAgentAccountIDs.has(accountID)) {
                return false;
            }

            // The created agent is the one from the server, which has no ADD pending action. Another agent the
            // user just created still has one.
            return agentPrompts?.[key]?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;
        });
        if (!createdAgentKey) {
            return;
        }

        pendingCreatedAgentRef.current = null;
        chatWithAgent(getAgentAccountIDFromKey(createdAgentKey), {shouldDismissModal: true});
    }, [agentPrompts, agentPromptsMetadata.status, chatWithAgent]);

    return (optimisticAccountID: number) => {
        pendingCreatedAgentRef.current = {optimisticAccountID, knownAgentAccountIDs: null};
    };
}

export default useOpenDMWithCreatedAgent;
