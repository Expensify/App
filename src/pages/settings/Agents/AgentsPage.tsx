import Button from '@components/ButtonComposed';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import type {AgentRowData} from '@components/Tables/AgentsTable';
import AgentsTable from '@components/Tables/AgentsTable';

import useChatWithAgent from '@hooks/useChatWithAgent';
import useCleanupSelectedOptions from '@hooks/useCleanupSelectedOptions';
import useConfirmModal from '@hooks/useConfirmModal';
import useDocumentTitle from '@hooks/useDocumentTitle';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useSwitchToDelegator from '@hooks/useSwitchToDelegator';
import useThemeStyles from '@hooks/useThemeStyles';

import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import {clearAgentDeleteError, clearAgentError, clearAgentUpdateError, deleteAgent, openAgentsPage} from '@userActions/Agent';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

function AgentsPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();
    const illustrations = useMemoizedLazyIllustrations(['AiBot']);
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Trashcan']);
    const chatWithAgent = useChatWithAgent();
    const switchToDelegator = useSwitchToDelegator();
    const {isBetaEnabled} = usePermissions();
    const isCustomAgentEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);
    const {showConfirmModal} = useConfirmModal();
    const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    useDocumentTitle(translate('agentsPage.title'));

    const [agentPrompts] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const personalDetailsList = usePersonalDetails();
    const canSelectMultiple = shouldUseNarrowLayout ? isMobileSelectionModeEnabled : true;

    useEffect(() => {
        if (!isCustomAgentEnabled) {
            return;
        }
        openAgentsPage();
    }, [isCustomAgentEnabled]);

    const handleErrorClose = (pendingAction: PendingAction | null | undefined, accountID: number) => {
        if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
            clearAgentError(accountID);
        } else if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            clearAgentDeleteError(accountID);
        } else {
            clearAgentUpdateError(accountID);
        }
    };

    const agents: AgentRowData[] = Object.entries(agentPrompts ?? {}).flatMap(([key, agentPrompt]) => {
        const accountID = Number(key.slice(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT.length));
        const details = personalDetailsList?.[accountID];
        if (!details) {
            return [];
        }
        const pendingAction = agentPrompt?.pendingAction;
        const isPendingDeletion = pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

        if (!isOffline && isPendingDeletion) {
            return [];
        }

        const mergedErrors = {
            ...getLatestError(agentPrompt?.errors ?? undefined),
            ...getLatestError(agentPrompt?.nameErrors ?? undefined),
            ...getLatestError(agentPrompt?.promptErrors ?? undefined),
            ...getLatestError(agentPrompt?.avatarErrors ?? undefined),
        };
        const rowErrors = getLatestError(mergedErrors);

        return [
            {
                keyForList: String(accountID),
                accountID,
                displayName: details.displayName ?? details.login ?? '',
                login: details.login ?? '',
                pendingAction,
                errors: Object.keys(rowErrors).length > 0 ? rowErrors : undefined,
                disabled: isPendingDeletion,
                action: () => Navigation.navigate(ROUTES.SETTINGS_AGENTS_EDIT.getRoute(accountID)),
                onChatPress: () => chatWithAgent(accountID),
                onCopilotPress: () => switchToDelegator(details.login ?? ''),
                dismissError: () => handleErrorClose(pendingAction, accountID),
            },
        ];
    });

    const agentsByAccountID = new Map(agents.map((agent) => [agent.keyForList, agent]));
    const selectedAgentKeys = selectedAgents.filter((accountIDString) => {
        const agent = agentsByAccountID.get(accountIDString);
        return !!agent && agent.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    });

    const clearSelectedAgents = () => {
        setSelectedAgents((prevSelectedAgents) => (prevSelectedAgents.length > 0 ? [] : prevSelectedAgents));
    };

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
        const result = await showConfirmModal({
            title: translate('agentsPage.deleteAgentsTitle', {count: selectedAgentKeys.length}),
            prompt: translate('agentsPage.deleteAgentsMessage', {count: selectedAgentKeys.length}),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            danger: true,
            shouldHandleNavigationBack: false,
        });

        if (result.action !== ModalActions.CONFIRM) {
            return;
        }

        removeSelectedAgents();
    };

    const bulkActionsButtonOptions: Array<DropdownOption<DeepValueOf<typeof CONST.AGENTS.BULK_ACTION_TYPES>>> = [
        {
            text: translate('agentsPage.deleteAgentsTitle', {count: selectedAgentKeys.length}),
            value: CONST.AGENTS.BULK_ACTION_TYPES.DELETE,
            icon: icons.Trashcan,
            onSelected: askForConfirmationToDelete,
        },
    ];

    const hasAgents = agents.length > 0;
    const shouldShowBulkActionsButton = shouldUseNarrowLayout ? canSelectMultiple : selectedAgentKeys.length > 0;
    const selectionModeHeader = isMobileSelectionModeEnabled && shouldUseNarrowLayout;

    const newAgentButton = (
        <Button
            variant="success"
            onPress={() => Navigation.navigate(ROUTES.SETTINGS_AGENTS_ADD.getRoute())}
        >
            <Button.Icon src={icons.Plus} />
            <Button.Text>{translate('agentsPage.newAgent')}</Button.Text>
        </Button>
    );

    const headerButtons = shouldShowBulkActionsButton ? (
        <ButtonWithDropdownMenu<DeepValueOf<typeof CONST.AGENTS.BULK_ACTION_TYPES>>
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            shouldAlwaysShowDropdownMenu
            customText={translate('workspace.common.selected', {count: selectedAgentKeys.length})}
            size={CONST.BUTTON_SIZE.MEDIUM}
            onPress={() => null}
            options={bulkActionsButtonOptions}
            isSplitButton={false}
            isDisabled={!selectedAgentKeys.length}
            testID="AgentsPage-header-dropdown-menu-button"
        />
    ) : (
        newAgentButton
    );

    if (!isCustomAgentEnabled) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            style={[styles.defaultModalContainer]}
            testID={AgentsPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            shouldMobileOfflineIndicatorStickToBottom={false}
            offlineIndicatorStyle={styles.mtAuto}
        >
            <HeaderWithBackButton
                icon={!selectionModeHeader ? illustrations.AiBot : undefined}
                onBackButtonPress={() => {
                    if (isMobileSelectionModeEnabled) {
                        clearSelectedAgents();
                        turnOffMobileSelectionMode();
                        return;
                    }
                    Navigation.goBack();
                }}
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldUseHeadlineHeader={!selectionModeHeader}
                shouldDisplaySearchRouter
                shouldDisplayHelpButton
                title={selectionModeHeader ? translate('common.selectMultiple') : translate('agentsPage.title')}
            >
                {!shouldDisplayButtonsInSeparateLine && headerButtons}
            </HeaderWithBackButton>
            {shouldDisplayButtonsInSeparateLine && <View style={[styles.ph5, styles.pb3]}>{headerButtons}</View>}
            {hasAgents && (
                <View style={[styles.renderHTML, styles.flexRow, styles.w100, styles.ph5, styles.pb5, styles.pt3]}>
                    <RenderHTML html={translate('agentsPage.subtitle')} />
                </View>
            )}
            <AgentsTable
                agents={agents}
                canSelectAgents
                selectedKeys={selectedAgentKeys}
                onRowSelectionChange={setSelectedAgents}
            />
        </ScreenWrapper>
    );
}

AgentsPage.displayName = 'AgentsPage';

export default AgentsPage;
