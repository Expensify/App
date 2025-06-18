import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo, useState} from 'react';
import {FlatList, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import type {FeatureListItem} from '@components/FeatureList';
import FeatureList from '@components/FeatureList';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
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
import type {ListItem} from '@components/SelectionList/types';
import SupportalActionRestrictedModal from '@components/SupportalActionRestrictedModal';
import Text from '@components/Text';
import useCardFeeds from '@hooks/useCardFeeds';
import useHandleBackButton from '@hooks/useHandleBackButton';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePayAndDowngrade from '@hooks/usePayAndDowngrade';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchResults from '@hooks/useSearchResults';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isConnectionInProgress} from '@libs/actions/connections';
import {calculateBillNewDot, clearDeleteWorkspaceError, clearErrors, deleteWorkspace, leaveWorkspace, removeWorkspace, updateDefaultPolicy} from '@libs/actions/Policy/Policy';
import {callFunctionIfActionIsAllowed, isSupportAuthToken} from '@libs/actions/Session';
import {filterInactiveCards} from '@libs/CardUtils';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import localeCompare from '@libs/LocaleCompare';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import {getPolicy, getPolicyBrickRoadIndicatorStatus, isPolicyAdmin, shouldShowPolicy} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import {shouldCalculateBillNewDot as shouldCalculateBillNewDotFn} from '@libs/SubscriptionUtils';
import type {AvatarSource} from '@libs/UserUtils';
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
        adminRoom?: string | null;
        announceRoom?: string | null;
        isJoinRequestPending?: boolean;
    };

// eslint-disable-next-line react/no-unused-prop-types
type GetMenuItem = {item: WorkspaceItem; index: number};

type ChatType = {
    adminRoom?: string | null;
    announceRoom?: string | null;
};

type ChatPolicyType = Record<string, ChatType>;

const workspaceFeatures: FeatureListItem[] = [
    {
        icon: Illustrations.MoneyReceipts,
        translationKey: 'workspace.emptyWorkspace.features.trackAndCollect',
    },
    {
        icon: Illustrations.CreditCardsNew,
        translationKey: 'workspace.emptyWorkspace.features.companyCards',
    },
    {
        icon: Illustrations.MoneyWings,
        translationKey: 'workspace.emptyWorkspace.features.reimbursements',
    },
];

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
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const [allConnectionSyncProgresses] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS, {canBeMissing: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: true});
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const shouldShowLoadingIndicator = isLoadingApp && !isOffline;
    const route = useRoute<PlatformStackRouteProp<AuthScreensParamList, typeof SCREENS.WORKSPACES_LIST>>();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [policyIDToDelete, setPolicyIDToDelete] = useState<string>();
    const [policyNameToDelete, setPolicyNameToDelete] = useState<string>();
    const {setIsDeletingPaidWorkspace, isLoadingBill}: {setIsDeletingPaidWorkspace: (value: boolean) => void; isLoadingBill: boolean | undefined} = usePayAndDowngrade(setIsDeleteModalOpen);

    const [loadingSpinnerIconIndex, setLoadingSpinnerIconIndex] = useState<number | null>(null);

    const isLessThanMediumScreen = isMediumScreenWidth || shouldUseNarrowLayout;

    const shouldDisplayLHB = !shouldUseNarrowLayout;

    // We need this to update translation for deleting a workspace when it has third party card feeds or expensify card assigned.
    const workspaceAccountID = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyIDToDelete}`]?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [cardFeeds] = useCardFeeds(policyIDToDelete);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`, {
        selector: filterInactiveCards,
        canBeMissing: true,
    });
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    const policyToDelete = getPolicy(policyIDToDelete);
    const hasCardFeedOrExpensifyCard =
        !isEmptyObject(cardFeeds) ||
        !isEmptyObject(cardsList) ||
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        ((policyToDelete?.areExpensifyCardsEnabled || policyToDelete?.areCompanyCardsEnabled) && policyToDelete?.workspaceAccountID);

    const isSupportalAction = isSupportAuthToken();

    const [isSupportalActionRestrictedModalOpen, setIsSupportalActionRestrictedModalOpen] = useState(false);
    const hideSupportalModal = () => {
        setIsSupportalActionRestrictedModalOpen(false);
    };
    const confirmDeleteAndHideModal = () => {
        if (!policyIDToDelete || !policyNameToDelete) {
            return;
        }

        deleteWorkspace(policyIDToDelete, policyNameToDelete);
        setIsDeleteModalOpen(false);
    };

    const shouldCalculateBillNewDot: boolean = shouldCalculateBillNewDotFn();

    const resetLoadingSpinnerIconIndex = useCallback(() => {
        setLoadingSpinnerIconIndex(null);
    }, []);

    /**
     * Gets the menu item for each workspace
     */
    const getMenuItem = useCallback(
        ({item, index}: GetMenuItem) => {
            const isAdmin = isPolicyAdmin(item as unknown as PolicyType, session?.email);
            const isOwner = item.ownerAccountID === session?.accountID;
            const isDefault = activePolicyID === item.policyID;
            // Menu options to navigate to the chat report of #admins and #announce room.
            // For navigation, the chat report ids may be unavailable due to the missing chat reports in Onyx.
            // In such cases, let us use the available chat report ids from the policy.
            const threeDotsMenuItems: PopoverMenuItem[] = [
                {
                    icon: Expensicons.Building,
                    text: translate('workspace.common.goToWorkspace'),
                    onSelected: item.action,
                },
            ];

            if (isOwner) {
                threeDotsMenuItems.push({
                    icon: Expensicons.Trashcan,
                    text: translate('workspace.common.delete'),
                    shouldShowLoadingSpinnerIcon: loadingSpinnerIconIndex === index,
                    onSelected: () => {
                        if (loadingSpinnerIconIndex !== null) {
                            return;
                        }

                        if (isSupportalAction) {
                            setIsSupportalActionRestrictedModalOpen(true);
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

            if (!(isAdmin || isOwner)) {
                threeDotsMenuItems.push({
                    icon: Expensicons.Exit,
                    text: translate('common.leave'),
                    onSelected: callFunctionIfActionIsAllowed(() => leaveWorkspace(item.policyID)),
                });
            }

            if (isAdmin && item.adminRoom) {
                threeDotsMenuItems.push({
                    icon: Expensicons.Hashtag,
                    text: translate('workspace.common.goToRoom', {roomName: CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}),
                    onSelected: () => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(item.adminRoom ?? '')),
                });
            }

            if (item.announceRoom) {
                threeDotsMenuItems.push({
                    icon: Expensicons.Hashtag,
                    text: translate('workspace.common.goToRoom', {roomName: CONST.REPORT.WORKSPACE_CHAT_ROOMS.ANNOUNCE}),
                    onSelected: () => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(item.announceRoom ?? '')),
                });
            }

            if (!isDefault && !item?.isJoinRequestPending) {
                threeDotsMenuItems.push({
                    icon: Expensicons.Star,
                    text: translate('workspace.common.setAsDefault'),
                    onSelected: () => updateDefaultPolicy(item.policyID, activePolicyID),
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
            isLessThanMediumScreen,
            styles.mb2,
            styles.mh5,
            styles.ph5,
            styles.hoveredComponentBG,
            translate,
            styles.offlineFeedback.deleted,
            session?.accountID,
            session?.email,
            activePolicyID,
            isSupportalAction,
            setIsDeletingPaidWorkspace,
            isLoadingBill,
            shouldCalculateBillNewDot,
            loadingSpinnerIconIndex,
            resetLoadingSpinnerIconIndex,
        ],
    );

    const policyRooms = useMemo(() => {
        if (!reports || isEmptyObject(reports)) {
            return;
        }

        return Object.values(reports).reduce<ChatPolicyType>((result, report) => {
            if (!report?.reportID || !report.policyID || report.parentReportID) {
                return result;
            }

            if (!result[report.policyID]) {
                // eslint-disable-next-line no-param-reassign
                result[report.policyID] = {};
            }

            switch (report.chatType) {
                case CONST.REPORT.CHAT_TYPE.POLICY_ADMINS:
                    // eslint-disable-next-line no-param-reassign
                    result[report.policyID].adminRoom = report.reportID;
                    break;
                case CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE:
                    // eslint-disable-next-line no-param-reassign
                    result[report.policyID].announceRoom = report.reportID;
                    break;
                default:
                    break;
            }

            return result;
        }, {});
    }, [reports]);

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
                    adminRoom: policyRooms?.[policy.id]?.adminRoom ?? policy.chatReportIDAdmins?.toString(),
                    announceRoom: policyRooms?.[policy.id]?.announceRoom ?? (policy.chatReportIDAnnounce ? policy.chatReportIDAnnounce?.toString() : ''),
                    ownerAccountID: policy.ownerAccountID,
                    role: policy.role,
                    type: policy.type,
                    employeeList: policy.employeeList,
                };
            });
    }, [reimbursementAccount?.errors, policies, isOffline, session?.email, allConnectionSyncProgresses, theme.textLight, policyRooms, navigateToWorkspace]);

    const filterWorkspace = useCallback((workspace: WorkspaceItem, inputValue: string) => workspace.title.toLowerCase().includes(inputValue), []);
    const sortWorkspace = useCallback((workspaceItems: WorkspaceItem[]) => workspaceItems.sort((a, b) => localeCompare(a.title, b.title)), []);
    const [inputValue, setInputValue, filteredWorkspaces] = useSearchResults(workspaces, filterWorkspace, sortWorkspace);

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
                <TopBar breadcrumbLabel={translate('common.workspaces')} />
                {shouldShowLoadingIndicator ? (
                    <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
                ) : (
                    <ScrollView
                        contentContainerStyle={styles.pt2}
                        addBottomSafeAreaPadding
                    >
                        <View style={[styles.flex1, isLessThanMediumScreen ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                            <FeatureList
                                menuItems={workspaceFeatures}
                                title={translate('workspace.emptyWorkspace.title')}
                                subtitle={translate('workspace.emptyWorkspace.subtitle')}
                                ctaText={translate('workspace.new.newWorkspace')}
                                ctaAccessibilityLabel={translate('workspace.new.newWorkspace')}
                                onCtaPress={() => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACE_CONFIRMATION.getRoute(ROUTES.WORKSPACES_LIST.route)))}
                                illustration={LottieAnimations.WorkspacePlanet}
                                // We use this style to vertically center the illustration, as the original illustration is not centered
                                illustrationStyle={styles.emptyWorkspaceIllustrationStyle}
                                titleStyles={styles.textHeadlineH1}
                            />
                        </View>
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
                    data={filteredWorkspaces}
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
            <SupportalActionRestrictedModal
                isModalOpen={isSupportalActionRestrictedModalOpen}
                hideSupportalModal={hideSupportalModal}
            />
            {shouldDisplayLHB && <NavigationTabBar selectedTab={NAVIGATION_TABS.WORKSPACES} />}
        </ScreenWrapper>
    );
}

WorkspacesListPage.displayName = 'WorkspacesListPage';

export default WorkspacesListPage;
