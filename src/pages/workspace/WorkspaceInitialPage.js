import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {useCallback, useEffect, useState} from 'react';
import {View, ScrollView} from 'react-native';
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
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import compose from '../../libs/compose';
import Avatar from '../../components/Avatar';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import {policyPropTypes, policyDefaultProps} from './withPolicy';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import reportPropTypes from '../reportPropTypes';
import * as Policy from '../../libs/actions/Policy';
import * as PolicyUtils from '../../libs/PolicyUtils';
import CONST from '../../CONST';
import * as ReimbursementAccount from '../../libs/actions/ReimbursementAccount';
import ONYXKEYS from '../../ONYXKEYS';
import OfflineWithFeedback from '../../components/OfflineWithFeedback';
import * as ReimbursementAccountProps from '../ReimbursementAccount/reimbursementAccountPropTypes';
import * as ReportUtils from '../../libs/ReportUtils';
import withWindowDimensions from '../../components/withWindowDimensions';
import PressableWithoutFeedback from '../../components/Pressable/PressableWithoutFeedback';

const propTypes = {
    ...policyPropTypes,
    ...withLocalizePropTypes,

    /** All reports shared with the user (coming from Onyx) */
    reports: PropTypes.objectOf(reportPropTypes),

    /** Bank account attached to free plan */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes,
};

const defaultProps = {
    reports: {},
    ...policyDefaultProps,
    reimbursementAccount: {},
};

/**
 * @param {string} policyID
 */
function openEditor(policyID) {
    Navigation.navigate(ROUTES.getWorkspaceSettingsRoute(policyID));
}

/**
 * @param {string} policyID
 */
function dismissError(policyID) {
    Navigation.goBack(ROUTES.SETTINGS_WORKSPACES);
    Policy.removeWorkspace(policyID);
}

function WorkspaceInitialPage(props) {
    const policy = props.policy;
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
    const hasPolicyCreationError = Boolean(policy.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && policy.errors);

    /**
     * Call the delete policy and hide the modal
     */
    const confirmDeleteAndHideModal = useCallback(() => {
        const policyReports = _.filter(props.reports, (report) => report && report.policyID === policy.id);
        Policy.deleteWorkspace(policy.id, policyReports, policy.name);
        setIsDeleteModalOpen(false);
        // Pop the deleted workspace page before opening workspace settings.
        Navigation.goBack(ROUTES.SETTINGS_WORKSPACES);
    }, [props.reports, policy]);

    useEffect(() => {
        if (!isCurrencyModalOpen || policy.outputCurrency !== CONST.CURRENCY.USD) {
            return;
        }
        setIsCurrencyModalOpen(false);
    }, [policy.outputCurrency, isCurrencyModalOpen]);

    /**
     * Call update workspace currency and hide the modal
     */
    const confirmCurrencyChangeAndHideModal = useCallback(() => {
        Policy.updateGeneralSettings(policy.id, policy.name, CONST.CURRENCY.USD);
        setIsCurrencyModalOpen(false);
        ReimbursementAccount.navigateToBankAccountRoute(policy.id);
    }, [policy]);

    /**
     * Navigates to workspace rooms
     * @param {String} chatType
     */
    const goToRoom = useCallback(
        (type) => {
            const room = _.find(props.reports, (report) => report && report.policyID === policy.id && report.chatType === type && !ReportUtils.isThread(report));
            Navigation.navigate(ROUTES.getReportRoute(room.reportID));
        },
        [props.reports, policy],
    );

    const policyName = lodashGet(policy, 'name', '');
    const hasMembersError = PolicyUtils.hasPolicyMemberError(props.policyMembers);
    const hasGeneralSettingsError = !_.isEmpty(lodashGet(policy, 'errorFields.generalSettings', {})) || !_.isEmpty(lodashGet(policy, 'errorFields.avatar', {}));
    const hasCustomUnitsError = PolicyUtils.hasCustomUnitsError(policy);
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
            action: () => (policy.outputCurrency === CONST.CURRENCY.USD ? ReimbursementAccount.navigateToBankAccountRoute(policy.id) : setIsCurrencyModalOpen(true)),
            brickRoadIndicator: !_.isEmpty(props.reimbursementAccount.errors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '',
        },
    ];

    const threeDotsMenuItems = [
        {
            icon: Expensicons.Trashcan,
            text: props.translate('workspace.common.delete'),
            onSelected: () => setIsDeleteModalOpen(true),
        },
        {
            icon: Expensicons.Hashtag,
            text: props.translate('workspace.common.goToRoom', {roomName: CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}),
            onSelected: () => goToRoom(CONST.REPORT.CHAT_TYPE.POLICY_ADMINS),
        },
        {
            icon: Expensicons.Hashtag,
            text: props.translate('workspace.common.goToRoom', {roomName: CONST.REPORT.WORKSPACE_CHAT_ROOMS.ANNOUNCE}),
            onSelected: () => goToRoom(CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE),
        },
    ];

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView
                    onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
                    shouldShow={_.isEmpty(props.policy) || !Policy.isPolicyOwner(props.policy)}
                    subtitleKey={_.isEmpty(props.policy) ? undefined : 'workspace.common.notAuthorized'}
                >
                    <HeaderWithBackButton
                        title={props.translate('workspace.common.workspace')}
                        shouldShowThreeDotsButton
                        shouldShowGetAssistanceButton
                        guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_INITIAL}
                        threeDotsMenuItems={threeDotsMenuItems}
                        threeDotsAnchorPosition={styles.threeDotsPopoverOffset(props.windowWidth)}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
                    />
                    <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexColumn, styles.justifyContentBetween, safeAreaPaddingBottomStyle]}>
                        <OfflineWithFeedback
                            pendingAction={policy.pendingAction}
                            onClose={() => dismissError(policy.id)}
                            errors={policy.errors}
                            errorRowStyles={[styles.ph5, styles.pv2]}
                        >
                            <View style={[styles.flex1]}>
                                <View style={styles.avatarSectionWrapper}>
                                    <View style={[styles.settingsPageBody, styles.alignItemsCenter]}>
                                        <Tooltip text={props.translate('workspace.common.settings')}>
                                            <PressableWithoutFeedback
                                                disabled={hasPolicyCreationError}
                                                style={[styles.pRelative, styles.avatarLarge]}
                                                onPress={() => openEditor(policy.id)}
                                                accessibilityLabel={props.translate('workspace.common.settings')}
                                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                            >
                                                <Avatar
                                                    containerStyles={styles.avatarLarge}
                                                    imageStyles={[styles.avatarLarge, styles.alignSelfCenter]}
                                                    source={policy.avatar ? policy.avatar : ReportUtils.getDefaultWorkspaceAvatar(policyName)}
                                                    fallbackIcon={Expensicons.FallbackWorkspaceAvatar}
                                                    size={CONST.AVATAR_SIZE.LARGE}
                                                    name={policyName}
                                                    type={CONST.ICON_TYPE_WORKSPACE}
                                                />
                                            </PressableWithoutFeedback>
                                        </Tooltip>
                                        {!_.isEmpty(policy.name) && (
                                            <Tooltip text={props.translate('workspace.common.settings')}>
                                                <PressableWithoutFeedback
                                                    disabled={hasPolicyCreationError}
                                                    style={[styles.alignSelfCenter, styles.mt4, styles.w100]}
                                                    onPress={() => openEditor(policy.id)}
                                                    accessibilityLabel={props.translate('workspace.common.settings')}
                                                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                                >
                                                    <Text
                                                        numberOfLines={1}
                                                        style={[styles.textHeadline, styles.alignSelfCenter, styles.pre]}
                                                    >
                                                        {policy.name}
                                                    </Text>
                                                </PressableWithoutFeedback>
                                            </Tooltip>
                                        )}
                                    </View>
                                </View>
                                {_.map(menuItems, (item) => (
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
                        title={props.translate('workspace.bankAccount.workspaceCurrency')}
                        isVisible={isCurrencyModalOpen}
                        onConfirm={confirmCurrencyChangeAndHideModal}
                        onCancel={() => setIsCurrencyModalOpen(false)}
                        prompt={props.translate('workspace.bankAccount.updateCurrencyPrompt')}
                        confirmText={props.translate('workspace.bankAccount.updateToUSD')}
                        cancelText={props.translate('common.cancel')}
                        danger
                    />
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
    withPolicyAndFullscreenLoading,
    withWindowDimensions,
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
)(WorkspaceInitialPage);
