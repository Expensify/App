"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Badge_1 = require("@components/Badge");
var Button_1 = require("@components/Button");
var Expensicons_1 = require("@components/Icon/Expensicons");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function FreeTrial(_a) {
    var badgeStyles = _a.badgeStyles, _b = _a.pressable, pressable = _b === void 0 ? false : _b, _c = _a.addSpacing, addSpacing = _c === void 0 ? false : _c, _d = _a.success, success = _d === void 0 ? true : _d, _e = _a.inARow, inARow = _e === void 0 ? false : _e;
    var styles = (0, useThemeStyles_1.default)();
    var policies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { canBeMissing: true })[0];
    var firstDayFreeTrial = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_FIRST_DAY_FREE_TRIAL, { canBeMissing: true })[0];
    var lastDayFreeTrial = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL, { canBeMissing: true })[0];
    var privateSubscription = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION, { canBeMissing: true })[0];
    var _f = (0, react_1.useState)(undefined), freeTrialText = _f[0], setFreeTrialText = _f[1];
    var isOffline = (0, useNetwork_1.default)().isOffline;
    (0, react_1.useEffect)(function () {
        if (!privateSubscription && !isOffline) {
            return;
        }
        setFreeTrialText((0, SubscriptionUtils_1.getFreeTrialText)(policies));
    }, [isOffline, privateSubscription, policies, firstDayFreeTrial, lastDayFreeTrial]);
    if (!freeTrialText) {
        return null;
    }
    var freeTrial = pressable ? (<Button_1.default icon={Expensicons_1.Star} success={success} text={freeTrialText} iconWrapperStyles={[styles.mw100]} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_SUBSCRIPTION.getRoute(Navigation_1.default.getActiveRoute())); }}/>) : (<Badge_1.default success={success} text={freeTrialText} badgeStyles={badgeStyles}/>);
    return addSpacing ? <react_native_1.View style={inARow ? [styles.pb3, styles.w50, styles.pl1] : [styles.pb3, styles.ph5]}>{freeTrial}</react_native_1.View> : freeTrial;
}
FreeTrial.displayName = 'FreeTrial';
exports.default = FreeTrial;
