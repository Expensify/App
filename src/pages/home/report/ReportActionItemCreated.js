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
var react_1 = require("react");
var react_native_1 = require("react-native");
var MultipleAvatars_1 = require("@components/MultipleAvatars");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var ReportWelcomeText_1 = require("@components/ReportWelcomeText");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var AnimatedEmptyStateBackground_1 = require("./AnimatedEmptyStateBackground");
function ReportActionItemCreated(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var reportID = _a.reportID, policyID = _a.policyID;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: true })[0];
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), { canBeMissing: true })[0];
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: true })[0];
    var invoiceReceiverPolicy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat((report === null || report === void 0 ? void 0 : report.invoiceReceiver) && 'policyID' in report.invoiceReceiver ? report.invoiceReceiver.policyID : undefined), {
        canBeMissing: true,
    })[0];
    if (!(0, ReportUtils_1.isChatReport)(report)) {
        return null;
    }
    var icons = (0, ReportUtils_1.getIcons)(report, personalDetails, null, '', -1, policy, invoiceReceiverPolicy);
    var shouldDisableDetailPage = (0, ReportUtils_1.shouldDisableDetailPage)(report);
    if ((0, ReportUtils_1.isInvoiceRoom)(report) && (0, ReportUtils_1.isCurrentUserInvoiceReceiver)(report)) {
        icons = __spreadArray([], icons, true).reverse();
    }
    return (<OfflineWithFeedback_1.default pendingAction={(_c = (_b = report === null || report === void 0 ? void 0 : report.pendingFields) === null || _b === void 0 ? void 0 : _b.addWorkspaceRoom) !== null && _c !== void 0 ? _c : (_d = report === null || report === void 0 ? void 0 : report.pendingFields) === null || _d === void 0 ? void 0 : _d.createChat} errors={(_f = (_e = report === null || report === void 0 ? void 0 : report.errorFields) === null || _e === void 0 ? void 0 : _e.addWorkspaceRoom) !== null && _f !== void 0 ? _f : (_g = report === null || report === void 0 ? void 0 : report.errorFields) === null || _g === void 0 ? void 0 : _g.createChat} errorRowStyles={[styles.ml10, styles.mr2]} onClose={function () { return (0, Report_1.clearCreateChatError)(report); }}>
            <react_native_1.View style={[styles.pRelative]}>
                <AnimatedEmptyStateBackground_1.default />
                <react_native_1.View accessibilityLabel={translate('accessibilityHints.chatWelcomeMessage')} style={[styles.p5]}>
                    <OfflineWithFeedback_1.default pendingAction={(_h = report === null || report === void 0 ? void 0 : report.pendingFields) === null || _h === void 0 ? void 0 : _h.avatar}>
                        <PressableWithoutFeedback_1.default onPress={function () { return (0, ReportUtils_1.navigateToDetailsPage)(report, Navigation_1.default.getReportRHPActiveRoute(), true); }} style={[styles.mh5, styles.mb3, styles.alignSelfStart, shouldDisableDetailPage && styles.cursorDefault]} accessibilityLabel={translate('common.details')} role={CONST_1.default.ROLE.BUTTON} disabled={shouldDisableDetailPage}>
                            <MultipleAvatars_1.default icons={icons} size={CONST_1.default.AVATAR_SIZE.X_LARGE} overlapDivider={4} shouldStackHorizontally shouldDisplayAvatarsInRows={shouldUseNarrowLayout} maxAvatarsInRow={shouldUseNarrowLayout ? CONST_1.default.AVATAR_ROW_SIZE.DEFAULT : CONST_1.default.AVATAR_ROW_SIZE.LARGE_SCREEN}/>
                        </PressableWithoutFeedback_1.default>
                    </OfflineWithFeedback_1.default>
                    <react_native_1.View style={[styles.ph5]}>
                        <ReportWelcomeText_1.default report={report} policy={policy}/>
                    </react_native_1.View>
                </react_native_1.View>
            </react_native_1.View>
        </OfflineWithFeedback_1.default>);
}
ReportActionItemCreated.displayName = 'ReportActionItemCreated';
exports.default = (0, react_1.memo)(ReportActionItemCreated);
