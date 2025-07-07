"use strict";
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
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var AttachmentPicker_1 = require("@components/AttachmentPicker");
var DelegateNoAccessModalProvider_1 = require("@components/DelegateNoAccessModalProvider");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var PopoverMenu_1 = require("@components/PopoverMenu");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var PopoverAnchorTooltip_1 = require("@components/Tooltip/PopoverAnchorTooltip");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var usePrevious_1 = require("@hooks/usePrevious");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var Browser_1 = require("@libs/Browser");
var getIconForAction_1 = require("@libs/getIconForAction");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var IOU_1 = require("@userActions/IOU");
var Modal_1 = require("@userActions/Modal");
var Report_1 = require("@userActions/Report");
var Task_1 = require("@userActions/Task");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
/**
 * This includes the popover of options you see when pressing the + button in the composer.
 * It also contains the attachment picker, as the menu items need to be able to open it.
 */
function AttachmentPickerWithMenuItems(_a) {
    var report = _a.report, currentUserPersonalDetails = _a.currentUserPersonalDetails, reportParticipantIDs = _a.reportParticipantIDs, displayFileInModal = _a.displayFileInModal, isFullComposerAvailable = _a.isFullComposerAvailable, isComposerFullSize = _a.isComposerFullSize, reportID = _a.reportID, isBlockedFromConcierge = _a.isBlockedFromConcierge, disabled = _a.disabled, setMenuVisibility = _a.setMenuVisibility, isMenuVisible = _a.isMenuVisible, onTriggerAttachmentPicker = _a.onTriggerAttachmentPicker, onCanceledAttachmentPicker = _a.onCanceledAttachmentPicker, onMenuClosed = _a.onMenuClosed, onAddActionPressed = _a.onAddActionPressed, onItemSelected = _a.onItemSelected, actionButtonRef = _a.actionButtonRef, raiseIsScrollLikelyLayoutTriggered = _a.raiseIsScrollLikelyLayoutTriggered, shouldDisableAttachmentItem = _a.shouldDisableAttachmentItem;
    var isFocused = (0, native_1.useIsFocused)();
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, useWindowDimensions_1.default)(), windowHeight = _b.windowHeight, windowWidth = _b.windowWidth;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var _c = (0, react_1.useContext)(DelegateNoAccessModalProvider_1.DelegateNoAccessContext), isDelegateAccessRestricted = _c.isDelegateAccessRestricted, showDelegateNoAccessModal = _c.showDelegateNoAccessModal;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report === null || report === void 0 ? void 0 : report.policyID), { canBeMissing: true })[0];
    var isProduction = (0, useEnvironment_1.default)().isProduction;
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var isManualDistanceTrackingEnabled = isBetaEnabled(CONST_1.default.BETAS.MANUAL_DISTANCE);
    var selectOption = (0, react_1.useCallback)(function (onSelected, shouldRestrictAction) {
        if (shouldRestrictAction && policy && (0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(policy.id)) {
            Navigation_1.default.navigate(ROUTES_1.default.RESTRICTED_ACTION.getRoute(policy.id));
            return;
        }
        onSelected();
    }, [policy]);
    var teacherUnitePolicyID = isProduction ? CONST_1.default.TEACHERS_UNITE.PROD_POLICY_ID : CONST_1.default.TEACHERS_UNITE.TEST_POLICY_ID;
    var isTeachersUniteReport = (report === null || report === void 0 ? void 0 : report.policyID) === teacherUnitePolicyID;
    /**
     * Returns the list of IOU Options
     */
    var moneyRequestOptions = (0, react_1.useMemo)(function () {
        var _a;
        var options = (_a = {},
            _a[CONST_1.default.IOU.TYPE.SPLIT] = [
                {
                    icon: Expensicons.Transfer,
                    text: translate('iou.splitExpense'),
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    onSelected: function () { return selectOption(function () { var _a; return (0, IOU_1.startMoneyRequest)(CONST_1.default.IOU.TYPE.SPLIT, (_a = report === null || report === void 0 ? void 0 : report.reportID) !== null && _a !== void 0 ? _a : String(CONST_1.default.DEFAULT_NUMBER_ID)); }, true); },
                },
            ],
            _a[CONST_1.default.IOU.TYPE.SUBMIT] = __spreadArray([
                {
                    icon: (0, getIconForAction_1.default)(CONST_1.default.IOU.TYPE.CREATE),
                    text: translate('iou.createExpense'),
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    onSelected: function () { return selectOption(function () { var _a; return (0, IOU_1.startMoneyRequest)(CONST_1.default.IOU.TYPE.SUBMIT, (_a = report === null || report === void 0 ? void 0 : report.reportID) !== null && _a !== void 0 ? _a : String(CONST_1.default.DEFAULT_NUMBER_ID)); }, true); },
                }
            ], (isManualDistanceTrackingEnabled
                ? [
                    {
                        icon: Expensicons.Location,
                        text: translate('quickAction.recordDistance'),
                        shouldCallAfterModalHide: shouldUseNarrowLayout,
                        onSelected: function () { return selectOption(function () { return null; }, true); },
                    },
                ]
                : []), true),
            _a[CONST_1.default.IOU.TYPE.PAY] = [
                {
                    icon: (0, getIconForAction_1.default)(CONST_1.default.IOU.TYPE.SEND),
                    text: translate('iou.paySomeone', { name: (0, ReportUtils_1.getPayeeName)(report) }),
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    onSelected: function () {
                        if (isDelegateAccessRestricted) {
                            (0, Modal_1.close)(function () {
                                showDelegateNoAccessModal();
                            });
                            return;
                        }
                        selectOption(function () { var _a; return (0, IOU_1.startMoneyRequest)(CONST_1.default.IOU.TYPE.PAY, (_a = report === null || report === void 0 ? void 0 : report.reportID) !== null && _a !== void 0 ? _a : String(CONST_1.default.DEFAULT_NUMBER_ID)); }, false);
                    },
                },
            ],
            _a[CONST_1.default.IOU.TYPE.TRACK] = __spreadArray([
                {
                    icon: (0, getIconForAction_1.default)(CONST_1.default.IOU.TYPE.CREATE),
                    text: translate('iou.createExpense'),
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    onSelected: function () { return selectOption(function () { var _a; return (0, IOU_1.startMoneyRequest)(CONST_1.default.IOU.TYPE.TRACK, (_a = report === null || report === void 0 ? void 0 : report.reportID) !== null && _a !== void 0 ? _a : String(CONST_1.default.DEFAULT_NUMBER_ID)); }, true); },
                }
            ], (isManualDistanceTrackingEnabled
                ? [
                    {
                        icon: Expensicons.Location,
                        text: translate('iou.trackDistance'),
                        shouldCallAfterModalHide: shouldUseNarrowLayout,
                        onSelected: function () { return selectOption(function () { return null; }, true); },
                    },
                ]
                : []), true),
            _a[CONST_1.default.IOU.TYPE.INVOICE] = [
                {
                    icon: Expensicons.InvoiceGeneric,
                    text: translate('workspace.invoices.sendInvoice'),
                    shouldCallAfterModalHide: shouldUseNarrowLayout,
                    onSelected: function () { return selectOption(function () { var _a; return (0, IOU_1.startMoneyRequest)(CONST_1.default.IOU.TYPE.INVOICE, (_a = report === null || report === void 0 ? void 0 : report.reportID) !== null && _a !== void 0 ? _a : String(CONST_1.default.DEFAULT_NUMBER_ID)); }, false); },
                },
            ],
            _a);
        var moneyRequestOptionsList = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, policy, reportParticipantIDs !== null && reportParticipantIDs !== void 0 ? reportParticipantIDs : []).map(function (option) { return options[option]; });
        return moneyRequestOptionsList.flat().filter(function (item, index, self) { return index === self.findIndex(function (t) { return t.text === item.text; }); });
    }, [translate, shouldUseNarrowLayout, report, policy, reportParticipantIDs, selectOption, isDelegateAccessRestricted, showDelegateNoAccessModal, isManualDistanceTrackingEnabled]);
    var createReportOption = (0, react_1.useMemo)(function () {
        if (!(0, ReportUtils_1.isPolicyExpenseChat)(report) || !(0, ReportUtils_1.isPaidGroupPolicy)(report) || !(0, ReportUtils_1.isReportOwner)(report)) {
            return [];
        }
        return [
            {
                icon: Expensicons.Document,
                text: translate('report.newReport.createReport'),
                onSelected: function () { return selectOption(function () { return (0, Report_1.createNewReport)(currentUserPersonalDetails, report === null || report === void 0 ? void 0 : report.policyID, true); }, true); },
            },
        ];
    }, [currentUserPersonalDetails, report, selectOption, translate]);
    /**
     * Determines if we can show the task option
     */
    var taskOption = (0, react_1.useMemo)(function () {
        if (!(0, ReportUtils_1.canCreateTaskInReport)(report)) {
            return [];
        }
        return [
            {
                icon: Expensicons.Task,
                text: translate('newTaskPage.assignTask'),
                shouldCallAfterModalHide: shouldUseNarrowLayout,
                onSelected: function () { return (0, Task_1.clearOutTaskInfoAndNavigate)(reportID, report); },
            },
        ];
    }, [report, reportID, translate, shouldUseNarrowLayout]);
    var onPopoverMenuClose = function () {
        setMenuVisibility(false);
        onMenuClosed === null || onMenuClosed === void 0 ? void 0 : onMenuClosed();
    };
    var prevIsFocused = (0, usePrevious_1.default)(isFocused);
    /**
     * Check if current screen is inactive and previous screen is active.
     * Used to close already opened popover menu when any other page is opened over current page.
     *
     * @return {Boolean}
     */
    var didScreenBecomeInactive = (0, react_1.useCallback)(function () { return !isFocused && prevIsFocused; }, [isFocused, prevIsFocused]);
    // When the navigation is focused, we want to close the popover menu.
    (0, react_1.useEffect)(function () {
        if (!didScreenBecomeInactive() || !isMenuVisible) {
            return;
        }
        setMenuVisibility(false);
    }, [didScreenBecomeInactive, isMenuVisible, setMenuVisibility]);
    // 1. Limit the container width to a single column.
    var outerContainerStyles = [{ flexBasis: styles.composerSizeButton.width + styles.composerSizeButton.marginHorizontal * 2 }, styles.flexGrow0, styles.flexShrink0];
    // 2. If there isn't enough height for two buttons, the Expand/Collapse button wraps to the next column so that it's intentionally hidden,
    //    and the Create button is centered vertically.
    var innerContainerStyles = [
        styles.dFlex,
        styles.flexColumnReverse,
        styles.flexWrap,
        styles.justifyContentCenter,
        styles.pAbsolute,
        styles.h100,
        styles.w100,
        styles.overflowHidden,
        { paddingVertical: styles.composerSizeButton.marginHorizontal },
    ];
    // 3. If there is enough height for two buttons, the Expand/Collapse button is at the top.
    var expandCollapseButtonContainerStyles = [styles.flexGrow1, styles.flexShrink0];
    // 4. And the Create button is at the bottom.
    var createButtonContainerStyles = [styles.flexGrow0, styles.flexShrink0];
    return (<AttachmentPicker_1.default>
            {function (_a) {
            var openPicker = _a.openPicker;
            var triggerAttachmentPicker = function () {
                onTriggerAttachmentPicker();
                openPicker({
                    onPicked: function (data) { var _a; return displayFileInModal((_a = data.at(0)) !== null && _a !== void 0 ? _a : {}); },
                    onCanceled: onCanceledAttachmentPicker,
                });
            };
            var menuItems = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], moneyRequestOptions, true), (!isTeachersUniteReport ? createReportOption : []), true), taskOption, true), [
                {
                    icon: Expensicons.Paperclip,
                    text: translate('reportActionCompose.addAttachment'),
                    disabled: shouldDisableAttachmentItem,
                },
            ], false);
            return (<>
                        <react_native_1.View style={outerContainerStyles}>
                            <react_native_1.View style={innerContainerStyles}>
                                <react_native_1.View style={createButtonContainerStyles}>
                                    <PopoverAnchorTooltip_1.default text={translate('common.create')}>
                                        <PressableWithFeedback_1.default ref={actionButtonRef} onPress={function (e) {
                    var _a;
                    e === null || e === void 0 ? void 0 : e.preventDefault();
                    if (!isFocused) {
                        return;
                    }
                    onAddActionPressed();
                    // Drop focus to avoid blue focus ring.
                    (_a = actionButtonRef.current) === null || _a === void 0 ? void 0 : _a.blur();
                    setMenuVisibility(!isMenuVisible);
                }} style={styles.composerSizeButton} disabled={isBlockedFromConcierge || disabled} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('common.create')}>
                                            <Icon_1.default fill={theme.icon} src={Expensicons.Plus}/>
                                        </PressableWithFeedback_1.default>
                                    </PopoverAnchorTooltip_1.default>
                                </react_native_1.View>
                                {(isFullComposerAvailable || isComposerFullSize) && (<react_native_1.View style={expandCollapseButtonContainerStyles}>
                                        {isComposerFullSize ? (<PopoverAnchorTooltip_1.default text={translate('reportActionCompose.collapse')} key="composer-collapse">
                                                <PressableWithFeedback_1.default onPress={function (e) {
                            e === null || e === void 0 ? void 0 : e.preventDefault();
                            raiseIsScrollLikelyLayoutTriggered();
                            (0, Report_1.setIsComposerFullSize)(reportID, false);
                        }} 
                    // Keep focus on the composer when Collapse button is clicked.
                    onMouseDown={function (e) { return e.preventDefault(); }} style={styles.composerSizeButton} disabled={isBlockedFromConcierge || disabled} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('reportActionCompose.collapse')}>
                                                    <Icon_1.default fill={theme.icon} src={Expensicons.Collapse}/>
                                                </PressableWithFeedback_1.default>
                                            </PopoverAnchorTooltip_1.default>) : (<PopoverAnchorTooltip_1.default text={translate('reportActionCompose.expand')} key="composer-expand">
                                                <PressableWithFeedback_1.default onPress={function (e) {
                            e === null || e === void 0 ? void 0 : e.preventDefault();
                            raiseIsScrollLikelyLayoutTriggered();
                            (0, Report_1.setIsComposerFullSize)(reportID, true);
                        }} 
                    // Keep focus on the composer when Expand button is clicked.
                    onMouseDown={function (e) { return e.preventDefault(); }} style={styles.composerSizeButton} disabled={isBlockedFromConcierge || disabled} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('reportActionCompose.expand')}>
                                                    <Icon_1.default fill={theme.icon} src={Expensicons.Expand}/>
                                                </PressableWithFeedback_1.default>
                                            </PopoverAnchorTooltip_1.default>)}
                                    </react_native_1.View>)}
                            </react_native_1.View>
                        </react_native_1.View>
                        <PopoverMenu_1.default animationInTiming={menuItems.length * 50} 
            // The menu should close 2/3 of the time it took to open
            animationOutTiming={menuItems.length * 50 * 0.66} isVisible={isMenuVisible && isFocused} onClose={onPopoverMenuClose} onItemSelected={function (item, index) {
                    setMenuVisibility(false);
                    onItemSelected();
                    // In order for the file picker to open dynamically, the click
                    // function must be called from within a event handler that was initiated
                    // by the user on Safari.
                    if (index === menuItems.length - 1) {
                        if ((0, Browser_1.isSafari)()) {
                            triggerAttachmentPicker();
                            return;
                        }
                        (0, Modal_1.close)(function () {
                            triggerAttachmentPicker();
                        });
                    }
                }} anchorPosition={styles.createMenuPositionReportActionCompose(shouldUseNarrowLayout, windowHeight, windowWidth)} anchorAlignment={{ horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM }} menuItems={menuItems} anchorRef={actionButtonRef}/>
                    </>);
        }}
        </AttachmentPicker_1.default>);
}
AttachmentPickerWithMenuItems.displayName = 'AttachmentPickerWithMenuItems';
exports.default = AttachmentPickerWithMenuItems;
