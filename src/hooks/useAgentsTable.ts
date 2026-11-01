import {ModalActions} from '@components/Modal/Global/ModalContext';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import type {TableHandle} from '@components/Table';
import type {AgentRowData, AgentsTableColumnKey} from '@components/Tables/AgentsTable';

import {clearAgentDeleteError, clearAgentError, clearAgentUpdateError, deleteAgent} from '@libs/actions/Agent';
import {getRuleBotEnforcedPolicy} from '@libs/AgentRulesUtils';
import {getAgentErrors} from '@libs/AgentUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import {domainNameSelector} from '@src/selectors/Domain';
import {groupByPolicyAccountIDPoliciesSelector} from '@src/selectors/Policy';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

import {Str} from 'expensify-common';
import {useEffect, useRef, useState} from 'react';

import useChatWithAgent from './useChatWithAgent';
import useCleanupSelectedOptions from './useCleanupSelectedOptions';
import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePrevious from './usePrevious';
import useRuleBotGuardModal from './useRuleBotGuardModal';
import useSearchBackPress from './useSearchBackPress';
import useSwitchToDelegator from './useSwitchToDelegator';

function handleErrorClose(pendingAction: PendingAction | null | undefined, accountID: number): void {
    if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        clearAgentError(accountID);
    } else if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
        clearAgentDeleteError(accountID);
    } else {
        clearAgentUpdateError(accountID);
    }
}

/**
 * Hook that derives the current user's manageable agent rows from Onyx and exposes selection and bulk-delete helpers for the Agents table.
 */
function useAgentsTable() {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [allAgents] = useOnyx(ONYXKEYS.COLLECTION.AGENT);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allDomains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);
    const personalDetailsList = usePersonalDetails();
    const chatWithAgent = useChatWithAgent();
    const switchToDelegator = useSwitchToDelegator();
    const {showConfirmModal} = useConfirmModal();
    const showRuleBotGuardModal = useRuleBotGuardModal();
    const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
    const policiesByAccountID = groupByPolicyAccountIDPoliciesSelector(allPolicies);

    const agents: AgentRowData[] = Object.entries(allAgents ?? {}).flatMap(([key, agent]) => {
        if (!agent) {
            return [];
        }
        const accountID = Number(key.slice(ONYXKEYS.COLLECTION.AGENT.length));
        const details = personalDetailsList?.[accountID];
        if (!details) {
            return [];
        }
        const pendingAction = agent.pendingAction;
        const isPendingDeletion = pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        if (isPendingDeletion && !isOffline) {
            return [];
        }

        let ownerDisplayName: string | undefined;
        let ownerPolicyID: string | undefined;
        if (agent.ownerType === CONST.AGENTS.OWNER_TYPE.PERSON) {
            const ownerDetails = agent.ownerAccountID ? personalDetailsList?.[agent.ownerAccountID] : undefined;
            ownerDisplayName = ownerDetails?.displayName ?? ownerDetails?.login;
        } else if (agent.ownerType === CONST.AGENTS.OWNER_TYPE.WORKSPACE) {
            const policy = agent.ownerAccountID ? policiesByAccountID.get(agent.ownerAccountID) : undefined;
            ownerDisplayName = policy?.name;
            ownerPolicyID = policy?.id;
        } else if (agent.ownerType === CONST.AGENTS.OWNER_TYPE.DOMAIN) {
            const ownerDetails = agent.ownerAccountID ? personalDetailsList?.[agent.ownerAccountID] : undefined;
            const domain = agent.ownerAccountID ? allDomains?.[`${ONYXKEYS.COLLECTION.DOMAIN}${agent.ownerAccountID}`] : undefined;
            ownerDisplayName = domainNameSelector(domain) ?? (ownerDetails?.login ? Str.extractEmailDomain(ownerDetails.login) : undefined);
        }

        const agentErrors = getAgentErrors(agent);

        return [
            {
                keyForList: String(accountID),
                accountID,
                displayName: details.displayName ?? details.login ?? '',
                login: details.login ?? '',
                ownerAccountID: agent.ownerAccountID,
                ownerDisplayName,
                ownerType: agent.ownerType,
                ownerPolicyID,
                pendingAction,
                errors: Object.keys(agentErrors ?? {}).length > 0 ? agentErrors : undefined,
                disabled: isPendingDeletion,
                canManage: true,
                action: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.AGENT_EDIT.getRoute(accountID))),
                onChatPress: () => chatWithAgent(accountID),
                // The agent can't use its own Agents page, so copiloting from here starts over from Home
                onCopilotPress: () => switchToDelegator(details.login ?? '', ROUTES.HOME),
                dismissError: () => handleErrorClose(pendingAction, accountID),
            },
        ];
    });

    const tableRef = useRef<TableHandle<AgentRowData, AgentsTableColumnKey, string>>(null);
    const agentKeys = agents.map((agent) => agent.keyForList);
    const prevAgentKeys = usePrevious(agentKeys);

    // Highlight (and scroll to) a newly created agent's row once it appears in the table, mirroring
    // the same pattern used for newly-invited workspace members (see WorkspaceMembersPage). Not
    // gated on useIsFocused: on wide layouts this page is the central pane of a split navigator and
    // stays visible (but unfocused per react-navigation) while the new agent's DM opens in the RHP.
    useEffect(() => {
        const newAgentKeys = agentKeys.filter((key) => !prevAgentKeys.includes(key));
        if (!newAgentKeys.length) {
            return;
        }

        const tableAgents = tableRef.current?.getProcessedData() ?? [];
        const newAgentIndex = tableAgents.findIndex((agent) => newAgentKeys.includes(agent.keyForList));
        if (newAgentIndex !== -1) {
            tableRef.current?.scrollToIndex({
                index: newAgentIndex,
                animated: false,
                viewPosition: 0.5,
            });
        }
        tableRef.current?.highlightItems(newAgentKeys);
    }, [agentKeys, prevAgentKeys]);

    const agentsByAccountID = new Map(agents.map((agent) => [agent.keyForList, agent]));
    const selectedAgentKeys = selectedAgents.filter((accountIDString) => {
        const agent = agentsByAccountID.get(accountIDString);
        return !!agent && agent.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    });

    const clearSelectedAgents = () => setSelectedAgents((prevSelectedAgents) => (prevSelectedAgents.length > 0 ? [] : prevSelectedAgents));
    useCleanupSelectedOptions(clearSelectedAgents);
    useSearchBackPress({
        onClearSelection: clearSelectedAgents,
        onNavigationCallBack: () => Navigation.goBack(),
    });

    const removeSelectedAgents = () => {
        for (const accountIDString of selectedAgentKeys) {
            const accountID = Number(accountIDString);
            const agentLogin = personalDetailsList?.[accountID]?.login;
            deleteAgent(accountID, agentLogin, allPolicies, false);
        }
        clearSelectedAgents();
    };

    const askForConfirmationToDelete = async () => {
        const ruleBotEnforcedPolicy = selectedAgentKeys.map((accountIDString) => getRuleBotEnforcedPolicy(Number(accountIDString), allPolicies)).find(Boolean);
        if (ruleBotEnforcedPolicy) {
            showRuleBotGuardModal('deleteAgent', ruleBotEnforcedPolicy.id);
            return;
        }
        const result = await showConfirmModal({
            title: translate('agentsPage.deleteAgentsTitle', {count: selectedAgentKeys.length}),
            prompt: translate('agentsPage.deleteAgentsMessage', {count: selectedAgentKeys.length}),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
            shouldHandleNavigationBack: false,
        });

        if (result.action !== ModalActions.CONFIRM) {
            return;
        }

        removeSelectedAgents();
    };

    return {agents, selectedAgentKeys, setSelectedAgents, clearSelectedAgents, askForConfirmationToDelete, tableRef};
}

export default useAgentsTable;
