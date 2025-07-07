"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Report_1 = require("@userActions/Report");
var Session_1 = require("@userActions/Session");
var CONST_1 = require("@src/CONST");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var PressableWithFeedback_1 = require("./Pressable/PressableWithFeedback");
var Tooltip_1 = require("./Tooltip");
function PinButton(_a) {
    var report = _a.report;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<Tooltip_1.default text={report.isPinned ? translate('common.unPin') : translate('common.pin')}>
            <PressableWithFeedback_1.default onPress={(0, Session_1.callFunctionIfActionIsAllowed)(function () { var _a; return (0, Report_1.togglePinnedState)(report.reportID, (_a = report.isPinned) !== null && _a !== void 0 ? _a : false); })} style={styles.touchableButtonImage} accessibilityLabel={report.isPinned ? translate('common.unPin') : translate('common.pin')} role={CONST_1.default.ROLE.BUTTON}>
                <Icon_1.default src={Expensicons.Pin} fill={report.isPinned ? theme.heading : theme.icon}/>
            </PressableWithFeedback_1.default>
        </Tooltip_1.default>);
}
PinButton.displayName = 'PinButton';
exports.default = PinButton;
