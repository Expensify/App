import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import AvatarWithImagePicker from '@components/AvatarWithImagePicker';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import DecisionModal from '@components/DecisionModal';
import DelegateNoAccessModal from '@components/DelegateNoAccessModal';
import DisplayNames from '@components/DisplayNames';
import Header from '@components/Header';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MentionReportContext from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Modal from '@components/Modal';
import MultipleAvatars from '@components/MultipleAvatars';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ParentNavigationSubtitle from '@components/ParentNavigationSubtitle';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import type {PromotedAction} from '@components/PromotedActionsBar';
import PromotedActionsBar, {PromotedActions} from '@components/PromotedActionsBar';
import RoomHeaderAvatars from '@components/RoomHeaderAvatars';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useSearchContext} from '@components/Search/SearchContext';
import Text from '@components/Text';
import useDelegateUserDetails from '@hooks/useDelegateUserDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import {getPersonalDetailsForAccountIDs} from '@libs/OptionsListUtils';
import {getConnectedIntegration, isPolicyAdmin as isPolicyAdminUtil, isPolicyEmployee as isPolicyEmployeeUtil, shouldShowPolicy} from '@libs/PolicyUtils';
import {getOneTransactionThreadReportID, getOriginalMessage, getTrackExpenseActionableWhisper, isDeletedAction, isMoneyRequestAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {
    canDeleteCardTransactionByLiabilityType,
    canDeleteTransaction,
    canEditReportDescription as canEditReportDescriptionUtil,
    canHoldUnholdReportAction as canHoldUnholdReportActionUtil,
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
    getReportName,
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
    isExported,
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
    isTrackExpenseReport as isTrackExpenseReportUtil,
    isUserCreatedPolicyRoom as isUserCreatedPolicyRoomUtil,
    navigateBackOnDeleteTransaction,
    navigateToPrivateNotes,
    reportTransactionsSelector,
    shouldDisableRename as shouldDisableRenameUtil,
    shouldUseFullTitleToDisplay,
} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import {
    canCancelPayment,
    cancelPayment as cancelPaymentAction,
    canUnapproveIOU,
    deleteMoneyRequest,
    deleteTrackExpense,
    getNavigationUrlAfterTrackExpenseDelete,
    getNavigationUrlOnMoneyRequestDelete,
    unapproveExpenseReport,
} from '@userActions/IOU';
import {
    clearAvatarErrors,
    clearPolicyRoomNameErrors,
    downloadReportPDF,
    exportReportToCSV,
    exportReportToPDF,
    getReportPrivateNote,
    hasErrorInPrivateNotes,
    leaveGroupChat,
    leaveRoom,
    setDeleteTransactionNavigateBackUrl,
    updateGroupChatAvatar,
} from '@userActions/Report';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import {canActionTask as canActionTaskAction, canModifyTask as canModifyTaskAction, deleteTask, reopenTask} from '@userActions/Task';
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

type ReportDetailsPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.ROOT>;

const CASES = {
    DEFAULT: 'default',
    MONEY_REQUEST: 'money_request',
    MONEY_REPORT: 'money_report',
};

type CaseID = ValueOf<typeof CASES>;

function ReportDetailsPage({policies, report, route, reportMetadata}: ReportDetailsPageProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {canUsePDFExport} = usePermissions();
    const theme = useTheme();
    const styles = useThemeStyles();
    const backTo = route.params.backTo;

    // The app would crash due to subscribing to the entire report collection if parentReportID is an empty string. So we should have a fallback ID here.
    /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID || CONST.DEFAULT_NUMBER_ID}`);

    const [reportPDFFilename] = useOnyx(`${ONYXKEYS.COLLECTION.NVP_EXPENSIFY_REPORT_PDFFILENAME}${report?.reportID || CONST.DEFAULT_NUMBER_ID}`) ?? null;
    const [download] = useOnyx(`${ONYXKEYS.COLLECTION.DOWNLOAD}${reportPDFFilename}`);
    const isDownloadingPDF = download?.isDownloading ?? false;

    const [parentReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID || CONST.DEFAULT_NUMBER_ID}`, {
        selector: (actions) => (report?.parentReportActionID ? actions?.[report.parentReportActionID] : undefined),
    });
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID || CONST.DEFAULT_NUMBER_ID}`);
    const [parentReportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.parentReportID || CONST.DEFAULT_NUMBER_ID}`);
    /* eslint-enable @typescript-eslint/prefer-nullish-coalescing */
    const {reportActions} = usePaginatedReportActions(report.reportID);
    const {currentSearchHash} = useSearchContext();

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const transactionThreadReportID = useMemo(() => getOneTransactionThreadReportID(report.reportID, reportActions ?? [], isOffline), [report.reportID, reportActions, isOffline]);

    /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID || CONST.DEFAULT_NUMBER_ID}`);
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.USER, {selector: (user) => !!user?.isDebugModeEnabled});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (_transactions) => reportTransactionsSelector(_transactions, report.reportID),
        initialValue: [],
    });

    const [isLastMemberLeavingGroupModalVisible, setIsLastMemberLeavingGroupModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isUnapproveModalVisible, setIsUnapproveModalVisible] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [isPDFModalVisible, setIsPDFModalVisible] = useState(false);
    const [offlineModalVisible, setOfflineModalVisible] = useState(false);
    const [downloadErrorModalVisible, setDownloadErrorModalVisible] = useState(false);
    const policy = useMemo(() => policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`], [policies, report?.policyID]);
    const isPolicyAdmin = useMemo(() => isPolicyAdminUtil(policy), [policy]);
    const isPolicyEmployee = useMemo(() => isPolicyEmployeeUtil(report?.policyID, policies), [report?.policyID, policies]);
    const isPolicyExpenseChat = useMemo(() => isPolicyExpenseChatUtil(report), [report]);
    const shouldUseFullTitle = useMemo(() => shouldUseFullTitleToDisplay(report), [report]);
    const isChatRoom = useMemo(() => isChatRoomUtil(report), [report]);
    const isUserCreatedPolicyRoom = useMemo(() => isUserCreatedPolicyRoomUtil(report), [report]);
    const isDefaultRoom = useMemo(() => isDefaultRoomUtil(report), [report]);
    const isChatThread = useMemo(() => isChatThreadUtil(report), [report]);
    const isArchivedRoom = useMemo(() => isArchivedNonExpenseReport(report, reportNameValuePairs), [report, reportNameValuePairs]);
    const isMoneyRequestReport = useMemo(() => isMoneyRequestReportUtil(report), [report]);
    const isMoneyRequest = useMemo(() => isMoneyRequestUtil(report), [report]);
    const isInvoiceReport = useMemo(() => isInvoiceReportUtil(report), [report]);
    const isInvoiceRoom = useMemo(() => isInvoiceRoomUtil(report), [report]);
    const isTaskReport = useMemo(() => isTaskReportUtil(report), [report]);
    const isSelfDM = useMemo(() => isSelfDMUtil(report), [report]);
    const isTrackExpenseReport = useMemo(() => isTrackExpenseReportUtil(report), [report]);
    const isCanceledTaskReport = isCanceledTaskReportUtil(report, parentReportAction);
    const canModifyTask = canModifyTaskAction(report, session?.accountID ?? CONST.DEFAULT_NUMBER_ID);
    const canEditReportDescription = useMemo(() => canEditReportDescriptionUtil(report, policy), [report, policy]);
    const shouldShowReportDescription = isChatRoom && (canEditReportDescription || report.description !== '') && (isTaskReport ? canModifyTask : true);
    const isExpenseReport = isMoneyRequestReport || isInvoiceReport || isMoneyRequest;
    const isSingleTransactionView = isMoneyRequest || isTrackExpenseReport;
    const isSelfDMTrackExpenseReport = isTrackExpenseReport && isSelfDMUtil(parentReport);
    const shouldDisableRename = useMemo(() => shouldDisableRenameUtil(report), [report]);
    const parentNavigationSubtitleData = getParentNavigationSubtitle(report);
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- policy is a dependency because `getChatRoomSubtitle` calls `getPolicyName` which in turn retrieves the value from the `policy` value stored in Onyx
    const chatRoomSubtitle = useMemo(() => {
        const subtitle = getChatRoomSubtitle(report);

        if (subtitle) {
            return subtitle;
        }

        return '';
    }, [report]);

    const messagePDF = useMemo(() => {
        if (!reportPDFFilename) {
            return translate('reportDetailsPage.waitForPDF');
        }
        if (reportPDFFilename === CONST.REPORT_DETAILS_MENU_ITEM.ERROR) {
            return translate('reportDetailsPage.errorPDF');
        }
        return translate('reportDetailsPage.generatedPDF');
    }, [reportPDFFilename, translate]);

    const isSystemChat = useMemo(() => isSystemChatUtil(report), [report]);
    const isGroupChat = useMemo(() => isGroupChatUtil(report), [report]);
    const isRootGroupChat = useMemo(() => isRootGroupChatUtil(report), [report]);
    const isThread = useMemo(() => isThreadUtil(report), [report]);
    const shouldOpenRoomMembersPage = isUserCreatedPolicyRoom || isChatThread || (isPolicyExpenseChat && isPolicyAdmin);
    const participants = useMemo(() => {
        return getParticipantsList(report, personalDetails, shouldOpenRoomMembersPage);
    }, [report, personalDetails, shouldOpenRoomMembersPage]);
    const connectedIntegration = getConnectedIntegration(policy);

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

    const transactionIDList = useMemo(() => {
        if (caseID !== CASES.MONEY_REPORT || !transactions) {
            return [];
        }
        return transactions.map((transaction) => transaction.transactionID);
    }, [caseID, transactions]);

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

    const isActionOwner =
        typeof requestParentReportAction?.actorAccountID === 'number' && typeof session?.accountID === 'number' && requestParentReportAction.actorAccountID === session?.accountID;
    const isDeletedParentAction = isDeletedAction(requestParentReportAction);

    const moneyRequestReport: OnyxEntry<OnyxTypes.Report> = useMemo(() => {
        if (caseID === CASES.MONEY_REQUEST) {
            return parentReport;
        }
        return report;
    }, [caseID, parentReport, report]);

    const moneyRequestAction = transactionThreadReportID ? requestParentReportAction : parentReportAction;

    const canActionTask = canActionTaskAction(report, session?.accountID ?? CONST.DEFAULT_NUMBER_ID);
    const shouldShowTaskDeleteButton =
        isTaskReport && !isCanceledTaskReport && canWriteInReport(report) && report.stateNum !== CONST.REPORT.STATE_NUM.APPROVED && !isClosedReport(report) && canModifyTask && canActionTask;
    const canDeleteRequest = isActionOwner && (canDeleteTransaction(moneyRequestReport) || isSelfDMTrackExpenseReport) && !isDeletedParentAction;
    const iouTransactionID = isMoneyRequestAction(requestParentReportAction) ? getOriginalMessage(requestParentReportAction)?.IOUTransactionID : '';
    const isCardTransactionCanBeDeleted = canDeleteCardTransactionByLiabilityType(iouTransactionID);
    const shouldShowDeleteButton = shouldShowTaskDeleteButton || (canDeleteRequest && isCardTransactionCanBeDeleted);

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

        getReportPrivateNote(report?.reportID);
    }, [report?.reportID, isOffline, isPrivateNotesFetchTriggered, isSelfDM]);

    const leaveChat = useCallback(() => {
        Navigation.dismissModal();
        Navigation.isNavigationReady().then(() => {
            if (isRootGroupChat) {
                leaveGroupChat(report.reportID);
                return;
            }
            const isWorkspaceMemberLeavingWorkspaceRoom = (report.visibility === CONST.REPORT.VISIBILITY.RESTRICTED || isPolicyExpenseChat) && isPolicyEmployee;
            leaveRoom(report.reportID, isWorkspaceMemberLeavingWorkspaceRoom);
        });
    }, [isPolicyEmployee, isPolicyExpenseChat, isRootGroupChat, report.reportID, report.visibility]);

    const [moneyRequestReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${moneyRequestReport?.reportID}`);
    const isMoneyRequestExported = isExported(moneyRequestReportActions);
    const {isDelegateAccessRestricted} = useDelegateUserDetails();
    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);

    const unapproveExpenseReportOrShowModal = useCallback(() => {
        if (isDelegateAccessRestricted) {
            setIsNoDelegateAccessMenuVisible(true);
        } else if (isMoneyRequestExported) {
            setIsUnapproveModalVisible(true);
            return;
        }
        Navigation.dismissModal();
        unapproveExpenseReport(moneyRequestReport);
    }, [isMoneyRequestExported, moneyRequestReport, isDelegateAccessRestricted]);

    const shouldShowLeaveButton = canLeaveChat(report, policy);
    const shouldShowGoToWorkspace = shouldShowPolicy(policy, false, session?.email) && !policy?.isJoinRequestPending;

    const reportName = getReportName(report);

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
    const shouldShowCancelPaymentButton = caseID === CASES.MONEY_REPORT && canCancelPayment(moneyRequestReport, session);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReport?.chatReportID}`);

    const cancelPayment = useCallback(() => {
        if (!chatReport) {
            return;
        }

        cancelPaymentAction(moneyRequestReport, chatReport, backTo);
        setIsConfirmModalVisible(false);
    }, [moneyRequestReport, chatReport, backTo]);

    const beginPDFExport = useCallback(() => {
        setIsPDFModalVisible(true);
        exportReportToPDF({reportID: report.reportID});
    }, [report]);

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
                icon: Expensicons.Users,
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
                icon: Expensicons.Gear,
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
                icon: Expensicons.Send,
                isAnonymousAction: false,
                shouldShowRightIcon: true,
                action: () => {
                    createDraftTransactionAndNavigateToParticipantSelector(iouTransactionID, actionReportID, CONST.IOU.ACTION.SUBMIT, actionableWhisperReportActionID);
                },
            });
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.TRACK.CATEGORIZE,
                translationKey: 'actionableMentionTrackExpense.categorize',
                icon: Expensicons.Folder,
                isAnonymousAction: false,
                shouldShowRightIcon: true,
                action: () => {
                    createDraftTransactionAndNavigateToParticipantSelector(iouTransactionID, actionReportID, CONST.IOU.ACTION.CATEGORIZE, actionableWhisperReportActionID);
                },
            });
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.TRACK.SHARE,
                translationKey: 'actionableMentionTrackExpense.share',
                icon: Expensicons.UserPlus,
                isAnonymousAction: false,
                shouldShowRightIcon: true,
                action: () => {
                    createDraftTransactionAndNavigateToParticipantSelector(iouTransactionID, actionReportID, CONST.IOU.ACTION.SHARE, actionableWhisperReportActionID);
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
                action: () => navigateToPrivateNotes(report, session, backTo),
                brickRoadIndicator: hasErrorInPrivateNotes(report) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            });
        }

        // Show actions related to Task Reports
        if (isTaskReport && !isCanceledTaskReport) {
            if (isCompletedTaskReport(report) && canModifyTask && canActionTask) {
                items.push({
                    key: CONST.REPORT_DETAILS_MENU_ITEM.MARK_AS_INCOMPLETE,
                    icon: Expensicons.Checkmark,
                    translationKey: 'task.markAsIncomplete',
                    isAnonymousAction: false,
                    action: callFunctionIfActionIsAllowed(() => {
                        Navigation.dismissModal();
                        reopenTask(report);
                    }),
                });
            }
        }

        if (shouldShowCancelPaymentButton) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.CANCEL_PAYMENT,
                icon: Expensicons.Trashcan,
                translationKey: 'iou.cancelPayment',
                isAnonymousAction: false,
                action: () => setIsConfirmModalVisible(true),
            });
        }

        if (caseID === CASES.MONEY_REPORT) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.DOWNLOAD_CSV,
                translationKey: 'common.downloadAsCSV',
                icon: Expensicons.Table,
                isAnonymousAction: false,
                action: () => {
                    if (isOffline) {
                        setOfflineModalVisible(true);
                        return;
                    }

                    exportReportToCSV({reportID: report.reportID, transactionIDList}, () => {
                        setDownloadErrorModalVisible(true);
                    });
                },
            });
            if (canUsePDFExport) {
                items.push({
                    key: CONST.REPORT_DETAILS_MENU_ITEM.DOWNLOAD_PDF,
                    translationKey: 'common.downloadAsPDF',
                    icon: Expensicons.Document,
                    isAnonymousAction: false,
                    action: () => {
                        if (isOffline) {
                            setOfflineModalVisible(true);
                        } else {
                            beginPDFExport();
                        }
                    },
                });
            }
        }

        if (policy && connectedIntegration && isPolicyAdmin && !isSingleTransactionView && isExpenseReport) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.EXPORT,
                translationKey: 'common.export',
                icon: Expensicons.Export,
                isAnonymousAction: false,
                action: () => {
                    Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS_EXPORT.getRoute(report?.reportID, connectedIntegration, backTo));
                },
            });
        }

        if (canUnapproveIOU(report, policy)) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.UNAPPROVE,
                icon: Expensicons.CircularArrowBackwards,
                translationKey: 'iou.unapprove',
                isAnonymousAction: false,
                action: () => unapproveExpenseReportOrShowModal(),
            });
        }

        if (shouldShowGoToWorkspace) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.GO_TO_WORKSPACE,
                translationKey: 'workspace.common.goToWorkspace',
                icon: Expensicons.Building,
                action: () => {
                    if (!report?.policyID) {
                        return;
                    }
                    Navigation.navigate(ROUTES.WORKSPACE_INITIAL.getRoute(report?.policyID, Navigation.getActiveRoute()));
                },
                isAnonymousAction: false,
                shouldShowRightIcon: true,
            });
        }

        if (shouldShowLeaveButton) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.LEAVE_ROOM,
                translationKey: 'common.leave',
                icon: Expensicons.Exit,
                isAnonymousAction: true,
                action: () => {
                    if (getParticipantsAccountIDsForDisplay(report, false, true).length === 1 && isRootGroupChat) {
                        setIsLastMemberLeavingGroupModalVisible(true);
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
                icon: Expensicons.Bug,
                action: () => Navigation.navigate(ROUTES.DEBUG_REPORT.getRoute(report.reportID)),
                isAnonymousAction: true,
                shouldShowRightIcon: true,
            });
        }

        return items;
    }, [
        beginPDFExport,
        canUsePDFExport,
        isSelfDM,
        isArchivedRoom,
        isGroupChat,
        isDefaultRoom,
        isChatThread,
        isPolicyEmployee,
        isUserCreatedPolicyRoom,
        participants.length,
        report,
        isSystemChat,
        isPolicyExpenseChat,
        shouldShowMenuItem,
        isTrackExpenseReport,
        isDeletedParentAction,
        isMoneyRequestReport,
        isInvoiceReport,
        isTaskReport,
        isCanceledTaskReport,
        shouldShowCancelPaymentButton,
        shouldShowLeaveButton,
        policy,
        connectedIntegration,
        isPolicyAdmin,
        isSingleTransactionView,
        isExpenseReport,
        isDebugModeEnabled,
        shouldShowGoToWorkspace,
        activeChatMembers.length,
        shouldOpenRoomMembersPage,
        backTo,
        parentReportAction,
        iouTransactionID,
        moneyRequestReport?.reportID,
        session,
        canModifyTask,
        canActionTask,
        isRootGroupChat,
        leaveChat,
        isOffline,
        transactionIDList,
        unapproveExpenseReportOrShowModal,
        caseID,
    ]);

    const displayNamesWithTooltips = useMemo(() => {
        const hasMultipleParticipants = participants.length > 1;
        return getDisplayNamesWithTooltips(getPersonalDetailsForAccountIDs(participants, personalDetails), hasMultipleParticipants);
    }, [participants, personalDetails]);

    const icons = useMemo(() => getIcons(report, personalDetails, null, '', -1, policy), [report, personalDetails, policy]);

    const chatRoomSubtitleText = chatRoomSubtitle ? (
        <DisplayNames
            fullTitle={chatRoomSubtitle}
            tooltipEnabled
            numberOfLines={1}
            textStyles={[styles.sidebarLinkText, styles.textLabelSupporting, styles.pre, styles.mt1, styles.textAlignCenter]}
            shouldUseFullTitle
        />
    ) : null;

    const connectedIntegrationName = connectedIntegration ? translate('workspace.accounting.connectionName', {connectionName: connectedIntegration}) : '';
    const unapproveWarningText = (
        <Text>
            <Text style={[styles.textStrong, styles.noWrap]}>{translate('iou.headsUp')}</Text>{' '}
            <Text>{translate('iou.unapproveWithIntegrationWarning', {accountingIntegration: connectedIntegrationName})}</Text>
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
                    source={icons.at(0)?.source}
                    avatarID={icons.at(0)?.id}
                    isUsingDefaultAvatar={!report.avatarUrl}
                    size={CONST.AVATAR_SIZE.XLARGE}
                    avatarStyle={styles.avatarXLarge}
                    onViewPhotoPress={() => Navigation.navigate(ROUTES.REPORT_AVATAR.getRoute(report.reportID))}
                    onImageRemoved={() => {
                        // Calling this without a file will remove the avatar
                        updateGroupChatAvatar(report.reportID);
                    }}
                    onImageSelected={(file) => updateGroupChatAvatar(report.reportID, file)}
                    editIcon={Expensicons.Camera}
                    editIconStyle={styles.smallEditIconAccount}
                    pendingAction={report.pendingFields?.avatar ?? undefined}
                    errors={report.errorFields?.avatar ?? null}
                    errorRowStyles={styles.mt6}
                    onErrorClose={() => clearAvatarErrors(report.reportID)}
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

    const canHoldUnholdReportAction = canHoldUnholdReportActionUtil(moneyRequestAction);
    const shouldShowHoldAction =
        caseID !== CASES.DEFAULT &&
        (canHoldUnholdReportAction.canHoldRequest || canHoldUnholdReportAction.canUnholdRequest) &&
        !isArchivedNonExpenseReport(transactionThreadReportID ? report : parentReport, transactionThreadReportID ? reportNameValuePairs : parentReportNameValuePairs);
    const canJoin = canJoinChat(report, parentReportAction, policy);

    const promotedActions = useMemo(() => {
        const result: PromotedAction[] = [];

        if (canJoin) {
            result.push(PromotedActions.join(report));
        }

        if (isExpenseReport && shouldShowHoldAction) {
            result.push(
                PromotedActions.hold({
                    isTextHold: canHoldUnholdReportAction.canHoldRequest,
                    reportAction: moneyRequestAction,
                    reportID: transactionThreadReportID ? report.reportID : moneyRequestAction?.childReportID,
                    isDelegateAccessRestricted,
                    setIsNoDelegateAccessMenuVisible,
                    currentSearchHash,
                }),
            );
        }

        if (report) {
            result.push(PromotedActions.pin(report));
        }

        result.push(PromotedActions.share(report, backTo));

        return result;
    }, [
        report,
        moneyRequestAction,
        currentSearchHash,
        canJoin,
        isExpenseReport,
        shouldShowHoldAction,
        canHoldUnholdReportAction.canHoldRequest,
        transactionThreadReportID,
        isDelegateAccessRestricted,
        backTo,
    ]);

    const nameSectionExpenseIOU = (
        <View style={[styles.reportDetailsRoomInfo, styles.mw100]}>
            {shouldDisableRename && (
                <>
                    <View style={[styles.alignSelfCenter, styles.w100, styles.mt1]}>
                        <DisplayNames
                            fullTitle={reportName}
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
                            accessibilityLabel={chatRoomSubtitle}
                            accessible
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
                    furtherDetailsNumberOfLines={isPolicyExpenseChat ? 0 : undefined}
                    furtherDetailsStyle={isPolicyExpenseChat ? styles.textAlignCenter : undefined}
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
            parentReportID={report?.parentReportID}
            parentReportActionID={report?.parentReportActionID}
            pressableStyles={[styles.mt1, styles.mw100]}
        />
    );

    const nameSectionTitleField = !!titleField && (
        <OfflineWithFeedback
            pendingAction={report.pendingFields?.reportName}
            errors={report.errorFields?.reportName}
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
            deleteTask(report);
            return;
        }

        if (!requestParentReportAction) {
            return;
        }

        const isTrackExpense = isTrackExpenseAction(requestParentReportAction);

        if (isTrackExpense) {
            deleteTrackExpense(moneyRequestReport?.reportID, iouTransactionID, requestParentReportAction, isSingleTransactionView);
        } else {
            deleteMoneyRequest(iouTransactionID, requestParentReportAction, isSingleTransactionView);
        }
    }, [caseID, iouTransactionID, isSingleTransactionView, moneyRequestReport?.reportID, report, requestParentReportAction]);

    // A flag to indicate whether the user chose to delete the transaction or not
    const isTransactionDeleted = useRef<boolean>(false);

    useEffect(() => {
        return () => {
            // Perform the actual deletion after the details page is unmounted. This prevents the [Deleted ...] text from briefly appearing when dismissing the modal.
            if (!isTransactionDeleted.current) {
                return;
            }

            deleteTransaction();
        };
    }, [deleteTransaction]);

    // Where to navigate back to after deleting the transaction and its report.
    const navigateToTargetUrl = useCallback(() => {
        // If transaction was not deleted (i.e. Cancel was clicked), do nothing
        // which only dismiss the delete confirmation modal
        if (!isTransactionDeleted.current) {
            return;
        }

        let urlToNavigateBack: string | undefined;

        // Only proceed with navigation logic if transaction was actually deleted
        if (!isEmptyObject(requestParentReportAction)) {
            const isTrackExpense = isTrackExpenseAction(requestParentReportAction);
            if (isTrackExpense) {
                urlToNavigateBack = getNavigationUrlAfterTrackExpenseDelete(moneyRequestReport?.reportID, iouTransactionID, requestParentReportAction, isSingleTransactionView);
            } else {
                urlToNavigateBack = getNavigationUrlOnMoneyRequestDelete(iouTransactionID, requestParentReportAction, isSingleTransactionView);
            }
        }

        if (!urlToNavigateBack) {
            Navigation.dismissModal();
        } else {
            setDeleteTransactionNavigateBackUrl(urlToNavigateBack);
            navigateBackOnDeleteTransaction(urlToNavigateBack as Route, true);
        }
    }, [iouTransactionID, requestParentReportAction, isSingleTransactionView, isTransactionDeleted, moneyRequestReport?.reportID]);

    const mentionReportContextValue = useMemo(() => ({currentReportID: report.reportID, exactlyMatch: true}), [report.reportID]);

    return (
        <ScreenWrapper testID={ReportDetailsPage.displayName}>
            <FullPageNotFoundView shouldShow={isEmptyObject(report)}>
                <HeaderWithBackButton
                    title={translate('common.details')}
                    onBackButtonPress={() => Navigation.goBack(backTo)}
                />
                <ScrollView style={[styles.flex1]}>
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
                    title={translate('iou.cancelPayment')}
                    isVisible={isConfirmModalVisible}
                    onConfirm={cancelPayment}
                    onCancel={() => setIsConfirmModalVisible(false)}
                    prompt={translate('iou.cancelPaymentConfirmation')}
                    confirmText={translate('iou.cancelPayment')}
                    cancelText={translate('common.dismiss')}
                    danger
                    shouldEnableNewFocusManagement
                />
                <ConfirmModal
                    title={caseID === CASES.DEFAULT ? translate('task.deleteTask') : translate('iou.deleteExpense', {count: 1})}
                    isVisible={isDeleteModalVisible}
                    onConfirm={() => {
                        setIsDeleteModalVisible(false);
                        isTransactionDeleted.current = true;
                    }}
                    onCancel={() => setIsDeleteModalVisible(false)}
                    prompt={caseID === CASES.DEFAULT ? translate('task.deleteConfirmation') : translate('iou.deleteConfirmation', {count: 1})}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                    shouldEnableNewFocusManagement
                    onModalHide={navigateToTargetUrl}
                />
                <DelegateNoAccessModal
                    isNoDelegateAccessMenuVisible={isNoDelegateAccessMenuVisible}
                    onClose={() => setIsNoDelegateAccessMenuVisible(false)}
                />
                <ConfirmModal
                    title={translate('iou.unapproveReport')}
                    isVisible={isUnapproveModalVisible}
                    danger
                    confirmText={translate('iou.unapproveReport')}
                    onConfirm={() => {
                        setIsUnapproveModalVisible(false);
                        Navigation.dismissModal();
                        unapproveExpenseReport(moneyRequestReport);
                    }}
                    cancelText={translate('common.cancel')}
                    onCancel={() => setIsUnapproveModalVisible(false)}
                    prompt={unapproveWarningText}
                />
                <DecisionModal
                    title={translate('common.youAppearToBeOffline')}
                    prompt={translate('common.offlinePrompt')}
                    isSmallScreenWidth={isSmallScreenWidth}
                    onSecondOptionSubmit={() => setOfflineModalVisible(false)}
                    secondOptionText={translate('common.buttonConfirm')}
                    isVisible={offlineModalVisible}
                    onClose={() => setOfflineModalVisible(false)}
                />
                <DecisionModal
                    title={translate('common.downloadFailedTitle')}
                    prompt={translate('common.downloadFailedDescription')}
                    isSmallScreenWidth={isSmallScreenWidth}
                    onSecondOptionSubmit={() => setDownloadErrorModalVisible(false)}
                    secondOptionText={translate('common.buttonConfirm')}
                    isVisible={downloadErrorModalVisible}
                    onClose={() => setDownloadErrorModalVisible(false)}
                />
                <Modal
                    onClose={() => setIsPDFModalVisible(false)}
                    isVisible={isPDFModalVisible}
                    type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
                >
                    <View style={[styles.m5]}>
                        <View>
                            <View style={[styles.flexRow, styles.mb4]}>
                                <Header
                                    title={translate('reportDetailsPage.generatingPDF')}
                                    containerStyles={[styles.alignItemsCenter]}
                                />
                            </View>
                            <View>
                                <Text>{messagePDF}</Text>
                                {!reportPDFFilename && (
                                    <ActivityIndicator
                                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                                        color={theme.textSupporting}
                                        style={styles.mt3}
                                    />
                                )}
                            </View>
                        </View>
                        {!!reportPDFFilename && reportPDFFilename !== 'error' && (
                            <Button
                                isLoading={isDownloadingPDF}
                                style={[styles.mt3, styles.noSelect]}
                                onPress={() => downloadReportPDF(reportPDFFilename ?? '', reportName)}
                                text={translate('common.download')}
                            />
                        )}
                        {(!reportPDFFilename || reportPDFFilename === 'error') && (
                            <Button
                                style={[styles.mt3, styles.noSelect]}
                                onPress={() => setIsPDFModalVisible(false)}
                                text={translate('common.close')}
                            />
                        )}
                    </View>
                </Modal>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

ReportDetailsPage.displayName = 'ReportDetailsPage';

export default withReportOrNotFound()(ReportDetailsPage);
