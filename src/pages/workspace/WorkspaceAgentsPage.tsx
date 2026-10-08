import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import RenderHTML from '@components/RenderHTML';
import AgentsTable from '@components/Tables/AgentsTable';

import useAgents from '@hooks/useAgents';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import DeepValueOf from '@src/types/utils/DeepValueOf';

import React from 'react';
import {View} from 'react-native';

type WorkspaceAgentsPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.AGENTS>;
function WorkspaceAgentsPage({route}: WorkspaceAgentsPageProps) {
    const policy = usePolicy(route.params.policyID);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {pageGutter} = useLayoutSpacing();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const isCompanyAgentsBetaEnabled = isBetaEnabled(CONST.BETAS.COMPANY_AGENTS);
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();
    const selectionModeHeader = isMobileSelectionModeEnabled && shouldUseNarrowLayout;
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Trashcan']);
    const {agents, selectedAgentKeys, setSelectedAgents, clearSelectedAgents, askForConfirmationToDelete, tableRef} = useAgents();
    const hasAgents = agents.length > 0;
    const canSelectMultiple = shouldUseNarrowLayout ? isMobileSelectionModeEnabled : true;
    const shouldShowBulkActionsButton = shouldUseNarrowLayout ? canSelectMultiple : selectedAgentKeys.length > 0;

    useWorkspaceDocumentTitle(policy?.name, 'workspace.agents.title');

    const newAgentButton = (
        <Button
            variant="success"
            onPress={() => Navigation.navigate(ROUTES.SETTINGS_AGENTS_NEW.getRoute())}
        >
            <Button.Icon src={icons.Plus} />
            <Button.Text>{translate('agentsPage.newAgent')}</Button.Text>
        </Button>
    );

    const bulkActionsButtonOptions: Array<DropdownOption<DeepValueOf<typeof CONST.AGENTS.BULK_ACTION_TYPES>>> = [
        {
            text: translate('agentsPage.deleteAgentsTitle', {count: selectedAgentKeys.length}),
            value: CONST.AGENTS.BULK_ACTION_TYPES.DELETE,
            icon: icons.Trashcan,
            shouldSkipFocusRestore: true,
            onSelected: askForConfirmationToDelete,
        },
    ];

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
        />
    ) : (
        newAgentButton
    );
    const agentsTableHeaderComponent = (
        <>
            {shouldDisplayButtonsInSeparateLine && <View style={[pageGutter, styles.pb3]}>{headerButtons}</View>}
            {hasAgents && (
                <View style={[styles.renderHTML, styles.flexRow, styles.w100, styles.ph5, styles.pb5, styles.pt3]}>
                    <RenderHTML html={translate('workspace.agents.subtitle')} />
                </View>
            )}
        </>
    );

    const headerContent = shouldDisplayButtonsInSeparateLine ? undefined : headerButtons;

    const onBackButtonPress = () => {
        if (isMobileSelectionModeEnabled) {
            clearSelectedAgents();
            turnOffMobileSelectionMode();
            return;
        }
        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.AGENTS}
            shouldBeBlocked={!isCompanyAgentsBetaEnabled}
        >
            <WorkspacePageWithSections
                shouldUseScrollView
                headerText={selectionModeHeader ? translate('common.selectMultiple') : translate('workspace.agents.title')}
                shouldShowOfflineIndicatorInWideScreen
                route={route}
                addBottomSafeAreaPadding
                policyFeature={CONST.POLICY.POLICY_FEATURE.AGENTS}
                onBackButtonPress={onBackButtonPress}
                shouldUseHeadlineHeader={!selectionModeHeader}
                headerContent={headerContent}
            >
                {(policyID?: string) => (
                    <AgentsTable
                        ref={tableRef}
                        agents={agents}
                        headerComponent={agentsTableHeaderComponent}
                        canSelectAgents
                        selectedKeys={selectedAgentKeys}
                        onRowSelectionChange={setSelectedAgents}
                    />
                )}
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceAgentsPage;
