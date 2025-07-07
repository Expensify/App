"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var laptop_with_second_screen_sync_svg_1 = require("@assets/images/laptop-with-second-screen-sync.svg");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var Button_1 = require("@components/Button");
var CopyTextToClipboard_1 = require("@components/CopyTextToClipboard");
var FixedFooter_1 = require("@components/FixedFooter");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Icon_1 = require("@components/Icon");
var Illustrations = require("@components/Icon/Illustrations");
var ImageSVG_1 = require("@components/ImageSVG");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var connections_1 = require("@libs/actions/connections");
var QuickbooksDesktop = require("@libs/actions/connections/QuickbooksDesktop");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyAction = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function RequireQuickBooksDesktopModal(_a) {
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var environmentURL = (0, useEnvironment_1.default)().environmentURL;
    var policyID = route.params.policyID;
    var _b = (0, react_1.useState)(false), hasError = _b[0], setHasError = _b[1];
    var _c = (0, react_1.useState)(''), codatSetupLink = _c[0], setCodatSetupLink = _c[1];
    var hasResultOfFetchingSetupLink = !!codatSetupLink || hasError;
    var ContentWrapper = hasResultOfFetchingSetupLink
        ? function (_a) {
            var children = _a.children;
            return children;
        }
        : function (_a) {
            var children = _a.children;
            return <FullPageOfflineBlockingView_1.default addBottomSafeAreaPadding>{children}</FullPageOfflineBlockingView_1.default>;
        };
    var fetchSetupLink = (0, react_1.useCallback)(function () {
        setHasError(false);
        // eslint-disable-next-line rulesdir/no-thenable-actions-in-views
        QuickbooksDesktop.getQuickbooksDesktopCodatSetupLink(policyID).then(function (response) {
            var _a;
            if (!(response === null || response === void 0 ? void 0 : response.jsonCode)) {
                return;
            }
            if (response.jsonCode === CONST_1.default.JSON_CODE.SUCCESS) {
                setCodatSetupLink(String((_a = response === null || response === void 0 ? void 0 : response.setupUrl) !== null && _a !== void 0 ? _a : ''));
            }
            else {
                (0, connections_1.setConnectionError)(policyID, CONST_1.default.POLICY.CONNECTIONS.NAME.QBD, translate('workspace.qbd.setupPage.setupErrorTitle'));
                setHasError(true);
            }
        });
    }, [policyID, translate]);
    (0, react_1.useEffect)(function () {
        // Since QBD doesn't support Taxes, we should disable them from the LHN when connecting to QBD
        PolicyAction.enablePolicyTaxes(policyID, false);
        fetchSetupLink();
        // disabling this rule, as we want this to run only on the first render
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    (0, useNetwork_1.default)({
        onReconnect: function () {
            if (hasResultOfFetchingSetupLink) {
                return;
            }
            fetchSetupLink();
        },
    });
    var shouldShowError = hasError;
    return (<ScreenWrapper_1.default shouldEnablePickerAvoiding={false} shouldShowOfflineIndicatorInWideScreen testID={RequireQuickBooksDesktopModal.displayName}>
            <HeaderWithBackButton_1.default title={translate('workspace.qbd.qbdSetup')} shouldShowBackButton onBackButtonPress={function () { return Navigation_1.default.dismissModal(); }}/>
            <ContentWrapper>
                {shouldShowError && (<react_native_1.View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, styles.ph5, styles.mb9]}>
                        <Icon_1.default src={Illustrations.BrokenMagnifyingGlass} width={116} height={168}/>
                        <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mt3]}>{translate('workspace.qbd.setupPage.setupErrorTitle')}</Text_1.default>
                        <Text_1.default style={[styles.textSupporting, styles.ph5, styles.mv3, styles.textAlignCenter]}>
                            {translate('workspace.qbd.setupPage.setupErrorBody1')}{' '}
                            <TextLink_1.default href={"".concat(environmentURL, "/").concat(ROUTES_1.default.CONCIERGE)} style={styles.link}>
                                {translate('workspace.qbd.setupPage.setupErrorBodyContactConcierge')}
                            </TextLink_1.default>{' '}
                            {translate('workspace.qbd.setupPage.setupErrorBody2')}
                        </Text_1.default>
                    </react_native_1.View>)}
                {!shouldShowError && (<react_native_1.View style={[styles.flex1, styles.ph5]}>
                        <react_native_1.View style={[styles.alignSelfCenter, styles.computerIllustrationContainer, styles.pv6]}>
                            <ImageSVG_1.default src={laptop_with_second_screen_sync_svg_1.default}/>
                        </react_native_1.View>

                        <Text_1.default style={[styles.textHeadlineH1, styles.pt5]}>{translate('workspace.qbd.setupPage.title')}</Text_1.default>
                        <Text_1.default style={[styles.textSupporting, styles.textNormal, styles.pt4]}>{translate('workspace.qbd.setupPage.body')}</Text_1.default>
                        <react_native_1.View style={[styles.qbdSetupLinkBox, styles.mt5]}>
                            {!hasResultOfFetchingSetupLink ? (<react_native_1.ActivityIndicator color={theme.spinner} size="small"/>) : (<CopyTextToClipboard_1.default text={codatSetupLink} textStyles={[styles.textSupporting]}/>)}
                        </react_native_1.View>
                        <FixedFooter_1.default style={[styles.mtAuto, styles.ph0]} addBottomSafeAreaPadding>
                            <Button_1.default success text={translate('common.done')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_TRIGGER_FIRST_SYNC.getRoute(policyID)); }} pressOnEnter large/>
                        </FixedFooter_1.default>
                    </react_native_1.View>)}
            </ContentWrapper>
        </ScreenWrapper_1.default>);
}
RequireQuickBooksDesktopModal.displayName = 'RequireQuickBooksDesktopModal';
exports.default = RequireQuickBooksDesktopModal;
