"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var AvatarWithImagePicker_1 = require("@components/AvatarWithImagePicker");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var ConfirmModal_1 = require("@components/ConfirmModal");
var DisplayNames_1 = require("@components/DisplayNames");
var FixedFooter_1 = require("@components/FixedFooter");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var MentionReportContext_1 = require("@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var MultipleAvatars_1 = require("@components/MultipleAvatars");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ParentNavigationSubtitle_1 = require("@components/ParentNavigationSubtitle");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var PromotedActionsBar_1 = require("@components/PromotedActionsBar");
var RoomHeaderAvatars_1 = require("@components/RoomHeaderAvatars");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var SearchContext_1 = require("@components/Search/SearchContext");
var TextWithCopy_1 = require("@components/TextWithCopy");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePaginatedReportActions_1 = require("@hooks/usePaginatedReportActions");
var usePermissions_1 = require("@hooks/usePermissions");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getBase62ReportID_1 = require("@libs/getBase62ReportID");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var Parser_1 = require("@libs/Parser");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var StringUtils_1 = require("@libs/StringUtils");
var IOU_1 = require("@userActions/IOU");
var Report_1 = require("@userActions/Report");
var Session_1 = require("@userActions/Session");
var Task_1 = require("@userActions/Task");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var withReportOrNotFound_1 = require("./home/report/withReportOrNotFound");
var CASES = {
    DEFAULT: 'default',
    MONEY_REQUEST: 'money_request',
    MONEY_REPORT: 'money_report',
};
function ReportDetailsPage(_a) {
    var _b, _c, _d, _e, _f, _g;
    var policy = _a.policy, report = _a.report, route = _a.route, reportMetadata = _a.reportMetadata;
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var styles = (0, useThemeStyles_1.default)();
    var backTo = route.params.backTo;
    var parentReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.parentReportID), { canBeMissing: true })[0];
    var chatReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.chatReportID), { canBeMissing: true })[0];
    var parentReportAction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.parentReportID), {
        selector: function (actions) { return ((report === null || report === void 0 ? void 0 : report.parentReportActionID) ? actions === null || actions === void 0 ? void 0 : actions[report.parentReportActionID] : undefined); },
        canBeMissing: true,
    })[0];
    var reportNameValuePairs = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report === null || report === void 0 ? void 0 : report.reportID), { canBeMissing: false })[0];
    var reportActions = (0, usePaginatedReportActions_1.default)(report.reportID).reportActions;
    var removeTransaction = (0, SearchContext_1.useSearchContext)().removeTransaction;
    var transactionThreadReportID = (0, react_1.useMemo)(function () { return (0, ReportActionsUtils_1.getOneTransactionThreadReportID)(report, chatReport, reportActions !== null && reportActions !== void 0 ? reportActions : [], isOffline); }, [reportActions, isOffline, report, chatReport]);
    /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
    var transactionThreadReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReportID), { canBeMissing: true })[0];
    var isDebugModeEnabled = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { selector: function (account) { return !!(account === null || account === void 0 ? void 0 : account.isDebugModeEnabled); }, canBeMissing: false })[0];
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: false })[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var _h = (0, react_1.useState)(false), isLastMemberLeavingGroupModalVisible = _h[0], setIsLastMemberLeavingGroupModalVisible = _h[1];
    var _j = (0, react_1.useState)(false), isDeleteModalVisible = _j[0], setIsDeleteModalVisible = _j[1];
    var isPolicyAdmin = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.isPolicyAdmin)(policy); }, [policy]);
    var isPolicyEmployee = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.isPolicyEmployee)(report === null || report === void 0 ? void 0 : report.policyID, policy); }, [report === null || report === void 0 ? void 0 : report.policyID, policy]);
    var isPolicyExpenseChat = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isPolicyExpenseChat)(report); }, [report]);
    var shouldUseFullTitle = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.shouldUseFullTitleToDisplay)(report); }, [report]);
    var isChatRoom = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isChatRoom)(report); }, [report]);
    var isUserCreatedPolicyRoom = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isUserCreatedPolicyRoom)(report); }, [report]);
    var isDefaultRoom = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isDefaultRoom)(report); }, [report]);
    var isChatThread = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isChatThread)(report); }, [report]);
    var isMoneyRequestReport = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isMoneyRequestReport)(report); }, [report]);
    var isMoneyRequest = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isMoneyRequest)(report); }, [report]);
    var isInvoiceReport = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isInvoiceReport)(report); }, [report]);
    var isFinancialReportsForBusinesses = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isFinancialReportsForBusinesses)(report); }, [report]);
    var isInvoiceRoom = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isInvoiceRoom)(report); }, [report]);
    var isTaskReport = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isTaskReport)(report); }, [report]);
    var isSelfDM = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isSelfDM)(report); }, [report]);
    var isTrackExpenseReport = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isTrackExpenseReport)(report); }, [report]);
    var isCanceledTaskReport = (0, ReportUtils_1.isCanceledTaskReport)(report, parentReportAction);
    var isParentReportArchived = (0, useReportIsArchived_1.default)(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID);
    var isTaskModifiable = (0, Task_1.canModifyTask)(report, session === null || session === void 0 ? void 0 : session.accountID, isParentReportArchived);
    var isTaskActionable = (0, Task_1.canActionTask)(report, session === null || session === void 0 ? void 0 : session.accountID, parentReport, isParentReportArchived);
    var canEditReportDescription = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.canEditReportDescription)(report, policy); }, [report, policy]);
    var shouldShowReportDescription = isChatRoom && (canEditReportDescription || report.description !== '') && (isTaskReport ? isTaskModifiable : true);
    var isExpenseReport = isMoneyRequestReport || isInvoiceReport || isMoneyRequest;
    var isSingleTransactionView = isMoneyRequest || isTrackExpenseReport;
    var isSelfDMTrackExpenseReport = isTrackExpenseReport && (0, ReportUtils_1.isSelfDM)(parentReport);
    var isReportArchived = (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID);
    var isArchivedRoom = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isArchivedNonExpenseReport)(report, isReportArchived); }, [report, isReportArchived]);
    var shouldDisableRename = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.shouldDisableRename)(report, isReportArchived); }, [report, isReportArchived]);
    var parentNavigationSubtitleData = (0, ReportUtils_1.getParentNavigationSubtitle)(report);
    var base62ReportID = (0, getBase62ReportID_1.default)(Number(report.reportID));
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- policy is a dependency because `getChatRoomSubtitle` calls `getPolicyName` which in turn retrieves the value from the `policy` value stored in Onyx
    var chatRoomSubtitle = (0, react_1.useMemo)(function () {
        var subtitle = (0, ReportUtils_1.getChatRoomSubtitle)(report);
        if (subtitle) {
            return subtitle;
        }
        return '';
    }, [report]);
    var isSystemChat = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isSystemChat)(report); }, [report]);
    var isGroupChat = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isGroupChat)(report); }, [report]);
    var isRootGroupChat = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isRootGroupChat)(report); }, [report]);
    var isThread = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isThread)(report); }, [report]);
    var shouldOpenRoomMembersPage = isUserCreatedPolicyRoom || isChatThread || (isPolicyExpenseChat && isPolicyAdmin);
    var participants = (0, react_1.useMemo)(function () {
        return (0, ReportUtils_1.getParticipantsList)(report, personalDetails, shouldOpenRoomMembersPage);
    }, [report, personalDetails, shouldOpenRoomMembersPage]);
    var caseID;
    if (isMoneyRequestReport || isInvoiceReport) {
        // 3. MoneyReportHeader
        caseID = CASES.MONEY_REPORT;
    }
    else if (isSingleTransactionView) {
        // 2. MoneyRequestHeader
        caseID = CASES.MONEY_REQUEST;
    }
    else {
        // 1. HeaderView
        caseID = CASES.DEFAULT;
    }
    // Get the active chat members by filtering out the pending members with delete action
    var activeChatMembers = participants.flatMap(function (accountID) {
        var _a;
        var pendingMember = (_a = reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.pendingChatMembers) === null || _a === void 0 ? void 0 : _a.findLast(function (member) { return member.accountID === accountID.toString(); });
        var detail = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID];
        if (!detail) {
            return [];
        }
        return !pendingMember || pendingMember.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? accountID : [];
    });
    var isPrivateNotesFetchTriggered = (reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.isLoadingPrivateNotes) !== undefined;
    var requestParentReportAction = (0, react_1.useMemo)(function () {
        // 2. MoneyReport case
        if (caseID === CASES.MONEY_REPORT) {
            if (!reportActions || !(transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.parentReportActionID)) {
                return undefined;
            }
            return reportActions.find(function (action) { return action.reportActionID === transactionThreadReport.parentReportActionID; });
        }
        return parentReportAction;
    }, [caseID, parentReportAction, reportActions, transactionThreadReport === null || transactionThreadReport === void 0 ? void 0 : transactionThreadReport.parentReportActionID]);
    var isActionOwner = typeof (requestParentReportAction === null || requestParentReportAction === void 0 ? void 0 : requestParentReportAction.actorAccountID) === 'number' && typeof (session === null || session === void 0 ? void 0 : session.accountID) === 'number' && requestParentReportAction.actorAccountID === (session === null || session === void 0 ? void 0 : session.accountID);
    var isDeletedParentAction = (0, ReportActionsUtils_1.isDeletedAction)(requestParentReportAction);
    var moneyRequestReport = (0, react_1.useMemo)(function () {
        if (caseID === CASES.MONEY_REQUEST) {
            return parentReport;
        }
        return report;
    }, [caseID, parentReport, report]);
    var isMoneyRequestReportArchived = (0, useReportIsArchived_1.default)(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID);
    var shouldShowTaskDeleteButton = isTaskReport &&
        !isCanceledTaskReport &&
        (0, ReportUtils_1.canWriteInReport)(report) &&
        report.stateNum !== CONST_1.default.REPORT.STATE_NUM.APPROVED &&
        !(0, ReportUtils_1.isClosedReport)(report) &&
        isTaskModifiable &&
        isTaskActionable;
    var canDeleteRequest = isActionOwner && ((0, ReportUtils_1.canDeleteTransaction)(moneyRequestReport, isMoneyRequestReportArchived) || isSelfDMTrackExpenseReport) && !isDeletedParentAction;
    var iouTransactionID = (0, ReportActionsUtils_1.isMoneyRequestAction)(requestParentReportAction) ? (_b = (0, ReportActionsUtils_1.getOriginalMessage)(requestParentReportAction)) === null || _b === void 0 ? void 0 : _b.IOUTransactionID : undefined;
    var iouTransaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(iouTransactionID), { canBeMissing: true })[0];
    var isCardTransactionCanBeDeleted = (0, ReportUtils_1.canDeleteCardTransactionByLiabilityType)(iouTransaction);
    var shouldShowDeleteButton = shouldShowTaskDeleteButton || (canDeleteRequest && isCardTransactionCanBeDeleted);
    (0, react_1.useEffect)(function () {
        if (canDeleteRequest) {
            return;
        }
        setIsDeleteModalVisible(false);
    }, [canDeleteRequest]);
    (0, react_1.useEffect)(function () {
        // Do not fetch private notes if isLoadingPrivateNotes is already defined, or if the network is offline, or if the report is a self DM.
        if (isPrivateNotesFetchTriggered || isOffline || isSelfDM) {
            return;
        }
        (0, Report_1.getReportPrivateNote)(report === null || report === void 0 ? void 0 : report.reportID);
    }, [report === null || report === void 0 ? void 0 : report.reportID, isOffline, isPrivateNotesFetchTriggered, isSelfDM]);
    var leaveChat = (0, react_1.useCallback)(function () {
        Navigation_1.default.dismissModal();
        Navigation_1.default.isNavigationReady().then(function () {
            if (isRootGroupChat) {
                (0, Report_1.leaveGroupChat)(report.reportID);
                return;
            }
            var isWorkspaceMemberLeavingWorkspaceRoom = (report.visibility === CONST_1.default.REPORT.VISIBILITY.RESTRICTED || isPolicyExpenseChat) && isPolicyEmployee;
            (0, Report_1.leaveRoom)(report.reportID, isWorkspaceMemberLeavingWorkspaceRoom);
        });
    }, [isPolicyEmployee, isPolicyExpenseChat, isRootGroupChat, report.reportID, report.visibility]);
    var shouldShowLeaveButton = (0, ReportUtils_1.canLeaveChat)(report, policy);
    var shouldShowGoToWorkspace = (0, PolicyUtils_1.shouldShowPolicy)(policy, false, session === null || session === void 0 ? void 0 : session.email) && !(policy === null || policy === void 0 ? void 0 : policy.isJoinRequestPending);
    var reportName = Parser_1.default.htmlToText((0, ReportUtils_1.getReportName)(report));
    var additionalRoomDetails = (isPolicyExpenseChat && !!(report === null || report === void 0 ? void 0 : report.isOwnPolicyExpenseChat)) || (0, ReportUtils_1.isExpenseReport)(report) || isPolicyExpenseChat || isInvoiceRoom
        ? chatRoomSubtitle
        : "".concat(translate('threads.in'), " ").concat(chatRoomSubtitle);
    var roomDescription;
    if (caseID === CASES.MONEY_REQUEST) {
        roomDescription = translate('common.name');
    }
    else if (isGroupChat) {
        roomDescription = translate('newRoomPage.groupName');
    }
    else {
        roomDescription = translate('newRoomPage.roomName');
    }
    var shouldShowNotificationPref = !isMoneyRequestReport && !(0, ReportUtils_1.isHiddenForCurrentUser)(report);
    var shouldShowWriteCapability = !isMoneyRequestReport;
    var shouldShowMenuItem = shouldShowNotificationPref || shouldShowWriteCapability || (!!(report === null || report === void 0 ? void 0 : report.visibility) && report.chatType !== CONST_1.default.REPORT.CHAT_TYPE.INVOICE);
    var menuItems = (0, react_1.useMemo)(function () {
        var items = [];
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
        if ((isGroupChat ||
            (isDefaultRoom && isChatThread && isPolicyEmployee) ||
            (!isUserCreatedPolicyRoom && participants.length) ||
            (isUserCreatedPolicyRoom && (isPolicyEmployee || (isChatThread && !(0, ReportUtils_1.isPublicRoom)(report))))) &&
            !(0, ReportUtils_1.isConciergeChatReport)(report) &&
            !isSystemChat &&
            activeChatMembers.length > 0) {
            items.push({
                key: CONST_1.default.REPORT_DETAILS_MENU_ITEM.MEMBERS,
                translationKey: 'common.members',
                icon: Expensicons.Users,
                subtitle: activeChatMembers.length,
                isAnonymousAction: false,
                shouldShowRightIcon: true,
                action: function () {
                    if (shouldOpenRoomMembersPage) {
                        Navigation_1.default.navigate(ROUTES_1.default.ROOM_MEMBERS.getRoute(report === null || report === void 0 ? void 0 : report.reportID, backTo));
                    }
                    else {
                        Navigation_1.default.navigate(ROUTES_1.default.REPORT_PARTICIPANTS.getRoute(report === null || report === void 0 ? void 0 : report.reportID, backTo));
                    }
                },
            });
        }
        else if ((isUserCreatedPolicyRoom && (!participants.length || !isPolicyEmployee)) || ((isDefaultRoom || isPolicyExpenseChat) && isChatThread && !isPolicyEmployee)) {
            items.push({
                key: CONST_1.default.REPORT_DETAILS_MENU_ITEM.INVITE,
                translationKey: 'common.invite',
                icon: Expensicons.Users,
                isAnonymousAction: false,
                shouldShowRightIcon: true,
                action: function () {
                    Navigation_1.default.navigate(ROUTES_1.default.ROOM_INVITE.getRoute(report === null || report === void 0 ? void 0 : report.reportID));
                },
            });
        }
        if (shouldShowMenuItem) {
            items.push({
                key: CONST_1.default.REPORT_DETAILS_MENU_ITEM.SETTINGS,
                translationKey: 'common.settings',
                icon: Expensicons.Gear,
                isAnonymousAction: false,
                shouldShowRightIcon: true,
                action: function () {
                    Navigation_1.default.navigate(ROUTES_1.default.REPORT_SETTINGS.getRoute(report === null || report === void 0 ? void 0 : report.reportID, backTo));
                },
            });
        }
        if (isTrackExpenseReport && !isDeletedParentAction) {
            var actionReportID_1 = (0, ReportUtils_1.getOriginalReportID)(report.reportID, parentReportAction);
            var whisperAction = (0, ReportActionsUtils_1.getTrackExpenseActionableWhisper)(iouTransactionID, moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID);
            var actionableWhisperReportActionID_1 = whisperAction === null || whisperAction === void 0 ? void 0 : whisperAction.reportActionID;
            items.push({
                key: CONST_1.default.REPORT_DETAILS_MENU_ITEM.TRACK.SUBMIT,
                translationKey: 'actionableMentionTrackExpense.submit',
                icon: Expensicons.Send,
                isAnonymousAction: false,
                shouldShowRightIcon: true,
                action: function () {
                    (0, ReportUtils_1.createDraftTransactionAndNavigateToParticipantSelector)(iouTransactionID, actionReportID_1, CONST_1.default.IOU.ACTION.SUBMIT, actionableWhisperReportActionID_1);
                },
            });
            if (isBetaEnabled(CONST_1.default.BETAS.TRACK_FLOWS)) {
                items.push({
                    key: CONST_1.default.REPORT_DETAILS_MENU_ITEM.TRACK.CATEGORIZE,
                    translationKey: 'actionableMentionTrackExpense.categorize',
                    icon: Expensicons.Folder,
                    isAnonymousAction: false,
                    shouldShowRightIcon: true,
                    action: function () {
                        (0, ReportUtils_1.createDraftTransactionAndNavigateToParticipantSelector)(iouTransactionID, actionReportID_1, CONST_1.default.IOU.ACTION.CATEGORIZE, actionableWhisperReportActionID_1);
                    },
                });
                items.push({
                    key: CONST_1.default.REPORT_DETAILS_MENU_ITEM.TRACK.SHARE,
                    translationKey: 'actionableMentionTrackExpense.share',
                    icon: Expensicons.UserPlus,
                    isAnonymousAction: false,
                    shouldShowRightIcon: true,
                    action: function () {
                        (0, ReportUtils_1.createDraftTransactionAndNavigateToParticipantSelector)(iouTransactionID, actionReportID_1, CONST_1.default.IOU.ACTION.SHARE, actionableWhisperReportActionID_1);
                    },
                });
            }
        }
        // Prevent displaying private notes option for threads and task reports
        if (!isChatThread && !isMoneyRequestReport && !isInvoiceReport && !isTaskReport) {
            items.push({
                key: CONST_1.default.REPORT_DETAILS_MENU_ITEM.PRIVATE_NOTES,
                translationKey: 'privateNotes.title',
                icon: Expensicons.Pencil,
                isAnonymousAction: false,
                shouldShowRightIcon: true,
                action: function () { return (0, ReportUtils_1.navigateToPrivateNotes)(report, session, backTo); },
                brickRoadIndicator: (0, Report_1.hasErrorInPrivateNotes)(report) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            });
        }
        // Show actions related to Task Reports
        if (isTaskReport && !isCanceledTaskReport) {
            if ((0, ReportUtils_1.isCompletedTaskReport)(report) && isTaskActionable) {
                items.push({
                    key: CONST_1.default.REPORT_DETAILS_MENU_ITEM.MARK_AS_INCOMPLETE,
                    icon: Expensicons.Checkmark,
                    translationKey: 'task.markAsIncomplete',
                    isAnonymousAction: false,
                    action: (0, Session_1.callFunctionIfActionIsAllowed)(function () {
                        Navigation_1.default.goBack(backTo);
                        (0, Task_1.reopenTask)(report);
                    }),
                });
            }
        }
        if (shouldShowGoToWorkspace) {
            items.push({
                key: CONST_1.default.REPORT_DETAILS_MENU_ITEM.GO_TO_WORKSPACE,
                translationKey: 'workspace.common.goToWorkspace',
                icon: Expensicons.Building,
                action: function () {
                    if (!(report === null || report === void 0 ? void 0 : report.policyID)) {
                        return;
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_INITIAL.getRoute(report === null || report === void 0 ? void 0 : report.policyID, Navigation_1.default.getActiveRoute()));
                },
                isAnonymousAction: false,
                shouldShowRightIcon: true,
            });
        }
        if (shouldShowLeaveButton) {
            items.push({
                key: CONST_1.default.REPORT_DETAILS_MENU_ITEM.LEAVE_ROOM,
                translationKey: 'common.leave',
                icon: Expensicons.Exit,
                isAnonymousAction: true,
                action: function () {
                    if ((0, ReportUtils_1.getParticipantsAccountIDsForDisplay)(report, false, true).length === 1 && isRootGroupChat) {
                        setIsLastMemberLeavingGroupModalVisible(true);
                        return;
                    }
                    leaveChat();
                },
            });
        }
        if ((report === null || report === void 0 ? void 0 : report.reportID) && isDebugModeEnabled) {
            items.push({
                key: CONST_1.default.REPORT_DETAILS_MENU_ITEM.DEBUG,
                translationKey: 'debug.debug',
                icon: Expensicons.Bug,
                action: function () { return Navigation_1.default.navigate(ROUTES_1.default.DEBUG_REPORT.getRoute(report.reportID)); },
                isAnonymousAction: true,
                shouldShowRightIcon: true,
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
        moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID,
        isBetaEnabled,
        session,
        isTaskActionable,
        isRootGroupChat,
        leaveChat,
    ]);
    var displayNamesWithTooltips = (0, react_1.useMemo)(function () {
        var hasMultipleParticipants = participants.length > 1;
        return (0, ReportUtils_1.getDisplayNamesWithTooltips)((0, OptionsListUtils_1.getPersonalDetailsForAccountIDs)(participants, personalDetails), hasMultipleParticipants);
    }, [participants, personalDetails]);
    var icons = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.getIcons)(report, personalDetails, null, '', -1, policy); }, [report, personalDetails, policy]);
    var chatRoomSubtitleText = chatRoomSubtitle ? (<DisplayNames_1.default fullTitle={chatRoomSubtitle} tooltipEnabled numberOfLines={1} textStyles={[styles.sidebarLinkText, styles.textLabelSupporting, styles.pre, styles.mt1, styles.textAlignCenter]} shouldUseFullTitle/>) : null;
    var renderedAvatar = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e, _f;
        if (isMoneyRequestReport || isInvoiceReport) {
            return (<react_native_1.View style={styles.mb3}>
                    <MultipleAvatars_1.default icons={icons} size={CONST_1.default.AVATAR_SIZE.LARGE}/>
                </react_native_1.View>);
        }
        if (isGroupChat && !isThread) {
            return (<AvatarWithImagePicker_1.default source={(_a = icons.at(0)) === null || _a === void 0 ? void 0 : _a.source} avatarID={(_b = icons.at(0)) === null || _b === void 0 ? void 0 : _b.id} isUsingDefaultAvatar={!report.avatarUrl} size={CONST_1.default.AVATAR_SIZE.X_LARGE} avatarStyle={styles.avatarXLarge} onViewPhotoPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.REPORT_AVATAR.getRoute(report.reportID)); }} onImageRemoved={function () {
                    // Calling this without a file will remove the avatar
                    (0, Report_1.updateGroupChatAvatar)(report.reportID);
                }} onImageSelected={function (file) { return (0, Report_1.updateGroupChatAvatar)(report.reportID, file); }} editIcon={Expensicons.Camera} editIconStyle={styles.smallEditIconAccount} pendingAction={(_d = (_c = report.pendingFields) === null || _c === void 0 ? void 0 : _c.avatar) !== null && _d !== void 0 ? _d : undefined} errors={(_f = (_e = report.errorFields) === null || _e === void 0 ? void 0 : _e.avatar) !== null && _f !== void 0 ? _f : null} errorRowStyles={styles.mt6} onErrorClose={function () { return (0, Report_1.clearAvatarErrors)(report.reportID); }} shouldUseStyleUtilityForAnchorPosition style={[styles.w100, styles.mb3]}/>);
        }
        return (<react_native_1.View style={styles.mb3}>
                <RoomHeaderAvatars_1.default icons={icons} reportID={report === null || report === void 0 ? void 0 : report.reportID}/>
            </react_native_1.View>);
    }, [report, icons, isMoneyRequestReport, isInvoiceReport, isGroupChat, isThread, styles]);
    var canJoin = (0, ReportUtils_1.canJoinChat)(report, parentReportAction, policy, reportNameValuePairs);
    var promotedActions = (0, react_1.useMemo)(function () {
        var result = [];
        if (canJoin) {
            result.push(PromotedActionsBar_1.PromotedActions.join(report));
        }
        if (report) {
            result.push(PromotedActionsBar_1.PromotedActions.pin(report));
        }
        result.push(PromotedActionsBar_1.PromotedActions.share(report, backTo));
        return result;
    }, [canJoin, report, backTo]);
    var nameSectionExpenseIOU = (<react_native_1.View style={[styles.reportDetailsRoomInfo, styles.mw100]}>
            {shouldDisableRename && (<>
                    <react_native_1.View style={[styles.alignSelfCenter, styles.w100, styles.mt1]}>
                        <DisplayNames_1.default fullTitle={reportName} displayNamesWithTooltips={displayNamesWithTooltips} tooltipEnabled numberOfLines={isChatRoom && !isChatThread ? 0 : 1} textStyles={[styles.textHeadline, styles.textAlignCenter, isChatRoom && !isChatThread ? undefined : styles.pre]} shouldUseFullTitle={shouldUseFullTitle}/>
                    </react_native_1.View>
                    {isPolicyAdmin ? (<PressableWithoutFeedback_1.default style={[styles.w100]} disabled={(policy === null || policy === void 0 ? void 0 : policy.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={chatRoomSubtitle} accessible onPress={function () {
                    var policyID = report === null || report === void 0 ? void 0 : report.policyID;
                    if (!policyID) {
                        policyID = '';
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_INITIAL.getRoute(policyID));
                }}>
                            {chatRoomSubtitleText}
                        </PressableWithoutFeedback_1.default>) : (chatRoomSubtitleText)}
                </>)}
            {!(0, EmptyObject_1.isEmptyObject)(parentNavigationSubtitleData) && (isMoneyRequestReport || isInvoiceReport || isMoneyRequest || isTaskReport) && (<ParentNavigationSubtitle_1.default parentNavigationSubtitleData={parentNavigationSubtitleData} parentReportID={report === null || report === void 0 ? void 0 : report.parentReportID} parentReportActionID={report === null || report === void 0 ? void 0 : report.parentReportActionID} pressableStyles={[styles.mt1, styles.mw100]}/>)}
        </react_native_1.View>);
    var nameSectionGroupWorkspace = (<OfflineWithFeedback_1.default pendingAction={(_c = report === null || report === void 0 ? void 0 : report.pendingFields) === null || _c === void 0 ? void 0 : _c.reportName} errors={(_d = report === null || report === void 0 ? void 0 : report.errorFields) === null || _d === void 0 ? void 0 : _d.reportName} errorRowStyles={[styles.ph5]} onClose={function () { return (0, Report_1.clearPolicyRoomNameErrors)(report === null || report === void 0 ? void 0 : report.reportID); }}>
            <react_native_1.View style={[styles.flex1, !shouldDisableRename && styles.mt3]}>
                <MenuItemWithTopDescription_1.default shouldShowRightIcon={!shouldDisableRename} interactive={!shouldDisableRename} title={StringUtils_1.default.lineBreaksToSpaces(reportName)} titleStyle={styles.newKansasLarge} titleContainerStyle={shouldDisableRename && styles.alignItemsCenter} shouldCheckActionAllowedOnPress={false} description={!shouldDisableRename ? roomDescription : ''} furtherDetails={chatRoomSubtitle && !isGroupChat ? additionalRoomDetails : ''} furtherDetailsNumberOfLines={isPolicyExpenseChat ? 0 : undefined} furtherDetailsStyle={isPolicyExpenseChat ? styles.textAlignCenter : undefined} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.REPORT_SETTINGS_NAME.getRoute(report.reportID, backTo)); }} numberOfLinesTitle={isThread ? 2 : 0} shouldBreakWord/>
            </react_native_1.View>
        </OfflineWithFeedback_1.default>);
    var titleField = (0, react_1.useMemo)(function () {
        var _a;
        var fields = (0, ReportUtils_1.getAvailableReportFields)(report, Object.values((_a = policy === null || policy === void 0 ? void 0 : policy.fieldList) !== null && _a !== void 0 ? _a : {}));
        return fields.find(function (reportField) { return (0, ReportUtils_1.isReportFieldOfTypeTitle)(reportField); });
    }, [report, policy === null || policy === void 0 ? void 0 : policy.fieldList]);
    var fieldKey = (0, ReportUtils_1.getReportFieldKey)(titleField === null || titleField === void 0 ? void 0 : titleField.fieldID);
    var isFieldDisabled = (0, ReportUtils_1.isReportFieldDisabled)(report, titleField, policy);
    var shouldShowTitleField = caseID !== CASES.MONEY_REQUEST && !isFieldDisabled && (0, ReportUtils_1.isAdminOwnerApproverOrReportOwner)(report, policy);
    var nameSectionFurtherDetailsContent = (<ParentNavigationSubtitle_1.default parentNavigationSubtitleData={parentNavigationSubtitleData} parentReportID={report === null || report === void 0 ? void 0 : report.parentReportID} parentReportActionID={report === null || report === void 0 ? void 0 : report.parentReportActionID} pressableStyles={[styles.mt1, styles.mw100]}/>);
    var nameSectionTitleField = !!titleField && (<OfflineWithFeedback_1.default pendingAction={(_e = report.pendingFields) === null || _e === void 0 ? void 0 : _e.reportName} errors={(_f = report.errorFields) === null || _f === void 0 ? void 0 : _f.reportName} errorRowStyles={styles.ph5} key={"menuItem-".concat(fieldKey)} onClose={function () { return (0, Report_1.clearPolicyRoomNameErrors)(report.reportID); }}>
            <react_native_1.View style={[styles.flex1]}>
                <MenuItemWithTopDescription_1.default shouldShowRightIcon={!isFieldDisabled} interactive={!isFieldDisabled} title={reportName} titleStyle={styles.newKansasLarge} shouldCheckActionAllowedOnPress={false} description={expensify_common_1.Str.UCFirst(titleField.name)} onPress={function () {
            var policyID = report.policyID;
            if (!policyID) {
                policyID = '';
            }
            Navigation_1.default.navigate(ROUTES_1.default.EDIT_REPORT_FIELD_REQUEST.getRoute(report.reportID, policyID, titleField.fieldID, backTo));
        }} furtherDetailsComponent={nameSectionFurtherDetailsContent}/>
            </react_native_1.View>
        </OfflineWithFeedback_1.default>);
    var deleteTransaction = (0, react_1.useCallback)(function () {
        if (caseID === CASES.DEFAULT) {
            (0, Task_1.deleteTask)(report);
            return;
        }
        if (!requestParentReportAction) {
            return;
        }
        var isTrackExpense = (0, ReportActionsUtils_1.isTrackExpenseAction)(requestParentReportAction);
        if (isTrackExpense) {
            (0, IOU_1.deleteTrackExpense)(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID, iouTransactionID, requestParentReportAction, isSingleTransactionView);
        }
        else {
            (0, IOU_1.deleteMoneyRequest)(iouTransactionID, requestParentReportAction, isSingleTransactionView);
            removeTransaction(iouTransactionID);
        }
    }, [caseID, iouTransactionID, isSingleTransactionView, moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID, removeTransaction, report, requestParentReportAction]);
    // A flag to indicate whether the user chose to delete the transaction or not
    var isTransactionDeleted = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(function () {
        return function () {
            // Perform the actual deletion after the details page is unmounted. This prevents the [Deleted ...] text from briefly appearing when dismissing the modal.
            if (!isTransactionDeleted.current) {
                return;
            }
            deleteTransaction();
        };
    }, [deleteTransaction]);
    // Where to navigate back to after deleting the transaction and its report.
    var navigateToTargetUrl = (0, react_1.useCallback)(function () {
        // If transaction was not deleted (i.e. Cancel was clicked), do nothing
        // which only dismiss the delete confirmation modal
        if (!isTransactionDeleted.current) {
            return;
        }
        var urlToNavigateBack;
        // Only proceed with navigation logic if transaction was actually deleted
        if (!(0, EmptyObject_1.isEmptyObject)(requestParentReportAction)) {
            var isTrackExpense = (0, ReportActionsUtils_1.isTrackExpenseAction)(requestParentReportAction);
            if (isTrackExpense) {
                urlToNavigateBack = (0, IOU_1.getNavigationUrlAfterTrackExpenseDelete)(moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID, iouTransactionID, requestParentReportAction, isSingleTransactionView);
            }
            else {
                urlToNavigateBack = (0, IOU_1.getNavigationUrlOnMoneyRequestDelete)(iouTransactionID, requestParentReportAction, isSingleTransactionView);
            }
        }
        if (!urlToNavigateBack) {
            Navigation_1.default.dismissModal();
        }
        else {
            (0, Report_1.setDeleteTransactionNavigateBackUrl)(urlToNavigateBack);
            (0, ReportUtils_1.navigateBackOnDeleteTransaction)(urlToNavigateBack, true);
        }
    }, [iouTransactionID, requestParentReportAction, isSingleTransactionView, isTransactionDeleted, moneyRequestReport === null || moneyRequestReport === void 0 ? void 0 : moneyRequestReport.reportID]);
    var mentionReportContextValue = (0, react_1.useMemo)(function () { return ({ currentReportID: report.reportID, exactlyMatch: true }); }, [report.reportID]);
    return (<ScreenWrapper_1.default testID={ReportDetailsPage.displayName}>
            <FullPageNotFoundView_1.default shouldShow={(0, EmptyObject_1.isEmptyObject)(report)}>
                <HeaderWithBackButton_1.default title={translate('common.details')} onBackButtonPress={function () { return Navigation_1.default.goBack(backTo); }}/>
                <ScrollView_1.default contentContainerStyle={[styles.flexGrow1]}>
                    <react_native_1.View style={[styles.reportDetailsTitleContainer, styles.pb0]}>
                        {renderedAvatar}
                        {isExpenseReport && (!shouldShowTitleField || !titleField) && nameSectionExpenseIOU}
                    </react_native_1.View>

                    {isExpenseReport && shouldShowTitleField && titleField && nameSectionTitleField}

                    {!isExpenseReport && nameSectionGroupWorkspace}

                    {shouldShowReportDescription && (<OfflineWithFeedback_1.default pendingAction={(_g = report.pendingFields) === null || _g === void 0 ? void 0 : _g.description}>
                            <MentionReportContext_1.default.Provider value={mentionReportContextValue}>
                                <MenuItemWithTopDescription_1.default shouldShowRightIcon interactive title={(0, ReportUtils_1.getReportDescription)(report)} shouldRenderAsHTML shouldTruncateTitle characterLimit={100} shouldCheckActionAllowedOnPress={false} description={translate('reportDescriptionPage.roomDescription')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.REPORT_DESCRIPTION.getRoute(report.reportID, Navigation_1.default.getActiveRoute())); }}/>
                            </MentionReportContext_1.default.Provider>
                        </OfflineWithFeedback_1.default>)}

                    <PromotedActionsBar_1.default containerStyle={styles.mt5} promotedActions={promotedActions}/>

                    {menuItems.map(function (item) { return (<MenuItem_1.default key={item.key} title={translate(item.translationKey)} subtitle={item.subtitle} icon={item.icon} onPress={item.action} isAnonymousAction={item.isAnonymousAction} shouldShowRightIcon={item.shouldShowRightIcon} brickRoadIndicator={item.brickRoadIndicator}/>); })}

                    {shouldShowDeleteButton && (<MenuItem_1.default key={CONST_1.default.REPORT_DETAILS_MENU_ITEM.DELETE} icon={Expensicons.Trashcan} title={caseID === CASES.DEFAULT ? translate('common.delete') : translate('reportActionContextMenu.deleteAction', { action: requestParentReportAction })} onPress={function () { return setIsDeleteModalVisible(true); }}/>)}

                    {isFinancialReportsForBusinesses && (<FixedFooter_1.default style={[styles.alignItemsCenter, styles.flex1, styles.justifyContentEnd, styles.pt5]}>
                            <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                                <TextWithCopy_1.default copyValue={base62ReportID} style={styles.textMicroSupporting}>
                                    {"".concat(translate('common.reportID'), ": ").concat(base62ReportID)}
                                </TextWithCopy_1.default>
                                <TextWithCopy_1.default copyValue={report.reportID} style={styles.textMicroSupporting}>
                                    {"".concat(translate('common.longID'), ": ").concat(report.reportID)}
                                </TextWithCopy_1.default>
                            </react_native_1.View>
                        </FixedFooter_1.default>)}
                </ScrollView_1.default>
                <ConfirmModal_1.default danger title={translate('groupChat.lastMemberTitle')} isVisible={isLastMemberLeavingGroupModalVisible} onConfirm={function () {
            setIsLastMemberLeavingGroupModalVisible(false);
            leaveChat();
        }} onCancel={function () { return setIsLastMemberLeavingGroupModalVisible(false); }} prompt={translate('groupChat.lastMemberWarning')} confirmText={translate('common.leave')} cancelText={translate('common.cancel')}/>
                <ConfirmModal_1.default title={caseID === CASES.DEFAULT ? translate('task.deleteTask') : translate('iou.deleteExpense', { count: 1 })} isVisible={isDeleteModalVisible} onConfirm={function () {
            setIsDeleteModalVisible(false);
            isTransactionDeleted.current = true;
        }} onCancel={function () { return setIsDeleteModalVisible(false); }} prompt={caseID === CASES.DEFAULT ? translate('task.deleteConfirmation') : translate('iou.deleteConfirmation', { count: 1 })} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger shouldEnableNewFocusManagement onModalHide={navigateToTargetUrl}/>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
ReportDetailsPage.displayName = 'ReportDetailsPage';
exports.default = (0, withReportOrNotFound_1.default)()(ReportDetailsPage);
