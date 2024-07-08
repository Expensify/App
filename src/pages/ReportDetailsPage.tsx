import type {StackScreenProps} from '@react-navigation/stack';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx, withOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DisplayNames from '@components/DisplayNames';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import MultipleAvatars from '@components/MultipleAvatars';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ParentNavigationSubtitle from '@components/ParentNavigationSubtitle';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import type {PromotedAction} from '@components/PromotedActionsBar';
import PromotedActionsBar, {PromotedActions} from '@components/PromotedActionsBar';
import RoomHeaderAvatars from '@components/RoomHeaderAvatars';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import PaginationUtils from '@libs/PaginationUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as IOU from '@userActions/IOU';
import * as Report from '@userActions/Report';
import * as Session from '@userActions/Session';
import * as Task from '@userActions/Task';
import ConfirmModal from '@src/components/ConfirmModal';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type ReportDetailsPageMenuItem = {
    key: DeepValueOf<typeof CONST.REPORT_DETAILS_MENU_ITEM>;
    translationKey: TranslationPaths;
    icon: IconAsset;
    isAnonymousAction: boolean;
    action: () => void;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    subtitle?: number;
    shouldShowRightIcon?: boolean;
};

type ReportDetailsPageOnyxProps = {
    /** Personal details of all the users */
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;

    /** Session info for the currently logged in user. */
    session: OnyxEntry<OnyxTypes.Session>;
};
type ReportDetailsPageProps = ReportDetailsPageOnyxProps & WithReportOrNotFoundProps & StackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.ROOT>;

const CASES = {
    DEFAULT: 'default',
    MONEY_REQUEST: 'money_request',
    MONEY_REPORT: 'money_report',
};

type CaseID = ValueOf<typeof CASES>;

function ReportDetailsPage({policies, report, session, personalDetails}: ReportDetailsPageProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();

    // The app would crash due to subscribing to the entire report collection if parentReportID is an empty string. So we should have a fallback ID here.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID || '-1'}`);
    const [sortedAllReportActions = []] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID || '-1'}`, {
        canEvict: false,
        selector: (allReportActions: OnyxEntry<OnyxTypes.ReportActions>) => ReportActionsUtils.getSortedReportActionsForDisplay(allReportActions, true),
    });
    const [reportActionPages = []] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${report.reportID || '-1'}`);

    const reportActions = useMemo(() => {
        if (!sortedAllReportActions.length) {
            return [];
        }
        return PaginationUtils.getContinuousChain(sortedAllReportActions, reportActionPages, (reportAction) => reportAction.reportActionID);
    }, [sortedAllReportActions, reportActionPages]);

    const transactionThreadReportID = useMemo(
        () => ReportActionsUtils.getOneTransactionThreadReportID(report.reportID, reportActions ?? [], isOffline),
        [report.reportID, reportActions, isOffline],
    );

    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);

    const [isLastMemberLeavingGroupModalVisible, setIsLastMemberLeavingGroupModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isUnapproveModalVisible, setIsUnapproveModalVisible] = useState(false);
    const policy = useMemo(() => policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID ?? '-1'}`], [policies, report?.policyID]);
    const isPolicyAdmin = useMemo(() => PolicyUtils.isPolicyAdmin(policy), [policy]);
    const isPolicyEmployee = useMemo(() => PolicyUtils.isPolicyEmployee(report?.policyID ?? '-1', policies), [report?.policyID, policies]);
    const isPolicyExpenseChat = useMemo(() => ReportUtils.isPolicyExpenseChat(report), [report]);
    const shouldUseFullTitle = useMemo(() => ReportUtils.shouldUseFullTitleToDisplay(report), [report]);
    const isChatRoom = useMemo(() => ReportUtils.isChatRoom(report), [report]);
    const isUserCreatedPolicyRoom = useMemo(() => ReportUtils.isUserCreatedPolicyRoom(report), [report]);
    const isDefaultRoom = useMemo(() => ReportUtils.isDefaultRoom(report), [report]);
    const isChatThread = useMemo(() => ReportUtils.isChatThread(report), [report]);
    const isArchivedRoom = useMemo(() => ReportUtils.isArchivedRoom(report), [report]);
    const isMoneyRequestReport = useMemo(() => ReportUtils.isMoneyRequestReport(report), [report]);
    const isMoneyRequest = useMemo(() => ReportUtils.isMoneyRequest(report), [report]);
    const isInvoiceReport = useMemo(() => ReportUtils.isInvoiceReport(report), [report]);
    const isInvoiceRoom = useMemo(() => ReportUtils.isInvoiceRoom(report), [report]);
    const isTaskReport = useMemo(() => ReportUtils.isTaskReport(report), [report]);
    const isSelfDM = useMemo(() => ReportUtils.isSelfDM(report), [report]);
    const isTrackExpenseReport = ReportUtils.isTrackExpenseReport(report);
    const parentReportAction = ReportActionsUtils.getReportAction(report?.parentReportID ?? '', report?.parentReportActionID ?? '');
    const isCanceledTaskReport = ReportUtils.isCanceledTaskReport(report, parentReportAction);
    const canEditReportDescription = useMemo(() => ReportUtils.canEditReportDescription(report, policy), [report, policy]);
    const shouldShowReportDescription = isChatRoom && (canEditReportDescription || report.description !== '');
    const isExpenseReport = isMoneyRequestReport || isInvoiceReport || isMoneyRequest;
    const isSingleTransactionView = isMoneyRequest || isTrackExpenseReport;
    const isSelfDMTrackExpenseReport = isTrackExpenseReport && ReportUtils.isSelfDM(parentReport);

    const shouldDisableRename = useMemo(() => ReportUtils.shouldDisableRename(report), [report]);
    const parentNavigationSubtitleData = ReportUtils.getParentNavigationSubtitle(report);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- policy is a dependency because `getChatRoomSubtitle` calls `getPolicyName` which in turn retrieves the value from the `policy` value stored in Onyx
    const chatRoomSubtitle = useMemo(() => ReportUtils.getChatRoomSubtitle(report), [report, policy]);
    const isSystemChat = useMemo(() => ReportUtils.isSystemChat(report), [report]);
    const isGroupChat = useMemo(() => ReportUtils.isGroupChat(report), [report]);
    const isThread = useMemo(() => ReportUtils.isThread(report), [report]);
    const participants = useMemo(() => {
        const shouldExcludeHiddenParticipants = !isGroupChat && !isSystemChat;
        return ReportUtils.getParticipantsAccountIDsForDisplay(report, shouldExcludeHiddenParticipants);
    }, [report, isGroupChat, isSystemChat]);

    // Get the active chat members by filtering out the pending members with delete action
    const activeChatMembers = participants.flatMap((accountID) => {
        const pendingMember = report?.pendingChatMembers?.findLast((member) => member.accountID === accountID.toString());
        return !pendingMember || pendingMember.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? accountID : [];
    });

    const caseID = useMemo((): CaseID => {
        // 3. MoneyReportHeader
        if (isMoneyRequestReport || isInvoiceReport) {
            return CASES.MONEY_REPORT;
        }
        // 2. MoneyRequestHeader
        if (isSingleTransactionView) {
            return CASES.MONEY_REQUEST;
        }
        // 1. HeaderView
        return CASES.DEFAULT;
    }, [isInvoiceReport, isMoneyRequestReport, isSingleTransactionView]);
    const isPrivateNotesFetchTriggered = report?.isLoadingPrivateNotes !== undefined;

    const requestParentReportAction = useMemo(() => {
        // 2. MoneyReport case
        if (caseID === CASES.MONEY_REPORT) {
            if (!reportActions || !transactionThreadReport?.parentReportActionID) {
                return null;
            }
            return reportActions.find((action) => action.reportActionID === transactionThreadReport.parentReportActionID);
        }
        return parentReportAction;
    }, [caseID, parentReportAction, reportActions, transactionThreadReport?.parentReportActionID]);

    const isActionOwner =
        typeof requestParentReportAction?.actorAccountID === 'number' && typeof session?.accountID === 'number' && requestParentReportAction.actorAccountID === session?.accountID;
    const isDeletedParentAction = ReportActionsUtils.isDeletedAction(requestParentReportAction);

    const moneyRequestReport: OnyxEntry<OnyxTypes.Report> = useMemo(() => {
        if (caseID === CASES.MONEY_REQUEST) {
            return parentReport;
        }
        return report;
    }, [caseID, parentReport, report]);

    const canModifyTask = Task.canModifyTask(report, session?.accountID ?? -1);
    const shouldShowTaskDeleteButton =
        isTaskReport &&
        !isCanceledTaskReport &&
        ReportUtils.canWriteInReport(report) &&
        report.stateNum !== CONST.REPORT.STATE_NUM.APPROVED &&
        !ReportUtils.isClosedReport(report) &&
        canModifyTask;
    const canDeleteRequest = isActionOwner && (ReportUtils.canAddOrDeleteTransactions(moneyRequestReport) || isSelfDMTrackExpenseReport) && !isDeletedParentAction;
    const shouldShowDeleteButton = shouldShowTaskDeleteButton || canDeleteRequest;

    const canUnapproveRequest =
        ReportUtils.isMoneyRequestReport(moneyRequestReport) &&
        (ReportUtils.isReportManager(moneyRequestReport) || isPolicyAdmin) &&
        (ReportUtils.isReportApproved(moneyRequestReport) || ReportUtils.isReportManuallyReimbursed(moneyRequestReport));

    useEffect(() => {
        if (canDeleteRequest) {
            return;
        }

        setIsDeleteModalVisible(false);
    }, [canDeleteRequest]);

    useEffect(() => {
        // Do not fetch private notes if isLoadingPrivateNotes is already defined, or if the network is offline, or if the report is a self DM.
        if (isPrivateNotesFetchTriggered || isOffline || isSelfDM) {
            return;
        }

        Report.getReportPrivateNote(report?.reportID ?? '-1');
    }, [report?.reportID, isOffline, isPrivateNotesFetchTriggered, isSelfDM]);

    const leaveChat = useCallback(() => {
        Navigation.dismissModal();
        if (isChatRoom) {
            const isWorkspaceMemberLeavingWorkspaceRoom = (report.visibility === CONST.REPORT.VISIBILITY.RESTRICTED || isPolicyExpenseChat) && isPolicyEmployee;
            Report.leaveRoom(report.reportID, isWorkspaceMemberLeavingWorkspaceRoom);
            return;
        }
        Report.leaveGroupChat(report.reportID);
    }, [isChatRoom, isPolicyEmployee, isPolicyExpenseChat, report.reportID, report.visibility]);

    const unapproveExpenseReportOrShowModal = useCallback(() => {
        if (PolicyUtils.hasAccountingConnections(policy)) {
            setIsUnapproveModalVisible(true);
            return;
        }
        Navigation.dismissModal();
        IOU.unapproveExpenseReport(moneyRequestReport);
    }, [moneyRequestReport, policy]);

    const shouldShowLeaveButton =
        !isThread && (isGroupChat || (isChatRoom && ReportUtils.canLeaveChat(report, policy)) || (isPolicyExpenseChat && !report.isOwnPolicyExpenseChat && !isPolicyAdmin));

    const reportName = ReportUtils.isDeprecatedGroupDM(report) || isGroupChat ? ReportUtils.getGroupChatName(undefined, false, report) : ReportUtils.getReportName(report);

    const additionalRoomDetails =
        (isPolicyExpenseChat && !!report?.isOwnPolicyExpenseChat) || ReportUtils.isExpenseReport(report) || isPolicyExpenseChat || isInvoiceRoom
            ? chatRoomSubtitle
            : `${translate('threads.in')} ${chatRoomSubtitle}`;

    let roomDescription;
    if (caseID === CASES.MONEY_REQUEST) {
        roomDescription = translate('common.name');
    } else if (isGroupChat) {
        roomDescription = translate('groupConfirmPage.groupName');
    } else {
        roomDescription = translate('newRoomPage.roomName');
    }

    const shouldShowNotificationPref = !isMoneyRequestReport && report?.notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
    const shouldShowWriteCapability = !isMoneyRequestReport;
    const shouldShowMenuItem = shouldShowNotificationPref || shouldShowWriteCapability || (!!report?.visibility && report.chatType !== CONST.REPORT.CHAT_TYPE.INVOICE);

    const menuItems: ReportDetailsPageMenuItem[] = useMemo(() => {
        const items: ReportDetailsPageMenuItem[] = [];

        if (isSelfDM) {
            return [];
        }

        if (isArchivedRoom) {
            return items;
        }

        // The Members page is only shown when:
        // - The report is a thread in a chat report
        // - The report is not a user created room with participants to show i.e. DM, Group Chat, etc
        // - The report is a user created room and the room and the current user is a workspace member i.e. non-workspace members should not see this option.
        if (
            (isGroupChat ||
                (isDefaultRoom && isChatThread && isPolicyEmployee) ||
                (!isUserCreatedPolicyRoom && participants.length) ||
                (isUserCreatedPolicyRoom && (isPolicyEmployee || (isChatThread && !ReportUtils.isPublicRoom(report))))) &&
            !ReportUtils.isConciergeChatReport(report) &&
            !isSystemChat
        ) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.MEMBERS,
                translationKey: 'common.members',
                icon: Expensicons.Users,
                subtitle: activeChatMembers.length,
                isAnonymousAction: false,
                shouldShowRightIcon: true,
                action: () => {
                    if (isUserCreatedPolicyRoom || isChatThread || (isPolicyExpenseChat && isPolicyAdmin)) {
                        Navigation.navigate(ROUTES.ROOM_MEMBERS.getRoute(report?.reportID ?? '-1'));
                    } else {
                        Navigation.navigate(ROUTES.REPORT_PARTICIPANTS.getRoute(report?.reportID ?? '-1'));
                    }
                },
            });
        } else if ((isUserCreatedPolicyRoom && (!participants.length || !isPolicyEmployee)) || ((isDefaultRoom || isPolicyExpenseChat) && isChatThread && !isPolicyEmployee)) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.INVITE,
                translationKey: 'common.invite',
                icon: Expensicons.Users,
                isAnonymousAction: false,
                shouldShowRightIcon: true,
                action: () => {
                    Navigation.navigate(ROUTES.ROOM_INVITE.getRoute(report?.reportID ?? '-1'));
                },
            });
        }

        if (shouldShowMenuItem) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.SETTINGS,
                translationKey: 'common.settings',
                icon: Expensicons.Gear,
                isAnonymousAction: false,
                shouldShowRightIcon: true,
                action: () => {
                    Navigation.navigate(ROUTES.REPORT_SETTINGS.getRoute(report?.reportID ?? '-1'));
                },
            });
        }

        // Prevent displaying private notes option for threads and task reports
        if (!isChatThread && !isMoneyRequestReport && !isInvoiceReport && !isTaskReport) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.PRIVATE_NOTES,
                translationKey: 'privateNotes.title',
                icon: Expensicons.Pencil,
                isAnonymousAction: false,
                shouldShowRightIcon: true,
                action: () => ReportUtils.navigateToPrivateNotes(report, session),
                brickRoadIndicator: Report.hasErrorInPrivateNotes(report) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            });
        }

        // Show actions related to Task Reports
        if (isTaskReport && !isCanceledTaskReport) {
            if (ReportUtils.isCompletedTaskReport(report) && canModifyTask) {
                items.push({
                    key: CONST.REPORT_DETAILS_MENU_ITEM.MARK_AS_INCOMPLETE,
                    icon: Expensicons.Checkmark,
                    translationKey: 'task.markAsIncomplete',
                    isAnonymousAction: false,
                    action: Session.checkIfActionIsAllowed(() => {
                        Navigation.dismissModal();
                        Task.reopenTask(report);
                    }),
                });
            }
        }

        if (shouldShowLeaveButton) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.LEAVE_ROOM,
                translationKey: 'common.leave',
                icon: Expensicons.Exit,
                isAnonymousAction: true,
                action: () => {
                    if (ReportUtils.getParticipantsAccountIDsForDisplay(report, false, true).length === 1 && isGroupChat) {
                        setIsLastMemberLeavingGroupModalVisible(true);
                        return;
                    }

                    leaveChat();
                },
            });
        }

        if (canUnapproveRequest) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.UNAPPROVE,
                icon: Expensicons.CircularArrowBackwards,
                translationKey: 'iou.unapprove',
                isAnonymousAction: false,
                action: () => unapproveExpenseReportOrShowModal(),
            });
        }
        return items;
    }, [
        isSelfDM,
        isArchivedRoom,
        isGroupChat,
        isDefaultRoom,
        isChatThread,
        isPolicyEmployee,
        isUserCreatedPolicyRoom,
        participants.length,
        report,
        canModifyTask,
        isSystemChat,
        isPolicyExpenseChat,
        shouldShowMenuItem,
        isMoneyRequestReport,
        isInvoiceReport,
        isTaskReport,
        isCanceledTaskReport,
        shouldShowLeaveButton,
        activeChatMembers.length,
        isPolicyAdmin,
        session,
        leaveChat,
        canUnapproveRequest,
        unapproveExpenseReportOrShowModal,
    ]);

    const displayNamesWithTooltips = useMemo(() => {
        const hasMultipleParticipants = participants.length > 1;
        return ReportUtils.getDisplayNamesWithTooltips(OptionsListUtils.getPersonalDetailsForAccountIDs(participants, personalDetails), hasMultipleParticipants);
    }, [participants, personalDetails]);

    const icons = useMemo(() => ReportUtils.getIcons(report, personalDetails, null, '', -1, policy), [report, personalDetails, policy]);

    const chatRoomSubtitleText = chatRoomSubtitle ? (
        <DisplayNames
            fullTitle={chatRoomSubtitle}
            tooltipEnabled
            numberOfLines={1}
            textStyles={[styles.sidebarLinkText, styles.textLabelSupporting, styles.pre, styles.mt1, styles.textAlignCenter]}
            shouldUseFullTitle
        />
    ) : null;

    const connectedIntegration = Object.values(CONST.POLICY.CONNECTIONS.NAME).find((integration) => !!policy?.connections?.[integration]);
    const connectedIntegrationName = connectedIntegration ? translate('workspace.accounting.connectionName', connectedIntegration) : '';
    const unapproveWarningText = (
        <Text>
            <Text style={[styles.textStrong, styles.noWrap]}>{translate('iou.headsUp')}</Text> <Text>{translate('iou.unapproveWithIntegrationWarning', connectedIntegrationName)}</Text>
        </Text>
    );

    const renderedAvatar = useMemo(() => {
        if (isMoneyRequestReport || isInvoiceReport) {
            return (
                <View style={styles.mb3}>
                    <MultipleAvatars
                        icons={icons}
                        size={CONST.AVATAR_SIZE.LARGE}
                    />
                </View>
            );
        }
        if (isGroupChat && !isThread) {
            return (
                <AvatarWithImagePicker
                    source={icons[0].source}
                    avatarID={icons[0].id}
                    isUsingDefaultAvatar={!report.avatarUrl}
                    size={CONST.AVATAR_SIZE.XLARGE}
                    avatarStyle={styles.avatarXLarge}
                    shouldDisableViewPhoto
                    onImageRemoved={() => {
                        // Calling this without a file will remove the avatar
                        Report.updateGroupChatAvatar(report.reportID ?? '');
                    }}
                    onImageSelected={(file) => Report.updateGroupChatAvatar(report.reportID ?? '-1', file)}
                    editIcon={Expensicons.Camera}
                    editIconStyle={styles.smallEditIconAccount}
                    pendingAction={report.pendingFields?.avatar ?? undefined}
                    errors={report.errorFields?.avatar ?? null}
                    errorRowStyles={styles.mt6}
                    onErrorClose={() => Report.clearAvatarErrors(report.reportID ?? '-1')}
                    shouldUseStyleUtilityForAnchorPosition
                    style={[styles.w100, styles.mb3]}
                />
            );
        }
        return (
            <View style={styles.mb3}>
                <RoomHeaderAvatars
                    icons={icons}
                    reportID={report?.reportID}
                />
            </View>
        );
    }, [report, icons, isMoneyRequestReport, isInvoiceReport, isGroupChat, isThread, styles]);

    const iouTransactionID = ReportActionsUtils.isMoneyRequestAction(requestParentReportAction)
        ? ReportActionsUtils.getOriginalMessage(requestParentReportAction)?.IOUTransactionID ?? ''
        : '';

    const canHoldUnholdReportAction = ReportUtils.canHoldUnholdReportAction(parentReportAction);
    const shouldShowHoldAction =
        caseID !== CASES.MONEY_REPORT && (canHoldUnholdReportAction.canHoldRequest || canHoldUnholdReportAction.canUnholdRequest) && !ReportUtils.isArchivedRoom(parentReport);

    const canJoin = ReportUtils.canJoinChat(report, parentReportAction, policy);

    const promotedActions = useMemo(() => {
        const result: PromotedAction[] = [];

        if (canJoin) {
            result.push(PromotedActions.join(report));
        }

        if (isExpenseReport && shouldShowHoldAction) {
            result.push(PromotedActions.hold({isTextHold: canHoldUnholdReportAction.canHoldRequest, reportAction: parentReportAction}));
        }

        if (report) {
            result.push(PromotedActions.pin(report));
        }

        result.push(PromotedActions.share(report));

        return result;
    }, [report, parentReportAction, canJoin, isExpenseReport, shouldShowHoldAction, canHoldUnholdReportAction.canHoldRequest]);

    const nameSectionExpenseIOU = (
        <View style={[styles.reportDetailsRoomInfo, styles.mw100]}>
            {shouldDisableRename && (
                <>
                    <View style={[styles.alignSelfCenter, styles.w100, styles.mt1]}>
                        <DisplayNames
                            fullTitle={reportName ?? ''}
                            displayNamesWithTooltips={displayNamesWithTooltips}
                            tooltipEnabled
                            numberOfLines={isChatRoom && !isChatThread ? 0 : 1}
                            textStyles={[styles.textHeadline, styles.textAlignCenter, isChatRoom && !isChatThread ? undefined : styles.pre]}
                            shouldUseFullTitle={shouldUseFullTitle}
                        />
                    </View>
                    {isPolicyAdmin ? (
                        <PressableWithoutFeedback
                            style={[styles.w100]}
                            disabled={policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                            role={CONST.ROLE.BUTTON}
                            accessibilityLabel={chatRoomSubtitle ?? ''}
                            accessible
                            onPress={() => {
                                Navigation.navigate(ROUTES.WORKSPACE_INITIAL.getRoute(report?.policyID ?? ''));
                            }}
                        >
                            {chatRoomSubtitleText}
                        </PressableWithoutFeedback>
                    ) : (
                        chatRoomSubtitleText
                    )}
                </>
            )}
            {!isEmptyObject(parentNavigationSubtitleData) && (isMoneyRequestReport || isInvoiceReport || isMoneyRequest || isTaskReport) && (
                <ParentNavigationSubtitle
                    parentNavigationSubtitleData={parentNavigationSubtitleData}
                    parentReportID={report?.parentReportID}
                    parentReportActionID={report?.parentReportActionID}
                    pressableStyles={[styles.mt1, styles.mw100]}
                />
            )}
        </View>
    );

    const nameSectionGroupWorkspace = (
        <OfflineWithFeedback
            pendingAction={report?.pendingFields?.reportName}
            errors={report?.errorFields?.reportName}
            errorRowStyles={[styles.ph5]}
            onClose={() => Report.clearPolicyRoomNameErrors(report?.reportID)}
        >
            <View style={[styles.flex1, !shouldDisableRename && styles.mt3]}>
                <MenuItemWithTopDescription
                    shouldShowRightIcon={!shouldDisableRename}
                    interactive={!shouldDisableRename}
                    title={reportName}
                    titleStyle={styles.newKansasLarge}
                    shouldCheckActionAllowedOnPress={false}
                    description={!shouldDisableRename ? roomDescription : ''}
                    furtherDetails={chatRoomSubtitle && !isGroupChat ? additionalRoomDetails : ''}
                    onPress={() => Navigation.navigate(ROUTES.REPORT_SETTINGS_NAME.getRoute(report.reportID))}
                />
            </View>
        </OfflineWithFeedback>
    );

    const titleField = useMemo<OnyxTypes.PolicyReportField | undefined>((): OnyxTypes.PolicyReportField | undefined => {
        const fields = ReportUtils.getAvailableReportFields(report, Object.values(policy?.fieldList ?? {}));
        return fields.find((reportField) => ReportUtils.isReportFieldOfTypeTitle(reportField));
    }, [report, policy?.fieldList]);
    const fieldKey = ReportUtils.getReportFieldKey(titleField?.fieldID ?? '-1');
    const isFieldDisabled = ReportUtils.isReportFieldDisabled(report, titleField, policy);

    const shouldShowTitleField = caseID !== CASES.MONEY_REQUEST && !isFieldDisabled && ReportUtils.isAdminOwnerApproverOrReportOwner(report, policy);

    const nameSectionFurtherDetailsContent = (
        <ParentNavigationSubtitle
            parentNavigationSubtitleData={parentNavigationSubtitleData}
            parentReportID={report?.parentReportID}
            parentReportActionID={report?.parentReportActionID}
            pressableStyles={[styles.mt1, styles.mw100]}
        />
    );

    const nameSectionTitleField = titleField && (
        <OfflineWithFeedback
            pendingAction={report.pendingFields?.[fieldKey]}
            errors={report.errorFields?.[fieldKey]}
            errorRowStyles={styles.ph5}
            key={`menuItem-${fieldKey}`}
            onClose={() => Report.clearReportFieldErrors(report.reportID, titleField)}
        >
            <View style={[styles.flex1]}>
                <MenuItemWithTopDescription
                    shouldShowRightIcon={!isFieldDisabled}
                    interactive={!isFieldDisabled}
                    title={reportName}
                    titleStyle={styles.newKansasLarge}
                    shouldCheckActionAllowedOnPress={false}
                    description={Str.UCFirst(titleField.name)}
                    onPress={() => Navigation.navigate(ROUTES.EDIT_REPORT_FIELD_REQUEST.getRoute(report.reportID, report.policyID ?? '-1', titleField.fieldID ?? '-1'))}
                    furtherDetailsComponent={nameSectionFurtherDetailsContent}
                />
            </View>
        </OfflineWithFeedback>
    );

    const navigateBackToAfterDelete = useRef<Route>();

    const deleteTransaction = useCallback(() => {
        setIsDeleteModalVisible(false);

        if (caseID === CASES.DEFAULT) {
            Task.deleteTask(report);
            navigateBackToAfterDelete.current = undefined;
            return;
        }

        if (!requestParentReportAction) {
            return;
        }

        if (ReportActionsUtils.isTrackExpenseAction(requestParentReportAction)) {
            navigateBackToAfterDelete.current = IOU.deleteTrackExpense(moneyRequestReport?.reportID ?? '', iouTransactionID, requestParentReportAction, true);
        } else {
            navigateBackToAfterDelete.current = IOU.deleteMoneyRequest(iouTransactionID, requestParentReportAction, true);
        }
    }, [caseID, iouTransactionID, moneyRequestReport?.reportID, report, requestParentReportAction]);
    return (
        <ScreenWrapper testID={ReportDetailsPage.displayName}>
            <FullPageNotFoundView shouldShow={isEmptyObject(report)}>
                <HeaderWithBackButton title={translate('common.details')} />
                <ScrollView style={[styles.flex1]}>
                    <View style={[styles.reportDetailsTitleContainer, styles.pb0]}>
                        {renderedAvatar}
                        {isExpenseReport && !shouldShowTitleField && nameSectionExpenseIOU}
                    </View>

                    {isExpenseReport && shouldShowTitleField && nameSectionTitleField}

                    {!isExpenseReport && nameSectionGroupWorkspace}

                    {shouldShowReportDescription && (
                        <OfflineWithFeedback pendingAction={report.pendingFields?.description}>
                            <MenuItemWithTopDescription
                                shouldShowRightIcon={canEditReportDescription}
                                interactive={canEditReportDescription}
                                title={report.description}
                                shouldRenderAsHTML
                                shouldCheckActionAllowedOnPress={false}
                                description={translate('reportDescriptionPage.roomDescription')}
                                onPress={() => Navigation.navigate(ROUTES.REPORT_DESCRIPTION.getRoute(report.reportID))}
                            />
                        </OfflineWithFeedback>
                    )}

                    <PromotedActionsBar
                        containerStyle={styles.mt5}
                        promotedActions={promotedActions}
                    />

                    {menuItems.map((item) => {
                        const brickRoadIndicator =
                            ReportUtils.hasReportNameError(report) && item.key === CONST.REPORT_DETAILS_MENU_ITEM.SETTINGS ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;
                        return (
                            <MenuItem
                                key={item.key}
                                title={translate(item.translationKey)}
                                subtitle={item.subtitle}
                                icon={item.icon}
                                onPress={item.action}
                                isAnonymousAction={item.isAnonymousAction}
                                shouldShowRightIcon={item.shouldShowRightIcon}
                                brickRoadIndicator={brickRoadIndicator ?? item.brickRoadIndicator}
                            />
                        );
                    })}

                    {shouldShowDeleteButton && (
                        <MenuItem
                            key={CONST.REPORT_DETAILS_MENU_ITEM.DELETE}
                            icon={Expensicons.Trashcan}
                            title={caseID === CASES.DEFAULT ? translate('common.delete') : translate('reportActionContextMenu.deleteAction', {action: requestParentReportAction})}
                            onPress={() => setIsDeleteModalVisible(true)}
                        />
                    )}
                </ScrollView>
                <ConfirmModal
                    danger
                    title={translate('groupChat.lastMemberTitle')}
                    isVisible={isLastMemberLeavingGroupModalVisible}
                    onConfirm={() => {
                        setIsLastMemberLeavingGroupModalVisible(false);
                        leaveChat();
                    }}
                    onCancel={() => setIsLastMemberLeavingGroupModalVisible(false)}
                    prompt={translate('groupChat.lastMemberWarning')}
                    confirmText={translate('common.leave')}
                    cancelText={translate('common.cancel')}
                />
                <ConfirmModal
                    title={caseID === CASES.DEFAULT ? translate('task.deleteTask') : translate('iou.deleteExpense')}
                    isVisible={isDeleteModalVisible}
                    onConfirm={deleteTransaction}
                    onCancel={() => setIsDeleteModalVisible(false)}
                    onModalHide={() => ReportUtils.navigateBackAfterDeleteTransaction(navigateBackToAfterDelete.current)}
                    prompt={caseID === CASES.DEFAULT ? translate('task.deleteConfirmation') : translate('iou.deleteConfirmation')}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                    shouldEnableNewFocusManagement
                />
                <ConfirmModal
                    title={translate('iou.unapproveReport')}
                    isVisible={isUnapproveModalVisible}
                    danger
                    confirmText={translate('iou.unapproveReport')}
                    onConfirm={() => {
                        setIsUnapproveModalVisible(false);
                        Navigation.dismissModal();
                        IOU.unapproveExpenseReport(moneyRequestReport);
                    }}
                    cancelText={translate('common.cancel')}
                    onCancel={() => setIsUnapproveModalVisible(false)}
                    prompt={unapproveWarningText}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

ReportDetailsPage.displayName = 'ReportDetailsPage';

export default withReportOrNotFound()(
    withOnyx<ReportDetailsPageProps, ReportDetailsPageOnyxProps>({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    })(ReportDetailsPage),
);
