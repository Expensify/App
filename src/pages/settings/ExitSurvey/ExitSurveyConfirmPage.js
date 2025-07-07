"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components//Icon");
var Button_1 = require("@components/Button");
var FixedFooter_1 = require("@components/FixedFooter");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Illustrations_1 = require("@components/Icon/Illustrations");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@navigation/Navigation");
var variables_1 = require("@styles/variables");
var ExitSurvey_1 = require("@userActions/ExitSurvey");
var Link_1 = require("@userActions/Link");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var ExitSurveyReasonForm_1 = require("@src/types/form/ExitSurveyReasonForm");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var ExitSurveyOffline_1 = require("./ExitSurveyOffline");
function ExitSurveyConfirmPage(_a) {
    var _b, _c;
    var route = _a.route, navigation = _a.navigation;
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var styles = (0, useThemeStyles_1.default)();
    var tryNewDot = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_TRY_NEW_DOT, { canBeMissing: true })[0];
    var exitReason = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.EXIT_SURVEY_REASON_FORM, {
        selector: function (value) { var _a; return (_a = value === null || value === void 0 ? void 0 : value[ExitSurveyReasonForm_1.default.REASON]) !== null && _a !== void 0 ? _a : null; },
        canBeMissing: true,
    })[0];
    var shouldShowQuickTips = (0, EmptyObject_1.isEmptyObject)(tryNewDot) || ((_b = tryNewDot === null || tryNewDot === void 0 ? void 0 : tryNewDot.classicRedirect) === null || _b === void 0 ? void 0 : _b.dismissed) === true || (!(0, EmptyObject_1.isEmptyObject)(tryNewDot) && ((_c = tryNewDot === null || tryNewDot === void 0 ? void 0 : tryNewDot.classicRedirect) === null || _c === void 0 ? void 0 : _c.dismissed) === undefined);
    var getBackToParam = (0, react_1.useCallback)(function () {
        if (isOffline) {
            return ROUTES_1.default.SETTINGS;
        }
        if (exitReason) {
            return ROUTES_1.default.SETTINGS_EXIT_SURVEY_RESPONSE.getRoute(exitReason, ROUTES_1.default.SETTINGS_EXIT_SURVEY_REASON.route);
        }
        return ROUTES_1.default.SETTINGS;
    }, [exitReason, isOffline]);
    var backTo = (route.params || {}).backTo;
    (0, react_1.useEffect)(function () {
        var newBackTo = getBackToParam();
        if (backTo === newBackTo) {
            return;
        }
        navigation.setParams({
            backTo: newBackTo,
        });
    }, [backTo, getBackToParam, navigation]);
    return (<ScreenWrapper_1.default testID={ExitSurveyConfirmPage.displayName}>
            <HeaderWithBackButton_1.default title={translate(shouldShowQuickTips ? 'exitSurvey.goToExpensifyClassic' : 'exitSurvey.header')} onBackButtonPress={function () { return Navigation_1.default.goBack(backTo); }}/>
            <react_native_1.View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, styles.mh5]}>
                {isOffline && <ExitSurveyOffline_1.default />}
                {!isOffline && (<>
                        <Icon_1.default src={Illustrations_1.MushroomTopHat} width={variables_1.default.mushroomTopHatWidth} height={variables_1.default.mushroomTopHatHeight}/>
                        <Text_1.default style={[styles.headerAnonymousFooter, styles.mt5, styles.textAlignCenter]}>
                            {translate(shouldShowQuickTips ? 'exitSurvey.quickTip' : 'exitSurvey.thankYou')}
                        </Text_1.default>
                        <Text_1.default style={[styles.mt2, styles.textAlignCenter]}>{translate(shouldShowQuickTips ? 'exitSurvey.quickTipSubTitle' : 'exitSurvey.thankYouSubtitle')}</Text_1.default>
                    </>)}
            </react_native_1.View>
            <FixedFooter_1.default>
                <Button_1.default success large text={translate(shouldShowQuickTips ? 'exitSurvey.takeMeToExpensifyClassic' : 'exitSurvey.goToExpensifyClassic')} pressOnEnter onPress={function () {
            (0, ExitSurvey_1.switchToOldDot)();
            Navigation_1.default.dismissModal();
            (0, Link_1.openOldDotLink)(CONST_1.default.OLDDOT_URLS.INBOX, true);
        }} isDisabled={isOffline}/>
            </FixedFooter_1.default>
        </ScreenWrapper_1.default>);
}
ExitSurveyConfirmPage.displayName = 'ExitSurveyConfirmPage';
exports.default = ExitSurveyConfirmPage;
