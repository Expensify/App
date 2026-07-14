import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import type {AgentRowData} from '@components/Tables/AgentsTable';
import AgentsTable from '@components/Tables/AgentsTable';

import useChatWithAgent from '@hooks/useChatWithAgent';
import useDocumentTitle from '@hooks/useDocumentTitle';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSwitchToDelegator from '@hooks/useSwitchToDelegator';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import {clearAgentDeleteError, clearAgentError, clearAgentUpdateError, openAgentsPage} from '@userActions/Agent';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

import React, {useEffect} from 'react';
import {View} from 'react-native';

function AgentsPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['TvScreenRobot', 'AiBot']);
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const chatWithAgent = useChatWithAgent();
    const switchToDelegator = useSwitchToDelegator();
    const {isBetaEnabled} = usePermissions();
    const isCustomAgentEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);
    useDocumentTitle(translate('agentsPage.title'));

    const [agentPrompts] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT);
    const personalDetailsList = usePersonalDetails();

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

    const shouldShowErrors = (pendingAction: PendingAction | null | undefined) =>
        pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD || pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

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
            ...(shouldShowErrors(pendingAction) ? getLatestError(agentPrompt?.errors ?? undefined) : {}),
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

    const newAgentButton = (
        <Button
            success
            icon={icons.Plus}
            text={translate('agentsPage.newAgent')}
            onPress={() => Navigation.navigate(ROUTES.SETTINGS_AGENTS_ADD.getRoute())}
        />
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
                icon={illustrations.AiBot}
                onBackButtonPress={() => Navigation.goBack()}
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldUseHeadlineHeader
                shouldDisplaySearchRouter
                shouldDisplayHelpButton
                title={translate('agentsPage.title')}
            >
                {!shouldUseNarrowLayout && newAgentButton}
            </HeaderWithBackButton>
            {shouldUseNarrowLayout && <View style={[styles.ph5, styles.pb3]}>{newAgentButton}</View>}

            <View style={[styles.renderHTML, styles.flexRow, styles.w100, styles.ph5, styles.pb5, styles.pt3]}>
                <RenderHTML html={translate('agentsPage.subtitle')} />
            </View>

            <AgentsTable agents={agents} />
        </ScreenWrapper>
    );
}

AgentsPage.displayName = 'AgentsPage';

export default AgentsPage;
