import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import RenderHTML from '@components/RenderHTML';
import AgentsTable from '@components/Tables/AgentsTable';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAgentsTable from '@hooks/useWorkspaceAgentsTable';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import {openAgentsPage} from '@libs/actions/Agent';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {openWorkspaceMembersPage} from '@libs/actions/Policy/Member';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {canMemberRead, canMemberWrite, getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import React, {useEffect, useEffectEvent} from 'react';
import {View} from 'react-native';

import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import WorkspacePageWithSections from './WorkspacePageWithSections';

type WorkspaceAgentsPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.AGENTS>;
function WorkspaceAgentsPage({route}: WorkspaceAgentsPageProps) {
    const policy = usePolicy(route.params.policyID);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const {pageGutter} = useLayoutSpacing();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();
    const selectionModeHeader = isMobileSelectionModeEnabled && shouldUseNarrowLayout;
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Trashcan']);
    const {agents, selectedAgentKeys, setSelectedAgents, clearSelectedAgents, askForConfirmationToDelete, tableRef} = useWorkspaceAgentsTable(policy);
    const hasAgents = agents.length > 0;
    const canSelectMultiple = shouldUseNarrowLayout ? isMobileSelectionModeEnabled : true;

    // The wide layout offers these actions in the floating bar over the table instead, so its header keeps the
    // page's own buttons no matter what is selected.
    const shouldShowBulkActionsButton = shouldUseNarrowLayout && canSelectMultiple;
    const canWriteAgents = canMemberWrite(policy, currentUserLogin ?? '', CONST.POLICY.POLICY_FEATURE.AGENTS);

    const employeePersonalDetails = usePersonalDetailsByLogins(Object.keys(policy?.employeeList ?? {}));
    const getWorkspaceMembers = () => {
        if (!canMemberRead(policy, currentUserLogin ?? '', CONST.POLICY.POLICY_FEATURE.MEMBERS)) {
            return;
        }
        const clientMemberEmails = Object.keys(getMemberAccountIDsForWorkspace(policy?.employeeList, employeePersonalDetails));
        openWorkspaceMembersPage(route.params.policyID, clientMemberEmails);
    };
    const fetchAgentsAndMembers = () => {
        openAgentsPage();

        // The OpenAgentsPage is only returning the owned agents
        // and on deep link the non-owned agents i.e. policy members who happen to be agents
        // are not displayed unless the user visit the Members page first
        // Will be removed in https://github.com/Expensify/Expensify/issues/694677
        getWorkspaceMembers();
    };
    const fetchAgentsAndMembersEvent = useEffectEvent(() => fetchAgentsAndMembers());

    useEffect(() => {
        fetchAgentsAndMembersEvent();
    }, []);
    useNetwork({onReconnect: fetchAgentsAndMembers});

    useWorkspaceDocumentTitle(policy?.name, 'agentsPage.title');

    const newAgentButton =
        canWriteAgents && hasAgents ? (
            <Button
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.AGENT_NEW.getRoute()))}
            >
                <Button.Icon src={icons.Plus} />
                <Button.Text>{translate('agentsPage.newAgent')}</Button.Text>
            </Button>
        ) : null;
    const emptyStateButtons = canWriteAgents
        ? [
              {
                  icon: icons.Plus,
                  buttonText: translate('agentsPage.newAgent'),
                  buttonVariant: CONST.BUTTON_VARIANT.SUCCESS,
                  buttonAction: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.AGENT_NEW.getRoute())),
              },
          ]
        : undefined;

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
                    <RenderHTML html={translate('agentsPage.subtitle')} />
                </View>
            )}
        </>
    );

    const headerContent = shouldDisplayButtonsInSeparateLine ? undefined : headerButtons;

    const goBackOrClearSelection = () => {
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
        >
            <WorkspacePageWithSections
                headerText={selectionModeHeader ? translate('common.selectMultiple') : translate('agentsPage.title')}
                shouldShowOfflineIndicatorInWideScreen
                route={route}
                addBottomSafeAreaPadding
                policyFeature={CONST.POLICY.POLICY_FEATURE.AGENTS}
                onBackButtonPress={goBackOrClearSelection}
                shouldUseHeadlineHeader={!selectionModeHeader}
                headerContent={headerContent}
            >
                <AgentsTable
                    ref={tableRef}
                    agents={agents}
                    headerComponent={agentsTableHeaderComponent}
                    canSelectAgents
                    selectedKeys={selectedAgentKeys}
                    onRowSelectionChange={setSelectedAgents}
                    shouldShowRoleColumn
                    emptyStateButtons={emptyStateButtons}
                    bulkActionOptions={canWriteAgents ? bulkActionsButtonOptions : undefined}
                />
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceAgentsPage;
