"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_picker_select_1 = require("react-native-picker-select");
var InputBlurContext_1 = require("@components/InputBlurContext");
var KeyboardAvoidingView_1 = require("@components/KeyboardAvoidingView");
var ModalContext_1 = require("@components/Modal/ModalContext");
var useBottomSafeSafeAreaPaddingStyle_1 = require("@hooks/useBottomSafeSafeAreaPaddingStyle");
var useInitialWindowDimensions_1 = require("@hooks/useInitialWindowDimensions");
var useSafeAreaPaddings_1 = require("@hooks/useSafeAreaPaddings");
var useTackInputFocus_1 = require("@hooks/useTackInputFocus");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var Browser_1 = require("@libs/Browser");
var VisualViewport_1 = require("@libs/VisualViewport");
var TestTool_1 = require("@userActions/TestTool");
var CONST_1 = require("@src/CONST");
function ScreenWrapperContainer(_a, ref) {
    var children = _a.children, style = _a.style, testID = _a.testID, bottomContent = _a.bottomContent, bottomContentStyleProp = _a.bottomContentStyle, _b = _a.keyboardAvoidingViewBehavior, keyboardAvoidingViewBehavior = _b === void 0 ? 'padding' : _b, keyboardVerticalOffset = _a.keyboardVerticalOffset, _c = _a.shouldEnableKeyboardAvoidingView, shouldEnableKeyboardAvoidingView = _c === void 0 ? true : _c, _d = _a.shouldEnableMaxHeight, shouldEnableMaxHeight = _d === void 0 ? false : _d, _f = _a.shouldEnableMinHeight, shouldEnableMinHeight = _f === void 0 ? false : _f, _g = _a.shouldEnablePickerAvoiding, shouldEnablePickerAvoiding = _g === void 0 ? true : _g, _h = _a.shouldDismissKeyboardBeforeClose, shouldDismissKeyboardBeforeClose = _h === void 0 ? true : _h, _j = _a.shouldAvoidScrollOnVirtualViewport, shouldAvoidScrollOnVirtualViewport = _j === void 0 ? true : _j, _k = _a.shouldUseCachedViewportHeight, shouldUseCachedViewportHeight = _k === void 0 ? false : _k, shouldKeyboardOffsetBottomSafeAreaPaddingProp = _a.shouldKeyboardOffsetBottomSafeAreaPadding, enableEdgeToEdgeBottomSafeAreaPadding = _a.enableEdgeToEdgeBottomSafeAreaPadding, _l = _a.includePaddingTop, includePaddingTop = _l === void 0 ? true : _l, _m = _a.includeSafeAreaPaddingBottom, includeSafeAreaPaddingBottom = _m === void 0 ? false : _m, _o = _a.isFocused, isFocused = _o === void 0 ? true : _o;
    var windowHeight = (0, useWindowDimensions_1.default)(shouldUseCachedViewportHeight).windowHeight;
    var initialHeight = (0, useInitialWindowDimensions_1.default)().initialHeight;
    var styles = (0, useThemeStyles_1.default)();
    var maxHeight = shouldEnableMaxHeight ? windowHeight : undefined;
    var minHeight = shouldEnableMinHeight && !(0, Browser_1.isSafari)() ? initialHeight : undefined;
    var _p = (0, InputBlurContext_1.useInputBlurContext)(), isBlurred = _p.isBlurred, setIsBlurred = _p.setIsBlurred;
    var isAvoidingViewportScroll = (0, useTackInputFocus_1.default)(isFocused && shouldEnableMaxHeight && shouldAvoidScrollOnVirtualViewport && (0, Browser_1.isMobileWebKit)());
    var isUsingEdgeToEdgeMode = enableEdgeToEdgeBottomSafeAreaPadding !== undefined;
    var shouldKeyboardOffsetBottomSafeAreaPadding = shouldKeyboardOffsetBottomSafeAreaPaddingProp !== null && shouldKeyboardOffsetBottomSafeAreaPaddingProp !== void 0 ? shouldKeyboardOffsetBottomSafeAreaPaddingProp : isUsingEdgeToEdgeMode;
    var _q = (0, useSafeAreaPaddings_1.default)(isUsingEdgeToEdgeMode), paddingTop = _q.paddingTop, paddingBottom = _q.paddingBottom, unmodifiedPaddings = _q.unmodifiedPaddings;
    // since Modals are drawn in separate native view hierarchy we should always add paddings
    var ignoreInsetsConsumption = !(0, react_1.useContext)(ModalContext_1.default).default;
    var paddingTopStyle = (0, react_1.useMemo)(function () {
        if (!includePaddingTop) {
            return {};
        }
        if (isUsingEdgeToEdgeMode) {
            return { paddingTop: paddingTop };
        }
        if (ignoreInsetsConsumption) {
            return { paddingTop: unmodifiedPaddings.top };
        }
        return { paddingTop: paddingTop };
    }, [isUsingEdgeToEdgeMode, ignoreInsetsConsumption, includePaddingTop, paddingTop, unmodifiedPaddings.top]);
    var showBottomContent = isUsingEdgeToEdgeMode ? !!bottomContent : true;
    var edgeToEdgeBottomContentStyle = (0, useBottomSafeSafeAreaPaddingStyle_1.default)({ addBottomSafeAreaPadding: true, addOfflineIndicatorBottomSafeAreaPadding: false });
    var legacyBottomContentStyle = (0, react_1.useMemo)(function () {
        var shouldUseUnmodifiedPaddings = includeSafeAreaPaddingBottom && ignoreInsetsConsumption;
        if (shouldUseUnmodifiedPaddings) {
            return {
                paddingBottom: unmodifiedPaddings.bottom,
            };
        }
        return {
            // We always need the safe area padding bottom if we're showing the offline indicator since it is bottom-docked.
            paddingBottom: includeSafeAreaPaddingBottom ? paddingBottom : undefined,
        };
    }, [ignoreInsetsConsumption, includeSafeAreaPaddingBottom, paddingBottom, unmodifiedPaddings.bottom]);
    var bottomContentStyle = (0, react_1.useMemo)(function () { return [isUsingEdgeToEdgeMode ? edgeToEdgeBottomContentStyle : legacyBottomContentStyle, bottomContentStyleProp]; }, [isUsingEdgeToEdgeMode, edgeToEdgeBottomContentStyle, legacyBottomContentStyle, bottomContentStyleProp]);
    var panResponder = (0, react_1.useRef)(react_native_1.PanResponder.create({
        onStartShouldSetPanResponderCapture: function (_e, gestureState) { return gestureState.numberActiveTouches === CONST_1.default.TEST_TOOL.NUMBER_OF_TAPS; },
        onPanResponderRelease: TestTool_1.default,
    })).current;
    var keyboardDismissPanResponder = (0, react_1.useRef)(react_native_1.PanResponder.create({
        onMoveShouldSetPanResponderCapture: function (_e, gestureState) {
            var isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
            var shouldDismissKeyboard = shouldDismissKeyboardBeforeClose && react_native_1.Keyboard.isVisible() && (0, Browser_1.isMobile)();
            return isHorizontalSwipe && shouldDismissKeyboard;
        },
        onPanResponderGrant: react_native_1.Keyboard.dismiss,
    })).current;
    (0, react_1.useEffect)(function () {
        /**
         * Handler to manage viewport resize events specific to Safari.
         * Disables the blur state when Safari is detected.
         */
        var handleViewportResize = function () {
            if (!(0, Browser_1.isSafari)()) {
                return; // Exit early if not Safari
            }
            setIsBlurred(false); // Disable blur state for Safari
        };
        // Add the viewport resize listener
        var removeResizeListener = (0, VisualViewport_1.default)(handleViewportResize);
        // Cleanup function to remove the listener
        return function () {
            removeResizeListener();
        };
    }, [setIsBlurred]);
    return (<react_native_1.View ref={ref} style={[styles.flex1, { minHeight: minHeight }]} 
    // eslint-disable-next-line react/jsx-props-no-spreading, react-compiler/react-compiler
    {...panResponder.panHandlers} testID={testID}>
            <react_native_1.View fsClass="fs-unmask" style={[style, paddingTopStyle]} 
    // eslint-disable-next-line react/jsx-props-no-spreading, react-compiler/react-compiler
    {...keyboardDismissPanResponder.panHandlers}>
                <KeyboardAvoidingView_1.default style={[styles.w100, styles.h100, !isBlurred ? { maxHeight: maxHeight } : undefined, isAvoidingViewportScroll ? [styles.overflowAuto, styles.overscrollBehaviorContain] : {}]} behavior={keyboardAvoidingViewBehavior} enabled={shouldEnableKeyboardAvoidingView} 
    // Whether the mobile offline indicator or the content in general
    // should be offset by the bottom safe area padding when the keyboard is open.
    shouldOffsetBottomSafeAreaPadding={shouldKeyboardOffsetBottomSafeAreaPadding} keyboardVerticalOffset={keyboardVerticalOffset}>
                    <react_native_picker_select_1.PickerAvoidingView style={isAvoidingViewportScroll ? [styles.h100, { marginTop: 1 }] : styles.flex1} enabled={shouldEnablePickerAvoiding}>
                        {children}
                    </react_native_picker_select_1.PickerAvoidingView>
                </KeyboardAvoidingView_1.default>
            </react_native_1.View>
            {showBottomContent && <react_native_1.View style={bottomContentStyle}>{bottomContent}</react_native_1.View>}
        </react_native_1.View>);
}
ScreenWrapperContainer.displayName = 'ScreenWrapperContainer';
exports.default = react_1.default.memo((0, react_1.forwardRef)(ScreenWrapperContainer));
