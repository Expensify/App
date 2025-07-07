"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var PressableWithFeedback_1 = require("./Pressable/PressableWithFeedback");
function PrevNextButtons(_a) {
    var isPrevButtonDisabled = _a.isPrevButtonDisabled, isNextButtonDisabled = _a.isNextButtonDisabled, onNext = _a.onNext, onPrevious = _a.onPrevious;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    return (<react_native_1.View style={styles.flexRow}>
            <PressableWithFeedback_1.default accessible accessibilityRole={CONST_1.default.ROLE.BUTTON} accessibilityLabel={CONST_1.default.ROLE.BUTTON} disabled={isPrevButtonDisabled} style={[styles.h10, styles.mr1, styles.alignItemsCenter, styles.justifyContentCenter]} onPress={onPrevious}>
                <react_native_1.View style={[styles.reportActionContextMenuMiniButton, { backgroundColor: theme.borderLighter }, isPrevButtonDisabled && styles.buttonOpacityDisabled]}>
                    <Icon_1.default src={Expensicons.BackArrow} small fill={theme.icon} isButtonIcon/>
                </react_native_1.View>
            </PressableWithFeedback_1.default>
            <PressableWithFeedback_1.default accessible accessibilityRole={CONST_1.default.ROLE.BUTTON} accessibilityLabel={CONST_1.default.ROLE.BUTTON} disabled={isNextButtonDisabled} style={[styles.h10, styles.alignItemsCenter, styles.justifyContentCenter]} onPress={onNext}>
                <react_native_1.View style={[styles.reportActionContextMenuMiniButton, { backgroundColor: theme.borderLighter }, isNextButtonDisabled && styles.buttonOpacityDisabled]}>
                    <Icon_1.default src={Expensicons.ArrowRight} small fill={theme.icon} isButtonIcon/>
                </react_native_1.View>
            </PressableWithFeedback_1.default>
        </react_native_1.View>);
}
exports.default = PrevNextButtons;
