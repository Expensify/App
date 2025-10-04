import {useIsFocused, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {FlatList, InteractionManager, View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import EmptyStateComponent from '@components/EmptyStateComponent';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import * as Expensicons from '@components/Icon/Expensicons';
import LottieAnimations from '@components/LottieAnimations';
import type {MenuItemProps} from '@components/MenuItem';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TopBar from '@components/Navigation/TopBar';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {PressableWithoutFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SearchBar from '@components/SearchBar';
import type {ListItem} from '@components/SelectionListWithSections/types';
import WorkspaceRowSkeleton from '@components/Skeletons/WorkspaceRowSkeleton';
import Text from '@components/Text';
import useCardFeeds from '@hooks/useCardFeeds';
import useHandleBackButton from '@hooks/useHandleBackButton';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePayAndDowngrade from '@hooks/usePayAndDowngrade';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchResults from '@hooks/useSearchResults';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isConnectionInProgress} from '@libs/actions/connections';
import {clearWorkspaceOwnerChangeFlow, requestWorkspaceOwnerChange} from '@libs/actions/Policy/Member';
import {calculateBillNewDot, clearDeleteWorkspaceError, clearDuplicateWorkspace, clearErrors, deleteWorkspace, leaveWorkspace, removeWorkspace} from '@libs/actions/Policy/Policy';
import {callFunctionIfActionIsAllowed} from '@libs/actions/Session';
import {filterInactiveCards} from '@libs/CardUtils';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import usePreloadFullScreenNavigators from '@libs/Navigation/AppNavigator/usePreloadFullScreenNavigators';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import {getDefaultApprover, getPolicy, getPolicyBrickRoadIndicatorStatus, getUberConnectionErrorDirectlyFromPolicy, isPolicyAdmin, shouldShowPolicy} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import shouldRenderTransferOwnerButton from '@libs/shouldRenderTransferOwnerButton';
import {shouldCalculateBillNewDot as shouldCalculateBillNewDotFn} from '@libs/SubscriptionUtils';
import type {AvatarSource} from '@libs/UserUtils';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import {setNameValuePair} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy as PolicyType} from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {PolicyDetailsForNonMembers} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import WorkspacesListRow from './WorkspacesListRow';

type WorkspaceItem = ListItem &
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

// eslint-disable-next-line react/no-unused-prop-types
type GetMenuItem = {item: WorkspaceItem; index: number};

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

function WorkspacesListPage() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate, localeCompare} = useLocalize();
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
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
    const {isRestrictedToPreferredPolicy} = usePreferredPolicy();

    // This hook preloads the screens of adjacent tabs to make changing tabs faster.
    usePreloadFullScreenNavigators();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [policyIDToDelete, setPolicyIDToDelete] = useState<string>();
    const [policyNameToDelete, setPolicyNameToDelete] = useState<string>();
    const {setIsDeletingPaidWorkspace, isLoadingBill}: {setIsDeletingPaidWorkspace: (value: boolean) => void; isLoadingBill: boolean | undefined} = usePayAndDowngrade(setIsDeleteModalOpen);

    const [loadingSpinnerIconIndex, setLoadingSpinnerIconIndex] = useState<number | null>(null);

    const isLessThanMediumScreen = isMediumScreenWidth || shouldUseNarrowLayout;

    const shouldDisplayLHB = !shouldUseNarrowLayout;

    // We need this to update translation for deleting a workspace when it has third party card feeds or expensify card assigned.
    const workspaceAccountID = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyIDToDelete}`]?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [cardFeeds, , defaultCardFeeds] = useCardFeeds(policyIDToDelete);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`, {
        selector: filterInactiveCards,
        canBeMissing: true,
    });
    const flatlistRef = useRef<FlatList | null>(null);
    const [lastAccessedWorkspacePolicyID] = useOnyx(ONYXKEYS.LAST_ACCESSED_WORKSPACE_POLICY_ID, {canBeMissing: true});

    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    const policyToDelete = getPolicy(policyIDToDelete);
    const hasCardFeedOrExpensifyCard =
        !isEmptyObject(cardFeeds) ||
        !isEmptyObject(cardsList) ||
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        ((policyToDelete?.areExpensifyCardsEnabled || policyToDelete?.areCompanyCardsEnabled) && policyToDelete?.workspaceAccountID);

    const confirmDeleteAndHideModal = () => {
        if (!policyIDToDelete || !policyNameToDelete) {
            return;
        }

        deleteWorkspace(policyIDToDelete, policyNameToDelete, lastAccessedWorkspacePolicyID, defaultCardFeeds, lastPaymentMethod);
        setIsDeleteModalOpen(false);
    };

    const shouldCalculateBillNewDot: boolean = shouldCalculateBillNewDotFn();

    const resetLoadingSpinnerIconIndex = useCallback(() => {
        setLoadingSpinnerIconIndex(null);
    }, []);

    const startChangeOwnershipFlow = useCallback(
        (policyID: string | undefined) => {
            if (!policyID) {
                return;
            }

            clearWorkspaceOwnerChangeFlow(policyID);
            requestWorkspaceOwnerChange(policyID);
            Navigation.navigate(
                ROUTES.WORKSPACE_OWNER_CHANGE_CHECK.getRoute(
                    policyID,
                    session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                    'amountOwed' as ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>,
                    Navigation.getActiveRoute(),
                ),
            );
        },
        [session?.accountID],
    );

    /**
     * Gets the menu item for each workspace
     */
    const getMenuItem = useCallback(
        ({item, index}: GetMenuItem) => {
            const isAdmin = isPolicyAdmin(item as unknown as PolicyType, session?.email);
            const isOwner = item.ownerAccountID === session?.accountID;
            const isDefault = activePolicyID === item.policyID;
            const shouldAnimateInHighlight = duplicateWorkspace?.policyID === item.policyID;

            const threeDotsMenuItems: PopoverMenuItem[] = [
                {
                    icon: Expensicons.Building,
                    text: translate('workspace.common.goToWorkspace'),
                    onSelected: item.action,
                },
            ];

            const defaultApprover = getDefaultApprover(policies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`]);
            if (!(isAdmin || isOwner) && defaultApprover !== session?.email) {
                threeDotsMenuItems.push({
                    icon: Expensicons.Exit,
                    text: translate('common.leave'),
                    onSelected: callFunctionIfActionIsAllowed(() => leaveWorkspace(item.policyID)),
                });
            }

            if (isAdmin) {
                threeDotsMenuItems.push({
                    icon: Expensicons.Copy,
                    text: translate('workspace.common.duplicateWorkspace'),
                    onSelected: () => (item.policyID ? Navigation.navigate(ROUTES.WORKSPACE_DUPLICATE.getRoute(item.policyID)) : undefined),
                });
            }

            if (!isDefault && !item?.isJoinRequestPending && !isRestrictedToPreferredPolicy) {
                threeDotsMenuItems.push({
                    icon: Expensicons.Star,
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
                    icon: Expensicons.Trashcan,
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

                        setIsDeleteModalOpen(true);
                    },
                    shouldKeepModalOpen: shouldCalculateBillNewDot,
                    shouldCallAfterModalHide: !shouldCalculateBillNewDot,
                });
            }

            if (isAdmin && !isOwner && shouldRenderTransferOwnerButton(fundList)) {
                threeDotsMenuItems.push({
                    icon: Expensicons.Transfer,
                    text: translate('workspace.people.transferOwner'),
                    onSelected: () => startChangeOwnershipFlow(item.policyID),
                });
            }

            return (
                <OfflineWithFeedback
                    key={`${item.title}_${index}`}
                    pendingAction={item.pendingAction}
                    errorRowStyles={styles.ph5}
                    onClose={item.dismissError}
                    errors={item.errors}
                    style={styles.mb2}
                    shouldShowErrorMessages={false}
                >
                    <PressableWithoutFeedback
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel="row"
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
                                style={[item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? styles.offlineFeedback.deleted : {}]}
                                isDefault={isDefault}
                                isLoadingBill={isLoadingBill}
                                resetLoadingSpinnerIconIndex={resetLoadingSpinnerIconIndex}
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
            styles.mb2,
            styles.mh5,
            styles.ph5,
            styles.hoveredComponentBG,
            styles.offlineFeedback.deleted,
            loadingSpinnerIconIndex,
            shouldCalculateBillNewDot,
            setIsDeletingPaidWorkspace,
            startChangeOwnershipFlow,
            isLessThanMediumScreen,
            isLoadingBill,
            resetLoadingSpinnerIconIndex,
            isRestrictedToPreferredPolicy,
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

    /**
     * Add free policies (workspaces) to the list of menu items and returns the list of menu items
     */
    const workspaces = useMemo(() => {
        const reimbursementAccountBrickRoadIndicator = !isEmptyObject(reimbursementAccount?.errors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;
        if (isEmptyObject(policies)) {
            return [];
        }

        return Object.values(policies)
            .filter((policy): policy is PolicyType => shouldShowPolicy(policy, isOffline, session?.email))
            .map((policy): WorkspaceItem => {
                const receiptUberBrickRoadIndicator = getUberConnectionErrorDirectlyFromPolicy(policy) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;

                if (policy?.isJoinRequestPending && policy?.policyDetailsForNonMembers) {
                    const policyInfo = Object.values(policy.policyDetailsForNonMembers).at(0) as PolicyDetailsForNonMembers;
                    const id = Object.keys(policy.policyDetailsForNonMembers).at(0);
                    return {
                        title: policyInfo.name,
                        icon: policyInfo?.avatar ? policyInfo.avatar : getDefaultWorkspaceAvatar(policy.name),
                        disabled: true,
                        ownerAccountID: policyInfo.ownerAccountID,
                        type: policyInfo.type,
                        iconType: policyInfo?.avatar ? CONST.ICON_TYPE_AVATAR : CONST.ICON_TYPE_ICON,
                        iconFill: theme.textLight,
                        fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                        policyID: id,
                        role: CONST.POLICY.ROLE.USER,
                        errors: undefined,
                        action: () => null,
                        dismissError: () => null,
                        isJoinRequestPending: true,
                    };
                }
                return {
                    title: policy.name,
                    icon: policy.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy.name),
                    action: () => navigateToWorkspace(policy.id),
                    brickRoadIndicator: !isPolicyAdmin(policy)
                        ? undefined
                        : (reimbursementAccountBrickRoadIndicator ??
                          receiptUberBrickRoadIndicator ??
                          getPolicyBrickRoadIndicatorStatus(
                              policy,
                              isConnectionInProgress(allConnectionSyncProgresses?.[`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy.id}`], policy),
                          )),
                    pendingAction: policy.pendingAction,
                    errors: policy.errors,
                    dismissError: () => dismissWorkspaceError(policy.id, policy.pendingAction),
                    disabled: policy.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    iconType: policy.avatarURL ? CONST.ICON_TYPE_AVATAR : CONST.ICON_TYPE_ICON,
                    iconFill: theme.textLight,
                    fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                    policyID: policy.id,
                    ownerAccountID: policy.ownerAccountID,
                    role: policy.role,
                    type: policy.type,
                    employeeList: policy.employeeList,
                };
            });
    }, [reimbursementAccount?.errors, policies, isOffline, session?.email, allConnectionSyncProgresses, theme.textLight, navigateToWorkspace]);

    const filterWorkspace = useCallback((workspace: WorkspaceItem, inputValue: string) => workspace.title.toLowerCase().includes(inputValue), []);
    const sortWorkspace = useCallback((workspaceItems: WorkspaceItem[]) => workspaceItems.sort((a, b) => localeCompare(a.title, b.title)), [localeCompare]);
    const [inputValue, setInputValue, filteredWorkspaces] = useSearchResults(workspaces, filterWorkspace, sortWorkspace);

    useEffect(() => {
        if (isEmptyObject(duplicateWorkspace) || !filteredWorkspaces.length || !isFocused) {
            return;
        }
        const duplicateWorkspaceIndex = filteredWorkspaces.findIndex((workspace) => workspace.policyID === duplicateWorkspace.policyID);
        if (duplicateWorkspaceIndex > 0) {
            flatlistRef.current?.scrollToIndex({index: duplicateWorkspaceIndex, animated: false});
            // eslint-disable-next-line deprecation/deprecation
            InteractionManager.runAfterInteractions(() => {
                clearDuplicateWorkspace();
            });
        }
    }, [duplicateWorkspace, isFocused, filteredWorkspaces]);

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
                    <View style={[styles.workspaceRightColumn, styles.mr2]} />
                </View>
            )}
        </>
    );

    const getHeaderButton = () => (
        <Button
            accessibilityLabel={translate('workspace.new.newWorkspace')}
            text={translate('workspace.new.newWorkspace')}
            onPress={() => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_CONFIRMATION.getRoute(ROUTES.WORKSPACES_LIST.route)))}
            icon={Expensicons.Plus}
            style={[shouldUseNarrowLayout && [styles.flexGrow1, styles.mb3]]}
        />
    );

    const onBackButtonPress = () => {
        Navigation.goBack(route.params?.backTo);
        return true;
    };

    useHandleBackButton(onBackButtonPress);

    if (isEmptyObject(workspaces)) {
        return (
            <ScreenWrapper
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
                testID={WorkspacesListPage.displayName}
                shouldShowOfflineIndicatorInWideScreen
                bottomContent={shouldUseNarrowLayout && <NavigationTabBar selectedTab={NAVIGATION_TABS.WORKSPACES} />}
                enableEdgeToEdgeBottomSafeAreaPadding={false}
            >
                <View style={styles.topBarWrapper}>
                    <TopBar breadcrumbLabel={translate('common.workspaces')} />
                </View>
                {shouldShowLoadingIndicator ? (
                    <View style={[styles.flex1]}>
                        <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={[styles.pt2, styles.flexGrow1, styles.flexShrink0]}>
                        <EmptyStateComponent
                            SkeletonComponent={WorkspaceRowSkeleton}
                            headerMediaType={CONST.EMPTY_STATE_MEDIA.ANIMATION}
                            headerMedia={LottieAnimations.WorkspacePlanet}
                            title={translate('workspace.emptyWorkspace.title')}
                            subtitle={translate('workspace.emptyWorkspace.subtitle')}
                            titleStyles={styles.pt2}
                            headerStyles={[styles.overflowHidden, StyleUtils.getBackgroundColorStyle(colors.pink800), StyleUtils.getHeight(variables.sectionIllustrationHeight)]}
                            lottieWebViewStyles={styles.emptyWorkspaceListIllustrationStyle}
                            headerContentStyles={styles.emptyWorkspaceListIllustrationStyle}
                            buttons={[
                                {
                                    success: true,
                                    buttonAction: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_CONFIRMATION.getRoute(ROUTES.WORKSPACES_LIST.route))),
                                    buttonText: translate('workspace.new.newWorkspace'),
                                },
                            ]}
                        />
                    </ScrollView>
                )}
                {shouldDisplayLHB && <NavigationTabBar selectedTab={NAVIGATION_TABS.WORKSPACES} />}
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID={WorkspacesListPage.displayName}
            enableEdgeToEdgeBottomSafeAreaPadding={false}
            bottomContent={shouldUseNarrowLayout && <NavigationTabBar selectedTab={NAVIGATION_TABS.WORKSPACES} />}
        >
            <View style={styles.flex1}>
                <TopBar breadcrumbLabel={translate('common.workspaces')}>{!shouldUseNarrowLayout && <View style={[styles.pr2]}>{getHeaderButton()}</View>}</TopBar>
                {shouldUseNarrowLayout && <View style={[styles.ph5, styles.pt2]}>{getHeaderButton()}</View>}
                <FlatList
                    ref={flatlistRef}
                    data={filteredWorkspaces}
                    onScrollToIndexFailed={(info) => {
                        flatlistRef.current?.scrollToOffset({
                            offset: info.averageItemLength * info.index,
                            animated: true,
                        });
                    }}
                    renderItem={getMenuItem}
                    ListHeaderComponent={listHeaderComponent}
                    keyboardShouldPersistTaps="handled"
                />
            </View>
            <ConfirmModal
                title={translate('workspace.common.delete')}
                isVisible={isDeleteModalOpen}
                onConfirm={confirmDeleteAndHideModal}
                onCancel={() => setIsDeleteModalOpen(false)}
                prompt={hasCardFeedOrExpensifyCard ? translate('workspace.common.deleteWithCardsConfirmation') : translate('workspace.common.deleteConfirmation')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
            />
            {shouldDisplayLHB && <NavigationTabBar selectedTab={NAVIGATION_TABS.WORKSPACES} />}
        </ScreenWrapper>
    );
}

WorkspacesListPage.displayName = 'WorkspacesListPage';

export default WorkspacesListPage;
