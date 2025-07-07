"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useAutoFocusInput;
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var ComposerFocusManager_1 = require("@libs/ComposerFocusManager");
var InputUtils_1 = require("@libs/InputUtils");
var isWindowReadyToFocus_1 = require("@libs/isWindowReadyToFocus");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SplashScreenStateContext_1 = require("@src/SplashScreenStateContext");
var useOnyx_1 = require("./useOnyx");
var usePrevious_1 = require("./usePrevious");
var useSidePanel_1 = require("./useSidePanel");
function useAutoFocusInput(isMultiline) {
    if (isMultiline === void 0) { isMultiline = false; }
    var _a = (0, react_1.useState)(false), isInputInitialized = _a[0], setIsInputInitialized = _a[1];
    var _b = (0, react_1.useState)(false), isScreenTransitionEnded = _b[0], setIsScreenTransitionEnded = _b[1];
    var modal = (0, useOnyx_1.default)(ONYXKEYS_1.default.MODAL, { canBeMissing: true })[0];
    var isPopoverVisible = (modal === null || modal === void 0 ? void 0 : modal.willAlertModalBecomeVisible) && (modal === null || modal === void 0 ? void 0 : modal.isPopover);
    var splashScreenState = (0, SplashScreenStateContext_1.useSplashScreenStateContext)().splashScreenState;
    var inputRef = (0, react_1.useRef)(null);
    var focusTimeoutRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        if (!isScreenTransitionEnded || !isInputInitialized || !inputRef.current || splashScreenState !== CONST_1.default.BOOT_SPLASH_STATE.HIDDEN || isPopoverVisible) {
            return;
        }
        var focusTaskHandle = react_native_1.InteractionManager.runAfterInteractions(function () {
            if (inputRef.current && isMultiline) {
                (0, InputUtils_1.moveSelectionToEnd)(inputRef.current);
            }
            (0, isWindowReadyToFocus_1.default)().then(function () { var _a; return (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus(); });
            setIsScreenTransitionEnded(false);
        });
        return function () {
            focusTaskHandle.cancel();
        };
    }, [isMultiline, isScreenTransitionEnded, isInputInitialized, splashScreenState, isPopoverVisible]);
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        focusTimeoutRef.current = setTimeout(function () {
            setIsScreenTransitionEnded(true);
        }, CONST_1.default.ANIMATED_TRANSITION);
        return function () {
            setIsScreenTransitionEnded(false);
            if (!focusTimeoutRef.current) {
                return;
            }
            clearTimeout(focusTimeoutRef.current);
        };
    }, []));
    // Trigger focus when Side Panel transition ends
    var _c = (0, useSidePanel_1.default)(), isSidePanelTransitionEnded = _c.isSidePanelTransitionEnded, shouldHideSidePanel = _c.shouldHideSidePanel;
    var prevShouldHideSidePanel = (0, usePrevious_1.default)(shouldHideSidePanel);
    (0, react_1.useEffect)(function () {
        if (!shouldHideSidePanel || prevShouldHideSidePanel) {
            return;
        }
        ComposerFocusManager_1.default.isReadyToFocus().then(function () { return setIsScreenTransitionEnded(isSidePanelTransitionEnded); });
    }, [isSidePanelTransitionEnded, shouldHideSidePanel, prevShouldHideSidePanel]);
    var inputCallbackRef = function (ref) {
        inputRef.current = ref;
        if (isInputInitialized) {
            return;
        }
        if (ref && isMultiline) {
            (0, InputUtils_1.scrollToBottom)(ref);
        }
        setIsInputInitialized(true);
    };
    return { inputCallbackRef: inputCallbackRef, inputRef: inputRef };
}
