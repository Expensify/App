import {useIsFocused, useRoute} from '@react-navigation/native';
import {Str} from 'expensify-common';
import React, {useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {FlatList, InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ConfirmModal from '@components/ConfirmModal';
import type {DomainItem} from '@components/Domain/DomainMenuItem';
import DomainMenuItem from '@components/Domain/DomainMenuItem';
import DomainsEmptyStateComponent from '@components/DomainsEmptyStateComponent';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import type {MenuItemProps} from '@components/MenuItem';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TopBar from '@components/Navigation/TopBar';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {PressableWithoutFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import type {ScrollViewProps} from '@components/ScrollView';
import SearchBar from '@components/SearchBar';
import type {ListItem} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import useCardFeeds from '@hooks/useCardFeeds';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHandleBackButton from '@hooks/useHandleBackButton';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePayAndDowngrade from '@hooks/usePayAndDowngrade';
import usePoliciesWithCardFeedErrors from '@hooks/usePoliciesWithCardFeedErrors';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchResults from '@hooks/useSearchResults';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolationOfWorkspace from '@hooks/useTransactionViolationOfWorkspace';
import {isConnectionInProgress} from '@libs/actions/connections';
import {close} from '@libs/actions/Modal';
import {clearWorkspaceOwnerChangeFlow, isApprover as isApproverUserAction, requestWorkspaceOwnerChange} from '@libs/actions/Policy/Member';
import {calculateBillNewDot, clearDeleteWorkspaceError, clearDuplicateWorkspace, clearErrors, deleteWorkspace, leaveWorkspace, removeWorkspace} from '@libs/actions/Policy/Policy';
import {callFunctionIfActionIsAllowed} from '@libs/actions/Session';
import {filterInactiveCards} from '@libs/CardUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import usePreloadFullScreenNavigators from '@libs/Navigation/AppNavigator/usePreloadFullScreenNavigators';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import {
    getConnectionExporters,
    getPolicyBrickRoadIndicatorStatus,
    getUberConnectionErrorDirectlyFromPolicy,
    getUserFriendlyWorkspaceType,
    isPendingDeletePolicy,
    isPolicyAdmin,
    isPolicyAuditor,
    shouldShowEmployeeListError,
    shouldShowPolicy,
} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import shouldRenderTransferOwnerButton from '@libs/shouldRenderTransferOwnerButton';
import {shouldCalculateBillNewDot as shouldCalculateBillNewDotFn} from '@libs/SubscriptionUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import {setNameValuePair} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {reimbursementAccountErrorSelector} from '@src/selectors/ReimbursementAccount';
import type {Policy as PolicyType} from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {PolicyDetailsForNonMembers} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import WorkspacesEmptyStateComponent from './WorkspacesEmptyStateComponent';
import WorkspacesListPageHeaderButton from './WorkspacesListPageHeaderButton';
import WorkspacesListRow from './WorkspacesListRow';

type WorkspaceItem = {listItemType: 'workspace'} & ListItem &
    Required<Pick<MenuItemProps, 'title' | 'disabled'>> &
    Pick<MenuItemProps, 'brickRoadIndicator' | 'iconFill' | 'fallbackIcon'> &
    Pick<OfflineWithFeedbackProps, 'errors' | 'pendingAction'> &
    Pick<PolicyType, 'role' | 'type' | 'ownerAccountID' | 'employeeList'> & {
        icon: AvatarSource;
        action: () => void;
        dismissError: () => void;
        iconType?: ValueOf<typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_ICON>;
        policyID?: string;
        isJoinRequestPending?: boolean;
    };

type WorkspaceOrDomainListItem = WorkspaceItem | DomainItem | {listItemType: 'domains-header' | 'workspaces-empty-state' | 'domains-empty-state'};

type GetWorkspaceMenuItem = {item: WorkspaceItem; index: number};

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
    const icons = useMemoizedLazyExpensifyIcons(['Building', 'Exit', 'Copy', 'Star', 'Trashcan', 'Transfer', 'FallbackWorkspaceAvatar']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Building', 'Exit', 'Copy', 'Star', 'Trashcan', 'Transfer', 'Plus', 'FallbackWorkspaceAvatar']);
    const {translate, localeCompare} = useLocalize();
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [allConnectionSyncProgresses] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS, {canBeMissing: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {canBeMissing: true});
    const shouldShowLoadingIndicator = isLoadingApp && !isOffline;
    const route = useRoute<PlatformStackRouteProp<AuthScreensParamList, typeof SCREENS.WORKSPACES_LIST>>();
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST, {canBeMissing: true});
    const [duplicateWorkspace] = useOnyx(ONYXKEYS.DUPLICATE_WORKSPACE, {canBeMissing: true});
    const {isRestrictedToPreferredPolicy, preferredPolicyID, isRestrictedPolicyCreation} = usePreferredPolicy();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [reimbursementAccountError] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: true, selector: reimbursementAccountErrorSelector});

    const [allDomains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN, {canBeMissing: false});
    const [allDomainErrors] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN_ERRORS, {canBeMissing: true});
    const [adminAccess] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_ADMIN_ACCESS, {canBeMissing: false});
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID, {canBeMissing: true});

    // This hook preloads the screens of adjacent tabs to make changing tabs faster.
    usePreloadFullScreenNavigators();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleteWorkspaceErrorModalOpen, setIsDeleteWorkspaceErrorModalOpen] = useState(false);
    const [policyIDToDelete, setPolicyIDToDelete] = useState<string>();
    // The workspace was deleted in this page
    const [policyNameToDelete, setPolicyNameToDelete] = useState<string>();
    const continueDeleteWorkspace = useCallback(() => {
        setIsDeleteModalOpen(true);
    }, []);
    const {reportsToArchive, transactionViolations} = useTransactionViolationOfWorkspace(policyIDToDelete);
    const {setIsDeletingPaidWorkspace, isLoadingBill}: {setIsDeletingPaidWorkspace: (value: boolean) => void; isLoadingBill: boolean | undefined} =
        usePayAndDowngrade(continueDeleteWorkspace);

    const [loadingSpinnerIconIndex, setLoadingSpinnerIconIndex] = useState<number | null>(null);

    const isLessThanMediumScreen = isMediumScreenWidth || shouldUseNarrowLayout;

    const shouldDisplayLHB = !shouldUseNarrowLayout;

    const policyToDelete = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyIDToDelete}`];

    const {saveScrollOffset, getScrollOffset} = useContext(ScrollOffsetContext);
    const onScroll = useCallback<NonNullable<ScrollViewProps['onScroll']>>(
        (e) => {
            // If the layout measurement is 0, it means the flash list is not displayed but the onScroll may be triggered with offset value 0.
            // We should ignore this case.
            if (e.nativeEvent.layoutMeasurement.height === 0) {
                return;
            }
            saveScrollOffset(route, e.nativeEvent.contentOffset.y);
        },
        [route, saveScrollOffset],
    );
    const flatlistRef = useRef<FlatList | null>(null);
    useLayoutEffect(() => {
        const scrollOffset = getScrollOffset(route);
        if (!scrollOffset || !flatlistRef.current) {
            return;
        }
        flatlistRef.current?.scrollToOffset({
            offset: scrollOffset,
            animated: false,
        });
    }, [getScrollOffset, route]);

    // We need this to update translation for deleting a workspace when it has third party card feeds or expensify card assigned.
    const workspaceAccountID = policyToDelete?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [cardFeeds, , defaultCardFeeds] = useCardFeeds(policyIDToDelete);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`, {
        selector: filterInactiveCards,
        canBeMissing: true,
    });
    const [lastAccessedWorkspacePolicyID] = useOnyx(ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID, {canBeMissing: true});

    const prevPolicyToDelete = usePrevious(policyToDelete);
    const hasCardFeedOrExpensifyCard =
        !isEmptyObject(cardFeeds) ||
        !isEmptyObject(cardsList) ||
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        ((policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyIDToDelete}`]?.areExpensifyCardsEnabled ||
            policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyIDToDelete}`]?.areCompanyCardsEnabled) &&
            policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyIDToDelete}`]?.workspaceAccountID);

    const personalDetails = usePersonalDetails();
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [isCannotLeaveWorkspaceModalOpen, setIsCannotLeaveWorkspaceModalOpen] = useState(false);
    const [policyIDToLeave, setPolicyIDToLeave] = useState<string>();
    const policyToLeave = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyIDToLeave}`];

    const policyToDeleteLatestErrorMessage = getLatestErrorMessage(policyToDelete);
    const isPendingDelete = isPendingDeletePolicy(policyToDelete);
    const prevIsPendingDelete = isPendingDeletePolicy(prevPolicyToDelete);

    const confirmDelete = () => {
        if (!policyIDToDelete || !policyNameToDelete) {
            return;
        }

        deleteWorkspace({
            policyID: policyIDToDelete,
            activePolicyID,
            policyName: policyNameToDelete,
            lastAccessedWorkspacePolicyID,
            policyCardFeeds: defaultCardFeeds,
            reportsToArchive,
            transactionViolations,
            reimbursementAccountError,
            bankAccountList,
            lastUsedPaymentMethods: lastPaymentMethod,
            localeCompare,
            personalPolicyID,
        });
        if (isOffline) {
            setIsDeleteModalOpen(false);
            setPolicyIDToDelete(undefined);
            setPolicyNameToDelete(undefined);
        }
    };

    const hideDeleteWorkspaceErrorModal = () => {
        setIsDeleteWorkspaceErrorModalOpen(false);
        setPolicyIDToDelete(undefined);
        if (!policyToDelete) {
            return;
        }
        dismissWorkspaceError(policyToDelete.id, policyToDelete.pendingAction);
    };

    const confirmLeaveAndHideModal = () => {
        if (!policyIDToLeave) {
            return;
        }

        leaveWorkspace(policyIDToLeave);
        setIsLeaveModalOpen(false);
    };

    const confirmModalPrompt = () => {
        const exporters = getConnectionExporters(policyToLeave);
        const policyOwnerDisplayName = personalDetails?.[policyToLeave?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID]?.displayName ?? '';
        const technicalContact = policyToLeave?.technicalContact;
        const isCurrentUserReimburser = isUserReimburserForPolicy(policies, policyIDToLeave, session?.email);
        const userEmail = session?.email ?? '';
        const isApprover = isApproverUserAction(policyToLeave, userEmail);

        if (isCurrentUserReimburser) {
            return translate('common.leaveWorkspaceReimburser');
        }

        if (technicalContact === userEmail) {
            return translate('common.leaveWorkspaceConfirmationTechContact', {
                workspaceOwner: policyOwnerDisplayName,
            });
        }

        if (exporters.some((exporter) => exporter === userEmail)) {
            return translate('common.leaveWorkspaceConfirmationExporter', {
                workspaceOwner: policyOwnerDisplayName,
            });
        }

        if (isApprover) {
            return translate('common.leaveWorkspaceConfirmationApprover', {
                workspaceOwner: policyOwnerDisplayName,
            });
        }

        if (isPolicyAdmin(policyToLeave)) {
            return translate('common.leaveWorkspaceConfirmationAdmin');
        }

        if (isPolicyAuditor(policyToLeave)) {
            return translate('common.leaveWorkspaceConfirmationAuditor');
        }

        return translate('common.leaveWorkspaceConfirmation');
    };

    const shouldCalculateBillNewDot: boolean = shouldCalculateBillNewDotFn(account?.canDowngrade);

    const resetLoadingSpinnerIconIndex = useCallback(() => {
        setLoadingSpinnerIconIndex(null);
    }, []);

    const startChangeOwnershipFlow = useCallback(
        (policyID: string | undefined) => {
            if (!policyID) {
                return;
            }

            clearWorkspaceOwnerChangeFlow(policyID);
            requestWorkspaceOwnerChange(policyID, currentUserPersonalDetails.accountID, currentUserPersonalDetails.login ?? '');
            Navigation.navigate(
                ROUTES.WORKSPACE_OWNER_CHANGE_CHECK.getRoute(
                    policyID,
                    currentUserPersonalDetails.accountID,
                    'amountOwed' as ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>,
                    Navigation.getActiveRoute(),
                ),
            );
        },
        [currentUserPersonalDetails.accountID, currentUserPersonalDetails.login],
    );

    useEffect(() => {
        if (!prevIsPendingDelete || isPendingDelete || !policyIDToDelete) {
            return;
        }
        setIsDeleteModalOpen(false);
        if (!isFocused || !policyToDeleteLatestErrorMessage) {
            return;
        }
        setIsDeleteWorkspaceErrorModalOpen(true);
    }, [isPendingDelete, prevIsPendingDelete, isFocused, policyToDeleteLatestErrorMessage, policyIDToDelete]);

    /**
     * Gets the menu item for each workspace
     */
    const getWorkspaceMenuItem = useCallback(
        ({item, index}: GetWorkspaceMenuItem) => {
            const isAdmin = isPolicyAdmin(item as unknown as PolicyType, session?.email);
            const isOwner = item.ownerAccountID === session?.accountID;
            const isDefault = activePolicyID === item.policyID;
            const shouldAnimateInHighlight = duplicateWorkspace?.policyID === item.policyID;

            const threeDotsMenuItems: PopoverMenuItem[] = [
                {
                    icon: expensifyIcons.Building,
                    text: translate('workspace.common.goToWorkspace'),
                    onSelected: item.action,
                },
            ];

            if (!isOwner && (item.policyID !== preferredPolicyID || !isRestrictedToPreferredPolicy)) {
                threeDotsMenuItems.push({
                    icon: expensifyIcons.Exit,
                    text: translate('common.leave'),
                    onSelected: callFunctionIfActionIsAllowed(() => {
                        close(() => {
                            const isReimburser = isUserReimburserForPolicy(policies, item.policyID, session?.email);

                            setPolicyIDToLeave(item.policyID);

                            if (isReimburser) {
                                setIsCannotLeaveWorkspaceModalOpen(true);
                                return;
                            }

                            setIsLeaveModalOpen(true);
                        });
                    }),
                });
            }

            if (isAdmin) {
                threeDotsMenuItems.push({
                    icon: icons.Copy,
                    text: translate('workspace.common.duplicateWorkspace'),
                    onSelected: () => (item.policyID ? Navigation.navigate(ROUTES.WORKSPACE_DUPLICATE.getRoute(item.policyID)) : undefined),
                });
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

                        setPolicyIDToDelete(item.policyID);
                        setPolicyNameToDelete(item.title);

                        if (shouldCalculateBillNewDot) {
                            setIsDeletingPaidWorkspace(true);
                            calculateBillNewDot();
                            setLoadingSpinnerIconIndex(index);
                            return;
                        }

                        continueDeleteWorkspace();
                    },
                    shouldKeepModalOpen: shouldCalculateBillNewDot,
                    shouldCallAfterModalHide: !shouldCalculateBillNewDot,
                });
            }

            if (isAdmin && !isOwner && shouldRenderTransferOwnerButton(fundList)) {
                threeDotsMenuItems.push({
                    icon: icons.Transfer,
                    text: translate('workspace.people.transferOwner'),
                    onSelected: () => startChangeOwnershipFlow(item.policyID),
                });
            }

            const ownerDisplayName = personalDetails?.[item.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID]?.displayName ?? '';
            const workspaceType = item.type ? getUserFriendlyWorkspaceType(item.type, translate) : '';
            const accessibilityLabel = [
                `${translate('workspace.common.workspace')}: ${item.title}`,
                isDefault ? translate('common.default') : '',
                `${translate('workspace.common.workspaceOwner')}: ${ownerDisplayName}`,
                `${translate('workspace.common.workspaceType')}: ${workspaceType}`,
            ]
                .filter(Boolean)
                .join(', ');

            return (
                <OfflineWithFeedback
                    key={`${item.title}_${index}`}
                    pendingAction={item.pendingAction}
                    errorRowStyles={[styles.ph5, styles.mt3]}
                    onClose={item.dismissError}
                    errors={item.errors}
                    style={styles.mb2}
                    shouldShowErrorMessages={item.policyID !== policyIDToDelete}
                    shouldHideOnDelete={false}
                >
                    <PressableWithoutFeedback
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={accessibilityLabel}
                        style={[styles.mh5]}
                        disabled={item.disabled}
                        onPress={item.action}
                    >
                        {({hovered}) => (
                            <WorkspacesListRow
                                title={item.title}
                                policyID={item.policyID}
                                menuItems={threeDotsMenuItems}
                                workspaceIcon={item.icon}
                                ownerAccountID={item.ownerAccountID}
                                workspaceType={item.type}
                                shouldAnimateInHighlight={shouldAnimateInHighlight}
                                isJoinRequestPending={item?.isJoinRequestPending}
                                rowStyles={hovered && styles.hoveredComponentBG}
                                layoutWidth={isLessThanMediumScreen ? CONST.LAYOUT_WIDTH.NARROW : CONST.LAYOUT_WIDTH.WIDE}
                                brickRoadIndicator={item.brickRoadIndicator}
                                shouldDisableThreeDotsMenu={item.disabled}
                                style={[item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? styles.offlineFeedbackDeleted : {}]}
                                isDefault={isDefault}
                                isLoadingBill={isLoadingBill}
                                resetLoadingSpinnerIconIndex={resetLoadingSpinnerIconIndex}
                                isHovered={hovered}
                            />
                        )}
                    </PressableWithoutFeedback>
                </OfflineWithFeedback>
            );
        },
        [
            session?.email,
            session?.accountID,
            activePolicyID,
            duplicateWorkspace?.policyID,
            translate,
            policies,
            fundList,
            styles,
            loadingSpinnerIconIndex,
            shouldCalculateBillNewDot,
            setIsDeletingPaidWorkspace,
            startChangeOwnershipFlow,
            isLessThanMediumScreen,
            isLoadingBill,
            resetLoadingSpinnerIconIndex,
            continueDeleteWorkspace,
            isRestrictedToPreferredPolicy,
            policyIDToDelete,
            preferredPolicyID,
            icons,
            expensifyIcons.Building,
            expensifyIcons.Exit,
            personalDetails,
        ],
    );

    const navigateToWorkspace = useCallback(
        (policyID: string) => {
            // On the wide layout, we always want to open the Profile page when opening workspace settings from the list
            if (shouldUseNarrowLayout) {
                Navigation.navigate(ROUTES.WORKSPACE_INITIAL.getRoute(policyID));
                return;
            }
            Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID));
        },
        [shouldUseNarrowLayout],
    );

    const navigateToDomain = useCallback(({domainAccountID, isAdmin}: {domainAccountID: number; isAdmin: boolean}) => {
        if (!isAdmin) {
            return Navigation.navigate(ROUTES.WORKSPACES_DOMAIN_ACCESS_RESTRICTED.getRoute(domainAccountID));
        }
        Navigation.navigate(ROUTES.DOMAIN_INITIAL.getRoute(domainAccountID));
    }, []);

    const {policiesWithCardFeedErrors} = usePoliciesWithCardFeedErrors();

    /**
     * Add free policies (workspaces) to the list of menu items and returns the list of menu items
     */
    const workspaces = useMemo(() => {
        const reimbursementAccountBrickRoadIndicator = !isEmptyObject(reimbursementAccount?.errors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;
        if (isEmptyObject(policies)) {
            return [];
        }

        return Object.values(policies)
            .filter((policy): policy is PolicyType => shouldShowPolicy(policy, true, session?.email))
            .map((policy): WorkspaceItem => {
                const receiptUberBrickRoadIndicator = getUberConnectionErrorDirectlyFromPolicy(policy as OnyxEntry<PolicyType>) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;

                let brickRoadIndicator: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined;
                if (isPolicyAdmin(policy, session?.email)) {
                    const indicator = reimbursementAccountBrickRoadIndicator ?? receiptUberBrickRoadIndicator;

                    if (indicator) {
                        brickRoadIndicator = indicator;
                    } else if (policiesWithCardFeedErrors.find((p) => p.id === policy.id)) {
                        brickRoadIndicator = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
                    } else if (shouldShowEmployeeListError(policy)) {
                        brickRoadIndicator = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
                    } else {
                        brickRoadIndicator = getPolicyBrickRoadIndicatorStatus(
                            policy,
                            isConnectionInProgress(allConnectionSyncProgresses?.[`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy.id}`], policy),
                        );
                    }
                }

                if (policy?.isJoinRequestPending && policy?.policyDetailsForNonMembers) {
                    const policyInfo = Object.values(policy.policyDetailsForNonMembers).at(0) as PolicyDetailsForNonMembers;
                    const id = Object.keys(policy.policyDetailsForNonMembers).at(0);
                    return {
                        listItemType: 'workspace',
                        title: policyInfo.name,
                        icon: policyInfo?.avatar ? policyInfo.avatar : getDefaultWorkspaceAvatar(policy.name),
                        disabled: true,
                        ownerAccountID: policyInfo.ownerAccountID,
                        type: policyInfo.type,
                        iconType: policyInfo?.avatar ? CONST.ICON_TYPE_AVATAR : CONST.ICON_TYPE_ICON,
                        iconFill: theme.textLight,
                        fallbackIcon: icons.FallbackWorkspaceAvatar,
                        policyID: id,
                        role: CONST.POLICY.ROLE.USER,
                        errors: undefined,
                        action: () => null,
                        dismissError: () => null,
                        isJoinRequestPending: true,
                    };
                }
                return {
                    listItemType: 'workspace',
                    title: policy.name,
                    icon: policy.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy.name),
                    action: () => navigateToWorkspace(policy.id),
                    brickRoadIndicator,
                    pendingAction: policy.pendingAction,
                    errors: policy.errors,
                    dismissError: () => dismissWorkspaceError(policy.id, policy.pendingAction),
                    disabled: policy.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    iconType: policy.avatarURL ? CONST.ICON_TYPE_AVATAR : CONST.ICON_TYPE_ICON,
                    iconFill: theme.textLight,
                    fallbackIcon: icons.FallbackWorkspaceAvatar,
                    policyID: policy.id,
                    ownerAccountID: policy.ownerAccountID,
                    role: policy.role,
                    type: policy.type,
                    employeeList: policy.employeeList,
                };
            });
    }, [
        reimbursementAccount?.errors,
        policies,
        session?.email,
        theme.textLight,
        icons.FallbackWorkspaceAvatar,
        policiesWithCardFeedErrors,
        allConnectionSyncProgresses,
        navigateToWorkspace,
    ]);

    const filterWorkspace = useCallback((workspace: WorkspaceItem, inputValue: string) => workspace.title.toLowerCase().includes(inputValue), []);
    const sortWorkspace = useCallback((workspaceItems: WorkspaceItem[]) => workspaceItems.sort((a, b) => localeCompare(a.title, b.title)), [localeCompare]);
    const [inputValue, setInputValue, filteredWorkspaces] = useSearchResults(workspaces, filterWorkspace, sortWorkspace);

    const domains = useMemo(() => {
        if (!allDomains) {
            return [];
        }

        return Object.values(allDomains).reduce<DomainItem[]>((domainItems, domain) => {
            if (!domain || !domain.accountID || !domain.email) {
                return domainItems;
            }
            const isAdmin = !!adminAccess?.[`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_ADMIN_ACCESS}${domain.accountID}`];
            domainItems.push({
                listItemType: 'domain',
                accountID: domain.accountID,
                title: Str.extractEmailDomain(domain.email),
                action: () => navigateToDomain({domainAccountID: domain.accountID, isAdmin}),
                isAdmin,
                isValidated: domain.validated,
                pendingAction: domain.pendingAction,
                errors: allDomainErrors?.[`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domain.accountID}`]?.errors,
            });

            return domainItems;
        }, []);
    }, [allDomains, allDomainErrors, adminAccess, navigateToDomain]);

    useEffect(() => {
        const duplicatedWSPolicyID = duplicateWorkspace?.policyID;
        if (!duplicatedWSPolicyID || !filteredWorkspaces.length || !isFocused) {
            return;
        }
        const duplicateWorkspaceIndex = filteredWorkspaces.findIndex((workspace) => workspace.policyID === duplicatedWSPolicyID);
        if (duplicateWorkspaceIndex >= 0) {
            flatlistRef.current?.scrollToIndex({index: duplicateWorkspaceIndex, animated: false});
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                clearDuplicateWorkspace();
            });
        }
    }, [duplicateWorkspace?.policyID, isFocused, filteredWorkspaces]);

    const listHeaderComponent = (
        <>
            {isLessThanMediumScreen && <View style={styles.mt3} />}
            {workspaces.length > CONST.SEARCH_ITEM_LIMIT && (
                <SearchBar
                    label={translate('workspace.common.findWorkspace')}
                    inputValue={inputValue}
                    onChangeText={setInputValue}
                    shouldShowEmptyState={filteredWorkspaces.length === 0 && inputValue.length > 0}
                />
            )}
            {!isLessThanMediumScreen && filteredWorkspaces.length > 0 && (
                <View style={[styles.flexRow, styles.gap5, styles.pt2, styles.pb3, styles.pr5, styles.pl10, styles.appBG]}>
                    <View style={[styles.flexRow, styles.flex2]}>
                        <Text
                            numberOfLines={1}
                            style={[styles.flexGrow1, styles.textLabelSupporting]}
                        >
                            {translate('workspace.common.workspaceName')}
                        </Text>
                    </View>
                    <View style={[styles.flexRow, styles.flex1, styles.workspaceOwnerSectionTitle, styles.workspaceOwnerSectionMinWidth]}>
                        <Text
                            numberOfLines={1}
                            style={[styles.flexGrow1, styles.textLabelSupporting]}
                        >
                            {translate('workspace.common.workspaceOwner')}
                        </Text>
                    </View>
                    <View style={[styles.flexRow, styles.flex1, styles.workspaceTypeSectionTitle]}>
                        <Text
                            numberOfLines={1}
                            style={[styles.flexGrow1, styles.textLabelSupporting]}
                        >
                            {translate('workspace.common.workspaceType')}
                        </Text>
                    </View>
                    <View style={[styles.workspaceRightColumn, styles.mr7]} />
                </View>
            )}
        </>
    );

    const headerButton = (
        <WorkspacesListPageHeaderButton
            shouldShowNewWorkspaceButton={!isRestrictedPolicyCreation && (!!domains.length || !!workspaces.length)}
            shouldShowNewDomainButton={!!domains.length}
        />
    );

    const onBackButtonPress = () => {
        Navigation.goBack(route.params?.backTo);
        return true;
    };

    useHandleBackButton(onBackButtonPress);

    const data: WorkspaceOrDomainListItem[] = useMemo(() => {
        const shouldShowDomainsSection = !inputValue.trim().length;

        return [
            // workspaces empty state
            !workspaces.length ? [{listItemType: 'workspaces-empty-state' as const}] : [],
            // workspaces
            filteredWorkspaces,
            // domains header and domains
            shouldShowDomainsSection ? [{listItemType: 'domains-header' as const}, ...domains] : [],
            // domains empty state
            shouldShowDomainsSection && !domains.length ? [{listItemType: 'domains-empty-state' as const}] : [],
        ].flat();
    }, [domains, filteredWorkspaces, workspaces.length, inputValue]);

    const renderItem = useCallback(
        // eslint-disable-next-line react/no-unused-prop-types
        ({item, index}: {item: WorkspaceOrDomainListItem; index: number}) => {
            switch (item.listItemType) {
                case 'workspace': {
                    return getWorkspaceMenuItem({item, index});
                }
                case 'domain': {
                    return (
                        <DomainMenuItem
                            item={item}
                            index={index}
                        />
                    );
                }
                case 'domains-header': {
                    return (
                        <View style={[styles.optionsListSectionHeader, styles.justifyContentCenter, styles.ph5, styles.pv3, styles.mt0, styles.mb0]}>
                            <Text style={[styles.ph5, styles.textLabelSupporting]}>{translate('common.domains')}</Text>
                        </View>
                    );
                }
                case 'workspaces-empty-state': {
                    return <WorkspacesEmptyStateComponent />;
                }
                case 'domains-empty-state': {
                    return <DomainsEmptyStateComponent />;
                }
                default:
                    return null;
            }
        },
        [getWorkspaceMenuItem, styles, translate],
    );

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID="WorkspacesListPage"
            enableEdgeToEdgeBottomSafeAreaPadding={false}
            bottomContent={
                shouldUseNarrowLayout && (
                    <NavigationTabBar
                        selectedTab={NAVIGATION_TABS.WORKSPACES}
                        shouldShowFloatingButtons={false}
                    />
                )
            }
        >
            <View style={styles.flex1}>
                <TopBar breadcrumbLabel={translate('common.workspaces')}>{!shouldUseNarrowLayout && <View style={styles.pr2}>{headerButton}</View>}</TopBar>
                {shouldUseNarrowLayout && <View style={[styles.ph5, styles.pt2]}>{headerButton}</View>}
                {shouldShowLoadingIndicator ? (
                    <View style={[styles.flex1]}>
                        <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
                    </View>
                ) : (
                    <FlatList
                        ref={flatlistRef}
                        data={data}
                        onScrollToIndexFailed={(info) => {
                            flatlistRef.current?.scrollToOffset({
                                offset: info.averageItemLength * info.index,
                                animated: true,
                            });
                        }}
                        renderItem={renderItem}
                        ListHeaderComponent={listHeaderComponent}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.pb20}
                        onScroll={onScroll}
                        // Render all items on first mount to restore scroll position correctly.
                        // Lists are small, so this won’t impact performance.
                        initialNumToRender={data.length}
                    />
                )}
            </View>
            <ConfirmModal
                title={translate('workspace.common.delete')}
                isVisible={isDeleteModalOpen}
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                prompt={hasCardFeedOrExpensifyCard ? translate('workspace.common.deleteWithCardsConfirmation') : translate('workspace.common.deleteConfirmation')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                isConfirmLoading={isPendingDelete}
                danger
            />
            <ConfirmModal
                title={translate('common.leaveWorkspace')}
                isVisible={isLeaveModalOpen}
                onConfirm={confirmLeaveAndHideModal}
                onCancel={() => setIsLeaveModalOpen(false)}
                prompt={confirmModalPrompt()}
                confirmText={translate('common.leaveWorkspace')}
                cancelText={translate('common.cancel')}
                danger
            />
            <ConfirmModal
                title={translate('common.leaveWorkspace')}
                isVisible={isCannotLeaveWorkspaceModalOpen}
                onConfirm={() => setIsCannotLeaveWorkspaceModalOpen(false)}
                prompt={confirmModalPrompt()}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
                success
            />
            <ConfirmModal
                title={translate('workspace.common.delete')}
                isVisible={isDeleteWorkspaceErrorModalOpen}
                onConfirm={hideDeleteWorkspaceErrorModal}
                onCancel={hideDeleteWorkspaceErrorModal}
                prompt={policyToDeleteLatestErrorMessage}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
                success={false}
            />
            {shouldDisplayLHB && <NavigationTabBar selectedTab={NAVIGATION_TABS.WORKSPACES} />}
        </ScreenWrapper>
    );
}

export default WorkspacesListPage;
