"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var expensify_logo_round_transparent_png_1 = require("@assets/images/expensify-logo-round-transparent.png");
var ContextMenuItem_1 = require("@components/ContextMenuItem");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var QRShareWithDownload_1 = require("@components/QRShare/QRShareWithDownload");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useLocalize_1 = require("@hooks/useLocalize");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Clipboard_1 = require("@libs/Clipboard");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var shouldAllowDownloadQRCode_1 = require("@libs/shouldAllowDownloadQRCode");
var Url_1 = require("@libs/Url");
var UserUtils_1 = require("@libs/UserUtils");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
/**
 * When sharing a policy (workspace) only return user avatar that is user defined. Default ws avatars have separate logic.
 * In any other case default to expensify logo
 */
function getLogoForWorkspace(report, policy) {
    if (!policy || !policy.id || (report === null || report === void 0 ? void 0 : report.type) !== 'chat') {
        return expensify_logo_round_transparent_png_1.default;
    }
    if (!policy.avatarURL) {
        return undefined;
    }
    return policy.avatarURL;
}
function ShareCodePage(_a) {
    var _b, _c, _d;
    var report = _a.report, policy = _a.policy, backTo = _a.backTo;
    var themeStyles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var environmentURL = (0, useEnvironment_1.default)().environmentURL;
    var qrCodeRef = (0, react_1.useRef)(null);
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var isReport = !!(report === null || report === void 0 ? void 0 : report.reportID);
    var subtitle = (0, react_1.useMemo)(function () {
        var _a;
        if (isReport) {
            if ((0, ReportUtils_1.isExpenseReport)(report)) {
                return (0, ReportUtils_1.getPolicyName)({ report: report });
            }
            if ((0, ReportUtils_1.isMoneyRequestReport)(report)) {
                // generate subtitle from participants
                return (0, ReportUtils_1.getParticipantsAccountIDsForDisplay)(report, true)
                    .map(function (accountID) { return (0, ReportUtils_1.getDisplayNameForParticipant)({ accountID: accountID }); })
                    .join(' & ');
            }
            return (_a = (0, ReportUtils_1.getParentNavigationSubtitle)(report).workspaceName) !== null && _a !== void 0 ? _a : (0, ReportUtils_1.getChatRoomSubtitle)(report);
        }
        return currentUserPersonalDetails.login;
    }, [report, currentUserPersonalDetails, isReport]);
    var title = isReport ? (0, ReportUtils_1.getReportName)(report) : ((_b = currentUserPersonalDetails.displayName) !== null && _b !== void 0 ? _b : '');
    var urlWithTrailingSlash = (0, Url_1.addTrailingForwardSlash)(environmentURL);
    var url = isReport
        ? "".concat(urlWithTrailingSlash).concat(ROUTES_1.default.REPORT_WITH_ID.getRoute(report.reportID))
        : "".concat(urlWithTrailingSlash).concat(ROUTES_1.default.PROFILE.getRoute((_c = currentUserPersonalDetails.accountID) !== null && _c !== void 0 ? _c : CONST_1.default.DEFAULT_NUMBER_ID));
    var logo = isReport ? getLogoForWorkspace(report, policy) : (0, UserUtils_1.getAvatarUrl)(currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.avatar, currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.accountID);
    // Default logos (avatars) are SVG and they require some special logic to display correctly
    var svgLogo;
    var logoBackgroundColor;
    var svgLogoFillColor;
    if (!logo && policy && !policy.avatarURL) {
        svgLogo = (0, ReportUtils_1.getDefaultWorkspaceAvatar)(policy.name) || Expensicons.FallbackAvatar;
        var defaultWorkspaceAvatarColors = StyleUtils.getDefaultWorkspaceAvatarColor(policy.id);
        logoBackgroundColor = (_d = defaultWorkspaceAvatarColors.backgroundColor) === null || _d === void 0 ? void 0 : _d.toString();
        svgLogoFillColor = defaultWorkspaceAvatarColors.fill;
    }
    return (<ScreenWrapper_1.default testID={ShareCodePage.displayName}>
            <HeaderWithBackButton_1.default title={translate('common.shareCode')} onBackButtonPress={function () { return Navigation_1.default.goBack(isReport ? ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(report === null || report === void 0 ? void 0 : report.reportID, backTo) : undefined); }} shouldShowBackButton/>
            <ScrollView_1.default style={[themeStyles.flex1, themeStyles.pt3]}>
                <react_native_1.View style={[themeStyles.workspaceSectionMobile, themeStyles.ph5]}>
                    <QRShareWithDownload_1.default ref={qrCodeRef} url={url} title={title} subtitle={subtitle} logo={isReport ? expensify_logo_round_transparent_png_1.default : (0, UserUtils_1.getAvatarUrl)(currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.avatar, currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.accountID)} logoRatio={isReport ? CONST_1.default.QR.EXPENSIFY_LOGO_SIZE_RATIO : CONST_1.default.QR.DEFAULT_LOGO_SIZE_RATIO} logoMarginRatio={isReport ? CONST_1.default.QR.EXPENSIFY_LOGO_MARGIN_RATIO : CONST_1.default.QR.DEFAULT_LOGO_MARGIN_RATIO} svgLogo={svgLogo} svgLogoFillColor={svgLogoFillColor} logoBackgroundColor={logoBackgroundColor}/>
                </react_native_1.View>

                <react_native_1.View style={themeStyles.mt9}>
                    <ContextMenuItem_1.default isAnonymousAction text={translate('qrCodes.copy')} icon={Expensicons.Copy} successIcon={Expensicons.Checkmark} successText={translate('qrCodes.copied')} onPress={function () { return Clipboard_1.default.setString(url); }} shouldLimitWidth={false}/>
                    {/* Remove this platform specific condition once https://github.com/Expensify/App/issues/19834 is done.
        We shouldn't introduce platform specific code in our codebase.
        This is a temporary solution while Web is not supported for the QR code download feature */}
                    {shouldAllowDownloadQRCode_1.default && (<MenuItem_1.default isAnonymousAction title={translate('common.download')} icon={Expensicons.Download} 
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onPress={function () { var _a, _b; return (_b = (_a = qrCodeRef.current) === null || _a === void 0 ? void 0 : _a.download) === null || _b === void 0 ? void 0 : _b.call(_a); }}/>)}

                    <MenuItem_1.default title={translate("referralProgram.".concat(CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE, ".buttonText"))} icon={Expensicons.Cash} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.REFERRAL_DETAILS_MODAL.getRoute(CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE, Navigation_1.default.getActiveRoute())); }} shouldShowRightIcon/>
                </react_native_1.View>
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
ShareCodePage.displayName = 'ShareCodePage';
exports.default = ShareCodePage;
