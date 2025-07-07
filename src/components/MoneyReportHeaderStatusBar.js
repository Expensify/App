"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var NextStepUtils = require("@libs/NextStepUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var RenderHTML_1 = require("./RenderHTML");
var iconMap = (_a = {},
    _a[CONST_1.default.NEXT_STEP.ICONS.HOURGLASS] = Expensicons.Hourglass,
    _a[CONST_1.default.NEXT_STEP.ICONS.CHECKMARK] = Expensicons.Checkmark,
    _a[CONST_1.default.NEXT_STEP.ICONS.STOPWATCH] = Expensicons.Stopwatch,
    _a);
function MoneyReportHeaderStatusBar(_a) {
    var nextStep = _a.nextStep;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var messageContent = (0, react_1.useMemo)(function () {
        var messageArray = nextStep.message;
        return NextStepUtils.parseMessage(messageArray);
    }, [nextStep.message]);
    return (<react_native_1.View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.overflowHidden, styles.w100, styles.headerStatusBarContainer]}>
            <react_native_1.View style={[styles.mr3]}>
                <Icon_1.default src={iconMap[nextStep.icon] || Expensicons.Hourglass} height={variables_1.default.iconSizeSmall} width={variables_1.default.iconSizeSmall} fill={theme.icon}/>
            </react_native_1.View>
            <react_native_1.View style={[styles.dFlex, styles.flexRow, styles.flexShrink1]}>
                <RenderHTML_1.default html={messageContent}/>
            </react_native_1.View>
        </react_native_1.View>);
}
MoneyReportHeaderStatusBar.displayName = 'MoneyReportHeaderStatusBar';
exports.default = MoneyReportHeaderStatusBar;
