import {useIsFocused, useRoute} from '@react-navigation/native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type {TableHandle} from '@components/Table';
import type {WorkspaceRowData, WorkspaceTableColumnKey} from '@components/Tables/WorkspaceListTable';
import WorkspaceListTable from '@components/Tables/WorkspaceListTable';
import WorkspaceListLayout from '@components/WorkspaceListLayout';
import useAndroidBackButtonHandler from '@hooks/useAndroidBackButtonHandler';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDocumentTitle from '@hooks/useDocumentTitle';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePoliciesWithCardFeedErrors from '@hooks/usePoliciesWithCardFeedErrors';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isConnectionInProgress} from '@libs/actions/connections';
import {close} from '@libs/actions/Modal';
import {clearCopyPolicySettings} from '@libs/actions/Policy/CopyPolicySettings';
import {clearWorkspaceOwnerChangeFlow, requestWorkspaceOwnerChange} from '@libs/actions/Policy/Member';
import {clearDuplicateWorkspace, dismissWorkspaceError, leaveWorkspace} from '@libs/actions/Policy/Policy';
import {callFunctionIfActionIsAllowed} from '@libs/actions/Session';
import {isMergeHRCompleteSetupNeeded} from '@libs/HRUtils';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import openInternalRouteInNewTab from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {WorkspaceNavigatorParamList} from '@libs/Navigation/types';
import {getDisplayNameOrDefault, getPersonalDetailsByIDs} from '@libs/PersonalDetailsUtils';
import {
    getConnectionExporters,
    getPolicyBrickRoadIndicatorStatus,
    getUberConnectionErrorDirectlyFromPolicy,
    isPendingDeletePolicy,
    isPolicyAdmin,
    isPolicyApprover,
    isPolicyAuditor,
    shouldShowEmployeeListError,
    shouldShowPolicy,
} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import shouldRenderTransferOwnerButton from '@libs/shouldRenderTransferOwnerButton';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {setNameValuePair} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {canDowngradeSelector} from '@src/selectors/Account';
import {createOwnedPaidPoliciesCountsSelector} from '@src/selectors/Policy';
import type {Policy as PolicyType} from '@src/types/onyx';
import type {PolicyDetailsForNonMembers} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import CopyPolicySettingsProgressModal from './copyPolicySettings/CopyPolicySettingsProgressModal';
import DeleteWorkspaceFlow from './deleteWorkspace/DeleteWorkspaceFlow';

function isUserReimburserForPolicy(policies: Record<string, PolicyType | undefined> | undefined, policyID: string | undefined, userEmail: string | undefined): boolean {
    if (!policies || !policyID || !userEmail) {
        return false;
    }
    const policy = policies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    if (!policy) {
        return false;
    }
    return policy.achAccount?.reimburser === userEmail;
}

function WorkspacesListPage() {
    const tableRef = useRef<TableHandle<WorkspaceRowData, WorkspaceTableColumnKey, string>>(null);
    const icons = useMemoizedLazyExpensifyIcons(['Building', 'Exit', 'Copy', 'Star', 'Trashcan', 'Transfer', 'FallbackWorkspaceAvatar', 'Plus']);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    useDocumentTitle(translate('common.workspaces'));
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [allConnectionSyncProgresses] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const shouldShowLoadingIndicator = isLoadingApp && !isOffline;
    const route = useRoute<PlatformStackRouteProp<WorkspaceNavigatorParamList, typeof SCREENS.WORKSPACES_LIST>>();
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const {isBetaEnabled} = usePermissions();
    const {isRestrictedToPreferredPolicy, preferredPolicyID, isRestrictedPolicyCreation} = usePreferredPolicy();
    const [duplicateWorkspace] = useOnyx(ONYXKEYS.DUPLICATE_WORKSPACE);
    const {showConfirmModal} = useConfirmModal();
    const personalDetails = usePersonalDetails();

    // Primitive-valued subscriptions configuring the Delete menu item (popover behavior and the loading spinner)
    // before a deletion starts. The deletion itself is handled by DeleteWorkspaceFlow, mounted on demand below.
    const [canDowngrade] = useOnyx(ONYXKEYS.ACCOUNT, {selector: canDowngradeSelector});
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [isLoadingBill] = useOnyx(ONYXKEYS.IS_LOADING_BILL_WHEN_DOWNGRADE);
    const [ownedPaidPoliciesCounts] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createOwnedPaidPoliciesCountsSelector(currentUserPersonalDetails.accountID)}, [
        currentUserPersonalDetails.accountID,
    ]);
    const shouldCalculateBillNewDot = !!canDowngrade && ownedPaidPoliciesCounts?.total === 1;
    const wouldBlockDeletion = (amountOwed ?? 0) > 0 && ownedPaidPoliciesCounts?.active === 1;

    const [policyIDToDelete, setPolicyIDToDelete] = useState<string>();

    const confirmLeaveAndHideModal = (policyToLeave: PolicyType | undefined) => {
        if (!policyToLeave) {
            return;
        }

        leaveWorkspace(currentUserPersonalDetails.accountID, currentUserPersonalDetails?.email ?? '', policyToLeave);
    };

    const confirmModalPrompt = (policyToLeave: PolicyType | undefined) => {
        const exporters = getConnectionExporters(policyToLeave);
        const userEmail = currentUserPersonalDetails?.email ?? '';
        const policyOwnerDisplayName = personalDetails?.[policyToLeave?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID]?.displayName ?? '';
        const technicalContact = policyToLeave?.technicalContact;
        const isCurrentUserReimburser = isUserReimburserForPolicy(policies, policyToLeave?.id, userEmail);
        const isApprover = isPolicyApprover(policyToLeave, userEmail);

        if (isCurrentUserReimburser) {
            return translate('common.leaveWorkspaceReimburser');
        }

        if (technicalContact === userEmail) {
            return translate('common.leaveWorkspaceConfirmationTechContact', policyOwnerDisplayName);
        }

        if (exporters.some((exporter) => exporter === userEmail)) {
            return translate('common.leaveWorkspaceConfirmationExporter', policyOwnerDisplayName);
        }

        if (isApprover) {
            return translate('common.leaveWorkspaceConfirmationApprover', policyOwnerDisplayName);
        }

        if (isPolicyAdmin(policyToLeave)) {
            return translate('common.leaveWorkspaceConfirmationAdmin');
        }

        if (isPolicyAuditor(policyToLeave)) {
            return translate('common.leaveWorkspaceConfirmationAuditor');
        }

        return translate('common.leaveWorkspaceConfirmation');
    };

    const startChangeOwnershipFlow = (policyID: string | undefined) => {
        if (!policyID) {
            return;
        }

        clearWorkspaceOwnerChangeFlow(policyID);
        requestWorkspaceOwnerChange(policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`], currentUserPersonalDetails.accountID, currentUserPersonalDetails.login ?? '');
        Navigation.navigate(
            ROUTES.WORKSPACE_OWNER_CHANGE_CHECK.getRoute(
                policyID,
                currentUserPersonalDetails.accountID,
                'amountOwed' as ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>,
                Navigation.getActiveRoute(),
            ),
        );
    };

    const copySettingsEligibleTargets = useMemo(() => {
        const adminNonPersonal: string[] = [];
        const corporateOnly: string[] = [];
        if (!policies) {
            return {adminNonPersonal, corporateOnly};
        }
        for (const policy of Object.values(policies)) {
            if (!policy || policy.type === CONST.POLICY.TYPE.PERSONAL || !isPolicyAdmin(policy, session?.email) || isPendingDeletePolicy(policy)) {
                continue;
            }
            adminNonPersonal.push(policy.id);
            if (policy.type === CONST.POLICY.TYPE.CORPORATE) {
                corporateOnly.push(policy.id);
            }
        }
        return {adminNonPersonal, corporateOnly};
    }, [policies, session?.email]);

    /**
     * Gets the menu item for each workspace
     */
    const getThreeDotMenuItems = (item: WorkspaceRowData) => {
        const isDefault = activePolicyID === item.policyID;
        const isOwner = item.ownerAccountID === session?.accountID;
        const isAdmin = isPolicyAdmin(item as unknown as PolicyType, session?.email);

        const threeDotsMenuItems: PopoverMenuItem[] = [
            {
                icon: icons.Building,
                text: translate('workspace.common.goToWorkspace'),
                onSelected: item.action,
            },
        ];

        if (!isOwner && (item.policyID !== preferredPolicyID || !isRestrictedToPreferredPolicy)) {
            threeDotsMenuItems.push({
                icon: icons.Exit,
                text: translate('common.leave'),
                onSelected: callFunctionIfActionIsAllowed(() => {
                    close(() => {
                        const policyToLeave = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`];
                        const isReimburser = isUserReimburserForPolicy(policies, item.policyID, session?.email);

                        if (isReimburser) {
                            showConfirmModal({
                                title: translate('common.leaveWorkspace'),
                                prompt: confirmModalPrompt(policyToLeave),
                                confirmText: translate('common.buttonConfirm'),
                                success: true,
                                shouldShowCancelButton: false,
                            });
                            return;
                        }

                        showConfirmModal({
                            title: translate('common.leaveWorkspace'),
                            prompt: confirmModalPrompt(policyToLeave),
                            confirmText: translate('common.leaveWorkspace'),
                            cancelText: translate('common.cancel'),
                            danger: true,
                        }).then((result) => {
                            if (result.action !== ModalActions.CONFIRM) {
                                return;
                            }
                            confirmLeaveAndHideModal(policyToLeave);
                        });
                    });
                }),
            });
        }

        if (isAdmin) {
            threeDotsMenuItems.push({
                icon: icons.Plus,
                text: translate('workspace.common.duplicateWorkspace'),
                onSelected: () => (item.policyID ? Navigation.navigate(ROUTES.WORKSPACE_DUPLICATE.getRoute(item.policyID)) : undefined),
            });
            const isSourceCorporate = item.type === CONST.POLICY.TYPE.CORPORATE;
            const candidates = isSourceCorporate ? copySettingsEligibleTargets.corporateOnly : copySettingsEligibleTargets.adminNonPersonal;
            const hasEligibleCopyTarget = candidates.length > 1 || (candidates.length === 1 && candidates.at(0) !== item.policyID);

            if (hasEligibleCopyTarget && isBetaEnabled(CONST.BETAS.BULK_EDIT_WORKSPACES)) {
                threeDotsMenuItems.push({
                    icon: icons.Copy,
                    text: translate('workspace.copyPolicySettings.title'),
                    onSelected: () => {
                        if (!item.policyID) {
                            return;
                        }
                        clearCopyPolicySettings();
                        Navigation.navigate(ROUTES.POLICY_COPY_SETTINGS.getRoute(item.policyID));
                    },
                });
            }
        }

        if (!isDefault && !item?.isJoinRequestPending && !isRestrictedToPreferredPolicy) {
            threeDotsMenuItems.push({
                icon: icons.Star,
                text: translate('workspace.common.setAsDefault'),
                onSelected: () => {
                    if (!item.policyID || !activePolicyID) {
                        return;
                    }
                    setNameValuePair(ONYXKEYS.NVP_ACTIVE_POLICY_ID, item.policyID, activePolicyID);
                },
            });
        }
        if (isOwner) {
            threeDotsMenuItems.push({
                icon: icons.Trashcan,
                text: translate('workspace.common.delete'),
                shouldShowLoadingSpinnerIcon: !!isLoadingBill && policyIDToDelete === item.policyID,
                onSelected: () => {
                    if (isLoadingBill) {
                        return;
                    }

                    // All the pre-deletion checks and the confirmation modal are handled by DeleteWorkspaceFlow, which mounts when this is set.
                    setPolicyIDToDelete(item.policyID);
                },
                shouldKeepModalOpen: shouldCalculateBillNewDot && !wouldBlockDeletion,
                shouldCallAfterModalHide: !shouldCalculateBillNewDot || wouldBlockDeletion,
            });
        }

        if (isAdmin && !isOwner && shouldRenderTransferOwnerButton(fundList)) {
            threeDotsMenuItems.push({
                icon: icons.Transfer,
                text: translate('workspace.people.transferOwner'),
                onSelected: () => startChangeOwnershipFlow(item.policyID),
            });
        }

        return threeDotsMenuItems;
    };

    const navigateToWorkspace = (policyID: string, event?: ModifiedMouseEvent) => {
        const workspaceRoute = shouldUseNarrowLayout ? ROUTES.WORKSPACE_INITIAL.getRoute(policyID) : ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID);
        if (openInternalRouteInNewTab(workspaceRoute, event)) {
            return;
        }
        Navigation.navigate(workspaceRoute);
    };

    const {policiesWithCardFeedErrors} = usePoliciesWithCardFeedErrors();

    /**
     * Add free policies (workspaces) to the list of menu items and returns the list of menu items
     */
    const workspaceRows: WorkspaceRowData[] = [];

    if (!isEmptyObject(policies)) {
        const reimbursementAccountBrickRoadIndicator = !isEmptyObject(reimbursementAccount?.errors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;

        for (const policy of Object.values(policies)) {
            if (!policy || !shouldShowPolicy(policy, true, session?.email)) {
                continue;
            }

            const brickRoadIndicator = (() => {
                if (!isPolicyAdmin(policy, session?.email)) {
                    return undefined;
                }

                if (reimbursementAccountBrickRoadIndicator) {
                    return reimbursementAccountBrickRoadIndicator;
                }

                const receiptUberBrickRoadIndicator = getUberConnectionErrorDirectlyFromPolicy(policy as OnyxEntry<PolicyType>) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;

                if (receiptUberBrickRoadIndicator) {
                    return receiptUberBrickRoadIndicator;
                }

                if (policiesWithCardFeedErrors.find((p) => p.id === policy.id)) {
                    return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
                }

                if (shouldShowEmployeeListError(policy)) {
                    return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
                }

                if (isMergeHRCompleteSetupNeeded(policy)) {
                    return CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
                }

                return getPolicyBrickRoadIndicatorStatus(
                    policy,
                    isConnectionInProgress(allConnectionSyncProgresses?.[`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy.id}`], policy),
                );
            })();

            if (policy?.isJoinRequestPending && policy?.policyDetailsForNonMembers) {
                const policyID = Object.keys(policy.policyDetailsForNonMembers).at(0) ?? '';
                const policyInfo = Object.values(policy.policyDetailsForNonMembers).at(0) as PolicyDetailsForNonMembers;

                const policyOwnerAccountID = policyInfo.ownerAccountID;
                const ownerDetails = policyOwnerAccountID && getPersonalDetailsByIDs({accountIDs: [policyOwnerAccountID], currentUserAccountID: currentUserPersonalDetails.accountID}).at(0);

                const pendingWorkspaceRow: WorkspaceRowData = {
                    keyForList: policyID,
                    policyID,
                    disabled: true,
                    errors: undefined,
                    type: policyInfo.type,
                    title: policyInfo.name,
                    role: CONST.POLICY.ROLE.USER,
                    isDeleted: false,
                    isLoadingBill: !!isLoadingBill,
                    isJoinRequestPending: true,
                    isDefault: activePolicyID === policyID,
                    shouldAnimateInHighlight: duplicateWorkspace?.policyID === policyID,
                    ownerAccountID: policyOwnerAccountID,
                    ownerLogin: ownerDetails ? ownerDetails.login : undefined,
                    ownerAvatar: ownerDetails ? ownerDetails.avatar : undefined,
                    ownerName: ownerDetails ? getDisplayNameOrDefault(ownerDetails) : undefined,
                    iconType: policyInfo?.avatar ? CONST.ICON_TYPE_AVATAR : CONST.ICON_TYPE_ICON,
                    icon: policyInfo?.avatar ? policyInfo.avatar : getDefaultWorkspaceAvatar(policy.name),
                    action: () => null,
                    dismissError: () => null,
                };

                pendingWorkspaceRow.threeDotMenuItems = getThreeDotMenuItems(pendingWorkspaceRow);
                workspaceRows.push(pendingWorkspaceRow);
            } else {
                const policyOwnerAccountID = policy.ownerAccountID;
                const ownerDetails = policyOwnerAccountID && getPersonalDetailsByIDs({accountIDs: [policyOwnerAccountID], currentUserAccountID: currentUserPersonalDetails.accountID}).at(0);

                const workspaceRow: WorkspaceRowData = {
                    keyForList: policy.id,
                    policyID: policy.id,
                    disabled: policy.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    errors: policy.errors,
                    type: policy.type,
                    title: policy.name,
                    role: policy.role,
                    ownerAccountID: policyOwnerAccountID,
                    isLoadingBill: !!isLoadingBill,
                    isJoinRequestPending: false,
                    shouldAnimateInHighlight: duplicateWorkspace?.policyID === policy.id,
                    isDefault: activePolicyID === policy.id,
                    isDeleted: isPendingDeletePolicy(policy),
                    ownerLogin: ownerDetails ? ownerDetails.login : undefined,
                    ownerAvatar: ownerDetails ? ownerDetails.avatar : undefined,
                    ownerName: ownerDetails ? getDisplayNameOrDefault(ownerDetails) : undefined,
                    iconType: policy.avatarURL ? CONST.ICON_TYPE_AVATAR : CONST.ICON_TYPE_ICON,
                    icon: policy.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy.name),
                    brickRoadIndicator,
                    pendingAction: policy.pendingAction,
                    action: (event) => navigateToWorkspace(policy.id, event),
                    dismissError: () => dismissWorkspaceError(policy.id, policy.pendingAction),
                };

                workspaceRow.threeDotMenuItems = getThreeDotMenuItems(workspaceRow);
                workspaceRows.push(workspaceRow);
            }
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

    const headerButton = !isRestrictedPolicyCreation && !!workspaceRows.length && (
        <Button
            success
            accessibilityLabel={translate('common.new')}
            text={translate('common.new')}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.LIST.NEW_WORKSPACE_BUTTON}
            onPress={() => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_CONFIRMATION.getRoute(ROUTES.WORKSPACES_LIST.route)))}
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
