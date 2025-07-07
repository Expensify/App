"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardStateContext = void 0;
exports.KeyboardStateProvider = KeyboardStateProvider;
var react_1 = require("react");
var react_native_keyboard_controller_1 = require("react-native-keyboard-controller");
var react_native_reanimated_1 = require("react-native-reanimated");
var useSafeAreaInsets_1 = require("@hooks/useSafeAreaInsets");
var getKeyboardHeight_1 = require("@libs/getKeyboardHeight");
var KeyboardStateContext = (0, react_1.createContext)({
    isKeyboardShown: false,
    isKeyboardActive: false,
    keyboardHeight: 0,
    isKeyboardAnimatingRef: { current: false },
});
exports.KeyboardStateContext = KeyboardStateContext;
function KeyboardStateProvider(_a) {
    var children = _a.children;
    var bottom = (0, useSafeAreaInsets_1.default)().bottom;
    var _b = (0, react_1.useState)(0), keyboardHeight = _b[0], setKeyboardHeight = _b[1];
    var isKeyboardAnimatingRef = (0, react_1.useRef)(false);
    var _c = (0, react_1.useState)(false), isKeyboardActive = _c[0], setIsKeyboardActive = _c[1];
    (0, react_1.useEffect)(function () {
        var keyboardDidShowListener = react_native_keyboard_controller_1.KeyboardEvents.addListener('keyboardDidShow', function (e) {
            setKeyboardHeight((0, getKeyboardHeight_1.default)(e.height, bottom));
            setIsKeyboardActive(true);
        });
        var keyboardDidHideListener = react_native_keyboard_controller_1.KeyboardEvents.addListener('keyboardDidHide', function () {
            setKeyboardHeight(0);
            setIsKeyboardActive(false);
        });
        var keyboardWillShowListener = react_native_keyboard_controller_1.KeyboardEvents.addListener('keyboardWillShow', function () {
            setIsKeyboardActive(true);
        });
        var keyboardWillHideListener = react_native_keyboard_controller_1.KeyboardEvents.addListener('keyboardWillHide', function () {
            setIsKeyboardActive(false);
        });
        return function () {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
            keyboardWillShowListener.remove();
            keyboardWillHideListener.remove();
        };
    }, [bottom]);
    var setIsKeyboardAnimating = (0, react_1.useCallback)(function (isAnimating) {
        isKeyboardAnimatingRef.current = isAnimating;
    }, []);
    (0, react_native_keyboard_controller_1.useKeyboardHandler)({
        onStart: function () {
            'worklet';
            (0, react_native_reanimated_1.runOnJS)(setIsKeyboardAnimating)(true);
        },
        onEnd: function () {
            'worklet';
            (0, react_native_reanimated_1.runOnJS)(setIsKeyboardAnimating)(false);
        },
    }, []);
    var contextValue = (0, react_1.useMemo)(function () { return ({
        keyboardHeight: keyboardHeight,
        isKeyboardShown: keyboardHeight !== 0,
        isKeyboardAnimatingRef: isKeyboardAnimatingRef,
        isKeyboardActive: isKeyboardActive,
    }); }, [isKeyboardActive, keyboardHeight]);
    return <KeyboardStateContext.Provider value={contextValue}>{children}</KeyboardStateContext.Provider>;
}
