"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Button_1 = require("@components/Button");
var FixedFooter_1 = require("@components/FixedFooter");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Illustrations = require("@components/Icon/Illustrations");
var RenderHTML_1 = require("@components/RenderHTML");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var variables_1 = require("@styles/variables");
var ROUTES_1 = require("@src/ROUTES");
function ImTeacherUpdateEmailPage() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var environmentURL = (0, useEnvironment_1.default)().environmentURL;
    var contactMethodsRoute = "".concat(environmentURL, "/").concat(ROUTES_1.default.SETTINGS_CONTACT_METHODS.getRoute(ROUTES_1.default.I_AM_A_TEACHER));
    return (<ScreenWrapper_1.default testID={ImTeacherUpdateEmailPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('teachersUnitePage.iAmATeacher')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
            <BlockingView_1.default shouldShowLink shouldEmbedLinkWithSubtitle icon={Illustrations.EmailAddress} title={translate('teachersUnitePage.updateYourEmail')} CustomSubtitle={<Text_1.default style={[styles.textAlignCenter]}>
                        <RenderHTML_1.default html={translate('teachersUnitePage.schoolMailAsDefault', { contactMethodsRoute: contactMethodsRoute })}/>
                    </Text_1.default>} iconWidth={variables_1.default.signInLogoWidthLargeScreen} iconHeight={variables_1.default.signInLogoHeightLargeScreen}/>
            <FixedFooter_1.default style={[styles.flexGrow0]}>
                <Button_1.default success large accessibilityLabel={translate('teachersUnitePage.updateEmail')} text={translate('teachersUnitePage.updateEmail')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_CONTACT_METHODS.getRoute(Navigation_1.default.getActiveRouteWithoutParams())); }}/>
            </FixedFooter_1.default>
        </ScreenWrapper_1.default>);
}
ImTeacherUpdateEmailPage.displayName = 'ImTeacherUpdateEmailPage';
exports.default = ImTeacherUpdateEmailPage;
