import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {useState} from 'react';
import {View, ScrollView, Pressable} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import Tooltip from '../../components/Tooltip';
import Text from '../../components/Text';
import ConfirmModal from '../../components/ConfirmModal';
import * as Expensicons from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import MenuItem from '../../components/MenuItem';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import compose from '../../libs/compose';
import Avatar from '../../components/Avatar';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import withPolicy, {policyPropTypes, policyDefaultProps} from './withPolicy';
import reportPropTypes from '../reportPropTypes';
import * as Policy from '../../libs/actions/Policy';
import * as PolicyUtils from '../../libs/PolicyUtils';
import CONST from '../../CONST';
import * as ReimbursementAccount from '../../libs/actions/ReimbursementAccount';
import ONYXKEYS from '../../ONYXKEYS';
import OfflineWithFeedback from '../../components/OfflineWithFeedback';
import * as ReportUtils from '../../libs/ReportUtils';

const propTypes = {
    ...policyPropTypes,
    ...withLocalizePropTypes,

    /** All reports shared with the user (coming from Onyx) */
    reports: PropTypes.objectOf(reportPropTypes),

};

const defaultProps = {
    ...policyDefaultProps,
};
const WorkspaceInitialPage = (props) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const hasPolicyCreationError = Boolean(props.policy.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && props.policy.errors);

    /**
     * Open Workspace Editor
     */
    function openEditor() {
        Navigation.navigate(ROUTES.getWorkspaceSettingsRoute(props.policy.id));
    }

    /**
     * Call the delete policy and hide the modal
     */
    function confirmDeleteAndHideModal() {
        const policyReports = _.filter(props.reports, report => report && report.policyID === props.policy.id);
        Policy.deleteWorkspace(props.policy.id, policyReports, props.policy.name);
        setIsDeleteModalOpen(false);
        Navigation.navigate(ROUTES.SETTINGS_WORKSPACES);
    }

    function dismissError() {
        Navigation.navigate(ROUTES.SETTINGS_WORKSPACES);
        Policy.removeWorkspace(props.policy.id);
    }

    const policy = props.policy;
    const policyName = lodashGet(props.policy, 'name', '');
    const hasMembersError = PolicyUtils.hasPolicyMemberError(props.policyMemberList);
    const hasGeneralSettingsError = !_.isEmpty(lodashGet(props.policy, 'errorFields.generalSettings', {}))
        || !_.isEmpty(lodashGet(props.policy, 'errorFields.avatar', {}));
    const hasCustomUnitsError = PolicyUtils.hasCustomUnitsError(props.policy);
    const menuItems = [
        {
            translationKey: 'workspace.common.settings',
            icon: Expensicons.Gear,
            action: () => Navigation.navigate(ROUTES.getWorkspaceSettingsRoute(policy.id)),
            brickRoadIndicator: hasGeneralSettingsError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '',
        },
        {
            translationKey: 'workspace.common.card',
            icon: Expensicons.ExpensifyCard,
            action: () => Navigation.navigate(ROUTES.getWorkspaceCardRoute(policy.id)),
        },
        {
            translationKey: 'workspace.common.reimburse',
            icon: Expensicons.Receipt,
            action: () => Navigation.navigate(ROUTES.getWorkspaceReimburseRoute(policy.id)),
            error: hasCustomUnitsError,
        },
        {
            translationKey: 'workspace.common.bills',
            icon: Expensicons.Bill,
            action: () => Navigation.navigate(ROUTES.getWorkspaceBillsRoute(policy.id)),
        },
        {
            translationKey: 'workspace.common.invoices',
            icon: Expensicons.Invoice,
            action: () => Navigation.navigate(ROUTES.getWorkspaceInvoicesRoute(policy.id)),
        },
        {
            translationKey: 'workspace.common.travel',
            icon: Expensicons.Luggage,
            action: () => Navigation.navigate(ROUTES.getWorkspaceTravelRoute(policy.id)),
        },
        {
            translationKey: 'workspace.common.members',
            icon: Expensicons.Users,
            action: () => Navigation.navigate(ROUTES.getWorkspaceMembersRoute(policy.id)),
            brickRoadIndicator: hasMembersError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '',
        },
        {
            translationKey: 'workspace.common.bankAccount',
            icon: Expensicons.Bank,
            action: () => ReimbursementAccount.navigateToBankAccountRoute(policy.id),
        },
    ];

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView
                    shouldShow={_.isEmpty(props.policy)}
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_WORKSPACES)}
                >
                    <HeaderWithCloseButton
                        title={props.translate('workspace.common.workspace')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_WORKSPACES)}
                        onCloseButtonPress={() => Navigation.dismissModal()}
                        shouldShowThreeDotsButton
                        shouldShowGetAssistanceButton
                        guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_INITIAL}
                        threeDotsMenuItems={[
                            {
                                icon: Expensicons.Trashcan,
                                text: props.translate('workspace.common.delete'),
                                onSelected: () => setIsDeleteModalOpen(true),
                            },
                        ]}
                        threeDotsAnchorPosition={styles.threeDotsPopoverOffset}
                    />
                    <ScrollView
                        contentContainerStyle={[
                            styles.flexGrow1,
                            styles.flexColumn,
                            styles.justifyContentBetween,
                            safeAreaPaddingBottomStyle,
                        ]}
                    >
                        <OfflineWithFeedback
                            pendingAction={props.policy.pendingAction}
                            onClose={dismissError}
                            errors={props.policy.errors}
                            errorRowStyles={[styles.ph6, styles.pv2]}
                        >
                            <View style={[styles.flex1]}>
                                <View style={styles.avatarSectionWrapper}>
                                    <View style={[styles.settingsPageBody, styles.alignItemsCenter]}>
                                        <Pressable
                                            disabled={hasPolicyCreationError}
                                            style={[styles.pRelative, styles.avatarLarge]}
                                            onPress={openEditor}
                                        >
                                            <Tooltip text={props.translate('workspace.common.settings')}>
                                                <Avatar
                                                    containerStyles={styles.avatarLarge}
                                                    imageStyles={[styles.avatarLarge, styles.alignSelfCenter]}
                                                    source={props.policy.avatar ? props.policy.avatar : ReportUtils.getDefaultWorkspaceAvatar(policyName)}
                                                    fallbackIcon={Expensicons.FallbackWorkspaceAvatar}
                                                    size={CONST.AVATAR_SIZE.LARGE}
                                                    name={policyName}
                                                    type={CONST.ICON_TYPE_WORKSPACE}
                                                />
                                            </Tooltip>
                                        </Pressable>
                                        {!_.isEmpty(props.policy.name) && (
                                            <Pressable
                                                disabled={hasPolicyCreationError}
                                                style={[
                                                    styles.alignSelfCenter,
                                                    styles.mt4,
                                                    styles.w100,
                                                ]}
                                                onPress={openEditor}
                                            >
                                                <Tooltip text={props.translate('workspace.common.settings')}>
                                                    <Text
                                                        numberOfLines={1}
                                                        style={[
                                                            styles.textHeadline,
                                                            styles.alignSelfCenter,
                                                        ]}
                                                    >
                                                        {props.policy.name}
                                                    </Text>
                                                </Tooltip>
                                            </Pressable>
                                        )}
                                    </View>
                                </View>
                                {_.map(menuItems, item => (
                                    <MenuItem
                                        key={item.translationKey}
                                        disabled={hasPolicyCreationError}
                                        interactive={!hasPolicyCreationError}
                                        title={props.translate(item.translationKey)}
                                        icon={item.icon}
                                        iconRight={item.iconRight}
                                        onPress={() => item.action()}
                                        shouldShowRightIcon
                                        brickRoadIndicator={item.brickRoadIndicator}
                                    />
                                ))}
                            </View>
                        </OfflineWithFeedback>
                    </ScrollView>
                    <ConfirmModal
                        title={props.translate('workspace.common.delete')}
                        isVisible={isDeleteModalOpen}
                        onConfirm={confirmDeleteAndHideModal}
                        onCancel={() => setIsDeleteModalOpen(false)}
                        prompt={props.translate('workspace.common.deleteConfirmation')}
                        confirmText={props.translate('common.delete')}
                        cancelText={props.translate('common.cancel')}
                        danger
                    />
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

WorkspaceInitialPage.propTypes = propTypes;
WorkspaceInitialPage.defaultProps = defaultProps;
WorkspaceInitialPage.displayName = 'WorkspaceInitialPage';

export default compose(
    withLocalize,
    withPolicy,
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
    }),
)(WorkspaceInitialPage);
