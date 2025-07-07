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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useOnyx_1 = require("@hooks/useOnyx");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var utils_1 = require("./Button/utils");
var DisplayNames_1 = require("./DisplayNames");
var Expensicons_1 = require("./Icon/Expensicons");
var MultipleAvatars_1 = require("./MultipleAvatars");
var ParentNavigationSubtitle_1 = require("./ParentNavigationSubtitle");
var PressableWithoutFeedback_1 = require("./Pressable/PressableWithoutFeedback");
var SubscriptAvatar_1 = require("./SubscriptAvatar");
var Text_1 = require("./Text");
var fallbackIcon = {
    source: Expensicons_1.FallbackAvatar,
    type: CONST_1.default.ICON_TYPE_AVATAR,
    name: '',
    id: -1,
};
function getCustomDisplayName(shouldUseCustomSearchTitleName, report, title, displayNamesWithTooltips, transactions, shouldUseFullTitle, customSearchDisplayStyle, regularStyle, isAnonymous, isMoneyRequestOrReport) {
    var _a;
    var reportName = (_a = report === null || report === void 0 ? void 0 : report.reportName) !== null && _a !== void 0 ? _a : CONST_1.default.REPORT.DEFAULT_REPORT_NAME;
    var isIOUOrInvoice = (report === null || report === void 0 ? void 0 : report.type) === CONST_1.default.REPORT.TYPE.IOU || (report === null || report === void 0 ? void 0 : report.type) === CONST_1.default.REPORT.TYPE.INVOICE;
    var hasTransactions = transactions.length > 0;
    function getDisplayProps() {
        var baseProps = {
            displayNamesWithTooltips: displayNamesWithTooltips,
            tooltipEnabled: true,
            numberOfLines: 1,
        };
        if (shouldUseCustomSearchTitleName) {
            var styleProps = {
                textStyles: customSearchDisplayStyle,
            };
            if (!hasTransactions) {
                return __assign(__assign({ fullTitle: reportName, shouldUseFullTitle: shouldUseFullTitle }, baseProps), styleProps);
            }
            if (isIOUOrInvoice) {
                return __assign(__assign({ fullTitle: title, shouldUseFullTitle: true }, baseProps), styleProps);
            }
            return __assign(__assign({ fullTitle: reportName, shouldUseFullTitle: shouldUseFullTitle }, baseProps), styleProps);
        }
        return __assign({ fullTitle: title, textStyles: regularStyle, shouldUseFullTitle: isMoneyRequestOrReport || isAnonymous }, baseProps);
    }
    var _b = getDisplayProps(), fullTitle = _b.fullTitle, textStyles = _b.textStyles, displayNamesWithTooltipsProp = _b.displayNamesWithTooltips, tooltipEnabled = _b.tooltipEnabled, numberOfLines = _b.numberOfLines, shouldUseFullTitleProp = _b.shouldUseFullTitle;
    return (<DisplayNames_1.default fullTitle={fullTitle} displayNamesWithTooltips={displayNamesWithTooltipsProp} tooltipEnabled={tooltipEnabled} numberOfLines={numberOfLines} textStyles={textStyles} shouldUseFullTitle={shouldUseFullTitleProp}/>);
}
function AvatarWithDisplayName(_a) {
    var _b, _c;
    var policy = _a.policy, report = _a.report, _d = _a.isAnonymous, isAnonymous = _d === void 0 ? false : _d, _e = _a.size, size = _e === void 0 ? CONST_1.default.AVATAR_SIZE.DEFAULT : _e, _f = _a.shouldEnableDetailPageNavigation, shouldEnableDetailPageNavigation = _f === void 0 ? false : _f, _g = _a.shouldEnableAvatarNavigation, shouldEnableAvatarNavigation = _g === void 0 ? true : _g, _h = _a.shouldUseCustomSearchTitleName, shouldUseCustomSearchTitleName = _h === void 0 ? false : _h, _j = _a.transactions, transactions = _j === void 0 ? [] : _j, _k = _a.openParentReportInCurrentTab, openParentReportInCurrentTab = _k === void 0 ? false : _k, avatarBorderColorProp = _a.avatarBorderColor;
    var parentReportActions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report === null || report === void 0 ? void 0 : report.parentReportID), { canEvict: false, canBeMissing: false })[0];
    var personalDetails = ((_b = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: false })) !== null && _b !== void 0 ? _b : CONST_1.default.EMPTY_OBJECT)[0];
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var parentReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report === null || report === void 0 ? void 0 : report.parentReportID), { canBeMissing: true })[0];
    var invoiceReceiverPolicy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat((parentReport === null || parentReport === void 0 ? void 0 : parentReport.invoiceReceiver) && 'policyID' in parentReport.invoiceReceiver ? parentReport.invoiceReceiver.policyID : undefined), { canBeMissing: true })[0];
    var reportAttributes = (0, useOnyx_1.default)(ONYXKEYS_1.default.DERIVED.REPORT_ATTRIBUTES, { selector: function (attributes) { return attributes === null || attributes === void 0 ? void 0 : attributes.reports; }, canBeMissing: false })[0];
    var parentReportActionParam = (report === null || report === void 0 ? void 0 : report.parentReportActionID) ? parentReportActions === null || parentReportActions === void 0 ? void 0 : parentReportActions[report.parentReportActionID] : undefined;
    var title = (0, ReportUtils_1.getReportName)(report, undefined, parentReportActionParam, personalDetails, invoiceReceiverPolicy, reportAttributes);
    var subtitle = (0, ReportUtils_1.getChatRoomSubtitle)(report, { isCreateExpenseFlow: true });
    var parentNavigationSubtitleData = (0, ReportUtils_1.getParentNavigationSubtitle)(report);
    var isMoneyRequestOrReport = (0, ReportUtils_1.isMoneyRequestReport)(report) || (0, ReportUtils_1.isMoneyRequest)(report) || (0, ReportUtils_1.isTrackExpenseReport)(report) || (0, ReportUtils_1.isInvoiceReport)(report);
    var icons = (0, ReportUtils_1.getIcons)(report, personalDetails, null, '', -1, policy, invoiceReceiverPolicy);
    var ownerPersonalDetails = (0, OptionsListUtils_1.getPersonalDetailsForAccountIDs)((report === null || report === void 0 ? void 0 : report.ownerAccountID) ? [report.ownerAccountID] : [], personalDetails);
    var displayNamesWithTooltips = (0, ReportUtils_1.getDisplayNamesWithTooltips)(Object.values(ownerPersonalDetails), false);
    var isReportArchived = (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID);
    var shouldShowSubscriptAvatar = (0, ReportUtils_1.shouldReportShowSubscript)(report, isReportArchived);
    var avatarBorderColor = avatarBorderColorProp !== null && avatarBorderColorProp !== void 0 ? avatarBorderColorProp : (isAnonymous ? theme.highlightBG : theme.componentBG);
    var actorAccountID = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        var _a;
        if (!(report === null || report === void 0 ? void 0 : report.parentReportActionID)) {
            return;
        }
        var parentReportAction = parentReportActions === null || parentReportActions === void 0 ? void 0 : parentReportActions[report === null || report === void 0 ? void 0 : report.parentReportActionID];
        actorAccountID.current = (_a = parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.actorAccountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID;
    }, [parentReportActions, report]);
    var goToDetailsPage = (0, react_1.useCallback)(function () {
        (0, ReportUtils_1.navigateToDetailsPage)(report, Navigation_1.default.getReportRHPActiveRoute());
    }, [report]);
    var showActorDetails = (0, react_1.useCallback)(function () {
        // We should navigate to the details page if the report is a IOU/expense report
        if (shouldEnableDetailPageNavigation) {
            goToDetailsPage();
            return;
        }
        if ((0, ReportUtils_1.isExpenseReport)(report) && (report === null || report === void 0 ? void 0 : report.ownerAccountID)) {
            Navigation_1.default.navigate(ROUTES_1.default.PROFILE.getRoute(report.ownerAccountID));
            return;
        }
        if ((0, ReportUtils_1.isIOUReport)(report) && (report === null || report === void 0 ? void 0 : report.reportID)) {
            Navigation_1.default.navigate(ROUTES_1.default.REPORT_PARTICIPANTS.getRoute(report.reportID));
            return;
        }
        if ((0, ReportUtils_1.isChatThread)(report)) {
            // In an ideal situation account ID won't be 0
            if (actorAccountID.current && actorAccountID.current > 0) {
                Navigation_1.default.navigate(ROUTES_1.default.PROFILE.getRoute(actorAccountID.current));
                return;
            }
        }
        if (report === null || report === void 0 ? void 0 : report.reportID) {
            // Report detail route is added as fallback but based on the current implementation this route won't be executed
            Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(report.reportID));
        }
    }, [report, shouldEnableDetailPageNavigation, goToDetailsPage]);
    var shouldUseFullTitle = isMoneyRequestOrReport || isAnonymous;
    var avatar = (<react_native_1.View accessibilityLabel={title}>
            {shouldShowSubscriptAvatar ? (<SubscriptAvatar_1.default backgroundColor={avatarBorderColor} mainAvatar={(_c = icons.at(0)) !== null && _c !== void 0 ? _c : fallbackIcon} secondaryAvatar={icons.at(1)} size={size}/>) : (<MultipleAvatars_1.default icons={icons} size={size} secondAvatarStyle={[StyleUtils.getBackgroundAndBorderStyle(avatarBorderColor)]}/>)}
        </react_native_1.View>);
    var headerView = (<react_native_1.View style={[styles.appContentHeaderTitle, styles.flex1]}>
            {!!report && !!title && (<react_native_1.View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    {shouldEnableAvatarNavigation ? (<PressableWithoutFeedback_1.default onPress={showActorDetails} accessibilityLabel={title} role={(0, utils_1.getButtonRole)(true)}>
                            {avatar}
                        </PressableWithoutFeedback_1.default>) : (avatar)}
                    <react_native_1.View style={[styles.flex1, styles.flexColumn]}>
                        {getCustomDisplayName(shouldUseCustomSearchTitleName, report, title, displayNamesWithTooltips, transactions, shouldUseFullTitle, [styles.headerText, styles.pre], [isAnonymous ? styles.headerAnonymousFooter : styles.headerText, styles.pre], isAnonymous, isMoneyRequestOrReport)}
                        {Object.keys(parentNavigationSubtitleData).length > 0 && (<ParentNavigationSubtitle_1.default parentNavigationSubtitleData={parentNavigationSubtitleData} parentReportID={report === null || report === void 0 ? void 0 : report.parentReportID} parentReportActionID={report === null || report === void 0 ? void 0 : report.parentReportActionID} pressableStyles={[styles.alignSelfStart, styles.mw100]} openParentReportInCurrentTab={openParentReportInCurrentTab}/>)}
                        {!!subtitle && (<Text_1.default style={[styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre]} numberOfLines={1}>
                                {subtitle}
                            </Text_1.default>)}
                    </react_native_1.View>
                </react_native_1.View>)}
        </react_native_1.View>);
    if (!shouldEnableDetailPageNavigation) {
        return headerView;
    }
    return (<PressableWithoutFeedback_1.default onPress={goToDetailsPage} style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]} accessibilityLabel={title} role={CONST_1.default.ROLE.BUTTON}>
            {headerView}
        </PressableWithoutFeedback_1.default>);
}
AvatarWithDisplayName.displayName = 'AvatarWithDisplayName';
exports.default = AvatarWithDisplayName;
