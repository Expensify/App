"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var expensify_logo_round_transparent_png_1 = require("@assets/images/expensify-logo-round-transparent.png");
var ContextMenuItem_1 = require("@components/ContextMenuItem");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var OnyxProvider_1 = require("@components/OnyxProvider");
var QRShareWithDownload_1 = require("@components/QRShare/QRShareWithDownload");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Clipboard_1 = require("@libs/Clipboard");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var shouldAllowDownloadQRCode_1 = require("@libs/shouldAllowDownloadQRCode");
var Url_1 = require("@libs/Url");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var AccessOrNotFoundWrapper_1 = require("./AccessOrNotFoundWrapper");
var withPolicy_1 = require("./withPolicy");
function WorkspaceOverviewSharePage(_a) {
    var _b, _c, _d;
    var policy = _a.policy;
    var themeStyles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var environmentURL = (0, useEnvironment_1.default)().environmentURL;
    var qrCodeRef = (0, react_1.useRef)(null);
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var session = (0, OnyxProvider_1.useSession)();
    var policyName = (_b = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _b !== void 0 ? _b : '';
    var policyID = policy === null || policy === void 0 ? void 0 : policy.id;
    var adminEmail = (_c = session === null || session === void 0 ? void 0 : session.email) !== null && _c !== void 0 ? _c : '';
    var urlWithTrailingSlash = (0, Url_1.addTrailingForwardSlash)(environmentURL);
    var url = policyID ? "".concat(urlWithTrailingSlash).concat(ROUTES_1.default.WORKSPACE_JOIN_USER.getRoute(policyID, adminEmail)) : '';
    var hasAvatar = !!(policy === null || policy === void 0 ? void 0 : policy.avatarURL);
    var logo = hasAvatar ? policy === null || policy === void 0 ? void 0 : policy.avatarURL : undefined;
    var defaultWorkspaceAvatar = (0, ReportUtils_1.getDefaultWorkspaceAvatar)(policyName) || Expensicons.FallbackAvatar;
    var defaultWorkspaceAvatarColors = policyID ? StyleUtils.getDefaultWorkspaceAvatarColor(policyID) : StyleUtils.getDefaultWorkspaceAvatarColor('');
    var svgLogo = !hasAvatar ? defaultWorkspaceAvatar : undefined;
    var logoBackgroundColor = !hasAvatar ? (_d = defaultWorkspaceAvatarColors.backgroundColor) === null || _d === void 0 ? void 0 : _d.toString() : undefined;
    var svgLogoFillColor = !hasAvatar ? defaultWorkspaceAvatarColors.fill : undefined;
    var adminRoom = (0, react_1.useMemo)(function () {
        if (!(policy === null || policy === void 0 ? void 0 : policy.id)) {
            return undefined;
        }
        return (0, ReportUtils_1.getRoom)(CONST_1.default.REPORT.CHAT_TYPE.POLICY_ADMINS, policy === null || policy === void 0 ? void 0 : policy.id);
    }, [policy === null || policy === void 0 ? void 0 : policy.id]);
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]}>
            <ScreenWrapper_1.default testID={WorkspaceOverviewSharePage.displayName} shouldShowOfflineIndicatorInWideScreen enableEdgeToEdgeBottomSafeAreaPadding>
                <HeaderWithBackButton_1.default title={translate('common.share')} onBackButtonPress={Navigation_1.default.goBack}/>
                <ScrollView_1.default style={[themeStyles.flex1, themeStyles.pt3]} addBottomSafeAreaPadding>
                    <react_native_1.View style={[themeStyles.flex1, shouldUseNarrowLayout ? themeStyles.workspaceSectionMobile : themeStyles.workspaceSection]}>
                        <react_native_1.View style={[themeStyles.mh5]}>
                            <Text_1.default style={[themeStyles.textHeadlineH1, themeStyles.mb2]}>{translate('workspace.common.shareNote.header')}</Text_1.default>
                        </react_native_1.View>
                        <react_native_1.View style={[themeStyles.mh5, themeStyles.mb9]}>
                            <Text_1.default style={[themeStyles.textNormal]}>
                                {translate('workspace.common.shareNote.content.firstPart')}{' '}
                                <TextLink_1.default style={themeStyles.link} onPress={function () {
            if (!(adminRoom === null || adminRoom === void 0 ? void 0 : adminRoom.reportID)) {
                return;
            }
            Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(adminRoom.reportID));
        }}>
                                    {CONST_1.default.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}
                                </TextLink_1.default>{' '}
                                {translate('workspace.common.shareNote.content.secondPart')}
                            </Text_1.default>
                        </react_native_1.View>

                        <react_native_1.View style={[themeStyles.workspaceSectionMobile, themeStyles.ph9]}>
                            <QRShareWithDownload_1.default ref={qrCodeRef} url={url} title={policyName} logo={logo !== null && logo !== void 0 ? logo : expensify_logo_round_transparent_png_1.default} svgLogo={svgLogo} svgLogoFillColor={svgLogoFillColor} logoBackgroundColor={logoBackgroundColor} logoRatio={CONST_1.default.QR.DEFAULT_LOGO_SIZE_RATIO} logoMarginRatio={CONST_1.default.QR.DEFAULT_LOGO_MARGIN_RATIO}/>
                        </react_native_1.View>
                        <react_native_1.View style={[themeStyles.mt3, themeStyles.ph4]}>
                            <ContextMenuItem_1.default isAnonymousAction text={translate('qrCodes.copy')} icon={Expensicons.Copy} successIcon={Expensicons.Checkmark} successText={translate('qrCodes.copied')} onPress={function () { return Clipboard_1.default.setString(url); }} shouldLimitWidth={false} wrapperStyle={themeStyles.sectionMenuItemTopDescription}/>
                            {/* Remove this once https://github.com/Expensify/App/issues/19834 is done.
        We shouldn't introduce platform specific code in our codebase.
        This is a temporary solution while Web is not supported for the QR code download feature */}
                            {shouldAllowDownloadQRCode_1.default && (<MenuItem_1.default isAnonymousAction title={translate('common.download')} icon={Expensicons.Download} onPress={function () { var _a, _b; return (_b = (_a = qrCodeRef.current) === null || _a === void 0 ? void 0 : _a.download) === null || _b === void 0 ? void 0 : _b.call(_a); }} wrapperStyle={themeStyles.sectionMenuItemTopDescription}/>)}
                        </react_native_1.View>
                    </react_native_1.View>
                </ScrollView_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceOverviewSharePage.displayName = 'WorkspaceOverviewSharePage';
exports.default = (0, withPolicy_1.default)(WorkspaceOverviewSharePage);
