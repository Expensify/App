"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useResponsiveLayout;
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var ModalContext_1 = require("@components/Modal/ModalContext");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
/**
 * Hook to determine if we are on mobile devices or in the Modal Navigator. It also provides booleans for our breakpoints
 * Use "shouldUseNarrowLayout" for "on mobile or in RHP", "isSmallScreenWidth" for "on mobile", "isInNarrowPaneModal" for "in RHP".
 *
 * There are two kinds of modals in this app:
 *     1. Modal stack navigators from react-navigation
 *     2. Modal components that use react-native-modal
 *
 * This hook is designed to handle both. `shouldUseNarrowLayout` will return `true` if any of the following are true:
 *     1. The device screen width is narrow
 *     2. The consuming component is the child of a "right docked" react-native-modal component
 *     3. The consuming component is a screen in a modal stack navigator and not a child of a "non-right-docked" react-native-modal component.
 *
 * For more details on the various modal types we've defined for this app and implemented using react-native-modal, see `ModalType`.
 */
function useResponsiveLayout() {
    var _a = (0, useWindowDimensions_1.default)(), windowWidth = _a.windowWidth, windowHeight = _a.windowHeight;
    // When the soft keyboard opens on mWeb, the window height changes. Use static screen height instead to get real screenHeight.
    var screenHeight = react_native_1.Dimensions.get('screen').height;
    var isExtraSmallScreenHeight = screenHeight <= variables_1.default.extraSmallMobileResponsiveHeightBreakpoint;
    var isSmallScreenWidth = windowWidth <= variables_1.default.mobileResponsiveWidthBreakpoint;
    var isMediumScreenWidth = windowWidth > variables_1.default.mobileResponsiveWidthBreakpoint && windowWidth <= variables_1.default.tabletResponsiveWidthBreakpoint;
    var onboardingIsMediumOrLargerScreenWidth = windowWidth > variables_1.default.mobileResponsiveWidthBreakpoint;
    var isLargeScreenWidth = windowWidth > variables_1.default.tabletResponsiveWidthBreakpoint;
    var isExtraLargeScreenWidth = windowWidth > variables_1.default.sidePanelResponsiveWidthBreakpoint;
    var isExtraSmallScreenWidth = windowWidth <= variables_1.default.extraSmallMobileResponsiveWidthBreakpoint;
    var lowerScreenDimension = Math.min(windowWidth, windowHeight);
    var isSmallScreen = lowerScreenDimension <= variables_1.default.mobileResponsiveWidthBreakpoint;
    // Note: activeModalType refers to our react-native-modal component wrapper, not react-navigation's modal stack navigators.
    // This means it will only be defined if the component calling this hook is a child of a modal component. See BaseModal for the provider.
    var activeModalType = (0, react_1.useContext)(ModalContext_1.default).activeModalType;
    // We are using these contexts directly instead of useNavigation/useNavigationState, because those will throw an error if used outside a navigator.
    // This hook can be used within or outside a navigator, so using useNavigationState does not work.
    // Furthermore, wrapping useNavigationState in a try/catch does not work either, because that breaks the rules of hooks.
    // Note that these three lines are copied closely from the internal implementation of useNavigation: https://github.com/react-navigation/react-navigation/blob/52a3234b7aaf4d4fcc9c0155f44f3ea2233f0f40/packages/core/src/useNavigation.tsx#L18-L28
    var navigationContainerRef = (0, react_1.useContext)(native_1.NavigationContainerRefContext);
    var navigator = (0, react_1.useContext)(native_1.NavigationContext);
    var currentNavigator = navigator !== null && navigator !== void 0 ? navigator : navigationContainerRef;
    var isDisplayedInNarrowModalNavigator = (0, react_1.useMemo)(function () { var _a; return !!((_a = currentNavigator === null || currentNavigator === void 0 ? void 0 : currentNavigator.getParent) === null || _a === void 0 ? void 0 : _a.call(currentNavigator, NAVIGATORS_1.default.RIGHT_MODAL_NAVIGATOR)); }, [currentNavigator]);
    // The component calling this hook is in a "narrow pane modal" if:
    var isInNarrowPaneModal = 
    // it's a child of the right-docked modal
    activeModalType === CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED ||
        // or there's a "right modal navigator" or "left modal navigator" on the top of the root navigation stack
        // and the component calling this hook is not the child of another modal type, such as a confirm modal
        (isDisplayedInNarrowModalNavigator && !activeModalType);
    var shouldUseNarrowLayout = isSmallScreenWidth || isInNarrowPaneModal;
    return {
        shouldUseNarrowLayout: shouldUseNarrowLayout,
        isSmallScreenWidth: isSmallScreenWidth,
        isInNarrowPaneModal: isInNarrowPaneModal,
        isExtraSmallScreenHeight: isExtraSmallScreenHeight,
        isExtraSmallScreenWidth: isExtraSmallScreenWidth,
        isMediumScreenWidth: isMediumScreenWidth,
        onboardingIsMediumOrLargerScreenWidth: onboardingIsMediumOrLargerScreenWidth,
        isLargeScreenWidth: isLargeScreenWidth,
        isExtraLargeScreenWidth: isExtraLargeScreenWidth,
        isSmallScreen: isSmallScreen,
    };
}
