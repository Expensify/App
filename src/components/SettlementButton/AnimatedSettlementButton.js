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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_reanimated_1 = require("react-native-reanimated");
var Button_1 = require("@components/Button");
var Expensicons = require("@components/Icon/Expensicons");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var _1 = require(".");
function AnimatedSettlementButton(_a) {
    var isPaidAnimationRunning = _a.isPaidAnimationRunning, isApprovedAnimationRunning = _a.isApprovedAnimationRunning, onAnimationFinish = _a.onAnimationFinish, _b = _a.shouldAddTopMargin, shouldAddTopMargin = _b === void 0 ? false : _b, isDisabled = _a.isDisabled, canIOUBePaid = _a.canIOUBePaid, wrapperStyle = _a.wrapperStyle, settlementButtonProps = __rest(_a, ["isPaidAnimationRunning", "isApprovedAnimationRunning", "onAnimationFinish", "shouldAddTopMargin", "isDisabled", "canIOUBePaid", "wrapperStyle"]);
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isAnimationRunning = isPaidAnimationRunning || isApprovedAnimationRunning;
    var buttonDuration = isPaidAnimationRunning ? CONST_1.default.ANIMATION_PAID_DURATION : CONST_1.default.ANIMATION_THUMBS_UP_DURATION;
    var buttonDelay = CONST_1.default.ANIMATION_PAID_BUTTON_HIDE_DELAY;
    var gap = styles.expenseAndReportPreviewTextButtonContainer.gap;
    var buttonMarginTop = (0, react_native_reanimated_1.useSharedValue)(gap);
    var height = (0, react_native_reanimated_1.useSharedValue)(variables_1.default.componentSizeNormal);
    var _c = react_1.default.useState(true), canShow = _c[0], setCanShow = _c[1];
    var _d = react_1.default.useState(0), minWidth = _d[0], setMinWidth = _d[1];
    var viewRef = (0, react_1.useRef)(null);
    var containerStyles = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return (__assign({ height: height.get(), justifyContent: 'center' }, (shouldAddTopMargin && { marginTop: buttonMarginTop.get() }))); });
    var willShowPaymentButton = canIOUBePaid && isApprovedAnimationRunning;
    var stretchOutY = (0, react_1.useCallback)(function () {
        'worklet';
        if (shouldAddTopMargin) {
            buttonMarginTop.set((0, react_native_reanimated_1.withTiming)(willShowPaymentButton ? gap : 0, { duration: buttonDuration }));
        }
        if (willShowPaymentButton) {
            (0, react_native_reanimated_1.runOnJS)(onAnimationFinish)();
            return;
        }
        height.set((0, react_native_reanimated_1.withTiming)(0, { duration: buttonDuration }, function () { return (0, react_native_reanimated_1.runOnJS)(onAnimationFinish)(); }));
    }, [buttonDuration, buttonMarginTop, gap, height, onAnimationFinish, shouldAddTopMargin, willShowPaymentButton]);
    var buttonAnimation = (0, react_1.useMemo)(function () {
        return new react_native_reanimated_1.Keyframe({
            from: {
                opacity: 1,
                transform: [{ scale: 1 }],
            },
            to: {
                opacity: 0,
                transform: [{ scale: 0 }],
            },
        })
            .delay(buttonDelay)
            .duration(buttonDuration)
            .withCallback(stretchOutY);
    }, [buttonDelay, buttonDuration, stretchOutY]);
    var icon;
    if (isApprovedAnimationRunning) {
        icon = Expensicons.ThumbsUp;
    }
    else if (isPaidAnimationRunning) {
        icon = Expensicons.Checkmark;
    }
    (0, react_1.useEffect)(function () {
        var _a, _b, _c;
        if (!isAnimationRunning) {
            setMinWidth(0);
            setCanShow(true);
            height.set(variables_1.default.componentSizeNormal);
            buttonMarginTop.set(shouldAddTopMargin ? gap : 0);
            return;
        }
        setMinWidth((_c = (_b = (_a = viewRef.current) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect) === null || _b === void 0 ? void 0 : _b.call(_a).width) !== null && _c !== void 0 ? _c : 0);
        var timer = setTimeout(function () { return setCanShow(false); }, CONST_1.default.ANIMATION_PAID_BUTTON_HIDE_DELAY);
        return function () { return clearTimeout(timer); };
    }, [buttonMarginTop, gap, height, isAnimationRunning, shouldAddTopMargin]);
    return (<react_native_reanimated_1.default.View style={[containerStyles, wrapperStyle, { minWidth: minWidth }]}>
            {isAnimationRunning && canShow && (<react_native_reanimated_1.default.View ref={function (el) {
                viewRef.current = el;
            }} exiting={buttonAnimation}>
                    <Button_1.default text={isApprovedAnimationRunning ? translate('iou.approved') : translate('iou.paymentComplete')} success icon={icon}/>
                </react_native_reanimated_1.default.View>)}
            {!isAnimationRunning && (<_1.default 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...settlementButtonProps} wrapperStyle={wrapperStyle} isDisabled={isAnimationRunning || isDisabled}/>)}
        </react_native_reanimated_1.default.View>);
}
AnimatedSettlementButton.displayName = 'AnimatedSettlementButton';
exports.default = AnimatedSettlementButton;
