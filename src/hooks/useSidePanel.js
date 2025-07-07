"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSidePanelDisplayStatus = useSidePanelDisplayStatus;
var react_1 = require("react");
// Import Animated directly from 'react-native' as animations are used with navigation.
// eslint-disable-next-line no-restricted-imports
var react_native_1 = require("react-native");
var SidePanel_1 = require("@libs/actions/SidePanel");
var focusComposerWithDelay_1 = require("@libs/focusComposerWithDelay");
var ReportActionComposeFocusManager_1 = require("@libs/ReportActionComposeFocusManager");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var keyboard_1 = require("@src/utils/keyboard");
var useLocalize_1 = require("./useLocalize");
var useOnyx_1 = require("./useOnyx");
var useResponsiveLayout_1 = require("./useResponsiveLayout");
var useWindowDimensions_1 = require("./useWindowDimensions");
/**
 * Hook to get the display status of the Side Panel
 */
function useSidePanelDisplayStatus() {
    var _a = (0, useResponsiveLayout_1.default)(), isExtraLargeScreenWidth = _a.isExtraLargeScreenWidth, shouldUseNarrowLayout = _a.shouldUseNarrowLayout;
    var preferredLocale = (0, useLocalize_1.default)().preferredLocale;
    var sidePanelNVP = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_SIDE_PANEL, { canBeMissing: true })[0];
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.MODAL, {
        canBeMissing: true,
        selector: function (modal) {
            return (modal === null || modal === void 0 ? void 0 : modal.type) === CONST_1.default.MODAL.MODAL_TYPE.CENTERED_SWIPEABLE_TO_RIGHT ||
                (modal === null || modal === void 0 ? void 0 : modal.type) === CONST_1.default.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE ||
                (modal === null || modal === void 0 ? void 0 : modal.type) === CONST_1.default.MODAL.MODAL_TYPE.CENTERED_SMALL ||
                (modal === null || modal === void 0 ? void 0 : modal.type) === CONST_1.default.MODAL.MODAL_TYPE.CENTERED;
        },
    })[0], isModalCenteredVisible = _b === void 0 ? false : _b;
    var isLanguageUnsupported = preferredLocale !== CONST_1.default.LOCALES.EN;
    var isSidePanelVisible = isExtraLargeScreenWidth ? sidePanelNVP === null || sidePanelNVP === void 0 ? void 0 : sidePanelNVP.open : sidePanelNVP === null || sidePanelNVP === void 0 ? void 0 : sidePanelNVP.openNarrowScreen;
    // The Side Panel is hidden when:
    // - NVP is not set or it is false
    // - language is unsupported
    // - modal centered is visible
    var shouldHideSidePanel = !isSidePanelVisible || isLanguageUnsupported || isModalCenteredVisible || !sidePanelNVP;
    var isSidePanelHiddenOrLargeScreen = !isSidePanelVisible || isLanguageUnsupported || isExtraLargeScreenWidth || !sidePanelNVP;
    // The help button is hidden when:
    // - side pane nvp is not set
    // - Side Panel is displayed currently
    // - language is unsupported
    var shouldHideHelpButton = !sidePanelNVP || !shouldHideSidePanel || isLanguageUnsupported;
    var shouldHideSidePanelBackdrop = shouldHideSidePanel || isExtraLargeScreenWidth || shouldUseNarrowLayout;
    return {
        shouldHideSidePanel: shouldHideSidePanel,
        isSidePanelHiddenOrLargeScreen: isSidePanelHiddenOrLargeScreen,
        shouldHideHelpButton: shouldHideHelpButton,
        shouldHideSidePanelBackdrop: shouldHideSidePanelBackdrop,
        sidePanelNVP: sidePanelNVP,
    };
}
/**
 * Hook to get the animated position of the Side Panel and the margin of the navigator
 */
function useSidePanel() {
    var _a = (0, useResponsiveLayout_1.default)(), isExtraLargeScreenWidth = _a.isExtraLargeScreenWidth, shouldUseNarrowLayout = _a.shouldUseNarrowLayout;
    var windowWidth = (0, useWindowDimensions_1.default)().windowWidth;
    var sidePanelWidth = shouldUseNarrowLayout ? windowWidth : variables_1.default.sideBarWidth;
    var _b = (0, react_1.useState)(true), isSidePanelTransitionEnded = _b[0], setIsSidePanelTransitionEnded = _b[1];
    var _c = useSidePanelDisplayStatus(), shouldHideSidePanel = _c.shouldHideSidePanel, shouldHideSidePanelBackdrop = _c.shouldHideSidePanelBackdrop, shouldHideHelpButton = _c.shouldHideHelpButton, sidePanelNVP = _c.sidePanelNVP;
    var shouldHideToolTip = isExtraLargeScreenWidth ? !isSidePanelTransitionEnded : !shouldHideSidePanel;
    var shouldApplySidePanelOffset = isExtraLargeScreenWidth && !shouldHideSidePanel;
    var sidePanelOffset = (0, react_1.useRef)(new react_native_1.Animated.Value(shouldApplySidePanelOffset ? variables_1.default.sideBarWidth : 0));
    var sidePanelTranslateX = (0, react_1.useRef)(new react_native_1.Animated.Value(shouldHideSidePanel ? sidePanelWidth : 0));
    (0, react_1.useEffect)(function () {
        setIsSidePanelTransitionEnded(false);
        react_native_1.Animated.parallel([
            react_native_1.Animated.timing(sidePanelOffset.current, {
                toValue: shouldApplySidePanelOffset ? variables_1.default.sideBarWidth : 0,
                duration: CONST_1.default.ANIMATED_TRANSITION,
                useNativeDriver: true,
            }),
            react_native_1.Animated.timing(sidePanelTranslateX.current, {
                toValue: shouldHideSidePanel ? sidePanelWidth : 0,
                duration: CONST_1.default.ANIMATED_TRANSITION,
                useNativeDriver: true,
            }),
        ]).start(function () { return setIsSidePanelTransitionEnded(true); });
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- sidePanelWidth dependency caused the help panel content to slide in on window resize
    }, [shouldHideSidePanel, shouldApplySidePanelOffset]);
    var openSidePanel = (0, react_1.useCallback)(function () {
        setIsSidePanelTransitionEnded(false);
        keyboard_1.default.dismiss();
        SidePanel_1.default.openSidePanel(!isExtraLargeScreenWidth);
    }, [isExtraLargeScreenWidth]);
    var closeSidePanel = (0, react_1.useCallback)(function (shouldUpdateNarrow) {
        if (shouldUpdateNarrow === void 0) { shouldUpdateNarrow = false; }
        setIsSidePanelTransitionEnded(false);
        SidePanel_1.default.closeSidePanel(!isExtraLargeScreenWidth || shouldUpdateNarrow);
        // Focus the composer after closing the Side Panel
        (0, focusComposerWithDelay_1.default)(ReportActionComposeFocusManager_1.default.composerRef.current, CONST_1.default.ANIMATED_TRANSITION + CONST_1.default.COMPOSER_FOCUS_DELAY)(true);
    }, [isExtraLargeScreenWidth]);
    return {
        sidePanelNVP: sidePanelNVP,
        isSidePanelTransitionEnded: isSidePanelTransitionEnded,
        shouldHideSidePanel: shouldHideSidePanel,
        shouldHideSidePanelBackdrop: shouldHideSidePanelBackdrop,
        shouldHideHelpButton: shouldHideHelpButton,
        shouldHideToolTip: shouldHideToolTip,
        sidePanelOffset: sidePanelOffset,
        sidePanelTranslateX: sidePanelTranslateX,
        openSidePanel: openSidePanel,
        closeSidePanel: closeSidePanel,
    };
}
exports.default = useSidePanel;
