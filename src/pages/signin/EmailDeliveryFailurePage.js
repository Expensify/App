"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useKeyboardState_1 = require("@hooks/useKeyboardState");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Session = require("@userActions/Session");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function EmailDeliveryFailurePage() {
    var credentials = (0, useOnyx_1.default)(ONYXKEYS_1.default.CREDENTIALS)[0];
    var styles = (0, useThemeStyles_1.default)();
    var isKeyboardShown = (0, useKeyboardState_1.default)().isKeyboardShown;
    var translate = (0, useLocalize_1.default)().translate;
    var login = (0, react_1.useMemo)(function () {
        if (!(credentials === null || credentials === void 0 ? void 0 : credentials.login)) {
            return '';
        }
        return expensify_common_1.Str.isSMSLogin(credentials.login) ? expensify_common_1.Str.removeSMSDomain(credentials.login) : credentials.login;
    }, [credentials === null || credentials === void 0 ? void 0 : credentials.login]);
    // This view doesn't have a field for user input, so dismiss the device keyboard if shown
    (0, react_1.useEffect)(function () {
        if (!isKeyboardShown) {
            return;
        }
        react_native_1.Keyboard.dismiss();
    }, [isKeyboardShown]);
    return (<>
            <react_native_1.View style={[styles.mv3, styles.flexRow]}>
                <react_native_1.View style={[styles.flex1]}>
                    <Text_1.default>{translate('emailDeliveryFailurePage.ourEmailProvider', { login: login })}</Text_1.default>
                    <Text_1.default style={[styles.mt5]}>
                        <Text_1.default style={[styles.textStrong]}>{translate('emailDeliveryFailurePage.confirmThat', { login: login })}</Text_1.default>
                        {translate('emailDeliveryFailurePage.emailAliases')}
                    </Text_1.default>
                    <Text_1.default style={[styles.mt5]}>
                        <Text_1.default style={[styles.textStrong]}>{translate('emailDeliveryFailurePage.ensureYourEmailClient')}</Text_1.default>
                        {translate('emailDeliveryFailurePage.youCanFindDirections')}
                        <TextLink_1.default href={CONST_1.default.SET_NOTIFICATION_LINK} style={[styles.link]}>
                            {translate('common.here')}
                        </TextLink_1.default>
                        {translate('emailDeliveryFailurePage.helpConfigure')}
                    </Text_1.default>
                    <Text_1.default style={styles.mt5}>
                        {translate('emailDeliveryFailurePage.onceTheAbove')}
                        <TextLink_1.default href={"mailto:".concat(CONST_1.default.EMAIL.CONCIERGE)} style={[styles.link]}>
                            {CONST_1.default.EMAIL.CONCIERGE}
                        </TextLink_1.default>
                        {translate('emailDeliveryFailurePage.toUnblock')}
                    </Text_1.default>
                </react_native_1.View>
            </react_native_1.View>
            <react_native_1.View style={[styles.mv4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                <PressableWithFeedback_1.default onPress={function () { return Session.clearSignInData(); }} role="button" accessibilityLabel={translate('common.back')} 
    // disable hover dim for switch
    hoverDimmingValue={1} pressDimmingValue={0.2}>
                    <Text_1.default style={[styles.link]}>{translate('common.back')}</Text_1.default>
                </PressableWithFeedback_1.default>
            </react_native_1.View>
        </>);
}
EmailDeliveryFailurePage.displayName = 'EmailDeliveryFailurePage';
exports.default = EmailDeliveryFailurePage;
