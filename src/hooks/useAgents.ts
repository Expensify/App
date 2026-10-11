import {ModalActions} from '@components/Modal/Global/ModalContext';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {TableHandle} from '@components/Table';
import {AgentRowData, AgentsTableColumnKey} from '@components/Tables/AgentsTable';

import {clearAgentDeleteError, clearAgentError, clearAgentUpdateError, deleteAgent, openAgentsPage} from '@libs/actions/Agent';
import {getRuleBotEnforcedPolicy} from '@libs/AgentRulesUtils';
import {getLatestError} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Agent} from '@src/types/onyx';
import {PendingAction} from '@src/types/onyx/OnyxCommon';

import type {OnyxCollection} from 'react-native-onyx';

import {useEffect, useRef, useState} from 'react';
import {usePrevious} from 'victory-native';

import useChatWithAgent from './useChatWithAgent';
import useCleanupSelectedOptions from './useCleanupSelectedOptions';
import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
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

function useAgents() {
    useEffect(() => {
        openAgentsPage();
    }, []);

    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [allAgents] = useOnyx(ONYXKEYS.COLLECTION.AGENT);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const personalDetailsList = usePersonalDetails();
    const chatWithAgent = useChatWithAgent();
    const switchToDelegator = useSwitchToDelegator();
    const {showConfirmModal} = useConfirmModal();
    const showRuleBotGuardModal = useRuleBotGuardModal();
    const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

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

        if (!isOffline && isPendingDeletion) {
            return [];
        }

        const mergedErrors = {
            ...getLatestError(agent.errors ?? undefined),
            ...getLatestError(agent.nameErrors ?? undefined),
            ...getLatestError(agent.promptErrors ?? undefined),
            ...getLatestError(agent.avatarErrors ?? undefined),
        };
        const rowErrors = getLatestError(mergedErrors);

        return [
            {
                keyForList: String(accountID),
                accountID,
                displayName: details.displayName ?? details.login ?? '',
                login: details.login ?? '',
                ownerAccountID: agent.ownerAccountID,
                ownerType: agent.ownerType,
                pendingAction,
                errors: Object.keys(rowErrors).length > 0 ? rowErrors : undefined,
                disabled: isPendingDeletion,
                canManage: true,
                action: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.AGENT_EDIT.getRoute(accountID)), {skipMatchingFullScreenRoute: true}),
                onChatPress: () => chatWithAgent(accountID),
                onCopilotPress: () => switchToDelegator(details.login ?? ''),
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

export default useAgents;
