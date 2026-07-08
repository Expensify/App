import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import type {TableHandle} from '@components/Table';
import type {WorkspaceRowData, WorkspaceTableColumnKey} from '@components/Tables/WorkspaceListTable';
import WorkspaceListTable from '@components/Tables/WorkspaceListTable';
import WorkspaceListLayout from '@components/WorkspaceListLayout';

import useAndroidBackButtonHandler from '@hooks/useAndroidBackButtonHandler';
import useDocumentTitle from '@hooks/useDocumentTitle';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDuplicateWorkspace, dismissWorkspaceError} from '@libs/actions/Policy/Policy';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import openInternalRouteInNewTab from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {WorkspaceNavigatorParamList} from '@libs/Navigation/types';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {createDisplayDetailsByAccountIDsSelector} from '@src/selectors/PersonalDetails';
import type {CopySettingsEligibleTargets} from '@src/selectors/Policy';
import {createCopySettingsEligibleTargetsSelector, createWorkspaceListPoliciesSelector} from '@src/selectors/Policy';

import {useIsFocused, useRoute} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import CopyPolicySettingsProgressModal from './copyPolicySettings/CopyPolicySettingsProgressModal';
import DeleteWorkspaceFlow from './deleteWorkspace/DeleteWorkspaceFlow';

const EMPTY_COPY_SETTINGS_ELIGIBLE_TARGETS: CopySettingsEligibleTargets = {adminNonPersonal: [], corporateOnly: []};

function WorkspacesListPage() {
    const tableRef = useRef<TableHandle<WorkspaceRowData, WorkspaceTableColumnKey, string>>(null);
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    useDocumentTitle(translate('common.workspaces'));
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const shouldShowLoadingIndicator = isLoadingApp && !isOffline;
    const route = useRoute<PlatformStackRouteProp<WorkspaceNavigatorParamList, typeof SCREENS.WORKSPACES_LIST>>();
    const {isRestrictedPolicyCreation} = usePreferredPolicy();
    const [duplicateWorkspace] = useOnyx(ONYXKEYS.DUPLICATE_WORKSPACE);

    // Light, flat projection of the policy collection. Deep, frequently mutated policy fields (isLoading*
    // flags, employeeList, connections, etc.) are excluded, so background writes to them no longer commit
    // this page. Per-row error indicators subscribe to those fields themselves in WorkspaceRowBrickRoadIndicator.
    const [workspaceListPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createWorkspaceListPoliciesSelector(session?.email)}, [session?.email]);

    // Projection of the policy collection passed down to the row menus, which compute their copy-settings
    // eligibility from it. Kept at the page level so it is evaluated once per policy write instead of once per row.
    const [copySettingsEligibleTargets] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createCopySettingsEligibleTargetsSelector(session?.email)}, [session?.email]);

    const [policyIDToDelete, setPolicyIDToDelete] = useState<string>();

    // Narrow subscription keeping the owner name/avatar columns reactive without re-rendering the page
    // when anything else in the personal details list changes.
    const ownerAccountIDs = [
        ...new Set(
            (workspaceListPolicies ?? [])
                .map((policy) => (policy.isJoinRequestPending && policy.nonMemberDetails ? policy.nonMemberDetails.ownerAccountID : policy.ownerAccountID))
                .filter((id): id is number => id !== undefined),
        ),
    ];
    const [ownerDisplayDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: createDisplayDetailsByAccountIDsSelector(ownerAccountIDs)}, [workspaceListPolicies]);

    const navigateToWorkspace = (policyID: string, event?: ModifiedMouseEvent) => {
        const workspaceRoute = shouldUseNarrowLayout ? ROUTES.WORKSPACE_INITIAL.getRoute(policyID) : ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID);
        if (openInternalRouteInNewTab(workspaceRoute, event)) {
            return;
        }
        Navigation.navigate(workspaceRoute);
    };

    /**
     * Add free policies (workspaces) to the list of menu items and returns the list of menu items
     */
    const workspaceRows: WorkspaceRowData[] = [];

    for (const policy of workspaceListPolicies ?? []) {
        if (policy.isJoinRequestPending && policy.nonMemberDetails) {
            const {policyID, ownerAccountID, ownerEmail, ownerDefaultAvatar} = policy.nonMemberDetails;
            let ownerDetails = ownerAccountID ? ownerDisplayDetails?.[ownerAccountID] : undefined;

            // The owner of a policy the user only requested to join is usually not in the personal details list,
            // so fall back to the owner email and default avatar the join request already provides.
            if (!ownerDetails && ownerAccountID && ownerEmail) {
                ownerDetails = {
                    accountID: ownerAccountID,
                    login: ownerEmail,
                    displayName: ownerEmail,
                    avatar: ownerDefaultAvatar,
                };
            }

            const pendingWorkspaceRow: WorkspaceRowData = {
                keyForList: policyID,
                policyID,
                disabled: true,
                errors: undefined,
                type: policy.nonMemberDetails.type,
                title: policy.nonMemberDetails.name,
                role: CONST.POLICY.ROLE.USER,
                isDeleted: false,
                isJoinRequestPending: true,
                isDefault: activePolicyID === policyID,
                shouldAnimateInHighlight: duplicateWorkspace?.policyID === policyID,
                ownerAccountID,
                ownerLogin: ownerDetails ? ownerDetails.login : undefined,
                ownerAvatar: ownerDetails ? ownerDetails.avatar : undefined,
                ownerName: ownerDetails ? temporaryGetDisplayNameOrDefault({passedPersonalDetails: ownerDetails, translate}) : undefined,
                iconType: policy.nonMemberDetails.avatar ? CONST.ICON_TYPE_AVATAR : CONST.ICON_TYPE_ICON,
                icon: policy.nonMemberDetails.avatar ? policy.nonMemberDetails.avatar : getDefaultWorkspaceAvatar(policy.nonMemberDetails.name),
                action: () => null,
                dismissError: () => null,
            };

            workspaceRows.push(pendingWorkspaceRow);
        } else {
            const ownerDetails = policy.ownerAccountID ? ownerDisplayDetails?.[policy.ownerAccountID] : undefined;

            const workspaceRow: WorkspaceRowData = {
                keyForList: policy.id,
                policyID: policy.id,
                disabled: policy.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                errors: policy.errors,
                type: policy.type,
                title: policy.name,
                role: policy.role,
                ownerAccountID: policy.ownerAccountID,
                isJoinRequestPending: false,
                shouldAnimateInHighlight: duplicateWorkspace?.policyID === policy.id,
                isDefault: activePolicyID === policy.id,
                isDeleted: policy.isPendingDelete,
                ownerLogin: ownerDetails ? ownerDetails.login : undefined,
                ownerAvatar: ownerDetails ? ownerDetails.avatar : undefined,
                ownerName: ownerDetails ? temporaryGetDisplayNameOrDefault({passedPersonalDetails: ownerDetails, translate}) : undefined,
                iconType: policy.avatarURL ? CONST.ICON_TYPE_AVATAR : CONST.ICON_TYPE_ICON,
                icon: policy.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy.name),
                pendingAction: policy.pendingAction,
                action: (event) => navigateToWorkspace(policy.id, event),
                dismissError: () => dismissWorkspaceError(policy.id, policy.pendingAction),
            };

            workspaceRows.push(workspaceRow);
        }
    }

    useEffect(() => {
        const duplicatedWSPolicyID = duplicateWorkspace?.policyID;
        const filteredWorkspaces = tableRef.current?.getProcessedData() ?? [];

        if (!duplicatedWSPolicyID || !filteredWorkspaces.length || !isFocused) {
            return;
        }

        const duplicateWorkspaceIndex = filteredWorkspaces.findIndex((workspace) => workspace.policyID === duplicatedWSPolicyID);
        if (duplicateWorkspaceIndex < 0) {
            return;
        }

        tableRef.current?.scrollToIndex({index: duplicateWorkspaceIndex, animated: false});
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => clearDuplicateWorkspace(),
        });

        return () => handle.cancel();
    }, [duplicateWorkspace?.policyID, isFocused, workspaceRows.length]);

    // Scroll to the top when the list gets its first workspace, so it's visible. On web, returning from the create
    // flow restores the scroll position the empty list had (it was scrolled down to reach the "New workspace" button),
    // which would otherwise hide the new row — so reset after the navigation transition, once that restore has run.
    const wasWorkspaceListEmptyRef = useRef(workspaceRows.length === 0);
    useEffect(() => {
        if (workspaceRows.length === 0) {
            wasWorkspaceListEmptyRef.current = true;
            return;
        }
        if (!wasWorkspaceListEmptyRef.current || !isFocused) {
            return;
        }
        wasWorkspaceListEmptyRef.current = false;
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => tableRef.current?.scrollToOffset({offset: 0, animated: false}),
        });
        return () => handle.cancel();
    }, [workspaceRows.length, isFocused]);

    const headerButton = !isRestrictedPolicyCreation && !!workspaceRows.length && (
        <Button
            success
            accessibilityLabel={translate('common.new')}
            text={translate('common.new')}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.LIST.NEW_WORKSPACE_BUTTON}
            onPress={() => interceptAnonymousUser(() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_CONFIRMATION.path, ROUTES.WORKSPACES_LIST.route)))}
            icon={icons.Plus}
        />
    );

    const onBackButtonPress = () => {
        Navigation.goBack(route.params?.backTo);
        return true;
    };

    useAndroidBackButtonHandler(onBackButtonPress);

    return (
        <WorkspaceListLayout
            activeTabKey="workspaces"
            headerButton={headerButton}
        >
            {shouldShowLoadingIndicator ? (
                <View style={[styles.flex1, styles.fullScreenLoading]}>
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        reasonAttributes={
                            {
                                context: 'WorkspacesListPage',
                                isOffline,
                            } satisfies SkeletonSpanReasonAttributes
                        }
                    />
                </View>
            ) : (
                <WorkspaceListTable
                    ref={tableRef}
                    workspaces={workspaceRows}
                    onDeleteWorkspace={setPolicyIDToDelete}
                    pendingDeletePolicyID={policyIDToDelete}
                    copySettingsEligibleTargets={copySettingsEligibleTargets ?? EMPTY_COPY_SETTINGS_ELIGIBLE_TARGETS}
                />
            )}
            {!!policyIDToDelete && (
                <DeleteWorkspaceFlow
                    key={policyIDToDelete}
                    policyID={policyIDToDelete}
                    onDismiss={() => setPolicyIDToDelete(undefined)}
                />
            )}
            <CopyPolicySettingsProgressModal />
        </WorkspaceListLayout>
    );
}

export default WorkspacesListPage;
