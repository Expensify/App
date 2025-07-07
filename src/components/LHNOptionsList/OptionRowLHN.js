"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var DisplayNames_1 = require("@components/DisplayNames");
var Hoverable_1 = require("@components/Hoverable");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var MultipleAvatars_1 = require("@components/MultipleAvatars");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var OnyxProvider_1 = require("@components/OnyxProvider");
var PressableWithSecondaryInteraction_1 = require("@components/PressableWithSecondaryInteraction");
var ProductTrainingContext_1 = require("@components/ProductTrainingContext");
var SubscriptAvatar_1 = require("@components/SubscriptAvatar");
var Text_1 = require("@components/Text");
var Tooltip_1 = require("@components/Tooltip");
var EducationalTooltip_1 = require("@components/Tooltip/EducationalTooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DateUtils_1 = require("@libs/DateUtils");
var DomUtils_1 = require("@libs/DomUtils");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var Parser_1 = require("@libs/Parser");
var Performance_1 = require("@libs/Performance");
var ReportActionComposeFocusManager_1 = require("@libs/ReportActionComposeFocusManager");
var ReportUtils_1 = require("@libs/ReportUtils");
var ReportActionContextMenu_1 = require("@pages/home/report/ContextMenu/ReportActionContextMenu");
var FreeTrial_1 = require("@pages/settings/Subscription/FreeTrial");
var variables_1 = require("@styles/variables");
var Timing_1 = require("@userActions/Timing");
var CONST_1 = require("@src/CONST");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function OptionRowLHN(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var reportID = _a.reportID, report = _a.report, _k = _a.isOptionFocused, isOptionFocused = _k === void 0 ? false : _k, _l = _a.onSelectRow, onSelectRow = _l === void 0 ? function () { } : _l, optionItem = _a.optionItem, _m = _a.viewMode, viewMode = _m === void 0 ? 'default' : _m, activePolicyID = _a.activePolicyID, onboardingPurpose = _a.onboardingPurpose, isFullscreenVisible = _a.isFullscreenVisible, isReportsSplitNavigatorLast = _a.isReportsSplitNavigatorLast, style = _a.style, _o = _a.onLayout, onLayout = _o === void 0 ? function () { } : _o, hasDraftComment = _a.hasDraftComment, shouldShowRBRorGBRTooltip = _a.shouldShowRBRorGBRTooltip, _p = _a.isScreenFocused, isScreenFocused = _p === void 0 ? false : _p;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var popoverAnchor = (0, react_1.useRef)(null);
    var StyleUtils = (0, useStyleUtils_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var session = (0, OnyxProvider_1.useSession)();
    var shouldShowWorkspaceChatTooltip = (0, ReportUtils_1.isPolicyExpenseChat)(report) && !(0, ReportUtils_1.isThread)(report) && activePolicyID === (report === null || report === void 0 ? void 0 : report.policyID) && (session === null || session === void 0 ? void 0 : session.accountID) === (report === null || report === void 0 ? void 0 : report.ownerAccountID);
    var isOnboardingGuideAssigned = onboardingPurpose === CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM && !((_b = session === null || session === void 0 ? void 0 : session.email) === null || _b === void 0 ? void 0 : _b.includes('+'));
    var isChatUsedForOnboarding = (0, ReportUtils_1.isChatUsedForOnboarding)(report, onboardingPurpose);
    var shouldShowGetStartedTooltip = isOnboardingGuideAssigned ? (0, ReportUtils_1.isAdminRoom)(report) && isChatUsedForOnboarding : (0, ReportUtils_1.isConciergeChatReport)(report);
    var _q = (0, react_1.useMemo)(function () {
        var tooltip;
        if (shouldShowRBRorGBRTooltip) {
            tooltip = CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.GBR_RBR_CHAT;
        }
        else if (shouldShowWorkspaceChatTooltip) {
            tooltip = CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.LHN_WORKSPACE_CHAT_TOOLTIP;
        }
        else {
            // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
            // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
            tooltip = CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.CONCIERGE_LHN_GBR;
        }
        var shouldShowTooltips = shouldShowRBRorGBRTooltip || shouldShowWorkspaceChatTooltip || shouldShowGetStartedTooltip;
        var shouldTooltipBeVisible = shouldUseNarrowLayout ? isScreenFocused && isReportsSplitNavigatorLast : isReportsSplitNavigatorLast && !isFullscreenVisible;
        return {
            tooltipToRender: tooltip,
            shouldShowTooltip: shouldShowTooltips && shouldTooltipBeVisible,
            shouldTooltipBeLeftAligned: shouldShowWorkspaceChatTooltip && !shouldShowRBRorGBRTooltip && !shouldShowGetStartedTooltip,
        };
    }, [shouldShowRBRorGBRTooltip, shouldShowGetStartedTooltip, shouldShowWorkspaceChatTooltip, isScreenFocused, shouldUseNarrowLayout, isReportsSplitNavigatorLast, isFullscreenVisible]), tooltipToRender = _q.tooltipToRender, shouldShowTooltip = _q.shouldShowTooltip, shouldTooltipBeLeftAligned = _q.shouldTooltipBeLeftAligned;
    var _r = (0, ProductTrainingContext_1.useProductTrainingContext)(tooltipToRender, shouldShowTooltip), shouldShowProductTrainingTooltip = _r.shouldShowProductTrainingTooltip, renderProductTrainingTooltip = _r.renderProductTrainingTooltip, hideProductTrainingTooltip = _r.hideProductTrainingTooltip;
    var translate = (0, useLocalize_1.default)().translate;
    var _s = (0, react_1.useState)(false), isContextMenuActive = _s[0], setIsContextMenuActive = _s[1];
    var isInFocusMode = viewMode === CONST_1.default.OPTION_MODE.COMPACT;
    var sidebarInnerRowStyle = react_native_1.StyleSheet.flatten(isInFocusMode
        ? [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRowCompact, styles.justifyContentCenter]
        : [styles.chatLinkRowPressable, styles.flexGrow1, styles.optionItemAvatarNameWrapper, styles.optionRow, styles.justifyContentCenter]);
    if (!optionItem && !isOptionFocused) {
        // rendering null as a render item causes the FlashList to render all
        // its children and consume significant memory on the first render. We can avoid this by
        // rendering a placeholder view instead. This behaviour is only observed when we
        // first sign in to the App.
        // We can fix this by checking if the optionItem is null and the component is not focused.
        // Which means that the currentReportID is not the same as the reportID. The currentReportID
        // in this case is empty and hence the component is not focused.
        return <react_native_1.View style={sidebarInnerRowStyle}/>;
    }
    if (!optionItem) {
        // This is the case when the component is focused and the optionItem is null.
        // For example, when you submit an expense in offline mode and click on the
        // generated expense report, we would only see the Report Details but no item in LHN.
        return null;
    }
    var brickRoadIndicator = optionItem.brickRoadIndicator;
    var textStyle = isOptionFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText;
    var textUnreadStyle = (0, OptionsListUtils_1.shouldUseBoldText)(optionItem) ? [textStyle, styles.sidebarLinkTextBold] : [textStyle];
    var displayNameStyle = [styles.optionDisplayName, styles.optionDisplayNameCompact, styles.pre, textUnreadStyle, style];
    var alternateTextStyle = isInFocusMode
        ? [textStyle, styles.textLabelSupporting, styles.optionAlternateTextCompact, styles.ml2, style]
        : [textStyle, styles.optionAlternateText, styles.textLabelSupporting, style];
    var contentContainerStyles = isInFocusMode ? [styles.flex1, styles.flexRow, styles.overflowHidden, StyleUtils.getCompactContentContainerStyles()] : [styles.flex1];
    var hoveredBackgroundColor = !!styles.sidebarLinkHover && 'backgroundColor' in styles.sidebarLinkHover ? styles.sidebarLinkHover.backgroundColor : theme.sidebar;
    var focusedBackgroundColor = styles.sidebarLinkActive.backgroundColor;
    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param [event] - A press event.
     */
    var showPopover = function (event) {
        if (!isScreenFocused && shouldUseNarrowLayout) {
            return;
        }
        setIsContextMenuActive(true);
        (0, ReportActionContextMenu_1.showContextMenu)({
            type: CONST_1.default.CONTEXT_MENU_TYPES.REPORT,
            event: event,
            selection: '',
            contextMenuAnchor: popoverAnchor.current,
            report: {
                reportID: reportID,
                originalReportID: reportID,
                isPinnedChat: optionItem.isPinned,
                isUnreadChat: !!optionItem.isUnread,
            },
            reportAction: {
                reportActionID: '-1',
            },
            callbacks: {
                onHide: function () { return setIsContextMenuActive(false); },
            },
            withoutOverlay: false,
        });
    };
    var emojiCode = (_d = (_c = optionItem.status) === null || _c === void 0 ? void 0 : _c.emojiCode) !== null && _d !== void 0 ? _d : '';
    var statusText = (_f = (_e = optionItem.status) === null || _e === void 0 ? void 0 : _e.text) !== null && _f !== void 0 ? _f : '';
    var statusClearAfterDate = (_h = (_g = optionItem.status) === null || _g === void 0 ? void 0 : _g.clearAfter) !== null && _h !== void 0 ? _h : '';
    var formattedDate = DateUtils_1.default.getStatusUntilDate(statusClearAfterDate);
    var statusContent = formattedDate ? "".concat(statusText ? "".concat(statusText, " ") : '', "(").concat(formattedDate, ")") : statusText;
    var isStatusVisible = !!emojiCode && (0, ReportUtils_1.isOneOnOneChat)(!(0, EmptyObject_1.isEmptyObject)(report) ? report : undefined);
    var subscriptAvatarBorderColor = isOptionFocused ? focusedBackgroundColor : theme.sidebar;
    var firstIcon = (_j = optionItem.icons) === null || _j === void 0 ? void 0 : _j.at(0);
    var onOptionPress = function (event) {
        Performance_1.default.markStart(CONST_1.default.TIMING.OPEN_REPORT);
        Timing_1.default.start(CONST_1.default.TIMING.OPEN_REPORT);
        event === null || event === void 0 ? void 0 : event.preventDefault();
        // Enable Composer to focus on clicking the same chat after opening the context menu.
        ReportActionComposeFocusManager_1.default.focus();
        hideProductTrainingTooltip();
        onSelectRow(optionItem, popoverAnchor);
    };
    return (<OfflineWithFeedback_1.default pendingAction={optionItem.pendingAction} errors={optionItem.allReportErrors} shouldShowErrorMessages={false} needsOffscreenAlphaCompositing>
            <EducationalTooltip_1.default 
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    shouldRender={shouldShowProductTrainingTooltip} renderTooltipContent={renderProductTrainingTooltip} anchorAlignment={{
            horizontal: shouldTooltipBeLeftAligned ? CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT : CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
            vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
        }} shiftHorizontal={shouldTooltipBeLeftAligned ? variables_1.default.workspaceLHNTooltipShiftHorizontal : variables_1.default.gbrTooltipShiftHorizontal} shiftVertical={shouldTooltipBeLeftAligned ? 0 : variables_1.default.gbrTooltipShiftVertical} wrapperStyle={styles.productTrainingTooltipWrapper} onTooltipPress={onOptionPress} shouldHideOnScroll>
                <react_native_1.View>
                    <Hoverable_1.default>
                        {function (hovered) {
            var _a, _b, _c, _d, _e;
            return (<PressableWithSecondaryInteraction_1.default ref={popoverAnchor} onPress={onOptionPress} onMouseDown={function (event) {
                    // Allow composer blur on right click
                    if (!event) {
                        return;
                    }
                    // Prevent composer blur on left click
                    event.preventDefault();
                }} 
            // reportID may be a number contrary to the type definition
            testID={typeof optionItem.reportID === 'number' ? String(optionItem.reportID) : optionItem.reportID} onSecondaryInteraction={function (event) {
                    var _a;
                    showPopover(event);
                    // Ensure that we blur the composer when opening context menu, so that only one component is focused at a time
                    if (DomUtils_1.default.getActiveElement()) {
                        (_a = DomUtils_1.default.getActiveElement()) === null || _a === void 0 ? void 0 : _a.blur();
                    }
                }} withoutFocusOnSecondaryInteraction activeOpacity={variables_1.default.pressDimValue} opacityAnimationDuration={0} style={[
                    styles.flexRow,
                    styles.alignItemsCenter,
                    styles.justifyContentBetween,
                    styles.sidebarLink,
                    styles.sidebarLinkInnerLHN,
                    StyleUtils.getBackgroundColorStyle(theme.sidebar),
                    isOptionFocused ? styles.sidebarLinkActive : null,
                    (hovered || isContextMenuActive) && !isOptionFocused ? styles.sidebarLinkHover : null,
                ]} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={"".concat(translate('accessibilityHints.navigatesToChat'), " ").concat(optionItem.text, ". ").concat(optionItem.isUnread ? "".concat(translate('common.unread'), ".") : '', " ").concat(optionItem.alternateText)} onLayout={onLayout} needsOffscreenAlphaCompositing={((_b = (_a = optionItem === null || optionItem === void 0 ? void 0 : optionItem.icons) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) >= 2}>
                                <react_native_1.View style={sidebarInnerRowStyle}>
                                    <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter]}>
                                        {!!((_c = optionItem.icons) === null || _c === void 0 ? void 0 : _c.length) &&
                    firstIcon &&
                    (optionItem.shouldShowSubscript ? (<SubscriptAvatar_1.default backgroundColor={hovered && !isOptionFocused ? hoveredBackgroundColor : subscriptAvatarBorderColor} mainAvatar={firstIcon} secondaryAvatar={optionItem.icons.at(1)} size={isInFocusMode ? CONST_1.default.AVATAR_SIZE.SMALL : CONST_1.default.AVATAR_SIZE.DEFAULT}/>) : (<MultipleAvatars_1.default icons={optionItem.icons} isFocusMode={isInFocusMode} size={isInFocusMode ? CONST_1.default.AVATAR_SIZE.SMALL : CONST_1.default.AVATAR_SIZE.DEFAULT} secondAvatarStyle={[
                            StyleUtils.getBackgroundAndBorderStyle(theme.sidebar),
                            isOptionFocused ? StyleUtils.getBackgroundAndBorderStyle(focusedBackgroundColor) : undefined,
                            hovered && !isOptionFocused ? StyleUtils.getBackgroundAndBorderStyle(hoveredBackgroundColor) : undefined,
                        ]} shouldShowTooltip={(0, OptionsListUtils_1.shouldOptionShowTooltip)(optionItem)}/>))}
                                        <react_native_1.View style={contentContainerStyles}>
                                            <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.mw100, styles.overflowHidden]}>
                                                <DisplayNames_1.default accessibilityLabel={translate('accessibilityHints.chatUserDisplayNames')} fullTitle={(_d = optionItem.text) !== null && _d !== void 0 ? _d : ''} displayNamesWithTooltips={(_e = optionItem.displayNamesWithTooltips) !== null && _e !== void 0 ? _e : []} tooltipEnabled numberOfLines={1} textStyles={displayNameStyle} shouldUseFullTitle={!!optionItem.isChatRoom ||
                    !!optionItem.isPolicyExpenseChat ||
                    !!optionItem.isTaskReport ||
                    !!optionItem.isThread ||
                    !!optionItem.isMoneyRequestReport ||
                    !!optionItem.isInvoiceReport ||
                    !!optionItem.private_isArchived ||
                    (0, ReportUtils_1.isGroupChat)(report) ||
                    (0, ReportUtils_1.isSystemChat)(report)}/>
                                                {isChatUsedForOnboarding && <FreeTrial_1.default badgeStyles={[styles.mnh0, styles.pl2, styles.pr2, styles.ml1]}/>}
                                                {isStatusVisible && (<Tooltip_1.default text={statusContent} shiftVertical={-4}>
                                                        <Text_1.default style={styles.ml1}>{emojiCode}</Text_1.default>
                                                    </Tooltip_1.default>)}
                                            </react_native_1.View>
                                            {optionItem.alternateText ? (<Text_1.default style={alternateTextStyle} numberOfLines={1} accessibilityLabel={translate('accessibilityHints.lastChatMessagePreview')}>
                                                    {Parser_1.default.htmlToText(optionItem.alternateText)}
                                                </Text_1.default>) : null}
                                        </react_native_1.View>
                                        {(optionItem === null || optionItem === void 0 ? void 0 : optionItem.descriptiveText) ? (<react_native_1.View style={[styles.flexWrap]}>
                                                <Text_1.default style={[styles.textLabel]}>{optionItem.descriptiveText}</Text_1.default>
                                            </react_native_1.View>) : null}
                                        {brickRoadIndicator === CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR && (<react_native_1.View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                                                <Icon_1.default testID="RBR Icon" src={Expensicons.DotIndicator} fill={theme.danger}/>
                                            </react_native_1.View>)}
                                    </react_native_1.View>
                                </react_native_1.View>
                                <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter]} accessible={false}>
                                    {brickRoadIndicator === CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.INFO && (<react_native_1.View style={styles.ml2}>
                                            <Icon_1.default testID="GBR Icon" src={Expensicons.DotIndicator} fill={theme.success}/>
                                        </react_native_1.View>)}
                                    {hasDraftComment && !!optionItem.isAllowedToComment && (<react_native_1.View style={styles.ml2} accessibilityLabel={translate('sidebarScreen.draftedMessage')}>
                                            <Icon_1.default testID="Pencil Icon" fill={theme.icon} src={Expensicons.Pencil}/>
                                        </react_native_1.View>)}
                                    {!brickRoadIndicator && !!optionItem.isPinned && (<react_native_1.View style={styles.ml2} accessibilityLabel={translate('sidebarScreen.chatPinned')}>
                                            <Icon_1.default testID="Pin Icon" fill={theme.icon} src={Expensicons.Pin}/>
                                        </react_native_1.View>)}
                                </react_native_1.View>
                            </PressableWithSecondaryInteraction_1.default>);
        }}
                    </Hoverable_1.default>
                </react_native_1.View>
            </EducationalTooltip_1.default>
        </OfflineWithFeedback_1.default>);
}
OptionRowLHN.displayName = 'OptionRowLHN';
exports.default = react_1.default.memo(OptionRowLHN);
