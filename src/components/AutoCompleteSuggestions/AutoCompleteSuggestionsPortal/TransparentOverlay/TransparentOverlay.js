"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function TransparentOverlay(_a) {
    var onPressProp = _a.onPress;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var onPress = (0, react_1.useCallback)(function (event) {
        event === null || event === void 0 ? void 0 : event.preventDefault();
        onPressProp();
    }, [onPressProp]);
    var handlePointerDown = (0, react_1.useCallback)(function (e) {
        e === null || e === void 0 ? void 0 : e.preventDefault();
    }, []);
    // The overlay is a semi-transparent layer that covers the entire screen and is used to close a modal when clicked.
    // The touch event passes through the transparent overlay to the elements underneath, so we need to prevent that by adding a nearly invisible background color to the overlay.
    var overlay = (0, react_1.useMemo)(function () { return ({
        backgroundColor: 'rgba(0, 0, 0, 0.005)',
    }); }, []);
    return (<react_native_1.View onPointerDown={handlePointerDown} style={styles.fullScreen}>
            <PressableWithoutFeedback_1.default onPress={onPress} style={[styles.flex1, styles.cursorDefault, overlay]} accessibilityLabel={translate('common.close')} role={CONST_1.default.ROLE.BUTTON}/>
        </react_native_1.View>);
}
exports.default = TransparentOverlay;
