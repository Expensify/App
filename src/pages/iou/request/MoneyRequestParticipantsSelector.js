"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var fast_equals_1 = require("fast-equals");
var pick_1 = require("lodash/pick");
var reject_1 = require("lodash/reject");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_permissions_1 = require("react-native-permissions");
var Button_1 = require("@components/Button");
var ContactPermissionModal_1 = require("@components/ContactPermissionModal");
var EmptySelectionListContent_1 = require("@components/EmptySelectionListContent");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var Expensicons_1 = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var OnyxProvider_1 = require("@components/OnyxProvider");
var OptionListContextProvider_1 = require("@components/OptionListContextProvider");
var ReferralProgramCTA_1 = require("@components/ReferralProgramCTA");
var SelectionList_1 = require("@components/SelectionList");
var InviteMemberListItem_1 = require("@components/SelectionList/InviteMemberListItem");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useDismissedReferralBanners_1 = require("@hooks/useDismissedReferralBanners");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useScreenWrapperTransitionStatus_1 = require("@hooks/useScreenWrapperTransitionStatus");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ContactImport_1 = require("@libs/ContactImport");
var useContactPermissions_1 = require("@libs/ContactPermission/useContactPermissions");
var ContactUtils_1 = require("@libs/ContactUtils");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var getPlatform_1 = require("@libs/getPlatform");
var goToSettings_1 = require("@libs/goToSettings");
var IOUUtils_1 = require("@libs/IOUUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var Policy_1 = require("@userActions/Policy/Policy");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var ImportContactButton_1 = require("./ImportContactButton");
function MoneyRequestParticipantsSelector(_a) {
    var _b;
    var _c = _a.participants, participants = _c === void 0 ? CONST_1.default.EMPTY_ARRAY : _c, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _d = _a.onFinish, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onFinish = _d === void 0 ? function (_value) { } : _d, onParticipantsAdded = _a.onParticipantsAdded, iouType = _a.iouType, action = _a.action, _e = _a.isWorkspacesOnly, isWorkspacesOnly = _e === void 0 ? false : _e, _f = _a.isPerDiemRequest, isPerDiemRequest = _f === void 0 ? false : _f;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var betas = (0, useOnyx_1.default)(ONYXKEYS_1.default.BETAS, { canBeMissing: true })[0];
    var _g = (0, react_1.useState)(react_native_permissions_1.RESULTS.UNAVAILABLE), contactPermissionState = _g[0], setContactPermissionState = _g[1];
    var platform = (0, getPlatform_1.default)();
    var isNative = platform === CONST_1.default.PLATFORM.ANDROID || platform === CONST_1.default.PLATFORM.IOS;
    var showImportContacts = isNative && !(contactPermissionState === react_native_permissions_1.RESULTS.GRANTED || contactPermissionState === react_native_permissions_1.RESULTS.LIMITED);
    var _h = (0, useDebouncedState_1.default)(''), searchTerm = _h[0], debouncedSearchTerm = _h[1], setSearchTerm = _h[2];
    var referralContentType = CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    var isDismissed = (0, useDismissedReferralBanners_1.default)({ referralContentType: referralContentType }).isDismissed;
    var didScreenTransitionEnd = (0, useScreenWrapperTransitionStatus_1.default)().didScreenTransitionEnd;
    var activePolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID, { canBeMissing: true })[0];
    var policy = (0, usePolicy_1.default)(activePolicyID);
    var isSearchingForReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_SEARCHING_FOR_REPORTS, { canBeMissing: true, initWithStoredValues: false })[0];
    var currentUserLogin = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: true, selector: function (session) { return session === null || session === void 0 ? void 0 : session.email; } })[0];
    var _j = (0, OptionListContextProvider_1.useOptionsList)({
        shouldInitialize: didScreenTransitionEnd,
    }), options = _j.options, areOptionsInitialized = _j.areOptionsInitialized, initializeOptions = _j.initializeOptions;
    var _k = (0, react_1.useState)([]), contacts = _k[0], setContacts = _k[1];
    var _l = (0, react_1.useState)(!isNative), textInputAutoFocus = _l[0], setTextInputAutoFocus = _l[1];
    var cleanSearchTerm = (0, react_1.useMemo)(function () { return debouncedSearchTerm.trim().toLowerCase(); }, [debouncedSearchTerm]);
    var offlineMessage = isOffline ? "".concat(translate('common.youAppearToBeOffline'), " ").concat(translate('search.resultsAreLimited')) : '';
    var isPaidGroupPolicy = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.isPaidGroupPolicy)(policy); }, [policy]);
    var isIOUSplit = iouType === CONST_1.default.IOU.TYPE.SPLIT;
    var isCategorizeOrShareAction = [CONST_1.default.IOU.ACTION.CATEGORIZE, CONST_1.default.IOU.ACTION.SHARE].some(function (option) { return option === action; });
    var tryNewDot = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_TRY_NEW_DOT, { canBeMissing: true })[0];
    var hasBeenAddedToNudgeMigration = !!((_b = tryNewDot === null || tryNewDot === void 0 ? void 0 : tryNewDot.nudgeMigration) === null || _b === void 0 ? void 0 : _b.timestamp);
    var importAndSaveContacts = (0, react_1.useCallback)(function () {
        (0, ContactImport_1.default)().then(function (_a) {
            var contactList = _a.contactList, permissionStatus = _a.permissionStatus;
            setContactPermissionState(permissionStatus);
            var usersFromContact = (0, ContactUtils_1.default)(contactList);
            setContacts(usersFromContact);
        });
    }, []);
    (0, react_1.useEffect)(function () {
        (0, Report_1.searchInServer)(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);
    (0, react_1.useEffect)(function () {
        // This is necessary to ensure the options list is always up to date
        // e.g. if the approver was changed in the policy, we need to update the options list
        initializeOptions();
    }, [initializeOptions]);
    (0, useContactPermissions_1.default)({
        importAndSaveContacts: importAndSaveContacts,
        setContacts: setContacts,
        contactPermissionState: contactPermissionState,
        setContactPermissionState: setContactPermissionState,
    });
    var defaultOptions = (0, react_1.useMemo)(function () {
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            return {
                userToInvite: null,
                recentReports: [],
                personalDetails: [],
                currentUserOption: null,
                headerMessage: '',
            };
        }
        var optionList = (0, OptionsListUtils_1.getValidOptions)({
            reports: options.reports,
            personalDetails: options.personalDetails.concat(contacts),
        }, {
            betas: betas,
            selectedOptions: participants,
            excludeLogins: CONST_1.default.EXPENSIFY_EMAILS_OBJECT,
            // If we are using this component in the "Submit expense" or the combined submit/track flow then we pass the includeOwnedWorkspaceChats argument so that the current user
            // sees the option to submit an expense from their admin on their own Expense Chat.
            includeOwnedWorkspaceChats: iouType === CONST_1.default.IOU.TYPE.SUBMIT || iouType === CONST_1.default.IOU.TYPE.CREATE || iouType === CONST_1.default.IOU.TYPE.SPLIT,
            // Sharing with an accountant involves inviting them to the workspace and that requires admin access.
            excludeNonAdminWorkspaces: action === CONST_1.default.IOU.ACTION.SHARE,
            // Per diem expenses should only be submitted to workspaces, not individual users
            includeP2P: !isCategorizeOrShareAction && !isPerDiemRequest,
            includeInvoiceRooms: iouType === CONST_1.default.IOU.TYPE.INVOICE,
            action: action,
            shouldSeparateSelfDMChat: iouType !== CONST_1.default.IOU.TYPE.INVOICE,
            shouldSeparateWorkspaceChat: true,
            includeSelfDM: !(0, IOUUtils_1.isMovingTransactionFromTrackExpense)(action) && iouType !== CONST_1.default.IOU.TYPE.INVOICE,
            canShowManagerMcTest: !hasBeenAddedToNudgeMigration && action !== CONST_1.default.IOU.ACTION.SUBMIT,
            isPerDiemRequest: isPerDiemRequest,
            showRBR: false,
        });
        var orderedOptions = (0, OptionsListUtils_1.orderOptions)(optionList);
        return __assign(__assign({}, optionList), orderedOptions);
    }, [
        action,
        contacts,
        areOptionsInitialized,
        betas,
        didScreenTransitionEnd,
        iouType,
        isCategorizeOrShareAction,
        options.personalDetails,
        options.reports,
        participants,
        isPerDiemRequest,
        hasBeenAddedToNudgeMigration,
    ]);
    var chatOptions = (0, react_1.useMemo)(function () {
        if (!areOptionsInitialized) {
            return {
                userToInvite: null,
                recentReports: [],
                personalDetails: [],
                currentUserOption: null,
                headerMessage: '',
                workspaceChats: [],
                selfDMChat: null,
            };
        }
        var newOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(defaultOptions, debouncedSearchTerm, {
            canInviteUser: !isCategorizeOrShareAction && !isPerDiemRequest,
            selectedOptions: participants,
            excludeLogins: CONST_1.default.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST_1.default.IOU.MAX_RECENT_REPORTS_TO_SHOW,
            preferPolicyExpenseChat: isPaidGroupPolicy,
            preferRecentExpenseReports: action === CONST_1.default.IOU.ACTION.CREATE,
        });
        return newOptions;
    }, [areOptionsInitialized, defaultOptions, debouncedSearchTerm, participants, isPaidGroupPolicy, isCategorizeOrShareAction, action, isPerDiemRequest]);
    var inputHelperText = (0, react_1.useMemo)(function () {
        var _a, _b, _c;
        return (0, OptionsListUtils_1.getHeaderMessage)(((_a = chatOptions.personalDetails) !== null && _a !== void 0 ? _a : []).length + ((_b = chatOptions.recentReports) !== null && _b !== void 0 ? _b : []).length + ((_c = chatOptions.workspaceChats) !== null && _c !== void 0 ? _c : []).length !== 0 ||
            !(0, EmptyObject_1.isEmptyObject)(chatOptions.selfDMChat), !!(chatOptions === null || chatOptions === void 0 ? void 0 : chatOptions.userToInvite), debouncedSearchTerm.trim(), participants.some(function (participant) { return (0, OptionsListUtils_1.getPersonalDetailSearchTerms)(participant).join(' ').toLowerCase().includes(cleanSearchTerm); }));
    }, [
        chatOptions.personalDetails,
        chatOptions.recentReports,
        chatOptions.selfDMChat,
        chatOptions === null || chatOptions === void 0 ? void 0 : chatOptions.userToInvite,
        chatOptions.workspaceChats,
        cleanSearchTerm,
        debouncedSearchTerm,
        participants,
    ]);
    /**
     * Returns the sections needed for the OptionsSelector
     * @returns {Array}
     */
    var _m = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        var newSections = [];
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            return [newSections, ''];
        }
        var formatResults = (0, OptionsListUtils_1.formatSectionsFromSearchTerm)(debouncedSearchTerm, participants.map(function (participant) { return (__assign(__assign({}, participant), { reportID: participant.reportID })); }), chatOptions.recentReports, chatOptions.personalDetails, personalDetails, true);
        newSections.push(formatResults.section);
        newSections.push({
            title: translate('workspace.common.workspace'),
            data: (_a = chatOptions.workspaceChats) !== null && _a !== void 0 ? _a : [],
            shouldShow: ((_b = chatOptions.workspaceChats) !== null && _b !== void 0 ? _b : []).length > 0,
        });
        if (!isWorkspacesOnly) {
            newSections.push({
                title: translate('workspace.invoices.paymentMethods.personal'),
                data: chatOptions.selfDMChat ? [chatOptions.selfDMChat] : [],
                shouldShow: !!chatOptions.selfDMChat,
            });
            newSections.push({
                title: translate('common.recents'),
                data: isPerDiemRequest ? chatOptions.recentReports.filter(function (report) { return report.isPolicyExpenseChat; }) : chatOptions.recentReports,
                shouldShow: (isPerDiemRequest ? chatOptions.recentReports.filter(function (report) { return report.isPolicyExpenseChat; }) : chatOptions.recentReports).length > 0,
            });
            newSections.push({
                title: translate('common.contacts'),
                data: chatOptions.personalDetails,
                shouldShow: chatOptions.personalDetails.length > 0 && !isPerDiemRequest,
            });
            if (chatOptions.userToInvite &&
                !(0, OptionsListUtils_1.isCurrentUser)(__assign(__assign({}, chatOptions.userToInvite), { accountID: (_d = (_c = chatOptions.userToInvite) === null || _c === void 0 ? void 0 : _c.accountID) !== null && _d !== void 0 ? _d : CONST_1.default.DEFAULT_NUMBER_ID, status: (_f = (_e = chatOptions.userToInvite) === null || _e === void 0 ? void 0 : _e.status) !== null && _f !== void 0 ? _f : undefined })) &&
                !isPerDiemRequest) {
                newSections.push({
                    title: translate('workspace.invoices.paymentMethods.personal'),
                    data: chatOptions.selfDMChat ? [chatOptions.selfDMChat] : [],
                    shouldShow: !!chatOptions.selfDMChat,
                });
                newSections.push({
                    title: translate('common.recents'),
                    data: chatOptions.recentReports,
                    shouldShow: chatOptions.recentReports.length > 0,
                });
                newSections.push({
                    title: translate('common.contacts'),
                    data: chatOptions.personalDetails,
                    shouldShow: chatOptions.personalDetails.length > 0,
                });
                if (chatOptions.userToInvite &&
                    !(0, OptionsListUtils_1.isCurrentUser)(__assign(__assign({}, chatOptions.userToInvite), { accountID: (_h = (_g = chatOptions.userToInvite) === null || _g === void 0 ? void 0 : _g.accountID) !== null && _h !== void 0 ? _h : CONST_1.default.DEFAULT_NUMBER_ID, status: (_k = (_j = chatOptions.userToInvite) === null || _j === void 0 ? void 0 : _j.status) !== null && _k !== void 0 ? _k : undefined }))) {
                    newSections.push({
                        title: undefined,
                        data: [chatOptions.userToInvite].map(function (participant) {
                            var _a;
                            var isPolicyExpenseChat = (_a = participant === null || participant === void 0 ? void 0 : participant.isPolicyExpenseChat) !== null && _a !== void 0 ? _a : false;
                            return isPolicyExpenseChat ? (0, OptionsListUtils_1.getPolicyExpenseReportOption)(participant) : (0, OptionsListUtils_1.getParticipantsOption)(participant, personalDetails);
                        }),
                        shouldShow: true,
                    });
                }
            }
        }
        var headerMessage = '';
        if (!showImportContacts) {
            headerMessage = inputHelperText;
        }
        return [newSections, headerMessage];
    }, [
        areOptionsInitialized,
        didScreenTransitionEnd,
        debouncedSearchTerm,
        participants,
        chatOptions.recentReports,
        chatOptions.personalDetails,
        chatOptions.workspaceChats,
        chatOptions.selfDMChat,
        chatOptions.userToInvite,
        personalDetails,
        translate,
        isWorkspacesOnly,
        showImportContacts,
        inputHelperText,
        isPerDiemRequest,
    ]), sections = _m[0], header = _m[1];
    /**
     * Adds a single participant to the expense
     *
     * @param {Object} option
     */
    var addSingleParticipant = (0, react_1.useCallback)(function (option) {
        var _a;
        var newParticipants = [
            __assign(__assign({}, (0, pick_1.default)(option, 'accountID', 'login', 'isPolicyExpenseChat', 'reportID', 'searchText', 'policyID', 'isSelfDM', 'text', 'phoneNumber')), { selected: true, iouType: iouType }),
        ];
        if (iouType === CONST_1.default.IOU.TYPE.INVOICE) {
            var policyID = option.item && (0, ReportUtils_1.isInvoiceRoom)(option.item) ? option.policyID : (_a = (0, Policy_1.getInvoicePrimaryWorkspace)(currentUserLogin)) === null || _a === void 0 ? void 0 : _a.id;
            newParticipants.push({
                policyID: policyID,
                isSender: true,
                selected: false,
                iouType: iouType,
            });
        }
        onParticipantsAdded(newParticipants);
        if (!option.isSelfDM) {
            onFinish();
        }
    }, 
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we don't want to trigger this callback when iouType changes
    [onFinish, onParticipantsAdded, currentUserLogin]);
    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     * @param {Object} option
     */
    var addParticipantToSelection = (0, react_1.useCallback)(function (option) {
        var isOptionSelected = function (selectedOption) {
            if (selectedOption.accountID && selectedOption.accountID === (option === null || option === void 0 ? void 0 : option.accountID)) {
                return true;
            }
            if (selectedOption.reportID && selectedOption.reportID === (option === null || option === void 0 ? void 0 : option.reportID)) {
                return true;
            }
            return false;
        };
        var isOptionInList = participants.some(isOptionSelected);
        var newSelectedOptions;
        if (isOptionInList) {
            newSelectedOptions = (0, reject_1.default)(participants, isOptionSelected);
        }
        else {
            newSelectedOptions = __spreadArray(__spreadArray([], participants, true), [
                {
                    accountID: option.accountID,
                    login: option.login,
                    isPolicyExpenseChat: option.isPolicyExpenseChat,
                    reportID: option.reportID,
                    selected: true,
                    searchText: option.searchText,
                    iouType: iouType,
                },
            ], false);
        }
        onParticipantsAdded(newSelectedOptions);
    }, 
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we don't want to trigger this callback when iouType changes
    [participants, onParticipantsAdded]);
    // Right now you can't split a request with a workspace and other additional participants
    // This is getting properly fixed in https://github.com/Expensify/App/issues/27508, but as a stop-gap to prevent
    // the app from crashing on native when you try to do this, we'll going to hide the button if you have a workspace and other participants
    var hasPolicyExpenseChatParticipant = participants.some(function (participant) { return participant.isPolicyExpenseChat; });
    var shouldShowSplitBillErrorMessage = participants.length > 1 && hasPolicyExpenseChatParticipant;
    var isAllowedToSplit = ![CONST_1.default.IOU.TYPE.PAY, CONST_1.default.IOU.TYPE.TRACK, CONST_1.default.IOU.TYPE.INVOICE].some(function (option) { return option === iouType; }) &&
        ![CONST_1.default.IOU.ACTION.SHARE, CONST_1.default.IOU.ACTION.SUBMIT, CONST_1.default.IOU.ACTION.CATEGORIZE].some(function (option) { return option === action; });
    var handleConfirmSelection = (0, react_1.useCallback)(function (keyEvent, option) {
        var shouldAddSingleParticipant = option && !participants.length;
        if (shouldShowSplitBillErrorMessage || (!participants.length && !option)) {
            return;
        }
        if (shouldAddSingleParticipant) {
            addSingleParticipant(option);
            return;
        }
        onFinish(CONST_1.default.IOU.TYPE.SPLIT);
    }, [shouldShowSplitBillErrorMessage, onFinish, addSingleParticipant, participants]);
    var showLoadingPlaceholder = (0, react_1.useMemo)(function () { return !areOptionsInitialized || !didScreenTransitionEnd; }, [areOptionsInitialized, didScreenTransitionEnd]);
    var optionLength = (0, react_1.useMemo)(function () {
        if (!areOptionsInitialized) {
            return 0;
        }
        var length = 0;
        sections.forEach(function (section) {
            length += section.data.length;
        });
        return length;
    }, [areOptionsInitialized, sections]);
    var shouldShowListEmptyContent = (0, react_1.useMemo)(function () { return optionLength === 0 && !showLoadingPlaceholder; }, [optionLength, showLoadingPlaceholder]);
    var shouldShowReferralBanner = !isDismissed && iouType !== CONST_1.default.IOU.TYPE.INVOICE && !shouldShowListEmptyContent;
    var initiateContactImportAndSetState = (0, react_1.useCallback)(function () {
        setContactPermissionState(react_native_permissions_1.RESULTS.GRANTED);
        react_native_1.InteractionManager.runAfterInteractions(importAndSaveContacts);
    }, [importAndSaveContacts]);
    var footerContent = (0, react_1.useMemo)(function () {
        if (isDismissed && !shouldShowSplitBillErrorMessage && !participants.length) {
            return;
        }
        return (<>
                {shouldShowReferralBanner && !isCategorizeOrShareAction && (<ReferralProgramCTA_1.default referralContentType={referralContentType} style={[styles.flexShrink0, !!participants.length && !shouldShowSplitBillErrorMessage && styles.mb5]}/>)}

                {shouldShowSplitBillErrorMessage && (<FormHelpMessage_1.default style={[styles.ph1, styles.mb2]} isError message={translate('iou.error.splitExpenseMultipleParticipantsErrorMessage')}/>)}

                {!!participants.length && !isCategorizeOrShareAction && (<Button_1.default success text={translate('common.next')} onPress={handleConfirmSelection} pressOnEnter large isDisabled={shouldShowSplitBillErrorMessage}/>)}
                {isCategorizeOrShareAction && (<Button_1.default success text={translate('workspace.new.newWorkspace')} onPress={function () { return onFinish(); }} pressOnEnter large/>)}
            </>);
    }, [
        handleConfirmSelection,
        participants.length,
        isDismissed,
        referralContentType,
        shouldShowSplitBillErrorMessage,
        styles,
        translate,
        shouldShowReferralBanner,
        isCategorizeOrShareAction,
        onFinish,
    ]);
    var onSelectRow = (0, react_1.useCallback)(function (option) {
        if (option.isPolicyExpenseChat && option.policyID && (0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(option.policyID)) {
            Navigation_1.default.navigate(ROUTES_1.default.RESTRICTED_ACTION.getRoute(option.policyID));
            return;
        }
        if (isIOUSplit) {
            addParticipantToSelection(option);
            return;
        }
        addSingleParticipant(option);
    }, [isIOUSplit, addParticipantToSelection, addSingleParticipant]);
    var footerContentAbovePaginationComponent = (0, react_1.useMemo)(function () {
        if (!showImportContacts) {
            return null;
        }
        return (<MenuItem_1.default title={translate('contact.importContacts')} icon={Expensicons_1.UserPlus} onPress={goToSettings_1.default} shouldShowRightIcon style={styles.mb3}/>);
    }, [showImportContacts, styles.mb3, translate]);
    var ClickableImportContactTextComponent = (0, react_1.useMemo)(function () {
        if (debouncedSearchTerm.length || isSearchingForReports) {
            return;
        }
        return (<ImportContactButton_1.default showImportContacts={showImportContacts} inputHelperText={translate('contact.importContactsTitle')} isInSearch={false}/>);
    }, [debouncedSearchTerm, isSearchingForReports, showImportContacts, translate]);
    var EmptySelectionListContentWithPermission = (0, react_1.useMemo)(function () {
        return (<>
                {ClickableImportContactTextComponent}
                <EmptySelectionListContent_1.default contentType={iouType}/>;
            </>);
    }, [iouType, ClickableImportContactTextComponent]);
    return (<>
            <ContactPermissionModal_1.default onGrant={initiateContactImportAndSetState} onDeny={setContactPermissionState} onFocusTextInput={function () { return setTextInputAutoFocus(true); }}/>
            <SelectionList_1.default onConfirm={handleConfirmSelection} sections={areOptionsInitialized ? sections : CONST_1.default.EMPTY_ARRAY} ListItem={InviteMemberListItem_1.default} textInputValue={searchTerm} textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')} textInputHint={offlineMessage} onChangeText={setSearchTerm} shouldPreventDefaultFocusOnSelectRow={!(0, DeviceCapabilities_1.canUseTouchScreen)()} onSelectRow={onSelectRow} shouldSingleExecuteRowSelect headerContent={<ImportContactButton_1.default showImportContacts={showImportContacts} inputHelperText={inputHelperText} isInSearch/>} footerContent={footerContent} listEmptyContent={EmptySelectionListContentWithPermission} footerContentAbovePagination={footerContentAbovePaginationComponent} headerMessage={header} showLoadingPlaceholder={showLoadingPlaceholder} canSelectMultiple={isIOUSplit && isAllowedToSplit} isLoadingNewOptions={!!isSearchingForReports} shouldShowListEmptyContent={shouldShowListEmptyContent} textInputAutoFocus={textInputAutoFocus}/>
        </>);
}
MoneyRequestParticipantsSelector.displayName = 'MoneyTemporaryForRefactorRequestParticipantsSelector';
exports.default = (0, react_1.memo)(MoneyRequestParticipantsSelector, function (prevProps, nextProps) {
    return (0, fast_equals_1.deepEqual)(prevProps.participants, nextProps.participants) && prevProps.iouType === nextProps.iouType && prevProps.isWorkspacesOnly === nextProps.isWorkspacesOnly;
});
