import React, {useCallback, useMemo, useState} from 'react';
import {FlatList, View} from 'react-native';
import {useOnyx, withOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import FeatureList from '@components/FeatureList';
import type {FeatureListItem} from '@components/FeatureList';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import type {MenuItemProps} from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {PressableWithoutFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isConnectionInProgress} from '@libs/actions/connections';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import localeCompare from '@libs/LocaleCompare';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import type {AvatarSource} from '@libs/UserUtils';
import * as App from '@userActions/App';
import * as Policy from '@userActions/Policy/Policy';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy as PolicyType, ReimbursementAccount, Report, Session as SessionType} from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import WorkspacesListRow from './WorkspacesListRow';

type WorkspaceItem = Required<Pick<MenuItemProps, 'title' | 'disabled'>> &
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

type WorkspaceListPageOnyxProps = {
    /** The list of this user's policies */
    policies: OnyxCollection<PolicyType>;

    /** Bank account attached to free plan */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** All reports shared with the user (coming from Onyx) */
    reports: OnyxCollection<Report>;

    /** Session info for the currently logged in user. */
    session: OnyxEntry<SessionType>;
};

type WorkspaceListPageProps = WorkspaceListPageOnyxProps;

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
        Policy.clearDeleteWorkspaceError(policyID);
        return;
    }

    if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        Policy.removeWorkspace(policyID);
        return;
    }

    Policy.clearErrors(policyID);
}

const stickyHeaderIndices = [0];

function WorkspacesListPage({policies, reimbursementAccount, reports, session}: WorkspaceListPageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const [allConnectionSyncProgresses] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS);

    const {activeWorkspaceID, setActiveWorkspaceID} = useActiveWorkspace();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [policyIDToDelete, setPolicyIDToDelete] = useState<string>();
    const [policyNameToDelete, setPolicyNameToDelete] = useState<string>();
    const isLessThanMediumScreen = isMediumScreenWidth || shouldUseNarrowLayout;

    const confirmDeleteAndHideModal = () => {
        if (!policyIDToDelete || !policyNameToDelete) {
            return;
        }

        Policy.deleteWorkspace(policyIDToDelete, policyNameToDelete);
        setIsDeleteModalOpen(false);

        // If the workspace being deleted is the active workspace, switch to the "All Workspaces" view
        if (activeWorkspaceID === policyIDToDelete) {
            setActiveWorkspaceID(undefined);
            Navigation.navigateWithSwitchPolicyID({policyID: undefined});
        }
    };

    /**
     * Gets the menu item for each workspace
     */
    const getMenuItem = useCallback(
        ({item, index}: GetMenuItem) => {
            const isAdmin = PolicyUtils.isPolicyAdmin(item as unknown as PolicyType, session?.email);
            const isOwner = item.ownerAccountID === session?.accountID;
            // Menu options to navigate to the chat report of #admins and #announce room.
            // For navigation, the chat report ids may be unavailable due to the missing chat reports in Onyx.
            // In such cases, let us use the available chat report ids from the policy.
            const threeDotsMenuItems: PopoverMenuItem[] = [];

            if (isOwner) {
                threeDotsMenuItems.push({
                    icon: Expensicons.Trashcan,
                    text: translate('workspace.common.delete'),
                    onSelected: () => {
                        setPolicyIDToDelete(item.policyID ?? '-1');
                        setPolicyNameToDelete(item.title);
                        setIsDeleteModalOpen(true);
                    },
                    shouldCallAfterModalHide: true,
                });
            }

            if (!(isAdmin || isOwner)) {
                threeDotsMenuItems.push({
                    icon: Expensicons.Exit,
                    text: translate('common.leave'),
                    onSelected: Session.checkIfActionIsAllowed(() => Policy.leaveWorkspace(item.policyID ?? '-1')),
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

            return (
                <OfflineWithFeedback
                    key={`${item.title}_${index}`}
                    pendingAction={item.pendingAction}
                    errorRowStyles={styles.ph5}
                    onClose={item.dismissError}
                    errors={item.errors}
                    style={styles.mb3}
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
                            />
                        )}
                    </PressableWithoutFeedback>
                </OfflineWithFeedback>
            );
        },
        [isLessThanMediumScreen, styles.mb3, styles.mh5, styles.ph5, styles.hoveredComponentBG, translate, styles.offlineFeedback.deleted, session?.accountID, session?.email],
    );

    const listHeaderComponent = useCallback(() => {
        if (isLessThanMediumScreen) {
            return <View style={styles.mt5} />;
        }

        return (
            <View style={[styles.flexRow, styles.gap5, styles.p5, styles.pl10, styles.appBG]}>
                <View style={[styles.flexRow, styles.flex1]}>
                    <Text
                        numberOfLines={1}
                        style={[styles.flexGrow1, styles.textLabelSupporting]}
                    >
                        {translate('workspace.common.workspaceName')}
                    </Text>
                </View>
                <View style={[styles.flexRow, styles.flex1, styles.workspaceOwnerSectionTitle]}>
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
        );
    }, [isLessThanMediumScreen, styles, translate]);

    const policyRooms = useMemo(() => {
        if (!reports || isEmptyObject(reports)) {
            return;
        }

        return Object.values(reports).reduce<ChatPolicyType>((result, report) => {
            if (!report?.reportID || !report.policyID) {
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

    /**
     * Add free policies (workspaces) to the list of menu items and returns the list of menu items
     */
    const workspaces = useMemo(() => {
        const reimbursementAccountBrickRoadIndicator = !isEmptyObject(reimbursementAccount?.errors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;
        if (isEmptyObject(policies)) {
            return [];
        }

        return Object.values(policies)
            .filter((policy): policy is PolicyType => PolicyUtils.shouldShowPolicy(policy, !!isOffline, session?.email))
            .map((policy): WorkspaceItem => {
                if (policy?.isJoinRequestPending && policy?.policyDetailsForNonMembers) {
                    const policyInfo = Object.values(policy.policyDetailsForNonMembers)[0];
                    const id = Object.keys(policy.policyDetailsForNonMembers)[0];
                    return {
                        title: policyInfo.name,
                        icon: policyInfo.avatar ? policyInfo.avatar : ReportUtils.getDefaultWorkspaceAvatar(policy.name),
                        disabled: true,
                        ownerAccountID: policyInfo.ownerAccountID,
                        type: policyInfo.type,
                        iconType: policyInfo.avatar ? CONST.ICON_TYPE_AVATAR : CONST.ICON_TYPE_ICON,
                        iconFill: theme.textLight,
                        fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                        policyID: id,
                        role: CONST.POLICY.ROLE.USER,
                        errors: null,
                        action: () => null,
                        dismissError: () => null,
                        isJoinRequestPending: true,
                    };
                }
                return {
                    title: policy.name,
                    icon: policy.avatarURL ? policy.avatarURL : ReportUtils.getDefaultWorkspaceAvatar(policy.name),
                    action: () => Navigation.navigate(ROUTES.WORKSPACE_INITIAL.getRoute(policy.id)),
                    brickRoadIndicator:
                        reimbursementAccountBrickRoadIndicator ??
                        PolicyUtils.getPolicyBrickRoadIndicatorStatus(
                            policy,
                            isConnectionInProgress(allConnectionSyncProgresses?.[`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy.id}`], policy),
                        ),
                    pendingAction: policy.pendingAction,
                    errors: policy.errors,
                    dismissError: () => dismissWorkspaceError(policy.id, policy.pendingAction),
                    disabled: policy.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    iconType: policy.avatarURL ? CONST.ICON_TYPE_AVATAR : CONST.ICON_TYPE_ICON,
                    iconFill: theme.textLight,
                    fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                    policyID: policy.id,
                    adminRoom: policyRooms?.[policy.id]?.adminRoom ?? policy.chatReportIDAdmins?.toString(),
                    announceRoom: policyRooms?.[policy.id]?.announceRoom ?? policy.chatReportIDAnnounce?.toString(),
                    ownerAccountID: policy.ownerAccountID,
                    role: policy.role,
                    type: policy.type,
                    employeeList: policy.employeeList,
                };
            })
            .sort((a, b) => localeCompare(a.title, b.title));
    }, [reimbursementAccount?.errors, policies, isOffline, theme.textLight, policyRooms, session?.email, allConnectionSyncProgresses]);

    const getHeaderButton = () => (
        <Button
            accessibilityLabel={translate('workspace.new.newWorkspace')}
            success
            medium
            text={translate('workspace.new.newWorkspace')}
            onPress={() => interceptAnonymousUser(() => App.createWorkspaceWithPolicyDraftAndNavigateToIt())}
            icon={Expensicons.Plus}
            style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}
        />
    );

    if (isEmptyObject(workspaces)) {
        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
                testID={WorkspacesListPage.displayName}
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton
                    title={translate('common.workspaces')}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={() => Navigation.goBack()}
                    icon={Illustrations.BigRocket}
                >
                    {!shouldUseNarrowLayout && getHeaderButton()}
                </HeaderWithBackButton>
                {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5]}>{getHeaderButton()}</View>}
                <ScrollView contentContainerStyle={styles.pt3}>
                    <View style={[styles.flex1, isLessThanMediumScreen ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        <FeatureList
                            menuItems={workspaceFeatures}
                            title={translate('workspace.emptyWorkspace.title')}
                            subtitle={translate('workspace.emptyWorkspace.subtitle')}
                            ctaText={translate('workspace.new.newWorkspace')}
                            ctaAccessibilityLabel={translate('workspace.new.newWorkspace')}
                            onCtaPress={() => interceptAnonymousUser(() => App.createWorkspaceWithPolicyDraftAndNavigateToIt())}
                            illustration={LottieAnimations.WorkspacePlanet}
                            // We use this style to vertically center the illustration, as the original illustration is not centered
                            illustrationStyle={styles.emptyWorkspaceIllustrationStyle}
                            titleStyles={styles.textHeadlineH1}
                        />
                    </View>
                </ScrollView>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID={WorkspacesListPage.displayName}
        >
            <View style={styles.flex1}>
                <HeaderWithBackButton
                    title={translate('common.workspaces')}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={() => Navigation.goBack()}
                    icon={Illustrations.BigRocket}
                >
                    {!shouldUseNarrowLayout && getHeaderButton()}
                </HeaderWithBackButton>
                {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5]}>{getHeaderButton()}</View>}
                <FlatList
                    data={workspaces}
                    renderItem={getMenuItem}
                    ListHeaderComponent={listHeaderComponent}
                    stickyHeaderIndices={stickyHeaderIndices}
                />
            </View>
            <ConfirmModal
                title={translate('workspace.common.delete')}
                isVisible={isDeleteModalOpen}
                onConfirm={confirmDeleteAndHideModal}
                onCancel={() => setIsDeleteModalOpen(false)}
                prompt={translate('workspace.common.deleteConfirmation')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
            />
        </ScreenWrapper>
    );
}

WorkspacesListPage.displayName = 'WorkspacesListPage';

export default withOnyx<WorkspaceListPageProps, WorkspaceListPageOnyxProps>({
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
})(WorkspacesListPage);
