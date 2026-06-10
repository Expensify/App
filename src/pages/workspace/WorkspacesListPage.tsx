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
import useCardFeeds from '@hooks/useCardFeeds';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDocumentTitle from '@hooks/useDocumentTitle';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useOutstandingBalanceGuard from '@hooks/useOutstandingBalanceGuard';
import usePayAndDowngrade from '@hooks/usePayAndDowngrade';
import usePermissions from '@hooks/usePermissions';
import usePoliciesWithCardFeedErrors from '@hooks/usePoliciesWithCardFeedErrors';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolationOfWorkspace from '@hooks/useTransactionViolationOfWorkspace';
import {isConnectionInProgress} from '@libs/actions/connections';
import {close} from '@libs/actions/Modal';
import {clearCopyPolicySettings} from '@libs/actions/Policy/CopyPolicySettings';
import {clearWorkspaceOwnerChangeFlow, requestWorkspaceOwnerChange} from '@libs/actions/Policy/Member';
import {calculateBillNewDot, clearDeleteWorkspaceError, clearDuplicateWorkspace, clearErrors, deleteWorkspace, leaveWorkspace, removeWorkspace} from '@libs/actions/Policy/Policy';
import {callFunctionIfActionIsAllowed} from '@libs/actions/Session';
import {filterInactiveCards} from '@libs/CardUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
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
    shouldBlockWorkspaceDeletionForInvoicifyUser,
    shouldShowEmployeeListError,
    shouldShowPolicy,
} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import shouldRenderTransferOwnerButton from '@libs/shouldRenderTransferOwnerButton';
import {isSubscriptionTypeOfInvoicing, shouldCalculateBillNewDot as shouldCalculateBillNewDotFn} from '@libs/SubscriptionUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {setNameValuePair} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {accountIDToLoginSelector} from '@src/selectors/PersonalDetails';
import {ownerPoliciesSelector} from '@src/selectors/Policy';
import {reimbursementAccountErrorSelector} from '@src/selectors/ReimbursementAccount';
import type {Policy as PolicyType} from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {PolicyDetailsForNonMembers} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import CopyPolicySettingsProgressModal from './copyPolicySettings/CopyPolicySettingsProgressModal';

type GetWorkspaceMenuItem = {item: WorkspaceRowData; index: number};

/**
 * Dismisses the errors on one item
 */
function dismissWorkspaceError(policyID: string, pendingAction: OnyxCommon.PendingAction | undefined) {
    if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
        clearDeleteWorkspaceError(policyID);
        return;
    }

    if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        removeWorkspace(policyID);
        return;
    }

    clearErrors(policyID);
}

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
    const {translate, localeCompare} = useLocalize();
    useDocumentTitle(translate('common.workspaces'));
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const privateSubscription = usePrivateSubscription();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [allConnectionSyncProgresses] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
    const shouldShowLoadingIndicator = isLoadingApp && !isOffline;
    const route = useRoute<PlatformStackRouteProp<WorkspaceNavigatorParamList, typeof SCREENS.WORKSPACES_LIST>>();
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const {isBetaEnabled} = usePermissions();
    const {isRestrictedToPreferredPolicy, preferredPolicyID, isRestrictedPolicyCreation} = usePreferredPolicy();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [reimbursementAccountError] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {selector: reimbursementAccountErrorSelector});
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const [duplicateWorkspace] = useOnyx(ONYXKEYS.DUPLICATE_WORKSPACE);
    const {showConfirmModal, closeModal} = useConfirmModal();

    const ownedPaidPolicies = ownerPoliciesSelector(policies, currentUserPersonalDetails?.accountID);
    const activeOwnedPaidPoliciesCount = ownedPaidPolicies.filter((p) => !isPendingDeletePolicy(p)).length;
    const {shouldBlockDeletion, wouldBlockDeletion, outstandingBalanceModal} = useOutstandingBalanceGuard(activeOwnedPaidPoliciesCount);

    const [policyIDToDelete, setPolicyIDToDelete] = useState<string>();
    // Set when a non-billing delete is initiated. The confirmation modal is opened from an effect (not synchronously) so that
    // `policyIDToDelete` and all of its Onyx-derived data (card feeds, reports to archive, transaction violations, etc.) are
    // up to date for the selected workspace before the modal and the deleteWorkspace call are built.
    const [shouldShowDeleteConfirmModal, setShouldShowDeleteConfirmModal] = useState(false);
    const isErrorModalShowingRef = useRef(false);
    const {reportsToArchive, transactionViolations} = useTransactionViolationOfWorkspace(policyIDToDelete);

    const [loadingSpinnerIconIndex, setLoadingSpinnerIconIndex] = useState<number | null>(null);

    const policyToDelete = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyIDToDelete}`];

    // We need this to update translation for deleting a workspace when it has third party card feeds or expensify card assigned.
    const workspaceAccountID = policyToDelete?.policyAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [cardFeeds, , defaultCardFeeds] = useCardFeeds(policyIDToDelete);
    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyIDToDelete}`);
    const [lastSelectedExpensifyCardFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_FEED}${policyIDToDelete}`);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`, {
        selector: filterInactiveCards,
    });
    const [lastAccessedWorkspacePolicyID] = useOnyx(ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID);

    const hasCardFeedOrExpensifyCard =
        !isEmptyObject(cardFeeds) ||
        !isEmptyObject(cardsList) ||
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        ((policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyIDToDelete}`]?.areExpensifyCardsEnabled ||
            policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyIDToDelete}`]?.areCompanyCardsEnabled) &&
            policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyIDToDelete}`]?.policyAccountID);
    const hasExpensifyCard = !!policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyIDToDelete}`]?.areExpensifyCardsEnabled && !isEmptyObject(cardsList);
    const personalDetails = usePersonalDetails();
    const [accountIDToLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: accountIDToLoginSelector(reportsToArchive)});

    const policyToDeleteLatestErrorMessage = getLatestErrorMessage(policyToDelete);
    const isPendingDelete = isPendingDeletePolicy(policyToDelete);
    const hasDeleteWorkspaceExpensifyCardsError = !!hasExpensifyCard && !!isOffline;

    const prevIsPendingDeleteRef = useRef(isPendingDelete);
    // Always invoked after a re-render (from the effect below for normal deletes, or from usePayAndDowngrade for billed deletes),
    // so the workspace being deleted and its derived data are read from the latest state.
    const continueDeleteWorkspace = () => {
        const policyID = policyIDToDelete;
        const policyName = policyToDelete?.name;

        showConfirmModal({
            title: translate('workspace.common.delete'),
            prompt: hasCardFeedOrExpensifyCard ? translate('workspace.common.deleteWithCardsConfirmation') : translate('workspace.common.deleteConfirmation'),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            danger: true,
            isConfirmLoading: isPendingDelete,
        }).then((result) => {
            if (!policyID || !policyName || result.action !== ModalActions.CONFIRM) {
                return;
            }

            deleteWorkspace({
                policies,
                policyID,
                activePolicyID,
                policyName,
                lastAccessedWorkspacePolicyID,
                policyCardFeeds: defaultCardFeeds,
                lastSelectedFeed,
                lastSelectedExpensifyCardFeed,
                reportsToArchive,
                transactionViolations,
                reimbursementAccountError,
                lastUsedPaymentMethods: lastPaymentMethod,
                localeCompare,
                personalPolicyID,
                hasDeleteWorkspaceExpensifyCardsError,
                currentUserAccountID: currentUserPersonalDetails.accountID,
                accountIDToLogin: accountIDToLogin ?? {},
            });
            if (isOffline) {
                closeModal();
                if (!hasDeleteWorkspaceExpensifyCardsError) {
                    setPolicyIDToDelete(undefined);
                }
            }
        });
    };

    const {setIsDeletingPaidWorkspace, isLoadingBill} = usePayAndDowngrade(continueDeleteWorkspace);

    // Open the delete confirmation modal on the render after `policyIDToDelete` (and its derived data) have updated.
    useEffect(() => {
        if (!shouldShowDeleteConfirmModal) {
            return;
        }
        setShouldShowDeleteConfirmModal(false);
        continueDeleteWorkspace();
    }, [shouldShowDeleteConfirmModal, continueDeleteWorkspace]);

    const hideDeleteWorkspaceErrorModal = () => {
        setPolicyIDToDelete(undefined);
        if (!policyToDelete) {
            return;
        }
        dismissWorkspaceError(policyToDelete.id, policyToDelete.pendingAction);
    };

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

    const shouldCalculateBillNewDot: boolean = shouldCalculateBillNewDotFn(currentUserPersonalDetails.accountID, account?.canDowngrade, policies);

    useEffect(() => {
        const prevIsPendingDelete = prevIsPendingDeleteRef.current;
        prevIsPendingDeleteRef.current = isPendingDelete;

        // Handle showing error modal when offline and error occurs
        if (isOffline && policyToDeleteLatestErrorMessage) {
            if (isErrorModalShowingRef.current) {
                return;
            }
            isErrorModalShowingRef.current = true;
            showConfirmModal({
                title: translate('workspace.common.delete'),
                prompt: policyToDeleteLatestErrorMessage,
                confirmText: translate('common.buttonConfirm'),
                cancelText: translate('common.cancel'),
                success: false,
                shouldShowCancelButton: false,
            }).then(() => {
                isErrorModalShowingRef.current = false;
                hideDeleteWorkspaceErrorModal();
            });
            return;
        }

        if (!prevIsPendingDelete || isPendingDelete || !policyIDToDelete) {
            return;
        }
        closeModal();
        if (!isFocused || !policyToDeleteLatestErrorMessage) {
            return;
        }

        if (isErrorModalShowingRef.current) {
            return;
        }
        isErrorModalShowingRef.current = true;
        showConfirmModal({
            title: translate('workspace.common.delete'),
            prompt: policyToDeleteLatestErrorMessage,
            confirmText: translate('common.buttonConfirm'),
            cancelText: translate('common.cancel'),
            success: false,
            shouldShowCancelButton: false,
        }).then(() => {
            isErrorModalShowingRef.current = false;
            hideDeleteWorkspaceErrorModal();
        });
    }, [isOffline, hideDeleteWorkspaceErrorModal, showConfirmModal, translate, policyToDeleteLatestErrorMessage, isPendingDelete, isFocused, policyIDToDelete, closeModal]);

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
    const getThreeDotMenuItems = ({item, index}: GetWorkspaceMenuItem) => {
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
                shouldShowLoadingSpinnerIcon: loadingSpinnerIconIndex === index,
                onSelected: () => {
                    if (loadingSpinnerIconIndex !== null) {
                        return;
                    }

                    if (
                        shouldBlockWorkspaceDeletionForInvoicifyUser(
                            isSubscriptionTypeOfInvoicing(privateSubscription?.type),
                            policies,
                            item?.policyID,
                            currentUserPersonalDetails?.accountID,
                        )
                    ) {
                        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_DOWNGRADE_BLOCKED.getRoute(Navigation.getActiveRoute()));
                        return;
                    }

                    setPolicyIDToDelete(item.policyID);

                    if (shouldBlockDeletion()) {
                        return;
                    }

                    if (shouldCalculateBillNewDot) {
                        setIsDeletingPaidWorkspace(true);
                        calculateBillNewDot();
                        setLoadingSpinnerIconIndex(index);
                        return;
                    }

                    setShouldShowDeleteConfirmModal(true);
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

    const resetLoadingSpinnerIconIndex = () => {
        setLoadingSpinnerIconIndex(null);
    };

    const {policiesWithCardFeedErrors} = usePoliciesWithCardFeedErrors();

    /**
     * Add free policies (workspaces) to the list of menu items and returns the list of menu items
     */
    const workspaceRows: WorkspaceRowData[] = [];

    if (!isEmptyObject(policies)) {
        const reimbursementAccountBrickRoadIndicator = !isEmptyObject(reimbursementAccount?.errors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;

        for (const [index, policy] of Object.values(policies).entries()) {
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
                    resetLoadingSpinnerIconIndex,
                };

                pendingWorkspaceRow.threeDotMenuItems = getThreeDotMenuItems({item: pendingWorkspaceRow, index});
                workspaceRows.push(pendingWorkspaceRow);
            } else {
                const policyOwnerAccountID = policy.ownerAccountID;
                const ownerDetails = policyOwnerAccountID && getPersonalDetailsByIDs({accountIDs: [policyOwnerAccountID], currentUserAccountID: currentUserPersonalDetails.accountID}).at(0);

                const workspaceRow: WorkspaceRowData = {
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
                    resetLoadingSpinnerIconIndex,
                    action: (event) => navigateToWorkspace(policy.id, event),
                    dismissError: () => dismissWorkspaceError(policy.id, policy.pendingAction),
                };

                workspaceRow.threeDotMenuItems = getThreeDotMenuItems({item: workspaceRow, index});
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
        <WorkspaceListTable
            ref={tableRef}
            workspaces={workspaceRows}
        >
            <WorkspaceListLayout
                activeTabKey="workspaces"
                headerButton={headerButton}
                searchInput={!shouldShowLoadingIndicator && <WorkspaceListTable.SearchBar />}
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
                    <WorkspaceListTable.Content />
                )}
                {outstandingBalanceModal}
                <CopyPolicySettingsProgressModal />
            </WorkspaceListLayout>
        </WorkspaceListTable>
    );
}

export default WorkspacesListPage;
