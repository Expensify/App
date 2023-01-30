import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import {View, ScrollView, Pressable} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import Tooltip from '../../components/Tooltip';
import Text from '../../components/Text';
import ConfirmModal from '../../components/ConfirmModal';
import Icon from '../../components/Icon';
import * as Expensicons from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import MenuItem from '../../components/MenuItem';
import themedefault from '../../styles/themes/default';
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

const propTypes = {
    ...policyPropTypes,
    ...withLocalizePropTypes,

    /** All reports shared with the user (coming from Onyx) */
    reports: PropTypes.objectOf(reportPropTypes),

};

const defaultProps = {
    ...policyDefaultProps,
};

class WorkspaceInitialPage extends React.Component {
    constructor(props) {
        super(props);

        this.openEditor = this.openEditor.bind(this);
        this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
        this.confirmDeleteAndHideModal = this.confirmDeleteAndHideModal.bind(this);
        this.hasPolicyCreationError = this.hasPolicyCreationError.bind(this);
        this.dismissError = this.dismissError.bind(this);

        this.state = {
            isDeleteModalOpen: false,
        };
    }

    /**
     * Open Workspace Editor
     */
    openEditor() {
        Navigation.navigate(ROUTES.getWorkspaceSettingsRoute(this.props.policy.id));
    }

    /**
     * Toggle delete confirm modal visibility
     * @param {Boolean} shouldOpen
     */
    toggleDeleteModal(shouldOpen) {
        this.setState({isDeleteModalOpen: shouldOpen});
    }

    /**
     * Call the delete policy and hide the modal
     */
    confirmDeleteAndHideModal() {
        const policyReports = _.filter(this.props.reports, report => report && report.policyID === this.props.policy.id);
        Policy.deleteWorkspace(this.props.policy.id, policyReports, this.props.policy.name);
        this.toggleDeleteModal(false);
        Navigation.navigate(ROUTES.SETTINGS_WORKSPACES);
    }

    /**
     * @returns {Boolean}
     */
    hasPolicyCreationError() {
        return Boolean(this.props.policy.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && this.props.policy.errors);
    }

    dismissError() {
        Navigation.navigate(ROUTES.SETTINGS_WORKSPACES);
        Policy.removeWorkspace(this.props.policy.id);
    }

    render() {
        const policy = this.props.policy;
        const hasMembersError = PolicyUtils.hasPolicyMemberError(this.props.policyMemberList);
        const hasGeneralSettingsError = !_.isEmpty(lodashGet(this.props.policy, 'errorFields.generalSettings', {}))
            || !_.isEmpty(lodashGet(this.props.policy, 'errorFields.avatar', {}));
        const hasCustomUnitsError = PolicyUtils.hasCustomUnitsError(this.props.policy);
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
                <FullPageNotFoundView
                    shouldShow={_.isEmpty(this.props.policy)}
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_WORKSPACES)}
                >
                    <HeaderWithCloseButton
                        title={this.props.translate('workspace.common.workspace')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_WORKSPACES)}
                        onCloseButtonPress={() => Navigation.dismissModal()}
                        shouldShowThreeDotsButton
                        shouldShowGetAssistanceButton
                        guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_INITIAL}
                        threeDotsMenuItems={[
                            {
                                icon: Expensicons.Trashcan,
                                text: this.props.translate('workspace.common.delete'),
                                onSelected: () => this.setState({isDeleteModalOpen: true}),
                            },
                        ]}
                        threeDotsAnchorPosition={styles.threeDotsPopoverOffset}
                    />
                    <ScrollView
                        contentContainerStyle={[
                            styles.flexGrow1,
                            styles.flexColumn,
                            styles.justifyContentBetween,
                        ]}
                    >
                        <OfflineWithFeedback
                            pendingAction={this.props.policy.pendingAction}
                            onClose={this.dismissError}
                            errors={this.props.policy.errors}
                            errorRowStyles={[styles.ph6, styles.pv2]}
                        >
                            <View style={[styles.flex1]}>
                                <View style={styles.avatarSectionWrapper}>
                                    <View style={[styles.settingsPageBody, styles.alignItemsCenter]}>
                                        <Pressable
                                            disabled={this.hasPolicyCreationError()}
                                            style={[styles.pRelative, styles.avatarLarge]}
                                            onPress={this.openEditor}
                                        >
                                            {this.props.policy.avatar
                                                ? (
                                                    <Avatar
                                                        containerStyles={styles.avatarLarge}
                                                        imageStyles={[styles.avatarLarge, styles.alignSelfCenter]}
                                                        source={this.props.policy.avatar}
                                                        fallbackIcon={Expensicons.FallbackWorkspaceAvatar}
                                                        size={CONST.AVATAR_SIZE.LARGE}
                                                    />
                                                )
                                                : (
                                                    <Icon
                                                        src={Expensicons.Workspace}
                                                        height={80}
                                                        width={80}
                                                        fill={themedefault.iconSuccessFill}
                                                    />
                                                )}
                                        </Pressable>
                                        {!_.isEmpty(this.props.policy.name) && (
                                            <Pressable
                                                disabled={this.hasPolicyCreationError()}
                                                style={[
                                                    styles.alignSelfCenter,
                                                    styles.mt4,
                                                    styles.w100,
                                                ]}
                                                onPress={this.openEditor}
                                            >
                                                <Tooltip text={this.props.policy.name}>
                                                    <Text
                                                        numberOfLines={1}
                                                        style={[
                                                            styles.textHeadline,
                                                            styles.alignSelfCenter,
                                                        ]}
                                                    >
                                                        {this.props.policy.name}
                                                    </Text>
                                                </Tooltip>
                                            </Pressable>
                                        )}
                                    </View>
                                </View>
                                {_.map(menuItems, item => (
                                    <MenuItem
                                        key={item.translationKey}
                                        disabled={this.hasPolicyCreationError()}
                                        interactive={!this.hasPolicyCreationError()}
                                        title={this.props.translate(item.translationKey)}
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
                        title={this.props.translate('workspace.common.delete')}
                        isVisible={this.state.isDeleteModalOpen}
                        onConfirm={this.confirmDeleteAndHideModal}
                        onCancel={() => this.toggleDeleteModal(false)}
                        prompt={this.props.translate('workspace.common.deleteConfirmation')}
                        confirmText={this.props.translate('common.delete')}
                        cancelText={this.props.translate('common.cancel')}
                        danger
                    />
                </FullPageNotFoundView>
            </ScreenWrapper>
        );
    }
}

WorkspaceInitialPage.propTypes = propTypes;
WorkspaceInitialPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withPolicy,
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
    }),
)(WorkspaceInitialPage);
