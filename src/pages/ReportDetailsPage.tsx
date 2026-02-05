import {StackActions} from '@react-navigation/native';
import reportsSelector from '@selectors/Attributes';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DisplayNames from '@components/DisplayNames';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MentionReportContext from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ParentNavigationSubtitle from '@components/ParentNavigationSubtitle';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import type {PromotedAction} from '@components/PromotedActionsBar';
import PromotedActionsBar, {PromotedActions} from '@components/PromotedActionsBar';
import ReportActionAvatars from '@components/ReportActionAvatars';
import RoomHeaderAvatars from '@components/RoomHeaderAvatars';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useSearchContext} from '@components/Search/SearchContext';
import {SUPER_WIDE_RIGHT_MODALS} from '@components/WideRHPContextProvider/WIDE_RIGHT_MODALS';
import useActivePolicy from '@hooks/useActivePolicy';
import useAncestors from '@hooks/useAncestors';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDeleteTransactions from '@hooks/useDeleteTransactions';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useGetIOUReportFromReportAction from '@hooks/useGetIOUReportFromReportAction';
import useHasOutstandingChildTask from '@hooks/useHasOutstandingChildTask';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import getBase62ReportID from '@libs/getBase62ReportID';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDetailsNavigatorParamList, RightModalNavigatorParamList} from '@libs/Navigation/types';
import {getPersonalDetailsForAccountIDs} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import Permissions from '@libs/Permissions';
import {isPolicyAdmin as isPolicyAdminUtil, isPolicyEmployee as isPolicyEmployeeUtil, shouldShowPolicy} from '@libs/PolicyUtils';
import {getOneTransactionThreadReportID, getOriginalMessage, getTrackExpenseActionableWhisper, isDeletedAction, isMoneyRequestAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {getReportName as getReportNameFromReportNameUtils} from '@libs/ReportNameUtils';
import {
    canDeleteCardTransactionByLiabilityType,
    canDeleteTransaction,
    canEditReportDescription as canEditReportDescriptionUtil,
    canJoinChat,
    canLeaveChat,
    canWriteInReport,
    createDraftTransactionAndNavigateToParticipantSelector,
    getAvailableReportFields,
    getChatRoomSubtitle,
    getDisplayNamesWithTooltips,
    getIcons,
    getOriginalReportID,
    getParentNavigationSubtitle,
    getParticipantsAccountIDsForDisplay,
    getParticipantsList,
    getReportDescription,
    getReportFieldKey,
    getReportForHeader,
    isAdminOwnerApproverOrReportOwner,
    isArchivedNonExpenseReport,
    isCanceledTaskReport as isCanceledTaskReportUtil,
    isChatRoom as isChatRoomUtil,
    isChatThread as isChatThreadUtil,
    isClosedReport,
    isCompletedTaskReport,
    isConciergeChatReport,
    isDefaultRoom as isDefaultRoomUtil,
    isExpenseReport as isExpenseReportUtil,
    isFinancialReportsForBusinesses as isFinancialReportsForBusinessesUtil,
    isGroupChat as isGroupChatUtil,
    isHiddenForCurrentUser,
    isInvoiceReport as isInvoiceReportUtil,
    isInvoiceRoom as isInvoiceRoomUtil,
    isMoneyRequestReport as isMoneyRequestReportUtil,
    isMoneyRequest as isMoneyRequestUtil,
    isPolicyExpenseChat as isPolicyExpenseChatUtil,
    isPublicRoom as isPublicRoomUtil,
    isReportFieldDisabled,
    isReportFieldOfTypeTitle,
    isRootGroupChat as isRootGroupChatUtil,
    isSelfDM as isSelfDMUtil,
    isSystemChat as isSystemChatUtil,
    isTaskReport as isTaskReportUtil,
    isThread as isThreadUtil,
    isTrackExpenseReportNew as isTrackExpenseReportUtil,
    isUserCreatedPolicyRoom as isUserCreatedPolicyRoomUtil,
    isWorkspaceChat as isWorkspaceChatUtil,
    isWorkspaceMemberLeavingWorkspaceRoom as isWorkspaceMemberLeavingWorkspaceRoomUtil,
    navigateBackOnDeleteTransaction,
    navigateToPrivateNotes,
    shouldDisableRename as shouldDisableRenameUtil,
    shouldUseFullTitleToDisplay,
} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import {isDemoTransaction} from '@libs/TransactionUtils';
import {deleteTrackExpense, getNavigationUrlAfterTrackExpenseDelete, getNavigationUrlOnMoneyRequestDelete} from '@userActions/IOU';
import {
    clearAvatarErrors,
    clearPolicyRoomNameErrors,
    getReportPrivateNote,
    hasErrorInPrivateNotes,
    leaveGroupChat,
    leaveRoom,
    setDeleteTransactionNavigateBackUrl,
    updateGroupChatAvatar,
} from '@userActions/Report';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import {canActionTask, canModifyTask, deleteTask, reopenTask} from '@userActions/Task';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import type {WithReportOrNotFoundProps} from './inbox/report/withReportOrNotFound';
import withReportOrNotFound from './inbox/report/withReportOrNotFound';

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

type ReportDetailsPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.ROOT>;

const CASES = {
    DEFAULT: 'default',
    MONEY_REQUEST: 'money_request',
    MONEY_REPORT: 'money_report',
};

type CaseID = ValueOf<typeof CASES>;

function ReportDetailsPage({policy, report, route, reportMetadata}: ReportDetailsPageProps) {
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const {isOffline} = useNetwork();
    const {isRestrictedToPreferredPolicy, preferredPolicyID} = usePreferredPolicy();
    const activePolicy = useActivePolicy();
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Users', 'Gear', 'Send', 'Folder', 'UserPlus', 'Pencil', 'Checkmark', 'Building', 'Exit', 'Bug', 'Camera', 'Trashcan']);
    const backTo = route.params.backTo;

    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`, {canBeMissing: true});
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report.chatReportID}`, {canBeMissing: true});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {canBeMissing: true});

    const parentReportAction = useParentReportAction(report);
    const hasOutstandingChildTask = useHasOutstandingChildTask(report);

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`, {canBeMissing: false});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});

    const {reportActions} = usePaginatedReportActions(report.reportID);

    const {removeTransaction} = useSearchContext();

    const transactionThreadReportID = useMemo(() => getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], isOffline), [reportActions, isOffline, report, chatReport]);
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionThreadReportID)}`, {canBeMissing: true});
    const [isDebugModeEnabled = false] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED, {canBeMissing: true});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {canBeMissing: true});
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {showConfirmModal} = useConfirmModal();
    const isPolicyAdmin = useMemo(() => isPolicyAdminUtil(policy), [policy]);
    const isPolicyEmployee = useMemo(() => isPolicyEmployeeUtil(report?.policyID, policy), [report?.policyID, policy]);
    const isPolicyExpenseChat = useMemo(() => isPolicyExpenseChatUtil(report), [report]);
    const shouldUseFullTitle = useMemo(() => shouldUseFullTitleToDisplay(report), [report]);
    const isChatRoom = useMemo(() => isChatRoomUtil(report), [report]);
    const isUserCreatedPolicyRoom = useMemo(() => isUserCreatedPolicyRoomUtil(report), [report]);
    const isDefaultRoom = useMemo(() => isDefaultRoomUtil(report), [report]);
    const isChatThread = useMemo(() => isChatThreadUtil(report), [report]);
    const isMoneyRequestReport = useMemo(() => isMoneyRequestReportUtil(report), [report]);
    const isMoneyRequest = useMemo(() => isMoneyRequestUtil(report), [report]);
    const isInvoiceReport = useMemo(() => isInvoiceReportUtil(report), [report]);
    const isFinancialReportsForBusinesses = useMemo(() => isFinancialReportsForBusinessesUtil(report), [report]);
    const isInvoiceRoom = useMemo(() => isInvoiceRoomUtil(report), [report]);
    const isTaskReport = useMemo(() => isTaskReportUtil(report), [report]);
    const isSelfDM = useMemo(() => isSelfDMUtil(report), [report]);
    const isTrackExpenseReport = useMemo(() => isTrackExpenseReportUtil(report, parentReport, parentReportAction), [report, parentReport, parentReportAction]);
    const isCanceledTaskReport = isCanceledTaskReportUtil(report, parentReportAction);
    const isParentReportArchived = useReportIsArchived(parentReport?.reportID);
    const isTaskModifiable = canModifyTask(report, currentUserPersonalDetails?.accountID, isParentReportArchived);
    const isTaskActionable = canActionTask(report, parentReportAction, currentUserPersonalDetails?.accountID, parentReport, isParentReportArchived);
    const canEditReportDescription = useMemo(() => canEditReportDescriptionUtil(report, policy), [report, policy]);
    const shouldShowReportDescription = isChatRoom && (canEditReportDescription || report.description !== '') && (isTaskReport ? isTaskModifiable : true);
    const isExpenseReport = isMoneyRequestReport || isInvoiceReport || isMoneyRequest;
    const isSingleTransactionView = isMoneyRequest || isTrackExpenseReport;
    const isSelfDMTrackExpenseReport = isTrackExpenseReport && isSelfDMUtil(parentReport);
    const isReportArchived = useReportIsArchived(report?.reportID);
    const isArchivedRoom = useMemo(() => isArchivedNonExpenseReport(report, isReportArchived), [report, isReportArchived]);
    const shouldDisableRename = useMemo(() => shouldDisableRenameUtil(report, isReportArchived), [report, isReportArchived]);
    const parentNavigationSubtitleData = getParentNavigationSubtitle(report, isParentReportArchived);
    const base62ReportID = getBase62ReportID(Number(report.reportID));
    const ancestors = useAncestors(report);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- policy is a dependency because `getChatRoomSubtitle` calls `getPolicyName` which in turn retrieves the value from the `policy` value stored in Onyx
    const chatRoomSubtitle = useMemo(() => {
        const subtitle = getChatRoomSubtitle(report, false, isReportArchived);

        if (subtitle) {
            return subtitle;
        }

        return '';
    }, [isReportArchived, report]);

    const isSystemChat = useMemo(() => isSystemChatUtil(report), [report]);
    const isGroupChat = useMemo(() => isGroupChatUtil(report), [report]);
    const isRootGroupChat = useMemo(() => isRootGroupChatUtil(report, isReportArchived), [report, isReportArchived]);
    const isThread = useMemo(() => isThreadUtil(report), [report]);
    const shouldOpenRoomMembersPage = isUserCreatedPolicyRoom || isChatThread || (isPolicyExpenseChat && isPolicyAdmin);
    const participants = useMemo(() => {
        return getParticipantsList(report, personalDetails, shouldOpenRoomMembersPage);
    }, [report, personalDetails, shouldOpenRoomMembersPage]);

    let caseID: CaseID;
    if (isMoneyRequestReport || isInvoiceReport) {
        // 3. MoneyReportHeader
        caseID = CASES.MONEY_REPORT;
    } else if (isSingleTransactionView) {
        // 2. MoneyRequestHeader
        caseID = CASES.MONEY_REQUEST;
    } else {
        // 1. HeaderView
        caseID = CASES.DEFAULT;
    }

    // Get the active chat members by filtering out the pending members with delete action
    const activeChatMembers = participants.flatMap((accountID) => {
        const pendingMember = reportMetadata?.pendingChatMembers?.findLast((member) => member.accountID === accountID.toString());
        const detail = personalDetails?.[accountID];
        if (!detail) {
            return [];
        }
        return !pendingMember || pendingMember.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? accountID : [];
    });

    const isPrivateNotesFetchTriggered = reportMetadata?.isLoadingPrivateNotes !== undefined;
    const requestParentReportAction = useMemo(() => {
        // 2. MoneyReport case
        if (caseID === CASES.MONEY_REPORT) {
            if (!reportActions || !transactionThreadReport?.parentReportActionID) {
                return undefined;
            }
            return reportActions.find((action) => action.reportActionID === transactionThreadReport.parentReportActionID);
        }
        return parentReportAction;
    }, [caseID, parentReportAction, reportActions, transactionThreadReport?.parentReportActionID]);
    const {iouReport, chatReport: chatIOUReport, isChatIOUReportArchived} = useGetIOUReportFromReportAction(requestParentReportAction);

    const isActionOwner =
        typeof requestParentReportAction?.actorAccountID === 'number' &&
        typeof currentUserPersonalDetails?.accountID === 'number' &&
        requestParentReportAction.actorAccountID === currentUserPersonalDetails?.accountID;
    const isDeletedParentAction = isDeletedAction(requestParentReportAction);

    const moneyRequestReport: OnyxEntry<OnyxTypes.Report> = useMemo(() => {
        if (caseID === CASES.MONEY_REQUEST) {
            return parentReport;
        }
        return report;
    }, [caseID, parentReport, report]);
    const isMoneyRequestReportArchived = useReportIsArchived(moneyRequestReport?.reportID);

    const shouldShowTaskDeleteButton =
        isTaskReport &&
        !isCanceledTaskReport &&
        canWriteInReport(report) &&
        report.stateNum !== CONST.REPORT.STATE_NUM.APPROVED &&
        !isClosedReport(report) &&
        isTaskModifiable &&
        isTaskActionable;
    const canDeleteRequest = isActionOwner && (canDeleteTransaction(moneyRequestReport, isMoneyRequestReportArchived) || isSelfDMTrackExpenseReport) && !isDeletedParentAction;
    const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : undefined;
    const [iouTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(iouTransactionID)}`, {canBeMissing: true});
    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(iouTransactionID ? [iouTransactionID] : []);
    const {deleteTransactions} = useDeleteTransactions({
        report: parentReport,
        reportActions: requestParentReportAction ? [requestParentReportAction] : [],
        policy,
    });
    const {currentSearchHash} = useSearchContext();
    const isCardTransactionCanBeDeleted = canDeleteCardTransactionByLiabilityType(iouTransaction);
    const shouldShowDeleteButton = shouldShowTaskDeleteButton || (canDeleteRequest && isCardTransactionCanBeDeleted) || isDemoTransaction(iouTransaction);
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: reportsSelector});
    const isWorkspaceChat = useMemo(() => isWorkspaceChatUtil(report?.chatType ?? ''), [report?.chatType]);

    useEffect(() => {
        // Do not fetch private notes if isLoadingPrivateNotes is already defined, or if the network is offline, or if the report is a self DM.
        if (isPrivateNotesFetchTriggered || isOffline || isSelfDM) {
            return;
        }

        getReportPrivateNote(report?.reportID);
    }, [report?.reportID, isOffline, isPrivateNotesFetchTriggered, isSelfDM]);

    const leaveChat = useCallback(() => {
        if (isRootGroupChat) {
            leaveGroupChat(report, quickAction?.chatReportID?.toString() === report.reportID, currentUserPersonalDetails.accountID, conciergeReportID);
            return;
        }

        const isWorkspaceMemberLeavingWorkspaceRoom = isWorkspaceMemberLeavingWorkspaceRoomUtil(report, isPolicyEmployee, isPolicyAdmin);
        leaveRoom(report, currentUserPersonalDetails.accountID, conciergeReportID, isWorkspaceMemberLeavingWorkspaceRoom);
    }, [isRootGroupChat, isPolicyEmployee, isPolicyAdmin, quickAction?.chatReportID, report, currentUserPersonalDetails.accountID, conciergeReportID]);

    const showLastMemberLeavingModal = useCallback(async () => {
        const {action} = await showConfirmModal({
            title: translate('groupChat.lastMemberTitle'),
            prompt: translate('groupChat.lastMemberWarning'),
            confirmText: translate('common.leave'),
            cancelText: translate('common.cancel'),
            danger: true,
            shouldHandleNavigationBack: false,
        });
        if (action !== ModalActions.CONFIRM) {
            return;
        }
        leaveChat();
    }, [showConfirmModal, translate, leaveChat]);

    const shouldShowLeaveButton = canLeaveChat(report, policy, !!reportNameValuePairs?.private_isArchived);
    const shouldShowGoToWorkspace = shouldShowPolicy(policy, false, currentUserPersonalDetails?.email) && !policy?.isJoinRequestPending;
    const reportForHeader = useMemo(() => getReportForHeader(report), [report]);
    const reportName = isGroupChat
        ? getReportNameFromReportNameUtils(reportForHeader, reportAttributes)
        : Parser.htmlToText(getReportNameFromReportNameUtils(reportForHeader, reportAttributes));
    const additionalRoomDetails =
        (isPolicyExpenseChat && !!report?.isOwnPolicyExpenseChat) || isExpenseReportUtil(report) || isPolicyExpenseChat || isInvoiceRoom
            ? chatRoomSubtitle
            : `${translate('threads.in')} ${chatRoomSubtitle}`;

    let roomDescription: string | undefined;
    if (caseID === CASES.MONEY_REQUEST) {
        roomDescription = translate('common.name');
    } else if (isGroupChat) {
        roomDescription = translate('newRoomPage.groupName');
    } else {
        roomDescription = translate('newRoomPage.roomName');
    }

    const shouldShowNotificationPref = !isMoneyRequestReport && !isHiddenForCurrentUser(report);
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
                (isUserCreatedPolicyRoom && (isPolicyEmployee || (isChatThread && !isPublicRoomUtil(report))))) &&
            !isConciergeChatReport(report) &&
            !isSystemChat &&
            activeChatMembers.length > 0
        ) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.MEMBERS,
                translationKey: 'common.members',
                icon: expensifyIcons.Users,
                subtitle: activeChatMembers.length,
                isAnonymousAction: false,
                shouldShowRightIcon: true,
                action: () => {
                    if (shouldOpenRoomMembersPage) {
                        Navigation.navigate(ROUTES.ROOM_MEMBERS.getRoute(report?.reportID, backTo));
                    } else {
                        Navigation.navigate(ROUTES.REPORT_PARTICIPANTS.getRoute(report?.reportID, backTo));
                    }
                },
            });
        } else if ((isUserCreatedPolicyRoom && (!participants.length || !isPolicyEmployee)) || ((isDefaultRoom || isPolicyExpenseChat) && isChatThread && !isPolicyEmployee)) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.INVITE,
                translationKey: 'common.invite',
                icon: expensifyIcons.Users,
                isAnonymousAction: false,
                shouldShowRightIcon: true,
                action: () => {
                    Navigation.navigate(ROUTES.ROOM_INVITE.getRoute(report?.reportID));
                },
            });
        }

        if (shouldShowMenuItem) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.SETTINGS,
                translationKey: 'common.settings',
                icon: expensifyIcons.Gear,
                isAnonymousAction: false,
                shouldShowRightIcon: true,
                action: () => {
                    Navigation.navigate(ROUTES.REPORT_SETTINGS.getRoute(report?.reportID, backTo));
                },
            });
        }

        if (isTrackExpenseReport && !isDeletedParentAction) {
            const actionReportID = getOriginalReportID(report.reportID, parentReportAction);
            const whisperAction = getTrackExpenseActionableWhisper(iouTransactionID, moneyRequestReport?.reportID);
            const actionableWhisperReportActionID = whisperAction?.reportActionID;
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.TRACK.SUBMIT,
                translationKey: 'actionableMentionTrackExpense.submit',
                icon: expensifyIcons.Send,
                isAnonymousAction: false,
                shouldShowRightIcon: true,
                action: () => {
                    createDraftTransactionAndNavigateToParticipantSelector(
                        iouTransactionID,
                        actionReportID,
                        CONST.IOU.ACTION.SUBMIT,
                        actionableWhisperReportActionID,
                        introSelected,
                        allTransactionDrafts,
                        activePolicy,
                        isRestrictedToPreferredPolicy,
                        preferredPolicyID,
                    );
                },
            });
            if (Permissions.canUseTrackFlows()) {
                items.push({
                    key: CONST.REPORT_DETAILS_MENU_ITEM.TRACK.CATEGORIZE,
                    translationKey: 'actionableMentionTrackExpense.categorize',
                    icon: expensifyIcons.Folder,
                    isAnonymousAction: false,
                    shouldShowRightIcon: true,
                    action: () => {
                        createDraftTransactionAndNavigateToParticipantSelector(
                            iouTransactionID,
                            actionReportID,
                            CONST.IOU.ACTION.CATEGORIZE,
                            actionableWhisperReportActionID,
                            introSelected,
                            allTransactionDrafts,
                            activePolicy,
                        );
                    },
                });
                items.push({
                    key: CONST.REPORT_DETAILS_MENU_ITEM.TRACK.SHARE,
                    translationKey: 'actionableMentionTrackExpense.share',
                    icon: expensifyIcons.UserPlus,
                    isAnonymousAction: false,
                    shouldShowRightIcon: true,
                    action: () => {
                        createDraftTransactionAndNavigateToParticipantSelector(
                            iouTransactionID,
                            actionReportID,
                            CONST.IOU.ACTION.SHARE,
                            actionableWhisperReportActionID,
                            introSelected,
                            allTransactionDrafts,
                            activePolicy,
                        );
                    },
                });
            }
        }

        // Prevent displaying private notes option for threads and task reports
        if (!isChatThread && !isMoneyRequestReport && !isInvoiceReport && !isTaskReport) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.PRIVATE_NOTES,
                translationKey: 'privateNotes.title',
                icon: expensifyIcons.Pencil,
                isAnonymousAction: false,
                shouldShowRightIcon: true,
                action: () => navigateToPrivateNotes(report, currentUserPersonalDetails.accountID, backTo),
                brickRoadIndicator: hasErrorInPrivateNotes(report) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            });
        }

        // Show actions related to Task Reports
        if (isTaskReport && !isCanceledTaskReport) {
            if (isCompletedTaskReport(report) && isTaskActionable) {
                items.push({
                    key: CONST.REPORT_DETAILS_MENU_ITEM.MARK_AS_INCOMPLETE,
                    icon: expensifyIcons.Checkmark,
                    translationKey: 'task.markAsIncomplete',
                    isAnonymousAction: false,
                    action: callFunctionIfActionIsAllowed(() => {
                        Navigation.goBack(backTo);
                        reopenTask(report, parentReport, currentUserPersonalDetails?.accountID);
                    }),
                });
            }
        }

        if (shouldShowGoToWorkspace) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.GO_TO_WORKSPACE,
                translationKey: 'workspace.common.goToWorkspace',
                icon: expensifyIcons.Building,
                action: () => {
                    if (!report?.policyID) {
                        return;
                    }
                    if (isSmallScreenWidth) {
                        Navigation.navigate(ROUTES.WORKSPACE_INITIAL.getRoute(report?.policyID, Navigation.getActiveRoute()));
                    } else {
                        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW.getRoute(report?.policyID));
                    }
                },
                isAnonymousAction: false,
                shouldShowRightIcon: true,
            });
        }

        if (shouldShowLeaveButton) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.LEAVE_ROOM,
                translationKey: 'common.leave',
                icon: expensifyIcons.Exit,
                isAnonymousAction: true,
                action: () => {
                    if (getParticipantsAccountIDsForDisplay(report, false, true).length === 1 && isRootGroupChat) {
                        showLastMemberLeavingModal();
                        return;
                    }

                    leaveChat();
                },
            });
        }

        if (report?.reportID && isDebugModeEnabled) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.DEBUG,
                translationKey: 'debug.debug',
                icon: expensifyIcons.Bug,
                action: () => Navigation.navigate(ROUTES.DEBUG_REPORT.getRoute(report.reportID)),
                isAnonymousAction: true,
                shouldShowRightIcon: true,
            });
        }

        return items;
    }, [
        isSelfDM,
        isArchivedRoom,
        isGroupChat,
        expensifyIcons,
        isDefaultRoom,
        isChatThread,
        isPolicyEmployee,
        isUserCreatedPolicyRoom,
        participants.length,
        report,
        isSystemChat,
        activeChatMembers.length,
        isPolicyExpenseChat,
        shouldShowMenuItem,
        isTrackExpenseReport,
        isDeletedParentAction,
        isMoneyRequestReport,
        isInvoiceReport,
        isTaskReport,
        isCanceledTaskReport,
        shouldShowGoToWorkspace,
        shouldShowLeaveButton,
        isDebugModeEnabled,
        shouldOpenRoomMembersPage,
        backTo,
        parentReportAction,
        iouTransactionID,
        moneyRequestReport?.reportID,
        currentUserPersonalDetails.accountID,
        isTaskActionable,
        isRootGroupChat,
        leaveChat,
        showLastMemberLeavingModal,
        isSmallScreenWidth,
        isRestrictedToPreferredPolicy,
        preferredPolicyID,
        introSelected,
        allTransactionDrafts,
        activePolicy,
        parentReport,
    ]);

    const displayNamesWithTooltips = useMemo(() => {
        const hasMultipleParticipants = participants.length > 1;
        return getDisplayNamesWithTooltips(getPersonalDetailsForAccountIDs(participants, personalDetails), hasMultipleParticipants, localeCompare, formatPhoneNumber);
    }, [participants, personalDetails, localeCompare, formatPhoneNumber]);

    const icons = useMemo(
        () => getIcons(report, formatPhoneNumber, personalDetails, null, '', -1, policy, undefined, isReportArchived),
        [report, formatPhoneNumber, personalDetails, policy, isReportArchived],
    );

    const chatRoomSubtitleText = chatRoomSubtitle ? (
        <DisplayNames
            fullTitle={chatRoomSubtitle}
            tooltipEnabled
            numberOfLines={1}
            textStyles={[styles.sidebarLinkText, styles.textLabelSupporting, styles.pre, styles.mt1, styles.textAlignCenter]}
            shouldUseFullTitle
        />
    ) : null;

    const renderedAvatar = useMemo(() => {
        if (isChatRoom && !isThread) {
            return (
                <View style={styles.mb3}>
                    <RoomHeaderAvatars
                        icons={icons}
                        report={report}
                        policy={policy}
                        participants={participants}
                        currentUserAccountID={currentUserPersonalDetails.accountID}
                    />
                </View>
            );
        }
        if (!isGroupChat || isThread) {
            return (
                <View style={styles.mb3}>
                    <ReportActionAvatars
                        noRightMarginOnSubscriptContainer
                        size={CONST.AVATAR_SIZE.X_LARGE}
                        useProfileNavigationWrapper
                        singleAvatarContainerStyle={[]}
                        reportID={report?.reportID ?? moneyRequestReport?.reportID}
                    />
                </View>
            );
        }

        return (
            <AvatarWithImagePicker
                source={icons.at(0)?.source}
                avatarID={icons.at(0)?.id}
                isUsingDefaultAvatar={!report.avatarUrl}
                size={CONST.AVATAR_SIZE.X_LARGE}
                avatarStyle={styles.avatarXLarge}
                onViewPhotoPress={() => Navigation.navigate(ROUTES.REPORT_AVATAR.getRoute(report.reportID))}
                onImageRemoved={() => {
                    // Calling this without a file will remove the avatar
                    updateGroupChatAvatar(report.reportID, report.avatarUrl);
                }}
                onImageSelected={(file) => updateGroupChatAvatar(report.reportID, report.avatarUrl, file)}
                editIcon={expensifyIcons.Camera}
                editIconStyle={styles.smallEditIconAccount}
                pendingAction={report.pendingFields?.avatar ?? undefined}
                errors={report.errorFields?.avatar ?? null}
                errorRowStyles={styles.mt6}
                onErrorClose={() => clearAvatarErrors(report.reportID)}
                style={[styles.w100, styles.mb3]}
            />
        );
    }, [
        isChatRoom,
        isThread,
        isGroupChat,
        icons,
        report,
        styles.avatarXLarge,
        styles.smallEditIconAccount,
        styles.mt6,
        styles.w100,
        styles.mb3,
        policy,
        participants,
        moneyRequestReport?.reportID,
        expensifyIcons.Camera,
        currentUserPersonalDetails?.accountID,
    ]);

    const canJoin = canJoinChat(report, parentReportAction, policy, parentReport, !!reportNameValuePairs?.private_isArchived);

    const promotedActions = useMemo(() => {
        const result: PromotedAction[] = [];

        if (canJoin) {
            result.push(PromotedActions.join(report, currentUserPersonalDetails.accountID));
        }

        if (report) {
            result.push(PromotedActions.pin(report));
        }

        result.push(PromotedActions.share(report, backTo));

        return result;
    }, [canJoin, report, backTo, currentUserPersonalDetails.accountID]);

    const nameSectionExpenseIOU = (
        <View style={[styles.reportDetailsRoomInfo, styles.mw100]}>
            {shouldDisableRename && (
                <>
                    <View style={[styles.alignSelfCenter, styles.w100, styles.mt1]}>
                        <DisplayNames
                            fullTitle={reportName}
                            displayNamesWithTooltips={displayNamesWithTooltips}
                            shouldParseFullTitle={!isGroupChat}
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
                            accessibilityLabel={chatRoomSubtitle}
                            accessible
                            sentryLabel={CONST.SENTRY_LABEL.REPORT_DETAILS.WORKSPACE_LINK}
                            onPress={() => {
                                let policyID = report?.policyID;

                                if (!policyID) {
                                    policyID = '';
                                }

                                Navigation.navigate(ROUTES.WORKSPACE_INITIAL.getRoute(policyID));
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
                <View style={[styles.w100, styles.mt1, styles.alignItemsCenter]}>
                    <View style={styles.mw100}>
                        <ParentNavigationSubtitle
                            parentNavigationSubtitleData={parentNavigationSubtitleData}
                            reportID={report?.reportID}
                            parentReportID={report?.parentReportID}
                            parentReportActionID={report?.parentReportActionID}
                            pressableStyles={[styles.mt1, styles.mw100]}
                            textStyles={[styles.textAlignCenter]}
                            subtitleNumberOfLines={2}
                        />
                    </View>
                </View>
            )}
        </View>
    );

    const nameSectionGroupWorkspace = (
        <OfflineWithFeedback
            pendingAction={report?.pendingFields?.reportName}
            errors={report?.errorFields?.reportName ?? null}
            errorRowStyles={[styles.ph5]}
            onClose={() => clearPolicyRoomNameErrors(report?.reportID)}
        >
            <View style={[styles.flex1, !shouldDisableRename && styles.mt3]}>
                <MenuItemWithTopDescription
                    shouldShowRightIcon={!shouldDisableRename}
                    interactive={!shouldDisableRename}
                    title={StringUtils.lineBreaksToSpaces(reportName)}
                    titleStyle={styles.newKansasLarge}
                    titleContainerStyle={shouldDisableRename && styles.alignItemsCenter}
                    shouldCheckActionAllowedOnPress={false}
                    description={!shouldDisableRename ? roomDescription : ''}
                    furtherDetails={chatRoomSubtitle && !isGroupChat ? additionalRoomDetails : ''}
                    furtherDetailsNumberOfLines={isWorkspaceChat ? 0 : undefined}
                    furtherDetailsStyle={isWorkspaceChat ? [styles.textAlignCenter, styles.breakWord] : undefined}
                    onPress={() => Navigation.navigate(ROUTES.REPORT_SETTINGS_NAME.getRoute(report.reportID, backTo))}
                    numberOfLinesTitle={isThread ? 2 : 0}
                    shouldBreakWord
                />
            </View>
        </OfflineWithFeedback>
    );

    const titleField = useMemo<OnyxTypes.PolicyReportField | undefined>((): OnyxTypes.PolicyReportField | undefined => {
        const fields = getAvailableReportFields(report, Object.values(policy?.fieldList ?? {}));
        return fields.find((reportField) => isReportFieldOfTypeTitle(reportField));
    }, [report, policy?.fieldList]);
    const fieldKey = getReportFieldKey(titleField?.fieldID);
    const isFieldDisabled = isReportFieldDisabled(report, titleField, policy);

    const shouldShowTitleField = caseID !== CASES.MONEY_REQUEST && !isFieldDisabled && isAdminOwnerApproverOrReportOwner(report, policy);

    const nameSectionFurtherDetailsContent = (
        <ParentNavigationSubtitle
            parentNavigationSubtitleData={parentNavigationSubtitleData}
            reportID={report?.reportID}
            parentReportID={report?.parentReportID}
            parentReportActionID={report?.parentReportActionID}
            pressableStyles={[styles.mt1, styles.mw100]}
            subtitleNumberOfLines={2}
        />
    );

    const nameSectionTitleField = !!titleField && (
        <OfflineWithFeedback
            pendingAction={report.pendingFields?.reportName}
            errors={report.errorFields?.reportName ?? null}
            errorRowStyles={styles.ph5}
            key={`menuItem-${fieldKey}`}
            onClose={() => clearPolicyRoomNameErrors(report.reportID)}
        >
            <View style={[styles.flex1]}>
                <MenuItemWithTopDescription
                    shouldShowRightIcon={!isFieldDisabled}
                    interactive={!isFieldDisabled}
                    title={reportName}
                    titleStyle={styles.newKansasLarge}
                    shouldCheckActionAllowedOnPress={false}
                    description={Str.UCFirst(titleField.name)}
                    onPress={() => {
                        let policyID = report.policyID;

                        if (!policyID) {
                            policyID = '';
                        }

                        Navigation.navigate(ROUTES.EDIT_REPORT_FIELD_REQUEST.getRoute(report.reportID, policyID, titleField.fieldID, backTo));
                    }}
                    furtherDetailsComponent={nameSectionFurtherDetailsContent}
                />
            </View>
        </OfflineWithFeedback>
    );

    const deleteTransaction = useCallback(() => {
        if (caseID === CASES.DEFAULT) {
            deleteTask(report, parentReport, isReportArchived, currentUserPersonalDetails.accountID, hasOutstandingChildTask, parentReportAction, ancestors);
            return;
        }

        if (!requestParentReportAction) {
            return;
        }

        const isTrackExpense = isTrackExpenseAction(requestParentReportAction);

        if (isTrackExpense) {
            deleteTrackExpense({
                chatReportID: moneyRequestReport?.reportID,
                chatReport: moneyRequestReport,
                transactionID: iouTransactionID,
                reportAction: requestParentReportAction,
                iouReport,
                chatIOUReport,
                transactions: duplicateTransactions,
                violations: duplicateTransactionViolations,
                isSingleTransactionView,
                isChatReportArchived: isMoneyRequestReportArchived,
                isChatIOUReportArchived,
                allTransactionViolationsParam: allTransactionViolations,
                currentUserAccountID: currentUserPersonalDetails.accountID,
            });
        } else if (iouTransactionID) {
            deleteTransactions([iouTransactionID], duplicateTransactions, duplicateTransactionViolations, currentSearchHash, isSingleTransactionView);
            removeTransaction(iouTransactionID);
        }
    }, [
        ancestors,
        caseID,
        requestParentReportAction,
        report,
        isReportArchived,
        currentUserPersonalDetails.accountID,
        iouTransactionID,
        duplicateTransactions,
        duplicateTransactionViolations,
        isSingleTransactionView,
        moneyRequestReport,
        removeTransaction,
        allTransactionViolations,
        isMoneyRequestReportArchived,
        iouReport,
        chatIOUReport,
        deleteTransactions,
        currentSearchHash,
        isChatIOUReportArchived,
        hasOutstandingChildTask,
        parentReportAction,
        parentReport,
    ]);

    // Where to navigate back to after deleting the transaction and its report.
    const navigateToTargetUrl = useCallback(() => {
        let urlToNavigateBack: string | undefined;
        // Only proceed with navigation logic if transaction was actually deleted
        if (!isEmptyObject(requestParentReportAction)) {
            const rootState = navigationRef.getRootState();
            const rhp = rootState.routes.at(-1);
            const rhpRoutes = rhp?.state?.routes ?? [];
            const previousRoute = rhpRoutes.at(-2);
            const superWideRHPIndex = rhpRoutes.findIndex((rhpRoute) => SUPER_WIDE_RIGHT_MODALS.has(rhpRoute.name));

            // If the deleted expense is displayed directly below, close the entire RHP
            const isSuperWideRHPDisplayed = superWideRHPIndex > -1;
            const isSuperWideRHPDisplayedDirectlyBelow = isSuperWideRHPDisplayed && superWideRHPIndex === rhpRoutes.length - 2;
            if (
                isSuperWideRHPDisplayedDirectlyBelow &&
                (previousRoute?.params as RightModalNavigatorParamList[typeof SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT])?.reportID === route.params.reportID
            ) {
                Navigation.dismissModal();
                return;
            }

            // If the deleted expense is opened from the super wide rhp, go back there.
            if (
                previousRoute?.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT &&
                (previousRoute.params as RightModalNavigatorParamList[typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT])?.reportID === route.params.reportID
            ) {
                if (isSuperWideRHPDisplayed) {
                    const distanceToPop = rhpRoutes.length - 1 - superWideRHPIndex;
                    navigationRef.dispatch({...StackActions.pop(distanceToPop), target: rhp?.state?.key});
                    return;
                }
                Navigation.dismissModal();
                return;
            }

            const isTrackExpense = isTrackExpenseAction(requestParentReportAction);
            if (isTrackExpense) {
                urlToNavigateBack = getNavigationUrlAfterTrackExpenseDelete(
                    moneyRequestReport?.reportID,
                    moneyRequestReport,
                    iouTransactionID,
                    requestParentReportAction,
                    iouReport,
                    chatIOUReport,
                    isChatIOUReportArchived,
                    isSingleTransactionView,
                );
            } else {
                urlToNavigateBack = getNavigationUrlOnMoneyRequestDelete(
                    iouTransactionID,
                    requestParentReportAction,
                    iouReport,
                    chatIOUReport,
                    isChatIOUReportArchived,
                    isSingleTransactionView,
                );
            }
        }

        if (!urlToNavigateBack) {
            Navigation.dismissModal();
        } else {
            setDeleteTransactionNavigateBackUrl(urlToNavigateBack);
            navigateBackOnDeleteTransaction(urlToNavigateBack as Route);
        }
    }, [requestParentReportAction, route.params.reportID, moneyRequestReport, iouTransactionID, iouReport, chatIOUReport, isChatIOUReportArchived, isSingleTransactionView]);

    const showDeleteModal = useCallback(async () => {
        const {action} = await showConfirmModal({
            title: caseID === CASES.DEFAULT ? translate('task.deleteTask') : translate('iou.deleteExpense', {count: 1}),
            prompt: caseID === CASES.DEFAULT ? translate('task.deleteConfirmation') : translate('iou.deleteConfirmation', {count: 1}),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            danger: true,
            shouldEnableNewFocusManagement: true,
        });
        if (action !== ModalActions.CONFIRM) {
            return;
        }
        Navigation.setNavigationActionToMicrotaskQueue(() => {
            navigateToTargetUrl();
            deleteTransaction();
        });
    }, [showConfirmModal, translate, caseID, navigateToTargetUrl, deleteTransaction]);

    const mentionReportContextValue = useMemo(() => ({currentReportID: report.reportID, exactlyMatch: true}), [report.reportID]);

    return (
        <ScreenWrapper testID="ReportDetailsPage">
            <FullPageNotFoundView shouldShow={isEmptyObject(report)}>
                <HeaderWithBackButton
                    title={translate('common.details')}
                    onBackButtonPress={() => Navigation.goBack(backTo)}
                />
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    <View style={[styles.reportDetailsTitleContainer, styles.pb0]}>
                        {renderedAvatar}
                        {isExpenseReport && (!shouldShowTitleField || !titleField) && nameSectionExpenseIOU}
                    </View>

                    {isExpenseReport && shouldShowTitleField && titleField && nameSectionTitleField}

                    {!isExpenseReport && nameSectionGroupWorkspace}

                    {shouldShowReportDescription && (
                        <OfflineWithFeedback pendingAction={report.pendingFields?.description}>
                            <MentionReportContext.Provider value={mentionReportContextValue}>
                                <MenuItemWithTopDescription
                                    shouldShowRightIcon
                                    interactive
                                    title={getReportDescription(report)}
                                    shouldRenderAsHTML
                                    shouldTruncateTitle
                                    characterLimit={100}
                                    shouldCheckActionAllowedOnPress={false}
                                    description={translate('reportDescriptionPage.roomDescription')}
                                    onPress={() => Navigation.navigate(ROUTES.REPORT_DESCRIPTION.getRoute(report.reportID, Navigation.getActiveRoute()))}
                                />
                            </MentionReportContext.Provider>
                        </OfflineWithFeedback>
                    )}

                    {isFinancialReportsForBusinesses && (
                        <>
                            <MenuItemWithTopDescription
                                title={base62ReportID}
                                description={translate('common.reportID')}
                                copyValue={base62ReportID}
                                interactive={false}
                                shouldBlockSelection
                                copyable
                            />
                            <MenuItemWithTopDescription
                                title={report.reportID}
                                description={translate('common.longReportID')}
                                copyValue={report.reportID}
                                interactive={false}
                                shouldBlockSelection
                                copyable
                            />
                        </>
                    )}

                    <PromotedActionsBar
                        containerStyle={styles.mt5}
                        promotedActions={promotedActions}
                    />

                    {menuItems.map((item) => (
                        <MenuItem
                            key={item.key}
                            title={translate(item.translationKey)}
                            subtitle={item.subtitle}
                            icon={item.icon}
                            onPress={item.action}
                            isAnonymousAction={item.isAnonymousAction}
                            shouldShowRightIcon={item.shouldShowRightIcon}
                            brickRoadIndicator={item.brickRoadIndicator}
                        />
                    ))}

                    {shouldShowDeleteButton && (
                        <MenuItem
                            key={CONST.REPORT_DETAILS_MENU_ITEM.DELETE}
                            icon={expensifyIcons.Trashcan}
                            title={caseID === CASES.DEFAULT ? translate('common.delete') : translate('reportActionContextMenu.deleteAction', {action: requestParentReportAction})}
                            onPress={showDeleteModal}
                        />
                    )}
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(ReportDetailsPage);
