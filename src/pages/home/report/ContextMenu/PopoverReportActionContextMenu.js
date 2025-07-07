"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var ActionSheetAwareScrollView_1 = require("@components/ActionSheetAwareScrollView");
var ConfirmModal_1 = require("@components/ConfirmModal");
var PopoverWithMeasuredContent_1 = require("@components/PopoverWithMeasuredContent");
var useLocalize_1 = require("@hooks/useLocalize");
var IOU_1 = require("@libs/actions/IOU");
var Report_1 = require("@libs/actions/Report");
var calculateAnchorPosition_1 = require("@libs/calculateAnchorPosition");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var CONST_1 = require("@src/CONST");
var BaseReportActionContextMenu_1 = require("./BaseReportActionContextMenu");
function extractPointerEvent(event) {
    if ('nativeEvent' in event) {
        return event.nativeEvent;
    }
    return event;
}
function PopoverReportActionContextMenu(_props, ref) {
    var translate = (0, useLocalize_1.default)().translate;
    var reportIDRef = (0, react_1.useRef)(undefined);
    var typeRef = (0, react_1.useRef)(undefined);
    var reportActionRef = (0, react_1.useRef)(null);
    var reportActionIDRef = (0, react_1.useRef)(undefined);
    var originalReportIDRef = (0, react_1.useRef)(undefined);
    var selectionRef = (0, react_1.useRef)('');
    var reportActionDraftMessageRef = (0, react_1.useRef)(undefined);
    var cursorRelativePosition = (0, react_1.useRef)({
        horizontal: 0,
        vertical: 0,
    });
    // The horizontal and vertical position (relative to the screen) where the popover will display.
    var popoverAnchorPosition = (0, react_1.useRef)({
        horizontal: 0,
        vertical: 0,
    });
    var actionSheetAwareScrollViewContext = (0, react_1.useContext)(ActionSheetAwareScrollView_1.ActionSheetAwareScrollViewContext);
    var instanceIDRef = (0, react_1.useRef)('');
    var _a = (0, react_1.useState)(false), isPopoverVisible = _a[0], setIsPopoverVisible = _a[1];
    var _b = (0, react_1.useState)(false), isDeleteCommentConfirmModalVisible = _b[0], setIsDeleteCommentConfirmModalVisible = _b[1];
    var _c = (0, react_1.useState)(true), shouldSetModalVisibilityForDeleteConfirmation = _c[0], setShouldSetModalVisibilityForDeleteConfirmation = _c[1];
    var _d = (0, react_1.useState)(false), isRoomArchived = _d[0], setIsRoomArchived = _d[1];
    var _e = (0, react_1.useState)(false), isChronosReportEnabled = _e[0], setIsChronosReportEnabled = _e[1];
    var _f = (0, react_1.useState)(false), isChatPinned = _f[0], setIsChatPinned = _f[1];
    var _g = (0, react_1.useState)(false), hasUnreadMessages = _g[0], setHasUnreadMessages = _g[1];
    var _h = (0, react_1.useState)(false), isThreadReportParentAction = _h[0], setIsThreadReportParentAction = _h[1];
    var _j = (0, react_1.useState)([]), disabledActions = _j[0], setDisabledActions = _j[1];
    var _k = (0, react_1.useState)(false), shouldSwitchPositionIfOverflow = _k[0], setShouldSwitchPositionIfOverflow = _k[1];
    var _l = (0, react_1.useState)(true), isWithoutOverlay = _l[0], setIsWithoutOverlay = _l[1];
    var contentRef = (0, react_1.useRef)(null);
    var anchorRef = (0, react_1.useRef)(null);
    var dimensionsEventListener = (0, react_1.useRef)(null);
    var contextMenuAnchorRef = (0, react_1.useRef)(null);
    var contextMenuTargetNode = (0, react_1.useRef)(null);
    var contextMenuDimensions = (0, react_1.useRef)({
        width: 0,
        height: 0,
    });
    var onPopoverShow = (0, react_1.useRef)(function () { });
    var _m = (0, react_1.useState)(false), isContextMenuOpening = _m[0], setIsContextMenuOpening = _m[1];
    var onPopoverHide = (0, react_1.useRef)(function () { });
    var onEmojiPickerToggle = (0, react_1.useRef)(undefined);
    var onCancelDeleteModal = (0, react_1.useRef)(function () { });
    var onConfirmDeleteModal = (0, react_1.useRef)(function () { });
    var onPopoverHideActionCallback = (0, react_1.useRef)(function () { });
    var callbackWhenDeleteModalHide = (0, react_1.useRef)(function () { });
    /** Get the Context menu anchor position. We calculate the anchor coordinates from measureInWindow async method */
    var getContextMenuMeasuredLocation = (0, react_1.useCallback)(function () {
        return new Promise(function (resolve) {
            if (contextMenuAnchorRef.current && 'measureInWindow' in contextMenuAnchorRef.current && typeof contextMenuAnchorRef.current.measureInWindow === 'function') {
                contextMenuAnchorRef.current.measureInWindow(function (x, y) { return resolve({ x: x, y: y }); });
            }
            else {
                resolve({ x: 0, y: 0 });
            }
        });
    }, []);
    /** This gets called on Dimensions change to find the anchor coordinates for the action context menu. */
    var measureContextMenuAnchorPosition = (0, react_1.useCallback)(function () {
        if (!isPopoverVisible) {
            return;
        }
        getContextMenuMeasuredLocation().then(function (_a) {
            var x = _a.x, y = _a.y;
            if (!x || !y) {
                return;
            }
            popoverAnchorPosition.current = {
                horizontal: cursorRelativePosition.current.horizontal + x,
                vertical: cursorRelativePosition.current.vertical + y,
            };
        });
    }, [isPopoverVisible, getContextMenuMeasuredLocation]);
    (0, react_1.useEffect)(function () {
        dimensionsEventListener.current = react_native_1.Dimensions.addEventListener('change', measureContextMenuAnchorPosition);
        return function () {
            if (!dimensionsEventListener.current) {
                return;
            }
            dimensionsEventListener.current.remove();
        };
    }, [measureContextMenuAnchorPosition]);
    /** Whether Context Menu is active for the Report Action. */
    var isActiveReportAction = function (actionID) { var _a; return !!actionID && (reportActionIDRef.current === actionID || ((_a = reportActionRef.current) === null || _a === void 0 ? void 0 : _a.reportActionID) === actionID); };
    var clearActiveReportAction = function () {
        reportActionIDRef.current = undefined;
        reportActionRef.current = null;
    };
    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param type - context menu type [EMAIL, LINK, REPORT_ACTION]
     * @param [event] - A press event.
     * @param [selection] - Copied content.
     * @param contextMenuAnchor - popoverAnchor
     * @param reportID - Active Report Id
     * @param reportActionID - ReportAction for ContextMenu
     * @param originalReportID - The current Report Id of the reportAction
     * @param draftMessage - ReportAction draft message
     * @param [onShow] - Run a callback when Menu is shown
     * @param [onHide] - Run a callback when Menu is hidden
     * @param isArchivedRoom - Whether the provided report is an archived room
     * @param isChronosReport - Flag to check if the chat participant is Chronos
     * @param isPinnedChat - Flag to check if the chat is pinned in the LHN. Used for the Pin/Unpin action
     * @param isUnreadChat - Flag to check if the chat is unread in the LHN. Used for the Mark as Read/Unread action
     */
    var showContextMenu = function (showContextMenuParams) {
        var type = showContextMenuParams.type, event = showContextMenuParams.event, selection = showContextMenuParams.selection, contextMenuAnchor = showContextMenuParams.contextMenuAnchor, _a = showContextMenuParams.report, report = _a === void 0 ? {} : _a, _b = showContextMenuParams.reportAction, reportAction = _b === void 0 ? {} : _b, _c = showContextMenuParams.callbacks, callbacks = _c === void 0 ? {} : _c, _d = showContextMenuParams.disabledOptions, disabledOptions = _d === void 0 ? [] : _d, _e = showContextMenuParams.shouldCloseOnTarget, shouldCloseOnTarget = _e === void 0 ? false : _e, _f = showContextMenuParams.isOverflowMenu, isOverflowMenu = _f === void 0 ? false : _f, _g = showContextMenuParams.withoutOverlay, withoutOverlay = _g === void 0 ? true : _g;
        var reportID = report.reportID, originalReportID = report.originalReportID, _h = report.isArchivedRoom, isArchivedRoom = _h === void 0 ? false : _h, _j = report.isChronos, isChronos = _j === void 0 ? false : _j, _k = report.isPinnedChat, isPinnedChat = _k === void 0 ? false : _k, _l = report.isUnreadChat, isUnreadChat = _l === void 0 ? false : _l;
        var reportActionID = reportAction.reportActionID, draftMessage = reportAction.draftMessage, _m = reportAction.isThreadReportParentAction, isThreadReportParentActionParam = _m === void 0 ? false : _m;
        var _o = callbacks.onShow, onShow = _o === void 0 ? function () { } : _o, _p = callbacks.onHide, onHide = _p === void 0 ? function () { } : _p, _q = callbacks.setIsEmojiPickerActive, setIsEmojiPickerActive = _q === void 0 ? function () { } : _q;
        setIsContextMenuOpening(true);
        setIsWithoutOverlay(withoutOverlay);
        var _r = extractPointerEvent(event), _s = _r.pageX, pageX = _s === void 0 ? 0 : _s, _t = _r.pageY, pageY = _t === void 0 ? 0 : _t;
        contextMenuAnchorRef.current = contextMenuAnchor;
        contextMenuTargetNode.current = event.target;
        if (shouldCloseOnTarget) {
            anchorRef.current = event.target;
        }
        else {
            anchorRef.current = null;
        }
        onPopoverShow.current = onShow;
        onPopoverHide.current = onHide;
        onEmojiPickerToggle.current = setIsEmojiPickerActive;
        new Promise(function (resolve) {
            if (!!(!pageX && !pageY && contextMenuAnchorRef.current) || isOverflowMenu) {
                (0, calculateAnchorPosition_1.default)(contextMenuAnchorRef.current).then(function (position) {
                    popoverAnchorPosition.current = { horizontal: position.horizontal, vertical: position.vertical };
                    contextMenuDimensions.current = { width: position.vertical, height: position.height };
                    resolve();
                });
            }
            else {
                getContextMenuMeasuredLocation().then(function (_a) {
                    var x = _a.x, y = _a.y;
                    cursorRelativePosition.current = {
                        horizontal: pageX - x,
                        vertical: pageY - y,
                    };
                    popoverAnchorPosition.current = {
                        horizontal: pageX,
                        vertical: pageY,
                    };
                    resolve();
                });
            }
        }).then(function () {
            setDisabledActions(disabledOptions);
            typeRef.current = type;
            reportIDRef.current = reportID;
            reportActionIDRef.current = reportActionID;
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            originalReportIDRef.current = originalReportID || undefined;
            selectionRef.current = selection;
            setIsPopoverVisible(true);
            reportActionDraftMessageRef.current = draftMessage;
            setIsRoomArchived(isArchivedRoom);
            setIsChronosReportEnabled(isChronos);
            setIsChatPinned(isPinnedChat);
            setHasUnreadMessages(isUnreadChat);
            setIsThreadReportParentAction(isThreadReportParentActionParam);
            setShouldSwitchPositionIfOverflow(isOverflowMenu);
        });
    };
    /** After Popover shows, call the registered onPopoverShow callback and reset it */
    var runAndResetOnPopoverShow = function () {
        instanceIDRef.current = Math.random().toString(36).slice(2, 7);
        onPopoverShow.current();
        // After we have called the action, reset it.
        onPopoverShow.current = function () { };
        // After the context menu opening animation ends reset isContextMenuOpening.
        setTimeout(function () {
            setIsContextMenuOpening(false);
        }, CONST_1.default.ANIMATED_TRANSITION);
    };
    /** Run the callback and return a noop function to reset it */
    var runAndResetCallback = function (callback) {
        callback();
        return function () { };
    };
    /** After Popover hides, call the registered onPopoverHide & onPopoverHideActionCallback callback and reset it */
    var runAndResetOnPopoverHide = function () {
        reportIDRef.current = undefined;
        reportActionIDRef.current = undefined;
        originalReportIDRef.current = undefined;
        instanceIDRef.current = '';
        selectionRef.current = '';
        onPopoverHide.current = runAndResetCallback(onPopoverHide.current);
        onPopoverHideActionCallback.current = runAndResetCallback(onPopoverHideActionCallback.current);
    };
    /**
     * Hide the ReportActionContextMenu modal popover.
     * @param onHideActionCallback Callback to be called after popover is completely hidden
     */
    var hideContextMenu = function (onHideActionCallback) {
        if (typeof onHideActionCallback === 'function') {
            onPopoverHideActionCallback.current = onHideActionCallback;
        }
        actionSheetAwareScrollViewContext.transitionActionSheetState({
            type: ActionSheetAwareScrollView_1.Actions.CLOSE_POPOVER,
        });
        selectionRef.current = '';
        reportActionDraftMessageRef.current = undefined;
        setIsPopoverVisible(false);
    };
    var confirmDeleteAndHideModal = (0, react_1.useCallback)(function () {
        callbackWhenDeleteModalHide.current = runAndResetCallback(onConfirmDeleteModal.current);
        var reportAction = reportActionRef.current;
        if ((0, ReportActionsUtils_1.isMoneyRequestAction)(reportAction)) {
            var originalMessage = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction);
            if ((0, ReportActionsUtils_1.isTrackExpenseAction)(reportAction)) {
                (0, IOU_1.deleteTrackExpense)(reportIDRef.current, originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.IOUTransactionID, reportAction);
            }
            else {
                (0, IOU_1.deleteMoneyRequest)(originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.IOUTransactionID, reportAction);
            }
        }
        else if (reportAction) {
            (0, Report_1.deleteReportComment)(reportIDRef.current, reportAction);
        }
        react_native_1.DeviceEventEmitter.emit("deletedReportAction_".concat(reportIDRef.current), reportAction === null || reportAction === void 0 ? void 0 : reportAction.reportActionID);
        setIsDeleteCommentConfirmModalVisible(false);
    }, []);
    var hideDeleteModal = function () {
        callbackWhenDeleteModalHide.current = function () { return (onCancelDeleteModal.current = runAndResetCallback(onCancelDeleteModal.current)); };
        setIsDeleteCommentConfirmModalVisible(false);
        setShouldSetModalVisibilityForDeleteConfirmation(true);
        setIsRoomArchived(false);
        setIsChronosReportEnabled(false);
        setIsChatPinned(false);
        setHasUnreadMessages(false);
    };
    /** Opens the Confirm delete action modal */
    var showDeleteModal = function (reportID, reportAction, shouldSetModalVisibility, onConfirm, onCancel) {
        if (shouldSetModalVisibility === void 0) { shouldSetModalVisibility = true; }
        if (onConfirm === void 0) { onConfirm = function () { }; }
        if (onCancel === void 0) { onCancel = function () { }; }
        onCancelDeleteModal.current = onCancel;
        onConfirmDeleteModal.current = onConfirm;
        reportIDRef.current = reportID;
        reportActionRef.current = reportAction !== null && reportAction !== void 0 ? reportAction : null;
        setShouldSetModalVisibilityForDeleteConfirmation(shouldSetModalVisibility);
        setIsDeleteCommentConfirmModalVisible(true);
    };
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        showContextMenu: showContextMenu,
        hideContextMenu: hideContextMenu,
        showDeleteModal: showDeleteModal,
        hideDeleteModal: hideDeleteModal,
        isActiveReportAction: isActiveReportAction,
        instanceIDRef: instanceIDRef,
        runAndResetOnPopoverHide: runAndResetOnPopoverHide,
        clearActiveReportAction: clearActiveReportAction,
        contentRef: contentRef,
        isContextMenuOpening: isContextMenuOpening,
    }); });
    var reportAction = reportActionRef.current;
    return (<>
            <PopoverWithMeasuredContent_1.default isVisible={isPopoverVisible} onClose={hideContextMenu} onModalShow={runAndResetOnPopoverShow} onModalHide={runAndResetOnPopoverHide} anchorPosition={popoverAnchorPosition.current} animationIn="fadeIn" disableAnimation={false} shouldSetModalVisibility={false} fullscreen withoutOverlay={isWithoutOverlay} anchorDimensions={contextMenuDimensions.current} anchorRef={anchorRef} shouldSwitchPositionIfOverflow={shouldSwitchPositionIfOverflow}>
                <BaseReportActionContextMenu_1.default isVisible={isPopoverVisible} type={typeRef.current} reportID={reportIDRef.current} reportActionID={reportActionIDRef.current} draftMessage={reportActionDraftMessageRef.current} selection={selectionRef.current} isArchivedRoom={isRoomArchived} isChronosReport={isChronosReportEnabled} isPinnedChat={isChatPinned} isUnreadChat={hasUnreadMessages} isThreadReportParentAction={isThreadReportParentAction} anchor={contextMenuTargetNode} contentRef={contentRef} originalReportID={originalReportIDRef.current} disabledActions={disabledActions} setIsEmojiPickerActive={onEmojiPickerToggle.current}/>
            </PopoverWithMeasuredContent_1.default>
            <ConfirmModal_1.default title={translate('reportActionContextMenu.deleteAction', { action: reportAction })} isVisible={isDeleteCommentConfirmModalVisible} shouldSetModalVisibility={shouldSetModalVisibilityForDeleteConfirmation} onConfirm={confirmDeleteAndHideModal} onCancel={hideDeleteModal} onModalHide={function () {
            clearActiveReportAction();
            callbackWhenDeleteModalHide.current();
        }} prompt={translate('reportActionContextMenu.deleteConfirmation', { action: reportAction })} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>
        </>);
}
PopoverReportActionContextMenu.displayName = 'PopoverReportActionContextMenu';
exports.default = (0, react_1.forwardRef)(PopoverReportActionContextMenu);
