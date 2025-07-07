"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TimePicker_1 = require("@components/TimePicker/TimePicker");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var User = require("@libs/actions/User");
var DateUtils_1 = require("@libs/DateUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function SetTimePage(_a) {
    var _b;
    var customStatus = _a.customStatus;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var clearAfter = (_b = customStatus === null || customStatus === void 0 ? void 0 : customStatus.clearAfter) !== null && _b !== void 0 ? _b : '';
    var onSubmit = function (time) {
        var timeToUse = DateUtils_1.default.combineDateAndTime(time, clearAfter);
        User.updateDraftCustomStatus({ clearAfter: timeToUse });
        Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_STATUS_CLEAR_AFTER);
    };
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom testID={SetTimePage.displayName}>
            <HeaderWithBackButton_1.default title={translate('statusPage.time')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_STATUS_CLEAR_AFTER); }}/>
            <react_native_1.View style={styles.flex1}>
                <TimePicker_1.default defaultValue={clearAfter} onSubmit={onSubmit}/>
            </react_native_1.View>
        </ScreenWrapper_1.default>);
}
SetTimePage.displayName = 'SetTimePage';
exports.default = (0, react_native_onyx_1.withOnyx)({
    customStatus: {
        key: ONYXKEYS_1.default.CUSTOM_STATUS_DRAFT,
    },
})(SetTimePage);
