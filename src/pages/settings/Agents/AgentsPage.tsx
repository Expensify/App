import React, {useEffect} from 'react';
import {FlatList, View} from 'react-native';
import Button from '@components/Button';
import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useDocumentTitle from '@hooks/useDocumentTitle';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import {clearAgentError, openAgentsPage} from '@userActions/Agent';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import AgentsListRow from './AgentsListRow';

type AgentItem = {
    accountID: number;
    displayName: string;
    login: string;
    pendingAction?: PendingAction | null;
    errors?: Errors | null;
};

function AgentsPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['TvScreenRobot', 'AiBot']);
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
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

    const agentItems: AgentItem[] = Object.entries(agentPrompts ?? {})
        .map(([key, agentPrompt]) => {
            const accountID = Number(key.slice(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT.length));
            const details = personalDetailsList?.[accountID];
            if (!details) {
                return null;
            }
            return {
                accountID,
                displayName: details.displayName ?? details.login ?? '',
                login: details.login ?? '',
                pendingAction: agentPrompt?.pendingAction,
                errors: agentPrompt?.errors,
            };
        })
        .filter(Boolean) as AgentItem[];

    const renderItem = ({item}: {item: AgentItem}) => (
        <AgentsListRow
            accountID={item.accountID}
            displayName={item.displayName}
            login={item.login}
            pendingAction={item.pendingAction}
            errors={item.errors}
            onErrorClose={() => clearAgentError(item.accountID)}
        />
    );

    const keyExtractor = (item: AgentItem) => String(item.accountID);

    const hasAgents = agentItems.length > 0;

    const newAgentButton = (
        <Button
            success
            icon={icons.Plus}
            text={translate('agentsPage.newAgent')}
            onPress={() => Navigation.navigate(ROUTES.SETTINGS_AGENTS_ADD)}
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
            {hasAgents ? (
                <>
                    <Text style={[styles.textSupporting, styles.ph5, styles.pb3, styles.pt3]}>{translate('agentsPage.subtitle')}</Text>
                    <FlatList
                        data={agentItems}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                    />
                </>
            ) : (
                <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
                    <GenericEmptyStateComponent
                        headerMedia={illustrations.TvScreenRobot}
                        title={translate('agentsPage.emptyAgents.title')}
                        subtitle={translate('agentsPage.emptyAgents.subtitle')}
                        subtitleStyles={styles.agentsPageEmptyStateSubtitle}
                        headerStyles={styles.emptyStateCardIllustrationContainer}
                        headerContentStyles={styles.agentsPageEmptyStateIllustration}
                    />
                </ScrollView>
            )}
        </ScreenWrapper>
    );
}

AgentsPage.displayName = 'AgentsPage';

export default AgentsPage;
