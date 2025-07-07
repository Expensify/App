"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
// eslint-disable-next-line no-restricted-imports
var react_native_1 = require("react-native");
// @ts-expect-error This is a workaround to display HelpPane on top of everything,
// Modal from react-native can't be used here, as it would block interactions with the rest of the app
var ModalPortal_1 = require("react-native-web/dist/exports/Modal/ModalPortal");
var FocusTrapForModal_1 = require("@components/FocusTrap/FocusTrapForModal");
var HelpContent_1 = require("@components/SidePanel/HelpComponents/HelpContent");
var HelpOverlay_1 = require("@components/SidePanel/HelpComponents/HelpOverlay");
var useKeyboardShortcut_1 = require("@hooks/useKeyboardShortcut");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSafeAreaPaddings_1 = require("@hooks/useSafeAreaPaddings");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ComposerFocusManager_1 = require("@libs/ComposerFocusManager");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function Help(_a) {
    var sidePanelTranslateX = _a.sidePanelTranslateX, closeSidePanel = _a.closeSidePanel, shouldHideSidePanelBackdrop = _a.shouldHideSidePanelBackdrop;
    var styles = (0, useThemeStyles_1.default)();
    var _b = (0, useResponsiveLayout_1.default)(), isExtraLargeScreenWidth = _b.isExtraLargeScreenWidth, shouldUseNarrowLayout = _b.shouldUseNarrowLayout;
    var _c = (0, useSafeAreaPaddings_1.default)(), paddingTop = _c.paddingTop, paddingBottom = _c.paddingBottom;
    var _d = (0, useOnyx_1.default)(ONYXKEYS_1.default.MODAL, { selector: function (modal) { return (modal === null || modal === void 0 ? void 0 : modal.type) === CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED; }, canBeMissing: true })[0], isRHPVisible = _d === void 0 ? false : _d;
    var uniqueModalId = (0, react_1.useMemo)(function () { return ComposerFocusManager_1.default.getId(); }, []);
    var onCloseSidePanelOnSmallScreens = function () {
        if (isExtraLargeScreenWidth) {
            return;
        }
        closeSidePanel();
    };
    // Close Side Panel on escape key press
    (0, useKeyboardShortcut_1.default)(CONST_1.default.KEYBOARD_SHORTCUTS.ESCAPE, function () { return closeSidePanel(); }, { isActive: !isExtraLargeScreenWidth, shouldBubble: false });
    // Close Side Panel on small screens when navigation keyboard shortcuts are used
    (0, useKeyboardShortcut_1.default)(CONST_1.default.KEYBOARD_SHORTCUTS.SEARCH, onCloseSidePanelOnSmallScreens, { shouldBubble: true });
    (0, useKeyboardShortcut_1.default)(CONST_1.default.KEYBOARD_SHORTCUTS.NEW_CHAT, onCloseSidePanelOnSmallScreens, { shouldBubble: true });
    (0, useKeyboardShortcut_1.default)(CONST_1.default.KEYBOARD_SHORTCUTS.SHORTCUTS, onCloseSidePanelOnSmallScreens, { shouldBubble: true });
    // Web back button: push history state and close Side Panel on popstate
    (0, react_1.useEffect)(function () {
        ComposerFocusManager_1.default.resetReadyToFocus(uniqueModalId);
        window.history.pushState({ isSidePanelOpen: true }, '', null);
        var handlePopState = function () {
            if (isExtraLargeScreenWidth) {
                return;
            }
            closeSidePanel();
        };
        window.addEventListener('popstate', handlePopState);
        return function () {
            window.removeEventListener('popstate', handlePopState);
            ComposerFocusManager_1.default.setReadyToFocus(uniqueModalId);
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    return (<ModalPortal_1.default>
            <FocusTrapForModal_1.default active={!isExtraLargeScreenWidth}>
                <react_native_1.View style={styles.sidePanelContainer}>
                    <react_native_1.View>
                        {!shouldHideSidePanelBackdrop && (<HelpOverlay_1.default onBackdropPress={closeSidePanel} isRHPVisible={isRHPVisible}/>)}
                    </react_native_1.View>
                    <react_native_1.Animated.View style={[styles.sidePanelContent(shouldUseNarrowLayout, isExtraLargeScreenWidth), { transform: [{ translateX: sidePanelTranslateX.current }], paddingTop: paddingTop, paddingBottom: paddingBottom }]}>
                        <HelpContent_1.default closeSidePanel={closeSidePanel}/>
                    </react_native_1.Animated.View>
                </react_native_1.View>
            </FocusTrapForModal_1.default>
        </ModalPortal_1.default>);
}
Help.displayName = 'Help';
exports.default = Help;
