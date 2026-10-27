import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption, WorkspacesBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {TableHandle} from '@components/Table';
import type {WorkspaceRowData, WorkspaceTableColumnKey} from '@components/Tables/WorkspaceListTable';
import WorkspaceListTable from '@components/Tables/WorkspaceListTable';
import LeaveWorkspaceFlow from '@components/Tables/WorkspaceListTable/LeaveWorkspaceFlow';
import TransferOwnershipFlow from '@components/Tables/WorkspaceListTable/TransferOwnershipFlow';
import WorkspaceListLayout, {WorkspaceListHeaderContent} from '@components/WorkspaceListLayout';

import useCleanupSelectedOptions from '@hooks/useCleanupSelectedOptions';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDocumentTitle from '@hooks/useDocumentTitle';
import {useIsAppLoadPending} from '@hooks/useInFlightRequests';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBackPress from '@hooks/useSearchBackPress';
import useThemeStyles from '@hooks/useThemeStyles';

import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {clearCopyPolicySettings} from '@libs/actions/Policy/CopyPolicySettings';
import {queueExportPoliciesMembersToCSV, requestWorkspacesOwnerChange} from '@libs/actions/Policy/Member';
import {archivePolicies, clearDuplicateWorkspace, dismissWorkspaceError, leaveWorkspaces} from '@libs/actions/Policy/Policy';
import {callFunctionIfActionIsAllowed} from '@libs/actions/Session';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import openInternalRouteInNewTab from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {WorkspaceNavigatorParamList} from '@libs/Navigation/types';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {isPaidGroupPolicyByType} from '@libs/PolicyUtils';
import shouldRenderTransferOwnerButton from '@libs/shouldRenderTransferOwnerButton';
import {getWorkspacesBulkActions} from '@libs/WorkspacesSettingsUtils';
import type {WorkspacesBulkAction} from '@libs/WorkspacesSettingsUtils';

import {setNameValuePair} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {createDisplayDetailsByAccountIDsSelector} from '@src/selectors/PersonalDetails';
import {createCopySettingsEligibleTargetsSelector, createWorkspaceListPoliciesSelector} from '@src/selectors/Policy';

import type {ValueOf} from 'type-fest';

import {useIsFocused, useRoute} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import ArchiveWorkspaceFlow from './archiveWorkspace/ArchiveWorkspaceFlow';
import UnarchiveWorkspaceFlow from './archiveWorkspace/UnarchiveWorkspaceFlow';
import CopyPolicySettingsProgressModal from './copyPolicySettings/CopyPolicySettingsProgressModal';
import DeleteWorkspaceFlow from './deleteWorkspace/DeleteWorkspaceFlow';

type ActiveWorkspaceFlow = {
    type: WorkspacesBulkActionType;
    policyID: string;
};

function WorkspacesListPage() {
    const tableRef = useRef<TableHandle<WorkspaceRowData, WorkspaceTableColumnKey, string>>(null);
    const icons = useMemoizedLazyExpensifyIcons(['ArrowCircleClockwise', 'Box', 'Copy', 'Exit', 'Export', 'Plus', 'Star', 'Transfer', 'Trashcan']);
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    useDocumentTitle(translate('common.workspaces'));
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const isAppLoadPending = useIsAppLoadPending();
    const shouldShowLoadingIndicator = isAppLoadPending && !isOffline;
    const route = useRoute<PlatformStackRouteProp<WorkspaceNavigatorParamList, typeof SCREENS.WORKSPACES_LIST>>();
    const {isRestrictedPolicyCreation, isRestrictedToPreferredPolicy, preferredPolicyID} = usePreferredPolicy();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {showConfirmModal} = useConfirmModal();
    const [canRenderTransferOwnerButton] = useOnyx(ONYXKEYS.FUND_LIST, {selector: shouldRenderTransferOwnerButton});
    const [isLoadingBill] = useOnyx(ONYXKEYS.IS_LOADING_BILL_WHEN_DOWNGRADE);
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const {isBetaEnabled} = usePermissions();
    const canUseArchivePolicies = isBetaEnabled(CONST.BETAS.ARCHIVE_POLICIES);
    const [duplicateWorkspace] = useOnyx(ONYXKEYS.DUPLICATE_WORKSPACE);

    // Light, flat projection of the policy collection. Deep, frequently mutated policy fields (isLoading*
    // flags, employeeList, connections, etc.) are excluded, so background writes to them no longer commit
    // this page. Per-row error indicators subscribe to those fields themselves in WorkspaceRowBrickRoadIndicator.
    const [workspaceListPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createWorkspaceListPoliciesSelector(session?.email, canUseArchivePolicies)});

    // IDs of every workspace eligible as a copy-settings target. Derived once per policy write (not per row) so each row can cheaply decide whether to offer "Copy settings".
    const [copySettingsEligibleTargets] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createCopySettingsEligibleTargetsSelector(session?.email)});

    // A workspace can copy its settings when there is at least one other eligible target.
    const isWorkspaceEligibleToCopy = (policyID: string) =>
        !!copySettingsEligibleTargets && (copySettingsEligibleTargets.length > 1 || (copySettingsEligibleTargets.length === 1 && copySettingsEligibleTargets.at(0) !== policyID));

    const [policyIDToDelete, setPolicyIDToDelete] = useState<string>();
    const [policyIDToArchive, setPolicyIDToArchive] = useState<string>();
    const [activeFlow, setActiveFlow] = useState<ActiveWorkspaceFlow>();
    const [selectedPolicyIDs, setSelectedPolicyIDs] = useState<string[]>([]);
    const clearSelection = () => setSelectedPolicyIDs([]);

    useCleanupSelectedOptions(clearSelection);

    // Narrow subscription keeping the owner name/avatar columns reactive without re-rendering the page
    // when anything else in the personal details list changes.
    const ownerAccountIDs = [
        ...new Set(
            (workspaceListPolicies ?? [])
                .map((policy) => (policy.isJoinRequestPending && policy.nonMemberDetails ? policy.nonMemberDetails.ownerAccountID : policy.ownerAccountID))
                .filter((id): id is number => id !== undefined),
        ),
    ];
    const [ownerDisplayDetails] = useAllPersonalDetails(createDisplayDetailsByAccountIDsSelector(ownerAccountIDs));

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
                isArchived: false,
                isJoinRequestPending: true,
                isEligibleToCopy: false,
                isDefault: activePolicyID === policyID,
                shouldAnimateInHighlight: duplicateWorkspace?.policyID === policyID,
                ownerAccountID,
                ownerLogin: ownerDetails ? ownerDetails.login : undefined,
                ownerAvatar: ownerDetails ? ownerDetails.avatar : undefined,
                ownerName: ownerDetails ? temporaryGetDisplayNameOrDefault({passedPersonalDetails: ownerDetails, translate, formatPhoneNumber}) : undefined,
                iconType: policy.nonMemberDetails.avatar ? CONST.ICON_TYPE_AVATAR : CONST.ICON_TYPE_ICON,
                icon: policy.nonMemberDetails.avatar ? policy.nonMemberDetails.avatar : undefined,
                action: () => null,
                dismissError: () => null,
            };

            workspaceRows.push(pendingWorkspaceRow);
        } else {
            const ownerDetails = policy.ownerAccountID ? ownerDisplayDetails?.[policy.ownerAccountID] : undefined;
            const policyID = policy.id;
            const isEligibleToCopy = isWorkspaceEligibleToCopy(policyID) && isPaidGroupPolicyByType(policy.type);

            const workspaceRow: WorkspaceRowData = {
                keyForList: policyID,
                policyID,
                disabled: policy.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                errors: policy.errors,
                type: policy.type,
                title: policy.name,
                role: policy.role,
                ownerAccountID: policy.ownerAccountID,
                isJoinRequestPending: false,
                isArchived: policy.isArchived,
                isEligibleToCopy,
                shouldAnimateInHighlight: duplicateWorkspace?.policyID === policyID,
                isDefault: activePolicyID === policyID,
                isDeleted: policy.isPendingDelete,
                ownerLogin: ownerDetails ? ownerDetails.login : undefined,
                ownerAvatar: ownerDetails ? ownerDetails.avatar : undefined,
                ownerName: ownerDetails ? temporaryGetDisplayNameOrDefault({passedPersonalDetails: ownerDetails, translate, formatPhoneNumber}) : undefined,
                iconType: policy.avatarURL ? CONST.ICON_TYPE_AVATAR : CONST.ICON_TYPE_ICON,
                icon: policy.avatarURL,
                pendingAction: policy.pendingAction,
                action: (event) => navigateToWorkspace(policyID, event),
                dismissError: () => dismissWorkspaceError(policyID, policy.pendingAction),
            };

            workspaceRows.push(workspaceRow);
        }
    }

    const duplicateWorkspacePolicyID = duplicateWorkspace?.policyID;
    useEffect(() => {
        const duplicatedWSPolicyID = duplicateWorkspacePolicyID;
        const filteredWorkspaces = tableRef.current?.getProcessedData() ?? [];

        if (!duplicatedWSPolicyID || !filteredWorkspaces.length || !isFocused) {
            return;
        }

        const duplicateWorkspaceIndex = filteredWorkspaces.findIndex((workspace) => workspace.policyID === duplicatedWSPolicyID);

        if (duplicateWorkspaceIndex < 0) {
            return;
        }

        tableRef.current?.scrollToIndex({index: duplicateWorkspaceIndex, animated: false, viewPosition: 0.5});
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => clearDuplicateWorkspace(),
        });

        return () => handle.cancel();
    }, [duplicateWorkspacePolicyID, isFocused, workspaceRows.length]);

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

    const selectedRows = workspaceRows.filter((row) => selectedPolicyIDs.includes(row.policyID));

    const confirmBulkAction = (
        policyIDs: string[],
        title: string,
        confirmText: string,
        onConfirm: () => void,
        buttonVariant: ValueOf<typeof CONST.BUTTON_VARIANT> = CONST.BUTTON_VARIANT.DANGER,
    ) => {
        const skippedWorkspaceNames = selectedRows.filter((row) => !policyIDs.includes(row.policyID)).map((row) => row.title);
        const prompt =
            skippedWorkspaceNames.length > 0
                ? `${translate('workspace.common.bulkActionAppliesTo', policyIDs.length, selectedRows.length)} ${translate('workspace.common.bulkActionSkippedWorkspaces', skippedWorkspaceNames.join(', '))}`
                : undefined;

        showConfirmModal({
            title,
            prompt,
            confirmText,
            cancelText: translate('common.cancel'),
            buttonVariant,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            onConfirm();
            clearSelection();
        });
    };

    const getBulkActionOption = ({type, policyIDs}: WorkspacesBulkAction): DropdownOption<WorkspacesBulkActionType> => {
        const [firstPolicyID = ''] = policyIDs;
        const isSingleSelection = selectedRows.length === 1;

        switch (type) {
            case CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.SET_AS_DEFAULT:
                return {
                    value: type,
                    text: translate('workspace.common.setAsDefaultShort'),
                    icon: icons.Star,
                    onSelected: () => {
                        if (!activePolicyID) {
                            return;
                        }
                        setNameValuePair(ONYXKEYS.NVP_ACTIVE_POLICY_ID, firstPolicyID, activePolicyID);
                        clearSelection();
                    },
                };
            case CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.EXPORT_MEMBERS:
                return {
                    value: type,
                    text: translate('workspace.common.exportMembers'),
                    icon: icons.Export,
                    onSelected: () => {
                        queueExportPoliciesMembersToCSV(policyIDs);
                        clearSelection();
                    },
                };
            case CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.TRANSFER_OWNER:
                return {
                    value: type,
                    text: translate('workspace.people.transferOwner'),
                    icon: icons.Transfer,
                    shouldSkipFocusRestore: true,
                    onSelected: () => {
                        if (isSingleSelection) {
                            setActiveFlow({type, policyID: firstPolicyID});
                            return;
                        }
                        confirmBulkAction(
                            policyIDs,
                            translate('workspace.common.transferOwnerWorkspacesTitle', {count: policyIDs.length}),
                            translate('workspace.people.transferOwner'),
                            () => requestWorkspacesOwnerChange(policyIDs),
                            CONST.BUTTON_VARIANT.SUCCESS,
                        );
                    },
                };
            case CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.COPY_SETTINGS:
                return {
                    value: type,
                    text: translate('workspace.copyPolicySettings.title'),
                    icon: icons.Copy,
                    onSelected: () => {
                        clearCopyPolicySettings();
                        Navigation.navigate(ROUTES.POLICY_COPY_SETTINGS.getRoute(firstPolicyID));
                    },
                };
            case CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.DUPLICATE:
                return {
                    value: type,
                    text: translate('common.duplicate'),
                    icon: icons.Plus,
                    onSelected: () => Navigation.navigate(ROUTES.WORKSPACE_DUPLICATE.getRoute(firstPolicyID)),
                };
            case CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.ARCHIVE:
                return {
                    value: type,
                    text: translate('common.archive'),
                    icon: icons.Box,
                    shouldSkipFocusRestore: true,
                    onSelected: () => {
                        // The single workspace confirmation is handled by ArchiveWorkspaceFlow, mounted below.
                        if (isSingleSelection) {
                            setPolicyIDToArchive(firstPolicyID);
                            return;
                        }
                        confirmBulkAction(policyIDs, translate('workspace.common.archiveWorkspacesTitle', {count: policyIDs.length}), translate('common.archive'), () =>
                            archivePolicies(policyIDs),
                        );
                    },
                };
            case CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.DELETE:
                return {
                    value: type,
                    text: translate('common.delete'),
                    icon: icons.Trashcan,
                    shouldSkipFocusRestore: true,
                    onSelected: () => {
                        if (isLoadingBill) {
                            return;
                        }

                        // All the pre-deletion checks and the confirmation modal are handled by DeleteWorkspaceFlow, mounted below.
                        setPolicyIDToDelete(firstPolicyID);
                    },
                };
            case CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.UNARCHIVE:
                return {
                    value: type,
                    text: translate('workspace.common.unarchive'),
                    icon: icons.ArrowCircleClockwise,
                    shouldSkipFocusRestore: true,
                    onSelected: callFunctionIfActionIsAllowed(() => setActiveFlow({type, policyID: firstPolicyID})),
                };
            case CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.LEAVE:
            default:
                return {
                    value: type,
                    text: translate('common.leave'),
                    icon: icons.Exit,
                    shouldSkipFocusRestore: true,
                    onSelected: callFunctionIfActionIsAllowed(() => {
                        if (isSingleSelection) {
                            setActiveFlow({type, policyID: firstPolicyID});
                            return;
                        }
                        confirmBulkAction(policyIDs, translate('workspace.common.leaveWorkspacesTitle', {count: policyIDs.length}), translate('common.leave'), () =>
                            leaveWorkspaces(
                                currentUserPersonalDetails.login ?? '',
                                selectedRows.filter((row) => policyIDs.includes(row.policyID)).map((row) => ({id: row.policyID, pendingAction: row.pendingAction})),
                            ),
                        );
                    }),
                };
        }
    };

    const bulkActionOptions = getWorkspacesBulkActions(selectedRows, {
        currentUserAccountID: currentUserPersonalDetails.accountID,
        preferredPolicyID,
        isRestrictedToPreferredPolicy,
        canArchivePolicies: canUseArchivePolicies,
        canRenderTransferOwnerButton: !!canRenderTransferOwnerButton,
    }).map(getBulkActionOption);

    const dismissActiveFlow = () => {
        setActiveFlow(undefined);
        clearSelection();
    };

    const newWorkspaceButton = !isRestrictedPolicyCreation && !!workspaceRows.length && (
        <Button
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            accessibilityLabel={translate('common.new')}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.LIST.NEW_WORKSPACE_BUTTON}
            onPress={() => interceptAnonymousUser(() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_CONFIRMATION.path, ROUTES.WORKSPACES_LIST.route)))}
        >
            <Button.Icon src={icons.Plus} />
            <Button.Text>{translate('common.new')}</Button.Text>
        </Button>
    );

    // The wide layout offers the bulk actions in the floating bar over the table instead.
    const headerButton =
        shouldUseNarrowLayout && isMobileSelectionModeEnabled ? (
            <ButtonWithDropdownMenu<WorkspacesBulkActionType>
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                shouldAlwaysShowDropdownMenu
                customText={translate('workspace.common.selected', {count: selectedPolicyIDs.length})}
                size={CONST.BUTTON_SIZE.MEDIUM}
                onPress={() => null}
                options={bulkActionOptions}
                isSplitButton={false}
                isDisabled={!selectedPolicyIDs.length}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.LIST.BULK_ACTIONS_DROPDOWN}
            />
        ) : (
            newWorkspaceButton
        );
    const headerComponent = (
        <WorkspaceListHeaderContent
            activeTabKey="workspaces"
            headerButton={headerButton}
        />
    );

    const exitSelectionMode = () => {
        clearSelection();
        turnOffMobileSelectionMode();
    };

    useSearchBackPress({
        onClearSelection: clearSelection,
        onNavigationCallBack: () => Navigation.goBack(route.params?.backTo),
    });

    return (
        <WorkspaceListLayout
            activeTabKey="workspaces"
            headerButton={headerButton}
            headerComponent={headerComponent}
            scrollHeaderWithTable
            isSelectionModeEnabled={isMobileSelectionModeEnabled}
            onExitSelectionMode={exitSelectionMode}
        >
            <>
                {shouldShowLoadingIndicator ? (
                    <>
                        {headerComponent}
                        <View style={[styles.flex1, styles.fullScreenLoading]}>
                            <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                        </View>
                    </>
                ) : (
                    <WorkspaceListTable
                        ref={tableRef}
                        workspaces={workspaceRows}
                        headerComponent={headerComponent}
                        selectedKeys={selectedPolicyIDs}
                        onRowSelectionChange={setSelectedPolicyIDs}
                        bulkActionOptions={bulkActionOptions}
                    />
                )}
                {!!policyIDToDelete && (
                    <DeleteWorkspaceFlow
                        key={policyIDToDelete}
                        policyID={policyIDToDelete}
                        onDismiss={() => {
                            setPolicyIDToDelete(undefined);
                            clearSelection();
                        }}
                    />
                )}
                {!!policyIDToArchive && (
                    <ArchiveWorkspaceFlow
                        key={policyIDToArchive}
                        policyID={policyIDToArchive}
                        onDismiss={() => {
                            setPolicyIDToArchive(undefined);
                            clearSelection();
                        }}
                    />
                )}
                {activeFlow?.type === CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.LEAVE && (
                    <LeaveWorkspaceFlow
                        policyID={activeFlow.policyID}
                        onDismiss={dismissActiveFlow}
                    />
                )}
                {activeFlow?.type === CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.UNARCHIVE && (
                    <UnarchiveWorkspaceFlow
                        policyID={activeFlow.policyID}
                        onDismiss={dismissActiveFlow}
                    />
                )}
                {activeFlow?.type === CONST.POLICY.WORKSPACES_BULK_ACTION_TYPES.TRANSFER_OWNER && (
                    <TransferOwnershipFlow
                        policyID={activeFlow.policyID}
                        onDismiss={dismissActiveFlow}
                    />
                )}
                <CopyPolicySettingsProgressModal />
            </>
        </WorkspaceListLayout>
    );
}

export default WorkspacesListPage;
