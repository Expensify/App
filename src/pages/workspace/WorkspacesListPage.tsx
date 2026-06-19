import {useIsFocused, useRoute} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
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
import usePoliciesWithCardFeedErrors from '@hooks/usePoliciesWithCardFeedErrors';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isConnectionInProgress} from '@libs/actions/connections';
import {clearDuplicateWorkspace, dismissWorkspaceError} from '@libs/actions/Policy/Policy';
import {isMergeHRCompleteSetupNeeded} from '@libs/HRUtils';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import openInternalRouteInNewTab from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {WorkspaceNavigatorParamList} from '@libs/Navigation/types';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {
    getPolicyBrickRoadIndicatorStatus,
    getUberConnectionErrorDirectlyFromPolicy,
    isPendingDeletePolicy,
    isPolicyAdmin,
    shouldShowEmployeeListError,
    shouldShowPolicy,
} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {createDisplayDetailsByAccountIDsSelector} from '@src/selectors/PersonalDetails';
import type {CopySettingsEligibleTargets} from '@src/selectors/Policy';
import {createCopySettingsEligibleTargetsSelector} from '@src/selectors/Policy';
import type {Policy as PolicyType} from '@src/types/onyx';
import type {PolicyDetailsForNonMembers} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
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
    const [allConnectionSyncProgresses] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const shouldShowLoadingIndicator = isLoadingApp && !isOffline;
    const route = useRoute<PlatformStackRouteProp<WorkspaceNavigatorParamList, typeof SCREENS.WORKSPACES_LIST>>();
    const {isRestrictedPolicyCreation} = usePreferredPolicy();
    const [duplicateWorkspace] = useOnyx(ONYXKEYS.DUPLICATE_WORKSPACE);

    // Light projection of the policy collection passed down to the row menus, which compute their copy-settings
    // eligibility from it. Kept at the page level so it is evaluated once per policy write instead of once per row.
    const [copySettingsEligibleTargets] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createCopySettingsEligibleTargetsSelector(session?.email)}, [session?.email]);

    const [policyIDToDelete, setPolicyIDToDelete] = useState<string>();

    // Narrow subscription keeping the owner name/avatar columns reactive without re-rendering the page
    // when anything else in the personal details list changes.
    const ownerAccountIDs: number[] = [];
    if (!isEmptyObject(policies)) {
        const uniqueOwnerAccountIDs = new Set<number>();
        for (const policy of Object.values(policies)) {
            if (!policy || !shouldShowPolicy(policy, true, session?.email)) {
                continue;
            }
            const ownerAccountID =
                policy.isJoinRequestPending && policy.policyDetailsForNonMembers ? Object.values(policy.policyDetailsForNonMembers).at(0)?.ownerAccountID : policy.ownerAccountID;
            if (ownerAccountID) {
                uniqueOwnerAccountIDs.add(ownerAccountID);
            }
        }
        ownerAccountIDs.push(...uniqueOwnerAccountIDs);
    }
    const [ownerDisplayDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: createDisplayDetailsByAccountIDsSelector(ownerAccountIDs)}, [policies, session?.email]);

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
                const ownerDetails = policyOwnerAccountID ? ownerDisplayDetails?.[policyOwnerAccountID] : undefined;

                const pendingWorkspaceRow: WorkspaceRowData = {
                    keyForList: policyID,
                    policyID,
                    disabled: true,
                    errors: undefined,
                    type: policyInfo.type,
                    title: policyInfo.name,
                    role: CONST.POLICY.ROLE.USER,
                    isDeleted: false,
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

                workspaceRows.push(pendingWorkspaceRow);
            } else {
                const policyOwnerAccountID = policy.ownerAccountID;
                const ownerDetails = policyOwnerAccountID ? ownerDisplayDetails?.[policyOwnerAccountID] : undefined;

                const workspaceRow: WorkspaceRowData = {
                    keyForList: policy.id,
                    policyID: policy.id,
                    disabled: policy.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    errors: policy.errors,
                    type: policy.type,
                    title: policy.name,
                    role: policy.role,
                    ownerAccountID: policyOwnerAccountID,
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
