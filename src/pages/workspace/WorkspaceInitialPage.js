import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Avatar from '@components/Avatar';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useSingleExecution from '@hooks/useSingleExecution';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import useWindowDimensions from '@hooks/useWindowDimensions';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import reportPropTypes from '@pages/reportPropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import * as App from '@userActions/App';
import * as Policy from '@userActions/Policy';
import * as ReimbursementAccount from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {policyDefaultProps, policyPropTypes} from './withPolicy';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

const propTypes = {
    ...policyPropTypes,

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
    Navigation.navigate(ROUTES.WORKSPACE_SETTINGS.getRoute(policyID));
}

/**
 * @param {string} policyID
 */
function dismissError(policyID) {
    Navigation.goBack(ROUTES.SETTINGS_WORKSPACES);
    Policy.removeWorkspace(policyID);
}

function WorkspaceInitialPage(props) {
    const styles = useThemeStyles();
    const policy = props.policyDraft && props.policyDraft.id ? props.policyDraft : props.policy;
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
    const hasPolicyCreationError = Boolean(policy.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && policy.errors);
    const waitForNavigate = useWaitForNavigation();
    const {singleExecution, isExecuting} = useSingleExecution();

    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();

    const policyID = useMemo(() => policy.id, [policy]);
    const [policyReports, adminsRoom, announceRoom] = useMemo(() => {
        const reports = [];
        let admins;
        let announce;
        _.each(props.reports, (report) => {
            if (!report || report.policyID !== policyID) {
                return;
            }

            reports.push(report);

            if (!report.reportID || ReportUtils.isThread(report)) {
                return;
            }

            if (report.chatType === CONST.REPORT.CHAT_TYPE.POLICY_ADMINS) {
                admins = report;
                return;
            }

            if (report.chatType === CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE) {
                announce = report;
            }
        });
        return [reports, admins, announce];
    }, [policyID, props.reports]);

    /**
     * Call the delete policy and hide the modal
     */
    const confirmDeleteAndHideModal = useCallback(() => {
        Policy.deleteWorkspace(policyID, policyReports, policy.name);
        setIsDeleteModalOpen(false);
        // Pop the deleted workspace page before opening workspace settings.
        Navigation.goBack(ROUTES.SETTINGS_WORKSPACES);
    }, [policyID, policy.name, policyReports]);

    useEffect(() => {
        const policyDraftId = lodashGet(props.policyDraft, 'id', null);
        if (!policyDraftId) {
            return;
        }

        App.savePolicyDraftByNewWorkspace(props.policyDraft.id, props.policyDraft.name, '', props.policyDraft.makeMeAdmin);
        // We only care when the component renders the first time
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        Policy.updateGeneralSettings(policyID, policy.name, CONST.CURRENCY.USD);
        setIsCurrencyModalOpen(false);
        ReimbursementAccount.navigateToBankAccountRoute(policyID);
    }, [policyID, policy.name]);

    const policyName = lodashGet(policy, 'name', '');
    const hasMembersError = PolicyUtils.hasPolicyMemberError(props.policyMembers);
    const hasGeneralSettingsError = !_.isEmpty(lodashGet(policy, 'errorFields.generalSettings', {})) || !_.isEmpty(lodashGet(policy, 'errorFields.avatar', {}));
    const hasCustomUnitsError = PolicyUtils.hasCustomUnitsError(policy);
    const menuItems = [
        {
            translationKey: 'workspace.common.settings',
            icon: Expensicons.Gear,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_SETTINGS.getRoute(policy.id)))),
            brickRoadIndicator: hasGeneralSettingsError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '',
        },
        {
            translationKey: 'workspace.common.card',
            icon: Expensicons.ExpensifyCard,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_CARD.getRoute(policy.id)))),
        },
        {
            translationKey: 'workspace.common.reimburse',
            icon: Expensicons.Receipt,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_REIMBURSE.getRoute(policy.id)))),
            error: hasCustomUnitsError,
        },
        {
            translationKey: 'workspace.common.bills',
            icon: Expensicons.Bill,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_BILLS.getRoute(policy.id)))),
        },
        {
            translationKey: 'workspace.common.invoices',
            icon: Expensicons.Invoice,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_INVOICES.getRoute(policy.id)))),
        },
        {
            translationKey: 'workspace.common.travel',
            icon: Expensicons.Luggage,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_TRAVEL.getRoute(policy.id)))),
        },
        {
            translationKey: 'workspace.common.members',
            icon: Expensicons.Users,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_MEMBERS.getRoute(policy.id)))),
            brickRoadIndicator: hasMembersError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '',
        },
        {
            translationKey: 'workspace.common.bankAccount',
            icon: Expensicons.Bank,
            action: () =>
                policy.outputCurrency === CONST.CURRENCY.USD
                    ? singleExecution(waitForNavigate(() => ReimbursementAccount.navigateToBankAccountRoute(policy.id, Navigation.getActiveRouteWithoutParams())))()
                    : setIsCurrencyModalOpen(true),
            brickRoadIndicator: !_.isEmpty(props.reimbursementAccount.errors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '',
        },
    ];

    const threeDotsMenuItems = useMemo(() => {
        const items = [
            {
                icon: Expensicons.Trashcan,
                text: translate('workspace.common.delete'),
                onSelected: () => setIsDeleteModalOpen(true),
            },
        ];
        if (adminsRoom) {
            items.push({
                icon: Expensicons.Hashtag,
                text: translate('workspace.common.goToRoom', {roomName: CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}),
                onSelected: () => Navigation.dismissModal(adminsRoom.reportID),
            });
        }
        if (announceRoom) {
            items.push({
                icon: Expensicons.Hashtag,
                text: translate('workspace.common.goToRoom', {roomName: CONST.REPORT.WORKSPACE_CHAT_ROOMS.ANNOUNCE}),
                onSelected: () => Navigation.dismissModal(announceRoom.reportID),
            });
        }
        return items;
    }, [adminsRoom, announceRoom, translate]);

    const prevPolicy = usePrevious(policy);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage =
        _.isEmpty(policy) ||
        !PolicyUtils.isPolicyAdmin(policy) ||
        // We check isPendingDelete for both policy and prevPolicy to prevent the NotFound view from showing right after we delete the workspace
        (PolicyUtils.isPendingDeletePolicy(policy) && PolicyUtils.isPendingDeletePolicy(prevPolicy));

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={WorkspaceInitialPage.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView
                    onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
                    shouldShow={shouldShowNotFoundPage}
                    subtitleKey={_.isEmpty(policy) ? undefined : 'workspace.common.notAuthorized'}
                >
                    <HeaderWithBackButton
                        title={translate('workspace.common.workspace')}
                        shouldShowThreeDotsButton
                        shouldShowGetAssistanceButton
                        singleExecution={singleExecution}
                        shouldDisableGetAssistanceButton={isExecuting}
                        shouldDisableThreeDotsButton={isExecuting}
                        guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_INITIAL}
                        threeDotsMenuItems={threeDotsMenuItems}
                        threeDotsAnchorPosition={styles.threeDotsPopoverOffset(windowWidth)}
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
                                        <Tooltip text={translate('workspace.common.settings')}>
                                            <PressableWithoutFeedback
                                                disabled={hasPolicyCreationError || isExecuting}
                                                style={[styles.pRelative, styles.avatarLarge]}
                                                onPress={singleExecution(waitForNavigate(() => openEditor(policy.id)))}
                                                accessibilityLabel={translate('workspace.common.settings')}
                                                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
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
                                            <Tooltip text={translate('workspace.common.settings')}>
                                                <PressableWithoutFeedback
                                                    disabled={hasPolicyCreationError || isExecuting}
                                                    style={[styles.alignSelfCenter, styles.mt4, styles.w100]}
                                                    onPress={singleExecution(waitForNavigate(() => openEditor(policy.id)))}
                                                    accessibilityLabel={translate('workspace.common.settings')}
                                                    role={CONST.ACCESSIBILITY_ROLE.BUTTON}
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
                                {/*
                   Ideally we should use MenuList component for MenuItems with singleExecution/Navigation actions.
                   In this case where user can click on workspace avatar or menu items, we need to have a check for `isExecuting`. So, we are directly mapping menuItems.
                */}
                                {_.map(menuItems, (item) => (
                                    <MenuItem
                                        key={item.translationKey}
                                        disabled={hasPolicyCreationError || isExecuting}
                                        interactive={!hasPolicyCreationError}
                                        title={translate(item.translationKey)}
                                        icon={item.icon}
                                        iconRight={item.iconRight}
                                        onPress={item.action}
                                        shouldShowRightIcon
                                        brickRoadIndicator={item.brickRoadIndicator}
                                    />
                                ))}
                            </View>
                        </OfflineWithFeedback>
                    </ScrollView>
                    <ConfirmModal
                        title={translate('workspace.bankAccount.workspaceCurrency')}
                        isVisible={isCurrencyModalOpen}
                        onConfirm={confirmCurrencyChangeAndHideModal}
                        onCancel={() => setIsCurrencyModalOpen(false)}
                        prompt={translate('workspace.bankAccount.updateCurrencyPrompt')}
                        confirmText={translate('workspace.bankAccount.updateToUSD')}
                        cancelText={translate('common.cancel')}
                        danger
                    />
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
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

WorkspaceInitialPage.propTypes = propTypes;
WorkspaceInitialPage.defaultProps = defaultProps;
WorkspaceInitialPage.displayName = 'WorkspaceInitialPage';

export default compose(
    withPolicyAndFullscreenLoading,
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
)(WorkspaceInitialPage);
