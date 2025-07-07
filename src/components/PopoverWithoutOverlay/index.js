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
var ColorSchemeWrapper_1 = require("@components/ColorSchemeWrapper");
var PopoverProvider_1 = require("@components/PopoverProvider");
var useSafeAreaInsets_1 = require("@hooks/useSafeAreaInsets");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var Modal_1 = require("@libs/actions/Modal");
var variables_1 = require("@styles/variables");
var viewRef_1 = require("@src/types/utils/viewRef");
var NOOP = function () { };
function PopoverWithoutOverlay(_a, ref) {
    var _b = _a.anchorPosition, anchorPosition = _b === void 0 ? {} : _b, anchorRef = _a.anchorRef, withoutOverlayRef = _a.withoutOverlayRef, _c = _a.innerContainerStyle, innerContainerStyle = _c === void 0 ? {} : _c, outerStyle = _a.outerStyle, _d = _a.onModalShow, onModalShow = _d === void 0 ? function () { } : _d, isVisible = _a.isVisible, onClose = _a.onClose, _e = _a.onModalHide, onModalHide = _e === void 0 ? function () { } : _e, children = _a.children;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _f = (0, react_1.useContext)(PopoverProvider_1.PopoverContext), onOpen = _f.onOpen, close = _f.close;
    var _g = (0, useWindowDimensions_1.default)(), windowWidth = _g.windowWidth, windowHeight = _g.windowHeight;
    var insets = (0, useSafeAreaInsets_1.default)();
    var _h = StyleUtils.getModalStyles('popover', {
        windowWidth: windowWidth,
        windowHeight: windowHeight,
        isSmallScreenWidth: false,
    }, anchorPosition, innerContainerStyle, outerStyle), modalStyle = _h.modalStyle, modalContainerStyle = _h.modalContainerStyle, shouldAddTopSafeAreaMargin = _h.shouldAddTopSafeAreaMargin, shouldAddBottomSafeAreaMargin = _h.shouldAddBottomSafeAreaMargin, shouldAddTopSafeAreaPadding = _h.shouldAddTopSafeAreaPadding, shouldAddBottomSafeAreaPadding = _h.shouldAddBottomSafeAreaPadding;
    (0, react_1.useEffect)(function () {
        var removeOnClose;
        if (isVisible) {
            onModalShow();
            onOpen === null || onOpen === void 0 ? void 0 : onOpen({
                ref: withoutOverlayRef,
                close: onClose !== null && onClose !== void 0 ? onClose : NOOP,
                anchorRef: anchorRef,
            });
            removeOnClose = (0, Modal_1.setCloseModal)(onClose !== null && onClose !== void 0 ? onClose : NOOP);
        }
        else {
            onModalHide();
            close(anchorRef);
            (0, Modal_1.onModalDidClose)();
        }
        (0, Modal_1.willAlertModalBecomeVisible)(isVisible, true);
        return function () {
            if (!removeOnClose) {
                return;
            }
            removeOnClose();
        };
        // We want this effect to run strictly ONLY when isVisible prop changes
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isVisible]);
    var modalPaddingStyles = (0, react_1.useMemo)(function () {
        return StyleUtils.getModalPaddingStyles({
            shouldAddBottomSafeAreaMargin: shouldAddBottomSafeAreaMargin,
            shouldAddTopSafeAreaMargin: shouldAddTopSafeAreaMargin,
            shouldAddBottomSafeAreaPadding: shouldAddBottomSafeAreaPadding,
            shouldAddTopSafeAreaPadding: shouldAddTopSafeAreaPadding,
            modalContainerStyle: modalContainerStyle,
            insets: insets,
        });
    }, [StyleUtils, insets, modalContainerStyle, shouldAddBottomSafeAreaMargin, shouldAddBottomSafeAreaPadding, shouldAddTopSafeAreaMargin, shouldAddTopSafeAreaPadding]);
    if (!isVisible) {
        return null;
    }
    return (<react_native_1.View style={[modalStyle, { zIndex: variables_1.default.popoverZIndex }]} ref={(0, viewRef_1.default)(withoutOverlayRef)} 
    // Prevent the parent element to capture a click. This is useful when the modal component is put inside a pressable.
    onClick={function (e) { return e.stopPropagation(); }} dataSet={{ dragArea: false }}>
            <react_native_1.View style={__assign(__assign(__assign({}, styles.defaultModalContainer), modalContainerStyle), modalPaddingStyles)} ref={ref}>
                <ColorSchemeWrapper_1.default>{children}</ColorSchemeWrapper_1.default>
            </react_native_1.View>
        </react_native_1.View>);
}
PopoverWithoutOverlay.displayName = 'PopoverWithoutOverlay';
exports.default = (0, react_1.forwardRef)(PopoverWithoutOverlay);
