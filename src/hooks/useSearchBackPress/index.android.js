"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var useOnyx_1 = require("@hooks/useOnyx");
var MobileSelectionMode_1 = require("@libs/actions/MobileSelectionMode");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useSearchBackPress = function (_a) {
    var onClearSelection = _a.onClearSelection, onNavigationCallBack = _a.onNavigationCallBack;
    var selectionMode = (0, useOnyx_1.default)(ONYXKEYS_1.default.MOBILE_SELECTION_MODE)[0];
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        var onBackPress = function () {
            if (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) {
                onClearSelection();
                (0, MobileSelectionMode_1.turnOffMobileSelectionMode)();
                return true;
            }
            onNavigationCallBack();
            return true;
        };
        var backHandler = react_native_1.BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return function () { return backHandler.remove(); };
    }, [selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled, onClearSelection, onNavigationCallBack]));
};
exports.default = useSearchBackPress;
