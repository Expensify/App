"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var Button_1 = require("@components/Button");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var MARKER_INACTIVE_TRANSLATE_Y = -40;
var MARKER_ACTIVE_TRANSLATE_Y = 10;
function FloatingMessageCounter(_a) {
    var _b;
    var _c = _a.isActive, isActive = _c === void 0 ? false : _c, _d = _a.onClick, onClick = _d === void 0 ? function () { } : _d;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var translateY = (0, react_native_reanimated_1.useSharedValue)(MARKER_INACTIVE_TRANSLATE_Y);
    var show = (0, react_1.useCallback)(function () {
        'worklet';
        translateY.set((0, react_native_reanimated_1.withSpring)(MARKER_ACTIVE_TRANSLATE_Y));
    }, [translateY]);
    var hide = (0, react_1.useCallback)(function () {
        'worklet';
        translateY.set((0, react_native_reanimated_1.withSpring)(MARKER_INACTIVE_TRANSLATE_Y));
    }, [translateY]);
    (0, react_1.useEffect)(function () {
        if (isActive) {
            show();
        }
        else {
            hide();
        }
    }, [isActive, show, hide]);
    var wrapperStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return (__assign(__assign({}, styles.floatingMessageCounterWrapper), { transform: [{ translateY: translateY.get() }] })); });
    return (<react_native_reanimated_1.default.View accessibilityHint={translate('accessibilityHints.scrollToNewestMessages')} style={wrapperStyle}>
            <react_native_1.View style={styles.floatingMessageCounter}>
                <react_native_1.View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                    <Button_1.default success small onPress={onClick}>
                        <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter]}>
                            <Icon_1.default small src={Expensicons.DownArrow} fill={theme.textLight}/>

                            <Text_1.default style={[styles.ml2, styles.buttonSmallText, styles.textWhite, styles.userSelectNone]} dataSet={_b = {}, _b[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _b}>
                                {translate('newMessages')}
                            </Text_1.default>
                        </react_native_1.View>
                    </Button_1.default>
                </react_native_1.View>
            </react_native_1.View>
        </react_native_reanimated_1.default.View>);
}
FloatingMessageCounter.displayName = 'FloatingMessageCounter';
exports.default = react_1.default.memo(FloatingMessageCounter);
