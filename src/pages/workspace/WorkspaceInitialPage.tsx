import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Avatar from '@components/Avatar';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {ThreeDotsMenuItem} from '@components/HeaderWithBackButton/types';
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
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import * as App from '@userActions/App';
import * as Policy from '@userActions/Policy';
import * as ReimbursementAccount from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

type WorkspaceMenuItem = {
    translationKey: TranslationPaths;
    icon: IconAsset;
    action: () => void;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
};

type WorkspaceInitialPageOnyxProps = {
    /** All reports shared with the user */
    reports: OnyxCollection<OnyxTypes.Report>;

    /** Bank account attached to free plan */
    reimbursementAccount: OnyxEntry<OnyxTypes.ReimbursementAccount>;
};

type WorkspaceInitialPageProps = WithPolicyAndFullscreenLoadingProps & WorkspaceInitialPageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INITIAL>;

function openEditor(policyID: string) {
    Navigation.navigate(ROUTES.WORKSPACE_SETTINGS.getRoute(policyID));
}

function dismissError(policyID: string) {
    Navigation.goBack(ROUTES.SETTINGS_WORKSPACES);
    Policy.removeWorkspace(policyID);
}

/** Whether the policy report should be archived when we delete the policy. */
function shouldArchiveReport(report: OnyxTypes.Report): boolean {
    return ReportUtils.isChatRoom(report) || ReportUtils.isPolicyExpenseChat(report) || ReportUtils.isTaskReport(report);
}

function WorkspaceInitialPage({policyDraft, policy: policyProp, reports: reportsProp, policyMembers, reimbursementAccount}: WorkspaceInitialPageProps) {
    const styles = useThemeStyles();
    const policy = policyDraft?.id ? policyDraft : policyProp;
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
    const hasPolicyCreationError = !!(policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && policy.errors);
    const waitForNavigate = useWaitForNavigation();
    const {singleExecution, isExecuting} = useSingleExecution();

    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();

    const policyID = policy?.id ?? '';
    const policyName = policy?.name ?? '';
    const [policyReports, adminsRoom, announceRoom] = useMemo(() => {
        const reports: OnyxTypes.Report[] = [];
        let admins: OnyxTypes.Report | undefined;
        let announce: OnyxTypes.Report | undefined;

        Object.values(reportsProp ?? {}).forEach((report) => {
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
    }, [policyID, reportsProp]);

    /** Call the delete policy and hide the modal */
    const confirmDeleteAndHideModal = useCallback(() => {
        Policy.deleteWorkspace(policyID, policyReports.filter(shouldArchiveReport), policyName);
        setIsDeleteModalOpen(false);
        // Pop the deleted workspace page before opening workspace settings.
        Navigation.goBack(ROUTES.SETTINGS_WORKSPACES);
    }, [policyID, policyName, policyReports]);

    useEffect(() => {
        const policyDraftId = policyDraft?.id;

        if (!policyDraftId) {
            return;
        }

        App.savePolicyDraftByNewWorkspace(policyDraft.id, policyDraft.name, '', policyDraft.makeMeAdmin);
        // We only care when the component renders the first time
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!isCurrencyModalOpen || policy?.outputCurrency !== CONST.CURRENCY.USD) {
            return;
        }
        setIsCurrencyModalOpen(false);
    }, [policy?.outputCurrency, isCurrencyModalOpen]);

    /** Call update workspace currency and hide the modal */
    const confirmCurrencyChangeAndHideModal = useCallback(() => {
        Policy.updateGeneralSettings(policyID, policyName, CONST.CURRENCY.USD);
        setIsCurrencyModalOpen(false);
        ReimbursementAccount.navigateToBankAccountRoute(policyID);
    }, [policyID, policyName]);

    const hasMembersError = PolicyUtils.hasPolicyMemberError(policyMembers);
    const hasGeneralSettingsError = !isEmptyObject(policy?.errorFields?.generalSettings ?? {}) || !isEmptyObject(policy?.errorFields?.avatar ?? {});
    const menuItems: WorkspaceMenuItem[] = [
        {
            translationKey: 'workspace.common.settings',
            icon: Expensicons.Gear,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_SETTINGS.getRoute(policyID)))),
            brickRoadIndicator: hasGeneralSettingsError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        },
        {
            translationKey: 'workspace.common.card',
            icon: Expensicons.ExpensifyCard,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_CARD.getRoute(policyID)))),
        },
        {
            translationKey: 'workspace.common.reimburse',
            icon: Expensicons.Receipt,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_REIMBURSE.getRoute(policyID)))),
        },
        {
            translationKey: 'workspace.common.bills',
            icon: Expensicons.Bill,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_BILLS.getRoute(policyID)))),
        },
        {
            translationKey: 'workspace.common.invoices',
            icon: Expensicons.Invoice,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_INVOICES.getRoute(policyID)))),
        },
        {
            translationKey: 'workspace.common.travel',
            icon: Expensicons.Luggage,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_TRAVEL.getRoute(policyID)))),
        },
        {
            translationKey: 'workspace.common.members',
            icon: Expensicons.Users,
            action: singleExecution(waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID)))),
            brickRoadIndicator: hasMembersError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        },
        {
            translationKey: 'workspace.common.bankAccount',
            icon: Expensicons.Bank,
            action: () =>
                policy?.outputCurrency === CONST.CURRENCY.USD
                    ? singleExecution(waitForNavigate(() => ReimbursementAccount.navigateToBankAccountRoute(policyID, Navigation.getActiveRouteWithoutParams())))()
                    : setIsCurrencyModalOpen(true),
            brickRoadIndicator: !isEmptyObject(reimbursementAccount?.errors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        },
    ];

    const threeDotsMenuItems: ThreeDotsMenuItem[] = useMemo(() => {
        const items = [
            {
                icon: Expensicons.Trashcan,
                text: translate('workspace.common.delete'),
                onSelected: () => setIsDeleteModalOpen(true),
            },
        ];
        // Menu options to navigate to the chat report of #admins and #announce room.
        // For navigation, the chat report ids may be unavailable due to the missing chat reports in Onyx.
        // In such cases, let us use the available chat report ids from the policy.
        if (adminsRoom || policy.chatReportIDAdmins) {
            items.push({
                icon: Expensicons.Hashtag,
                text: translate('workspace.common.goToRoom', {roomName: CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}),
                onSelected: () => Navigation.dismissModal(adminsRoom ? adminsRoom.reportID : policy.chatReportIDAdmins.toString()),
            });
        }
        if (announceRoom || policy.chatReportIDAnnounce) {
            items.push({
                icon: Expensicons.Hashtag,
                text: translate('workspace.common.goToRoom', {roomName: CONST.REPORT.WORKSPACE_CHAT_ROOMS.ANNOUNCE}),
                onSelected: () => Navigation.dismissModal(announceRoom ? announceRoom.reportID : policy.chatReportIDAnnounce.toString()),
            });
        }
        return items;
    }, [adminsRoom, announceRoom, translate, policy]);

    const prevPolicy = usePrevious(policy);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage =
        isEmptyObject(policy) ||
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
                    subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
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
                            pendingAction={policy?.pendingAction}
                            onClose={() => dismissError(policyID)}
                            errors={policy?.errors}
                            errorRowStyles={[styles.ph5, styles.pv2]}
                        >
                            <View style={[styles.flex1]}>
                                <View style={styles.avatarSectionWrapper}>
                                    <View style={[styles.settingsPageBody, styles.alignItemsCenter]}>
                                        <Tooltip text={translate('workspace.common.settings')}>
                                            <PressableWithoutFeedback
                                                disabled={hasPolicyCreationError || isExecuting}
                                                style={[styles.pRelative, styles.avatarLarge]}
                                                onPress={singleExecution(waitForNavigate(() => openEditor(policyID)))}
                                                accessibilityLabel={translate('workspace.common.settings')}
                                                role={CONST.ROLE.BUTTON}
                                            >
                                                <Avatar
                                                    containerStyles={styles.avatarLarge}
                                                    imageStyles={[styles.avatarLarge, styles.alignSelfCenter]}
                                                    // It's possible for avatar to be an empty string, so we must use "||" to fallback to the default workspace avatar
                                                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                                                    source={policy?.avatar || ReportUtils.getDefaultWorkspaceAvatar(policyName)}
                                                    fallbackIcon={Expensicons.FallbackWorkspaceAvatar}
                                                    size={CONST.AVATAR_SIZE.LARGE}
                                                    name={policyName}
                                                    type={CONST.ICON_TYPE_WORKSPACE}
                                                />
                                            </PressableWithoutFeedback>
                                        </Tooltip>
                                        {!!policyName && (
                                            <Tooltip text={translate('workspace.common.settings')}>
                                                <PressableWithoutFeedback
                                                    disabled={hasPolicyCreationError || isExecuting}
                                                    style={[styles.alignSelfCenter, styles.mt4, styles.w100]}
                                                    onPress={singleExecution(waitForNavigate(() => openEditor(policyID)))}
                                                    accessibilityLabel={translate('workspace.common.settings')}
                                                    role={CONST.ROLE.BUTTON}
                                                >
                                                    <Text
                                                        numberOfLines={1}
                                                        style={[styles.textHeadline, styles.alignSelfCenter, styles.pre]}
                                                    >
                                                        {policyName}
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
                                {menuItems.map((item) => (
                                    <MenuItem
                                        key={item.translationKey}
                                        disabled={hasPolicyCreationError || isExecuting}
                                        interactive={!hasPolicyCreationError}
                                        title={translate(item.translationKey)}
                                        icon={item.icon}
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

WorkspaceInitialPage.displayName = 'WorkspaceInitialPage';

export default withPolicyAndFullscreenLoading(
    withOnyx<WorkspaceInitialPageProps, WorkspaceInitialPageOnyxProps>({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    })(WorkspaceInitialPage),
);
