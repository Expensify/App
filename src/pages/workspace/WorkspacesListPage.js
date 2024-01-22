import PropTypes from 'prop-types';
import React, {useCallback, useMemo, useState} from 'react';
import {FlatList, ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import FeatureList from '@components/FeatureList';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithoutFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import policyMemberPropType from '@pages/policyMemberPropType';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import reportPropTypes from '@pages/reportPropTypes';
import * as App from '@userActions/App';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import WorkspacesListRow from './WorkspacesListRow';

const propTypes = {
    /** The list of this user's policies */
    policies: PropTypes.objectOf(
        PropTypes.shape({
            /** The ID of the policy */
            ID: PropTypes.string,

            /** The name of the policy */
            name: PropTypes.string,

            /** The type of the policy */
            type: PropTypes.string,

            /** The user's role in the policy */
            role: PropTypes.string,

            /** The current action that is waiting to happen on the policy */
            pendingAction: PropTypes.oneOf(_.values(CONST.RED_BRICK_ROAD_PENDING_ACTION)),
        }),
    ),

    /** Bank account attached to free plan */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes,

    /** A collection of objects for all policies which key policy member objects by accountIDs */
    allPolicyMembers: PropTypes.objectOf(PropTypes.objectOf(policyMemberPropType)),

    /** All reports shared with the user (coming from Onyx) */
    reports: PropTypes.objectOf(reportPropTypes),
};

const defaultProps = {
    policies: {},
    allPolicyMembers: {},
    reimbursementAccount: {},
    reports: {},
};

const workspaceFeatures = [
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
 *
 * @param {string} policyID
 * @param {string} pendingAction
 */
function dismissWorkspaceError(policyID, pendingAction) {
    if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
        Policy.clearDeleteWorkspaceError(policyID);
        return;
    }

    if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        Policy.removeWorkspace(policyID);
        return;
    }
    throw new Error('Not implemented');
}

function WorkspacesListPage({policies, allPolicyMembers, reimbursementAccount, reports}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {isSmallScreenWidth} = useWindowDimensions();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [policyIDToDelete, setPolicyIDToDelete] = useState(null);
    const [policyNameToDelete, setPolicyNameToDelete] = useState(null);

    const confirmDeleteAndHideModal = () => {
        Policy.deleteWorkspace(policyIDToDelete, [], policyNameToDelete);
        setIsDeleteModalOpen(false);
    };
    /**
     * Gets the menu item for each workspace
     *
     * @param {Object} item
     * @returns {JSX}
     */
    const getMenuItem = useCallback(
        ({item}) => {
            const threeDotsMenuItems = [
                // Check if the user is an admin of the workspace
                ...(item.role === CONST.POLICY.ROLE.ADMIN
                    ? [
                          {
                              icon: Expensicons.Trashcan,
                              text: translate('workspace.common.delete'),
                              onSelected: () => {
                                  setPolicyIDToDelete(item.policyID);
                                  setPolicyNameToDelete(item.title);
                                  setIsDeleteModalOpen(true);
                              },
                          },
                          {
                              icon: Expensicons.Hashtag,
                              text: translate('workspace.common.goToRoom', {roomName: CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}),
                              onSelected: () => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(item.adminRoom)),
                          },
                      ]
                    : []),
                {
                    icon: Expensicons.Hashtag,
                    text: translate('workspace.common.goToRoom', {roomName: CONST.REPORT.WORKSPACE_CHAT_ROOMS.ANNOUNCE}),
                    onSelected: () => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(item.announceRoom)),
                },
            ];

            return (
                <OfflineWithFeedback
                    key={`${item.policyID}`}
                    pendingAction={item.pendingAction}
                    errorRowStyles={styles.ph5}
                    onClose={item.dismissError}
                    errors={item.errors}
                >
                    <PressableWithoutFeedback
                        accessibilityRole="button"
                        style={[styles.mh5, styles.mb3]}
                        disabled={item.disabled}
                        onPress={() => item.action()}
                    >
                        <WorkspacesListRow
                            title={item.title}
                            menuItems={threeDotsMenuItems}
                            workspaceIcon={item.icon}
                            ownerAccountID={item.ownerAccountID}
                            workspaceType={item.type}
                            layoutWidth={isSmallScreenWidth ? CONST.LAYOUT_WIDTH.NARROW : CONST.LAYOUT_WIDTH.WIDE}
                        />
                    </PressableWithoutFeedback>
                </OfflineWithFeedback>
            );
        },
        [isSmallScreenWidth, styles.mb3, styles.mh5, styles.ph5, translate],
    );

    const listHeaderComponent = useCallback(() => {
        if (isSmallScreenWidth) {
            return <View style={styles.mt5} />;
        }

        return (
            <View style={[styles.flexRow, styles.gap5, styles.mh5, styles.mv5, styles.pl5]}>
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
                <View style={[styles.ml10, styles.mr2]} />
            </View>
        );
    }, [isSmallScreenWidth, styles, translate]);

    const policyRooms = useMemo(
        () =>
            _.reduce(
                reports,
                (result, report) => {
                    if (!report || !report.reportID || !report.policyID) {
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
                },
                {},
            ),
        [reports],
    );

    /**
     * Add free policies (workspaces) to the list of menu items and returns the list of menu items
     * @returns {Array} the menu item list
     */
    const workspaces = useMemo(() => {
        const reimbursementAccountBrickRoadIndicator = !_.isEmpty(reimbursementAccount.errors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
        return _.chain(policies)
            .filter((policy) => PolicyUtils.shouldShowPolicy(policy, isOffline))
            .map((policy) => ({
                title: policy.name,
                icon: policy.avatar ? policy.avatar : ReportUtils.getDefaultWorkspaceAvatar(policy.name),
                iconType: policy.avatar ? CONST.ICON_TYPE_AVATAR : CONST.ICON_TYPE_ICON,
                action: () => Navigation.navigate(ROUTES.WORKSPACE_INITIAL.getRoute(policy.id)),
                iconFill: theme.textLight,
                fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                brickRoadIndicator: reimbursementAccountBrickRoadIndicator || PolicyUtils.getPolicyBrickRoadIndicatorStatus(policy, allPolicyMembers),
                pendingAction: policy.pendingAction,
                errors: policy.errors,
                dismissError: () => dismissWorkspaceError(policy.id, policy.pendingAction),
                disabled: policy.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                policyID: policy.id,
                adminRoom: policyRooms[policy.id] ? policyRooms[policy.id].adminRoom : null,
                announceRoom: policyRooms[policy.id] ? policyRooms[policy.id].announceRoom : null,
                ownerAccountID: policy.ownerAccountID,
                role: policy.role,
            }))
            .sortBy((policy) => policy.title.toLowerCase())
            .value();
    }, [reimbursementAccount.errors, policies, isOffline, theme.textLight, allPolicyMembers, policyRooms]);

    if (_.isEmpty(workspaces)) {
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
                    shouldShowBackButton={isSmallScreenWidth}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.ALL_SETTINGS)}
                >
                    <Button
                        accessibilityLabel={translate('workspace.new.newWorkspace')}
                        success
                        medium
                        text={translate('workspace.new.newWorkspace')}
                        onPress={() => App.createWorkspaceWithPolicyDraftAndNavigateToIt()}
                    />
                </HeaderWithBackButton>
                <ScrollView contentContainerStyle={styles.pt3}>
                    <View style={[styles.flex1, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        <FeatureList
                            menuItems={workspaceFeatures}
                            title={translate('workspace.emptyWorkspace.title')}
                            subtitle={translate('workspace.emptyWorkspace.subtitle')}
                            ctaText={translate('workspace.new.newWorkspace')}
                            ctaAccessibilityLabel={translate('workspace.new.newWorkspace')}
                            onCtaPress={() => App.createWorkspaceWithPolicyDraftAndNavigateToIt()}
                            illustration={LottieAnimations.WorkspacePlanet}
                            illustrationBackgroundColor={theme.PAGE_THEMES[SCREENS.SETTINGS.WORKSPACES].backgroundColor}
                            // We use this style to vertically center the illustration, as the original illustration is not centered
                            illustrationStyle={styles.emptyWorkspaceIllustrationStyle}
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
        >
            <View style={styles.flex1}>
                <HeaderWithBackButton
                    title={translate('common.workspaces')}
                    shouldShowBackButton={isSmallScreenWidth}
                >
                    <Button
                        accessibilityLabel={translate('workspace.new.newWorkspace')}
                        success
                        medium
                        text={translate('workspace.new.newWorkspace')}
                        onPress={() => App.createWorkspaceWithPolicyDraftAndNavigateToIt()}
                    />
                </HeaderWithBackButton>
                <FlatList
                    data={workspaces}
                    renderItem={getMenuItem}
                    ListHeaderComponent={listHeaderComponent}
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

WorkspacesListPage.propTypes = propTypes;
WorkspacesListPage.defaultProps = defaultProps;
WorkspacesListPage.displayName = 'WorkspacesListPage';

export default compose(
    withPolicyAndFullscreenLoading,
    withOnyx({
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        allPolicyMembers: {
            key: ONYXKEYS.COLLECTION.POLICY_MEMBERS,
        },
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
    }),
)(WorkspacesListPage);
