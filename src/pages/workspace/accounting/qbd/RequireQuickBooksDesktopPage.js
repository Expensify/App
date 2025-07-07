"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var laptop_with_second_screen_x_svg_1 = require("@assets/images/laptop-with-second-screen-x.svg");
var Button_1 = require("@components/Button");
var FixedFooter_1 = require("@components/FixedFooter");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ImageSVG_1 = require("@components/ImageSVG");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ROUTES_1 = require("@src/ROUTES");
function RequireQuickBooksDesktopModal(_a) {
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = route.params.policyID;
    return (<ScreenWrapper_1.default shouldEnablePickerAvoiding={false} shouldShowOfflineIndicatorInWideScreen testID={RequireQuickBooksDesktopModal.displayName} enableEdgeToEdgeBottomSafeAreaPadding>
            <HeaderWithBackButton_1.default title={translate('workspace.qbd.qbdSetup')} shouldShowBackButton onBackButtonPress={function () { return Navigation_1.default.dismissModal(); }}/>
            <react_native_1.View style={[styles.flex1]}>
                <react_native_1.View style={[styles.flex1, styles.justifyContentCenter, styles.ph5]}>
                    <react_native_1.View style={[styles.alignSelfCenter, styles.pendingStateCardIllustration]}>
                        <ImageSVG_1.default src={laptop_with_second_screen_x_svg_1.default}/>
                    </react_native_1.View>

                    <Text_1.default style={[styles.textAlignCenter, styles.textHeadlineH1, styles.pt5]}>{translate('workspace.qbd.requiredSetupDevice.title')}</Text_1.default>
                    <Text_1.default style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal, styles.pt3]}>{translate('workspace.qbd.requiredSetupDevice.body1')}</Text_1.default>
                    <Text_1.default style={[styles.textAlignCenter, styles.textSupporting, styles.textNormal, styles.pt4]}>{translate('workspace.qbd.requiredSetupDevice.body2')}</Text_1.default>
                </react_native_1.View>
                <FixedFooter_1.default addBottomSafeAreaPadding>
                    <Button_1.default success text={translate('common.buttonConfirm')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_ACCOUNTING.getRoute(policyID)); }} pressOnEnter large/>
                </FixedFooter_1.default>
            </react_native_1.View>
        </ScreenWrapper_1.default>);
}
RequireQuickBooksDesktopModal.displayName = 'RequireQuickBooksDesktopModal';
exports.default = RequireQuickBooksDesktopModal;
