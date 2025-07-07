"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onSubmitAction = void 0;
var debounce_1 = require("lodash/debounce");
var noop_1 = require("lodash/noop");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var ActionSheetAwareScrollView = require("@components/ActionSheetAwareScrollView");
var AttachmentModal_1 = require("@components/AttachmentModal");
var Consumer_1 = require("@components/DragAndDrop/Consumer");
var DropZoneUI_1 = require("@components/DropZone/DropZoneUI");
var DualDropZone_1 = require("@components/DropZone/DualDropZone");
var EmojiPickerButton_1 = require("@components/EmojiPicker/EmojiPickerButton");
var ExceededCommentLength_1 = require("@components/ExceededCommentLength");
var Expensicons = require("@components/Icon/Expensicons");
var ImportedStateIndicator_1 = require("@components/ImportedStateIndicator");
var OfflineIndicator_1 = require("@components/OfflineIndicator");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var OnyxProvider_1 = require("@components/OnyxProvider");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useDebounce_1 = require("@hooks/useDebounce");
var useFilesValidation_1 = require("@hooks/useFilesValidation");
var useHandleExceedMaxCommentLength_1 = require("@hooks/useHandleExceedMaxCommentLength");
var useHandleExceedMaxTaskTitleLength_1 = require("@hooks/useHandleExceedMaxTaskTitleLength");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var canFocusInputOnScreenFocus_1 = require("@libs/canFocusInputOnScreenFocus");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var DomUtils_1 = require("@libs/DomUtils");
var DraftCommentUtils_1 = require("@libs/DraftCommentUtils");
var getModalState_1 = require("@libs/getModalState");
var Performance_1 = require("@libs/Performance");
var ReportUtils_1 = require("@libs/ReportUtils");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var willBlurTextInputOnTapOutside_1 = require("@libs/willBlurTextInputOnTapOutside");
var Navigation_1 = require("@navigation/Navigation");
var AgentZeroProcessingRequestIndicator_1 = require("@pages/home/report/AgentZeroProcessingRequestIndicator");
var ParticipantLocalTime_1 = require("@pages/home/report/ParticipantLocalTime");
var ReportDropUI_1 = require("@pages/home/report/ReportDropUI");
var ReportTypingIndicator_1 = require("@pages/home/report/ReportTypingIndicator");
var EmojiPickerAction_1 = require("@userActions/EmojiPickerAction");
var IOU_1 = require("@userActions/IOU");
var Report_1 = require("@userActions/Report");
var Timing_1 = require("@userActions/Timing");
var TransactionEdit_1 = require("@userActions/TransactionEdit");
var User_1 = require("@userActions/User");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var AttachmentPickerWithMenuItems_1 = require("./AttachmentPickerWithMenuItems");
var ComposerWithSuggestions_1 = require("./ComposerWithSuggestions");
var SendButton_1 = require("./SendButton");
// We want consistent auto focus behavior on input between native and mWeb so we have some auto focus management code that will
// prevent auto focus on existing chat for mobile device
var shouldFocusInputOnScreenFocus = (0, canFocusInputOnScreenFocus_1.default)();
var willBlurTextInputOnTapOutside = (0, willBlurTextInputOnTapOutside_1.default)();
// eslint-disable-next-line import/no-mutable-exports
var onSubmitAction = noop_1.default;
exports.onSubmitAction = onSubmitAction;
function ReportActionCompose(_a) {
    var _b = _a.disabled, disabled = _b === void 0 ? false : _b, _c = _a.isComposerFullSize, isComposerFullSize = _c === void 0 ? false : _c, onSubmit = _a.onSubmit, pendingAction = _a.pendingAction, report = _a.report, reportID = _a.reportID, _d = _a.isReportReadyForDisplay, isReportReadyForDisplay = _d === void 0 ? true : _d, lastReportAction = _a.lastReportAction, onComposerFocus = _a.onComposerFocus, onComposerBlur = _a.onComposerBlur, didHideComposerInput = _a.didHideComposerInput;
    var actionSheetAwareScrollViewContext = (0, react_1.useContext)(ActionSheetAwareScrollView.ActionSheetAwareScrollViewContext);
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _e = (0, useResponsiveLayout_1.default)(), isSmallScreenWidth = _e.isSmallScreenWidth, isMediumScreenWidth = _e.isMediumScreenWidth, shouldUseNarrowLayout = _e.shouldUseNarrowLayout;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var actionButtonRef = (0, react_1.useRef)(null);
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    var blockedFromConcierge = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_BLOCKED_FROM_CONCIERGE, { canBeMissing: true })[0];
    var _f = (0, useOnyx_1.default)(ONYXKEYS_1.default.SHOULD_SHOW_COMPOSE_INPUT, { canBeMissing: true })[0], shouldShowComposeInput = _f === void 0 ? true : _f;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report === null || report === void 0 ? void 0 : report.policyID), { canBeMissing: true })[0];
    // TODO: remove beta check after the feature is enabled
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    /**
     * Updates the Highlight state of the composer
     */
    var _g = (0, react_1.useState)(function () {
        var initialModalState = (0, getModalState_1.default)();
        return shouldFocusInputOnScreenFocus && shouldShowComposeInput && !(initialModalState === null || initialModalState === void 0 ? void 0 : initialModalState.isVisible) && !(initialModalState === null || initialModalState === void 0 ? void 0 : initialModalState.willAlertModalBecomeVisible);
    }), isFocused = _g[0], setIsFocused = _g[1];
    var _h = (0, react_1.useState)(isComposerFullSize), isFullComposerAvailable = _h[0], setIsFullComposerAvailable = _h[1];
    // A flag to indicate whether the onScroll callback is likely triggered by a layout change (caused by text change) or not
    var isScrollLikelyLayoutTriggered = (0, react_1.useRef)(false);
    /**
     * Reset isScrollLikelyLayoutTriggered to false.
     *
     * The function is debounced with a handpicked wait time to address 2 issues:
     * 1. There is a slight delay between onChangeText and onScroll
     * 2. Layout change will trigger onScroll multiple times
     */
    var debouncedLowerIsScrollLikelyLayoutTriggered = (0, useDebounce_1.default)((0, react_1.useCallback)(function () { return (isScrollLikelyLayoutTriggered.current = false); }, []), 500);
    var raiseIsScrollLikelyLayoutTriggered = (0, react_1.useCallback)(function () {
        isScrollLikelyLayoutTriggered.current = true;
        debouncedLowerIsScrollLikelyLayoutTriggered();
    }, [debouncedLowerIsScrollLikelyLayoutTriggered]);
    var _j = (0, react_1.useState)(function () {
        var draftComment = (0, DraftCommentUtils_1.getDraftComment)(reportID);
        return !draftComment || !!draftComment.match(CONST_1.default.REGEX.EMPTY_COMMENT);
    }), isCommentEmpty = _j[0], setIsCommentEmpty = _j[1];
    /**
     * Updates the visibility state of the menu
     */
    var _k = (0, react_1.useState)(false), isMenuVisible = _k[0], setMenuVisibility = _k[1];
    var _l = (0, react_1.useState)(false), isAttachmentPreviewActive = _l[0], setIsAttachmentPreviewActive = _l[1];
    /**
     * Updates the composer when the comment length is exceeded
     * Shows red borders and prevents the comment from being sent
     */
    var _m = (0, useHandleExceedMaxCommentLength_1.default)(), hasExceededMaxCommentLength = _m.hasExceededMaxCommentLength, validateCommentMaxLength = _m.validateCommentMaxLength, setHasExceededMaxCommentLength = _m.setHasExceededMaxCommentLength;
    var _o = (0, useHandleExceedMaxTaskTitleLength_1.default)(), hasExceededMaxTaskTitleLength = _o.hasExceededMaxTaskTitleLength, validateTaskTitleMaxLength = _o.validateTaskTitleMaxLength, setHasExceededMaxTitleLength = _o.setHasExceededMaxTitleLength;
    var _p = (0, react_1.useState)(null), exceededMaxLength = _p[0], setExceededMaxLength = _p[1];
    var suggestionsRef = (0, react_1.useRef)(null);
    var composerRef = (0, react_1.useRef)(undefined);
    var reportParticipantIDs = (0, react_1.useMemo)(function () {
        var _a;
        return Object.keys((_a = report === null || report === void 0 ? void 0 : report.participants) !== null && _a !== void 0 ? _a : {})
            .map(Number)
            .filter(function (accountID) { return accountID !== currentUserPersonalDetails.accountID; });
    }, [currentUserPersonalDetails.accountID, report === null || report === void 0 ? void 0 : report.participants]);
    var shouldShowReportRecipientLocalTime = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.canShowReportRecipientLocalTime)(personalDetails, report, currentUserPersonalDetails.accountID) && !isComposerFullSize; }, [personalDetails, report, currentUserPersonalDetails.accountID, isComposerFullSize]);
    var includesConcierge = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.chatIncludesConcierge)({ participants: report === null || report === void 0 ? void 0 : report.participants }); }, [report === null || report === void 0 ? void 0 : report.participants]);
    var userBlockedFromConcierge = (0, react_1.useMemo)(function () { return (0, User_1.isBlockedFromConcierge)(blockedFromConcierge); }, [blockedFromConcierge]);
    var isBlockedFromConcierge = (0, react_1.useMemo)(function () { return includesConcierge && userBlockedFromConcierge; }, [includesConcierge, userBlockedFromConcierge]);
    var parentReport = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.getParentReport)(report); }, [report]);
    var shouldDisplayDualDropZone = (0, react_1.useMemo)(function () {
        return !(0, ReportUtils_1.isChatRoom)(report) &&
            !(0, ReportUtils_1.isUserCreatedPolicyRoom)(report) &&
            !(0, ReportUtils_1.isAnnounceRoom)(report) &&
            !(0, ReportUtils_1.isAdminRoom)(report) &&
            !(0, ReportUtils_1.isConciergeChatReport)(report) &&
            !(0, ReportUtils_1.isInvoiceReport)(report) &&
            !(0, ReportUtils_1.isGroupChat)(report) &&
            !(0, ReportUtils_1.isSettled)(parentReport) &&
            !(0, ReportUtils_1.isSettled)(report);
    }, [report, parentReport]);
    var isTransactionThreadView = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.isReportTransactionThread)(report); }, [report]);
    var transactionID = (0, react_1.useMemo)(function () { return (0, TransactionUtils_1.getTransactionID)(reportID); }, [reportID]);
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { canBeMissing: true })[0];
    var hasReceipt = (0, react_1.useMemo)(function () { return (0, TransactionUtils_1.hasReceipt)(transaction); }, [transaction]);
    var isEditingReceipt = isTransactionThreadView && transactionID && hasReceipt;
    // Placeholder to display in the chat input.
    var inputPlaceholder = (0, react_1.useMemo)(function () {
        if (includesConcierge && userBlockedFromConcierge) {
            return translate('reportActionCompose.blockedFromConcierge');
        }
        return translate('reportActionCompose.writeSomething');
    }, [includesConcierge, translate, userBlockedFromConcierge]);
    var focus = function () {
        var _a;
        if (composerRef.current === null) {
            return;
        }
        (_a = composerRef.current) === null || _a === void 0 ? void 0 : _a.focus(true);
    };
    var isKeyboardVisibleWhenShowingModalRef = (0, react_1.useRef)(false);
    var isNextModalWillOpenRef = (0, react_1.useRef)(false);
    var containerRef = (0, react_1.useRef)(null);
    var measureContainer = (0, react_1.useCallback)(function (callback) {
        if (!containerRef.current) {
            return;
        }
        containerRef.current.measureInWindow(callback);
    }, 
    // We added isComposerFullSize in dependencies so that when this value changes, we recalculate the position of the popup
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    [isComposerFullSize]);
    var onAddActionPressed = (0, react_1.useCallback)(function () {
        var _a, _b;
        if (!willBlurTextInputOnTapOutside) {
            isKeyboardVisibleWhenShowingModalRef.current = !!((_a = composerRef.current) === null || _a === void 0 ? void 0 : _a.isFocused());
        }
        (_b = composerRef.current) === null || _b === void 0 ? void 0 : _b.blur();
    }, []);
    var onItemSelected = (0, react_1.useCallback)(function () {
        isKeyboardVisibleWhenShowingModalRef.current = false;
    }, []);
    var updateShouldShowSuggestionMenuToFalse = (0, react_1.useCallback)(function () {
        if (!suggestionsRef.current) {
            return;
        }
        suggestionsRef.current.updateShouldShowSuggestionMenuToFalse(false);
    }, []);
    var attachmentFileRef = (0, react_1.useRef)(null);
    var addAttachment = (0, react_1.useCallback)(function (file) {
        var _a;
        attachmentFileRef.current = file;
        var clear = (_a = composerRef.current) === null || _a === void 0 ? void 0 : _a.clear;
        if (!clear) {
            throw new Error('The composerRef.clear function is not set yet. This should never happen, and indicates a developer error.');
        }
        (0, react_native_reanimated_1.runOnUI)(clear)();
    }, []);
    /**
     * Event handler to update the state after the attachment preview is closed.
     */
    var onAttachmentPreviewClose = (0, react_1.useCallback)(function () {
        updateShouldShowSuggestionMenuToFalse();
        setIsAttachmentPreviewActive(false);
    }, [updateShouldShowSuggestionMenuToFalse]);
    /**
     * Add a new comment to this chat
     */
    var submitForm = (0, react_1.useCallback)(function (newComment) {
        var newCommentTrimmed = newComment.trim();
        if (attachmentFileRef.current) {
            (0, Report_1.addAttachment)(reportID, attachmentFileRef.current, newCommentTrimmed, true);
            attachmentFileRef.current = null;
        }
        else {
            Performance_1.default.markStart(CONST_1.default.TIMING.SEND_MESSAGE, { message: newCommentTrimmed });
            Timing_1.default.start(CONST_1.default.TIMING.SEND_MESSAGE);
            onSubmit(newCommentTrimmed);
        }
    }, [onSubmit, reportID]);
    var onTriggerAttachmentPicker = (0, react_1.useCallback)(function () {
        isNextModalWillOpenRef.current = true;
        isKeyboardVisibleWhenShowingModalRef.current = true;
    }, []);
    var onBlur = (0, react_1.useCallback)(function (event) {
        var webEvent = event;
        setIsFocused(false);
        onComposerBlur === null || onComposerBlur === void 0 ? void 0 : onComposerBlur();
        if (suggestionsRef.current) {
            suggestionsRef.current.resetSuggestions();
        }
        if (webEvent.relatedTarget && webEvent.relatedTarget === actionButtonRef.current) {
            isKeyboardVisibleWhenShowingModalRef.current = true;
        }
    }, [onComposerBlur]);
    var onFocus = (0, react_1.useCallback)(function () {
        setIsFocused(true);
        onComposerFocus === null || onComposerFocus === void 0 ? void 0 : onComposerFocus();
    }, [onComposerFocus]);
    (0, react_1.useEffect)(function () {
        if (hasExceededMaxTaskTitleLength) {
            setExceededMaxLength(CONST_1.default.TITLE_CHARACTER_LIMIT);
        }
        else if (hasExceededMaxCommentLength) {
            setExceededMaxLength(CONST_1.default.MAX_COMMENT_LENGTH);
        }
        else {
            setExceededMaxLength(null);
        }
    }, [hasExceededMaxTaskTitleLength, hasExceededMaxCommentLength]);
    // We are returning a callback here as we want to invoke the method on unmount only
    (0, react_1.useEffect)(function () { return function () {
        if (!(0, EmojiPickerAction_1.isActive)(report === null || report === void 0 ? void 0 : report.reportID)) {
            return;
        }
        (0, EmojiPickerAction_1.hideEmojiPicker)();
    }; }, 
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    []);
    // When we invite someone to a room they don't have the policy object, but we still want them to be able to mention other reports they are members of, so we only check if the policyID in the report is from a workspace
    var isGroupPolicyReport = (0, react_1.useMemo)(function () { return !!(report === null || report === void 0 ? void 0 : report.policyID) && report.policyID !== CONST_1.default.POLICY.ID_FAKE; }, [report]);
    var reportRecipientAccountIDs = (0, ReportUtils_1.getReportRecipientAccountIDs)(report, currentUserPersonalDetails.accountID);
    var reportRecipient = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[reportRecipientAccountIDs[0]];
    var shouldUseFocusedColor = !isBlockedFromConcierge && !disabled && isFocused;
    var hasReportRecipient = !(0, EmptyObject_1.isEmptyObject)(reportRecipient);
    var isSendDisabled = isCommentEmpty || isBlockedFromConcierge || !!disabled || !!exceededMaxLength;
    // Note: using JS refs is not well supported in reanimated, thus we need to store the function in a shared value
    // useSharedValue on web doesn't support functions, so we need to wrap it in an object.
    var composerRefShared = (0, react_native_reanimated_1.useSharedValue)({ clear: undefined });
    var handleSendMessage = (0, react_1.useCallback)(function () {
        'worklet';
        var clearComposer = composerRefShared.get().clear;
        if (!clearComposer) {
            throw new Error('The composerRefShared.clear function is not set yet. This should never happen, and indicates a developer error.');
        }
        if (isSendDisabled || !isReportReadyForDisplay) {
            return;
        }
        // This will cause onCleared to be triggered where we actually send the message
        clearComposer();
    }, [isSendDisabled, isReportReadyForDisplay, composerRefShared]);
    var measureComposer = (0, react_1.useCallback)(function (e) {
        actionSheetAwareScrollViewContext.transitionActionSheetState({
            type: ActionSheetAwareScrollView.Actions.MEASURE_COMPOSER,
            payload: {
                composerHeight: e.nativeEvent.layout.height,
            },
        });
    }, [actionSheetAwareScrollViewContext]);
    // eslint-disable-next-line react-compiler/react-compiler
    exports.onSubmitAction = onSubmitAction = handleSendMessage;
    var emojiPositionValues = (0, react_1.useMemo)(function () { return ({
        secondaryRowHeight: styles.chatItemComposeSecondaryRow.height,
        secondaryRowMarginTop: styles.chatItemComposeSecondaryRow.marginTop,
        secondaryRowMarginBottom: styles.chatItemComposeSecondaryRow.marginBottom,
        composeBoxMinHeight: styles.chatItemComposeBox.minHeight,
        emojiButtonHeight: styles.chatItemEmojiButton.height,
    }); }, [
        styles.chatItemComposeSecondaryRow.height,
        styles.chatItemComposeSecondaryRow.marginTop,
        styles.chatItemComposeSecondaryRow.marginBottom,
        styles.chatItemComposeBox.minHeight,
        styles.chatItemEmojiButton.height,
    ]);
    var emojiShiftVertical = (0, react_1.useMemo)(function () {
        var chatItemComposeSecondaryRowHeight = emojiPositionValues.secondaryRowHeight + emojiPositionValues.secondaryRowMarginTop + emojiPositionValues.secondaryRowMarginBottom;
        var reportActionComposeHeight = emojiPositionValues.composeBoxMinHeight + chatItemComposeSecondaryRowHeight;
        var emojiOffsetWithComposeBox = (emojiPositionValues.composeBoxMinHeight - emojiPositionValues.emojiButtonHeight) / 2;
        return reportActionComposeHeight - emojiOffsetWithComposeBox - CONST_1.default.MENU_POSITION_REPORT_ACTION_COMPOSE_BOTTOM;
    }, [emojiPositionValues]);
    var validateMaxLength = (0, react_1.useCallback)(function (value) {
        var taskCommentMatch = value === null || value === void 0 ? void 0 : value.match(CONST_1.default.REGEX.TASK_TITLE_WITH_OPTIONAL_SHORT_MENTION);
        if (taskCommentMatch) {
            var title = (taskCommentMatch === null || taskCommentMatch === void 0 ? void 0 : taskCommentMatch[3]) ? taskCommentMatch[3].trim().replace(/\n/g, ' ') : '';
            setHasExceededMaxCommentLength(false);
            validateTaskTitleMaxLength(title);
        }
        else {
            setHasExceededMaxTitleLength(false);
            validateCommentMaxLength(value, { reportID: reportID });
        }
    }, [setHasExceededMaxCommentLength, setHasExceededMaxTitleLength, validateTaskTitleMaxLength, validateCommentMaxLength, reportID]);
    var debouncedValidate = (0, react_1.useMemo)(function () { return (0, debounce_1.default)(validateMaxLength, CONST_1.default.TIMING.COMMENT_LENGTH_DEBOUNCE_TIME, { leading: true }); }, [validateMaxLength]);
    var onValueChange = (0, react_1.useCallback)(function (value) {
        if (value.length === 0 && isComposerFullSize) {
            (0, Report_1.setIsComposerFullSize)(reportID, false);
        }
        debouncedValidate(value);
    }, [isComposerFullSize, reportID, debouncedValidate]);
    var saveFileAndInitMoneyRequest = function (files) {
        if (files.length === 0) {
            return;
        }
        if (isEditingReceipt) {
            var source = URL.createObjectURL(files.at(0));
            (0, IOU_1.replaceReceipt)({ transactionID: transactionID, file: files.at(0), source: source });
        }
        else {
            var initialTransaction_1 = (0, IOU_1.initMoneyRequest)({
                reportID: reportID,
                newIouRequestType: CONST_1.default.IOU.REQUEST_TYPE.SCAN,
            });
            files.forEach(function (file, index) {
                var _a, _b;
                var source = URL.createObjectURL(file);
                var newTransaction = index === 0
                    ? initialTransaction_1
                    : (0, TransactionEdit_1.buildOptimisticTransactionAndCreateDraft)({
                        initialTransaction: initialTransaction_1,
                        currentUserPersonalDetails: currentUserPersonalDetails,
                        reportID: reportID,
                    });
                var newTransactionID = (_a = newTransaction === null || newTransaction === void 0 ? void 0 : newTransaction.transactionID) !== null && _a !== void 0 ? _a : CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID;
                (0, IOU_1.setMoneyRequestReceipt)(newTransactionID, source, (_b = file.name) !== null && _b !== void 0 ? _b : '', true);
                (0, IOU_1.setMoneyRequestParticipantsFromReport)(newTransactionID, report);
            });
            Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST_1.default.IOU.ACTION.CREATE, (0, ReportUtils_1.isSelfDM)(report) ? CONST_1.default.IOU.TYPE.TRACK : CONST_1.default.IOU.TYPE.SUBMIT, CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID, reportID));
        }
    };
    var _q = (0, useFilesValidation_1.default)(saveFileAndInitMoneyRequest), validateFiles = _q.validateFiles, PDFValidationComponent = _q.PDFValidationComponent, ErrorModal = _q.ErrorModal;
    var handleAddingReceipt = function (e) {
        var _a, _b, _c, _d;
        if (policy && (0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(policy.id)) {
            Navigation_1.default.navigate(ROUTES_1.default.RESTRICTED_ACTION.getRoute(policy.id));
            return;
        }
        if (isEditingReceipt) {
            var file = (_b = (_a = e === null || e === void 0 ? void 0 : e.dataTransfer) === null || _a === void 0 ? void 0 : _a.files) === null || _b === void 0 ? void 0 : _b[0];
            if (file) {
                file.uri = URL.createObjectURL(file);
                validateFiles([file]);
                return;
            }
        }
        var files = Array.from((_d = (_c = e === null || e === void 0 ? void 0 : e.dataTransfer) === null || _c === void 0 ? void 0 : _c.files) !== null && _d !== void 0 ? _d : []);
        if (files.length === 0) {
            return;
        }
        files.forEach(function (file) {
            // eslint-disable-next-line no-param-reassign
            file.uri = URL.createObjectURL(file);
        });
        validateFiles(files);
    };
    return (<react_native_1.View style={[shouldShowReportRecipientLocalTime && !isOffline && styles.chatItemComposeWithFirstRow, isComposerFullSize && styles.chatItemFullComposeRow]}>
            <OfflineWithFeedback_1.default pendingAction={pendingAction}>
                {shouldShowReportRecipientLocalTime && hasReportRecipient && <ParticipantLocalTime_1.default participant={reportRecipient}/>}
            </OfflineWithFeedback_1.default>
            <react_native_1.View onLayout={measureComposer} style={isComposerFullSize ? styles.flex1 : {}}>
                <OfflineWithFeedback_1.default shouldDisableOpacity pendingAction={pendingAction} style={isComposerFullSize ? styles.chatItemFullComposeRow : {}} contentContainerStyle={isComposerFullSize ? styles.flex1 : {}}>
                    <react_native_1.View ref={containerRef} style={[
            shouldUseFocusedColor ? styles.chatItemComposeBoxFocusedColor : styles.chatItemComposeBoxColor,
            styles.flexRow,
            styles.chatItemComposeBox,
            isComposerFullSize && styles.chatItemFullComposeBox,
            !!exceededMaxLength && styles.borderColorDanger,
        ]}>
                        {PDFValidationComponent}
                        <AttachmentModal_1.default headerTitle={translate('reportActionCompose.sendAttachment')} onConfirm={addAttachment} onModalShow={function () { return setIsAttachmentPreviewActive(true); }} onModalHide={onAttachmentPreviewClose} shouldDisableSendButton={!!exceededMaxLength} reportID={reportID} shouldHandleNavigationBack>
                            {function (_a) {
            var displayFileInModal = _a.displayFileInModal;
            return (<>
                                    <AttachmentPickerWithMenuItems_1.default displayFileInModal={displayFileInModal} reportID={reportID} report={report} currentUserPersonalDetails={currentUserPersonalDetails} reportParticipantIDs={reportParticipantIDs} isFullComposerAvailable={isFullComposerAvailable} isComposerFullSize={isComposerFullSize} isBlockedFromConcierge={isBlockedFromConcierge} disabled={disabled} setMenuVisibility={setMenuVisibility} isMenuVisible={isMenuVisible} onTriggerAttachmentPicker={onTriggerAttachmentPicker} raiseIsScrollLikelyLayoutTriggered={raiseIsScrollLikelyLayoutTriggered} onAddActionPressed={onAddActionPressed} onItemSelected={onItemSelected} onCanceledAttachmentPicker={function () {
                    if (!shouldFocusInputOnScreenFocus) {
                        return;
                    }
                    focus();
                }} actionButtonRef={actionButtonRef} shouldDisableAttachmentItem={!!exceededMaxLength}/>
                                    <ComposerWithSuggestions_1.default ref={function (ref) {
                    composerRef.current = ref !== null && ref !== void 0 ? ref : undefined;
                    composerRefShared.set({
                        clear: ref === null || ref === void 0 ? void 0 : ref.clear,
                    });
                }} suggestionsRef={suggestionsRef} isNextModalWillOpenRef={isNextModalWillOpenRef} isScrollLikelyLayoutTriggered={isScrollLikelyLayoutTriggered} raiseIsScrollLikelyLayoutTriggered={raiseIsScrollLikelyLayoutTriggered} reportID={reportID} policyID={report === null || report === void 0 ? void 0 : report.policyID} includeChronos={(0, ReportUtils_1.chatIncludesChronos)(report)} isGroupPolicyReport={isGroupPolicyReport} lastReportAction={lastReportAction} isMenuVisible={isMenuVisible} inputPlaceholder={inputPlaceholder} isComposerFullSize={isComposerFullSize} setIsFullComposerAvailable={setIsFullComposerAvailable} displayFileInModal={displayFileInModal} onCleared={submitForm} isBlockedFromConcierge={isBlockedFromConcierge} disabled={disabled} setIsCommentEmpty={setIsCommentEmpty} handleSendMessage={handleSendMessage} shouldShowComposeInput={shouldShowComposeInput} onFocus={onFocus} onBlur={onBlur} measureParentContainer={measureContainer} onValueChange={onValueChange} didHideComposerInput={didHideComposerInput}/>
                                    {/* TODO: remove beta check after the feature is enabled */}
                                    {isBetaEnabled(CONST_1.default.BETAS.NEWDOT_MULTI_FILES_DRAG_AND_DROP) && shouldDisplayDualDropZone && (<DualDropZone_1.default isEditing={isTransactionThreadView && hasReceipt} onAttachmentDrop={function (event) {
                        var _a;
                        if (isAttachmentPreviewActive) {
                            return;
                        }
                        var data = (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.files[0];
                        if (data) {
                            data.uri = URL.createObjectURL(data);
                            displayFileInModal(data);
                        }
                    }} onReceiptDrop={handleAddingReceipt}/>)}
                                    {isBetaEnabled(CONST_1.default.BETAS.NEWDOT_MULTI_FILES_DRAG_AND_DROP) && !shouldDisplayDualDropZone && (<Consumer_1.default onDrop={function (event) {
                        var _a;
                        if (isAttachmentPreviewActive) {
                            return;
                        }
                        var data = (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.files[0];
                        if (data) {
                            data.uri = URL.createObjectURL(data);
                            displayFileInModal(data);
                        }
                    }}>
                                            <DropZoneUI_1.default icon={Expensicons.MessageInABottle} dropTitle={translate('dropzone.addAttachments')} dropStyles={styles.attachmentDropOverlay(true)} dropTextStyles={styles.attachmentDropText} dropInnerWrapperStyles={styles.attachmentDropInnerWrapper(true)}/>
                                        </Consumer_1.default>)}
                                    {!isBetaEnabled(CONST_1.default.BETAS.NEWDOT_MULTI_FILES_DRAG_AND_DROP) && (<ReportDropUI_1.default onDrop={function (event) {
                        var _a;
                        if (isAttachmentPreviewActive) {
                            return;
                        }
                        var data = (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.files[0];
                        if (data) {
                            data.uri = URL.createObjectURL(data);
                            displayFileInModal(data);
                        }
                    }}/>)}
                                </>);
        }}
                        </AttachmentModal_1.default>
                        {(0, DeviceCapabilities_1.canUseTouchScreen)() && isMediumScreenWidth ? null : (<EmojiPickerButton_1.default isDisabled={isBlockedFromConcierge || disabled} onModalHide={function (isNavigating) {
                var _a;
                if (isNavigating) {
                    return;
                }
                var activeElementId = (_a = DomUtils_1.default.getActiveElement()) === null || _a === void 0 ? void 0 : _a.id;
                if (activeElementId === CONST_1.default.COMPOSER.NATIVE_ID || activeElementId === CONST_1.default.EMOJI_PICKER_BUTTON_NATIVE_ID) {
                    return;
                }
                focus();
            }} onEmojiSelected={function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return (_a = composerRef.current) === null || _a === void 0 ? void 0 : _a.replaceSelectionWithText.apply(_a, args);
        }} emojiPickerID={report === null || report === void 0 ? void 0 : report.reportID} shiftVertical={emojiShiftVertical}/>)}
                        <SendButton_1.default isDisabled={isSendDisabled} handleSendMessage={handleSendMessage}/>
                    </react_native_1.View>
                    {ErrorModal}
                    <react_native_1.View style={[
            styles.flexRow,
            styles.justifyContentBetween,
            styles.alignItemsCenter,
            (!isSmallScreenWidth || (isSmallScreenWidth && !isOffline)) && styles.chatItemComposeSecondaryRow,
        ]}>
                        {!shouldUseNarrowLayout && <OfflineIndicator_1.default containerStyles={[styles.chatItemComposeSecondaryRow]}/>}
                        <AgentZeroProcessingRequestIndicator_1.default reportID={reportID}/>
                        <ReportTypingIndicator_1.default reportID={reportID}/>
                        {!!exceededMaxLength && (<ExceededCommentLength_1.default maxCommentLength={exceededMaxLength} isTaskTitle={hasExceededMaxTaskTitleLength}/>)}
                    </react_native_1.View>
                </OfflineWithFeedback_1.default>
                {!isSmallScreenWidth && (<react_native_1.View style={[styles.mln5, styles.mrn5]}>
                        <ImportedStateIndicator_1.default />
                    </react_native_1.View>)}
            </react_native_1.View>
        </react_native_1.View>);
}
ReportActionCompose.displayName = 'ReportActionCompose';
exports.default = (0, react_1.memo)(ReportActionCompose);
