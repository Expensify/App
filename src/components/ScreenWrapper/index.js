"use strict";
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
var react_native_hybrid_app_1 = require("@expensify/react-native-hybrid-app");
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var CustomDevMenu_1 = require("@components/CustomDevMenu");
var CustomStatusBarAndBackgroundContext_1 = require("@components/CustomStatusBarAndBackground/CustomStatusBarAndBackgroundContext");
var FocusTrapForScreen_1 = require("@components/FocusTrap/FocusTrapForScreen");
var HeaderGap_1 = require("@components/HeaderGap");
var InitialURLContextProvider_1 = require("@components/InitialURLContextProvider");
var withNavigationFallback_1 = require("@components/withNavigationFallback");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSafeAreaPaddings_1 = require("@hooks/useSafeAreaPaddings");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var NarrowPaneContext_1 = require("@libs/Navigation/AppNavigator/Navigators/NarrowPaneContext");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ScreenWrapperContainer_1 = require("./ScreenWrapperContainer");
var ScreenWrapperOfflineIndicatorContext_1 = require("./ScreenWrapperOfflineIndicatorContext");
var ScreenWrapperOfflineIndicators_1 = require("./ScreenWrapperOfflineIndicators");
var ScreenWrapperStatusContext_1 = require("./ScreenWrapperStatusContext");
function ScreenWrapper(_a, ref) {
    var _b, _c;
    var navigationProp = _a.navigation, children = _a.children, style = _a.style, bottomContent = _a.bottomContent, headerGapStyles = _a.headerGapStyles, offlineIndicatorStyle = _a.offlineIndicatorStyle, disableOfflineIndicatorSafeAreaPadding = _a.disableOfflineIndicatorSafeAreaPadding, shouldShowSmallScreenOfflineIndicator = _a.shouldShowOfflineIndicator, shouldShowWideScreenOfflineIndicator = _a.shouldShowOfflineIndicatorInWideScreen, shouldSmallScreenOfflineIndicatorStickToBottomProp = _a.shouldMobileOfflineIndicatorStickToBottom, shouldDismissKeyboardBeforeClose = _a.shouldDismissKeyboardBeforeClose, onEntryTransitionEnd = _a.onEntryTransitionEnd, _d = _a.includePaddingTop, includePaddingTop = _d === void 0 ? true : _d, _e = _a.includeSafeAreaPaddingBottom, includeSafeAreaPaddingBottomProp = _e === void 0 ? true : _e, enableEdgeToEdgeBottomSafeAreaPaddingProp = _a.enableEdgeToEdgeBottomSafeAreaPadding, shouldKeyboardOffsetBottomSafeAreaPaddingProp = _a.shouldKeyboardOffsetBottomSafeAreaPadding, isOfflineIndicatorTranslucent = _a.isOfflineIndicatorTranslucent, focusTrapSettings = _a.focusTrapSettings, restContainerProps = __rest(_a, ["navigation", "children", "style", "bottomContent", "headerGapStyles", "offlineIndicatorStyle", "disableOfflineIndicatorSafeAreaPadding", "shouldShowOfflineIndicator", "shouldShowOfflineIndicatorInWideScreen", "shouldMobileOfflineIndicatorStickToBottom", "shouldDismissKeyboardBeforeClose", "onEntryTransitionEnd", "includePaddingTop", "includeSafeAreaPaddingBottom", "enableEdgeToEdgeBottomSafeAreaPadding", "shouldKeyboardOffsetBottomSafeAreaPadding", "isOfflineIndicatorTranslucent", "focusTrapSettings"]);
    /**
     * We are only passing navigation as prop from
     * ReportScreen -> ScreenWrapper
     *
     * so in other places where ScreenWrapper is used, we need to
     * fallback to useNavigation.
     */
    var navigationFallback = (0, native_1.useNavigation)();
    var navigation = navigationProp !== null && navigationProp !== void 0 ? navigationProp : navigationFallback;
    var isFocused = (0, native_1.useIsFocused)();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout for a case where we want to show the offline indicator only on small screens
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _f = (0, useResponsiveLayout_1.default)(), isSmallScreenWidth = _f.isSmallScreenWidth, shouldUseNarrowLayout = _f.shouldUseNarrowLayout;
    var styles = (0, useThemeStyles_1.default)();
    var isDevelopment = (0, useEnvironment_1.default)().isDevelopment;
    var _g = (0, react_1.useState)(false), didScreenTransitionEnd = _g[0], setDidScreenTransitionEnd = _g[1];
    // When the `enableEdgeToEdgeBottomSafeAreaPadding` prop is explicitly set, we enable edge-to-edge mode.
    var isUsingEdgeToEdgeMode = enableEdgeToEdgeBottomSafeAreaPaddingProp !== undefined;
    var enableEdgeToEdgeBottomSafeAreaPadding = enableEdgeToEdgeBottomSafeAreaPaddingProp !== null && enableEdgeToEdgeBottomSafeAreaPaddingProp !== void 0 ? enableEdgeToEdgeBottomSafeAreaPaddingProp : false;
    var _h = (0, useSafeAreaPaddings_1.default)(isUsingEdgeToEdgeMode), insets = _h.insets, safeAreaPaddingBottomStyle = _h.safeAreaPaddingBottomStyle;
    // We enable all of these flags by default, if we are using edge-to-edge mode.
    var shouldSmallScreenOfflineIndicatorStickToBottom = shouldSmallScreenOfflineIndicatorStickToBottomProp !== null && shouldSmallScreenOfflineIndicatorStickToBottomProp !== void 0 ? shouldSmallScreenOfflineIndicatorStickToBottomProp : isUsingEdgeToEdgeMode;
    var shouldKeyboardOffsetBottomSafeAreaPadding = shouldKeyboardOffsetBottomSafeAreaPaddingProp !== null && shouldKeyboardOffsetBottomSafeAreaPaddingProp !== void 0 ? shouldKeyboardOffsetBottomSafeAreaPaddingProp : isUsingEdgeToEdgeMode;
    // We disable legacy bottom safe area padding handling, if we are using edge-to-edge mode.
    var includeSafeAreaPaddingBottom = isUsingEdgeToEdgeMode ? false : includeSafeAreaPaddingBottomProp;
    var isSafeAreaTopPaddingApplied = includePaddingTop;
    var statusContextValue = (0, react_1.useMemo)(function () { return ({ didScreenTransitionEnd: didScreenTransitionEnd, isSafeAreaTopPaddingApplied: isSafeAreaTopPaddingApplied, isSafeAreaBottomPaddingApplied: includeSafeAreaPaddingBottom }); }, [didScreenTransitionEnd, includeSafeAreaPaddingBottom, isSafeAreaTopPaddingApplied]);
    // This context allows us to disable the safe area padding offsetting the offline indicator in scrollable components like 'ScrollView', 'SelectionList' or 'FormProvider'.
    // This is useful e.g. for the RightModalNavigator, where we want to avoid the safe area padding offsetting the offline indicator because we only show the offline indicator on small screens.
    var isInNarrowPane = (0, react_1.useContext)(NarrowPaneContext_1.default).isInNarrowPane;
    var _j = (0, react_1.useContext)(ScreenWrapperOfflineIndicatorContext_1.default), addSafeAreaPadding = _j.addSafeAreaPadding, showOnSmallScreens = _j.showOnSmallScreens, showOnWideScreens = _j.showOnWideScreens, originalValues = _j.originalValues;
    var offlineIndicatorContextValue = (0, react_1.useMemo)(function () {
        var newAddSafeAreaPadding = isInNarrowPane ? isSmallScreenWidth : addSafeAreaPadding;
        var newOriginalValues = originalValues !== null && originalValues !== void 0 ? originalValues : {
            addSafeAreaPadding: newAddSafeAreaPadding,
            showOnSmallScreens: showOnSmallScreens,
            showOnWideScreens: showOnWideScreens,
        };
        return {
            // Allows for individual screens to disable the offline indicator safe area padding for the screen and all nested ScreenWrapper components.
            addSafeAreaPadding: disableOfflineIndicatorSafeAreaPadding === undefined ? (newAddSafeAreaPadding !== null && newAddSafeAreaPadding !== void 0 ? newAddSafeAreaPadding : true) : !disableOfflineIndicatorSafeAreaPadding,
            // Prevent any nested ScreenWrapper components from rendering another offline indicator.
            showOnSmallScreens: false,
            showOnWideScreens: false,
            // Pass down the original values by the outermost ScreenWrapperOfflineIndicatorContext.Provider,
            // to allow nested ScreenWrapperOfflineIndicatorContext.Provider to access these values. (e.g. in Modals)
            originalValues: newOriginalValues,
        };
    }, [addSafeAreaPadding, disableOfflineIndicatorSafeAreaPadding, isInNarrowPane, isSmallScreenWidth, originalValues, showOnSmallScreens, showOnWideScreens]);
    /** If there is no bottom content, the mobile offline indicator will stick to the bottom of the screen by default. */
    var displayStickySmallScreenOfflineIndicator = shouldSmallScreenOfflineIndicatorStickToBottom && !bottomContent;
    var displaySmallScreenOfflineIndicator = isSmallScreenWidth && ((_b = shouldShowSmallScreenOfflineIndicator !== null && shouldShowSmallScreenOfflineIndicator !== void 0 ? shouldShowSmallScreenOfflineIndicator : showOnSmallScreens) !== null && _b !== void 0 ? _b : true);
    var displayWideScreenOfflineIndicator = !shouldUseNarrowLayout && ((_c = shouldShowWideScreenOfflineIndicator !== null && shouldShowWideScreenOfflineIndicator !== void 0 ? shouldShowWideScreenOfflineIndicator : showOnWideScreens) !== null && _c !== void 0 ? _c : false);
    /** In edge-to-edge mode, we always want to apply the bottom safe area padding to the mobile offline indicator. */
    var addSmallScreenOfflineIndicatorBottomSafeAreaPadding = isUsingEdgeToEdgeMode ? enableEdgeToEdgeBottomSafeAreaPadding : !includeSafeAreaPaddingBottom;
    /** If we currently show the offline indicator and it has bottom safe area padding, we need to offset the bottom safe area padding in the KeyboardAvoidingView. */
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var shouldOffsetMobileOfflineIndicator = displaySmallScreenOfflineIndicator && addSmallScreenOfflineIndicatorBottomSafeAreaPadding && isOffline;
    var initialURL = (0, react_1.useContext)(InitialURLContextProvider_1.InitialURLContext).initialURL;
    var isSingleNewDotEntry = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_SINGLE_NEW_DOT_ENTRY, { canBeMissing: true })[0];
    var setRootStatusBarEnabled = (0, react_1.useContext)(CustomStatusBarAndBackgroundContext_1.default).setRootStatusBarEnabled;
    (0, native_1.usePreventRemove)((isSingleNewDotEntry !== null && isSingleNewDotEntry !== void 0 ? isSingleNewDotEntry : false) && initialURL === Navigation_1.default.getActiveRouteWithoutParams(), function () {
        if (!CONFIG_1.default.IS_HYBRID_APP) {
            return;
        }
        react_native_hybrid_app_1.default.closeReactNativeApp({ shouldSignOut: false, shouldSetNVP: false });
        setRootStatusBarEnabled(false);
    });
    (0, react_1.useEffect)(function () {
        // On iOS, the transitionEnd event doesn't trigger some times. As such, we need to set a timeout
        var timeout = setTimeout(function () {
            setDidScreenTransitionEnd(true);
            onEntryTransitionEnd === null || onEntryTransitionEnd === void 0 ? void 0 : onEntryTransitionEnd();
        }, CONST_1.default.SCREEN_TRANSITION_END_TIMEOUT);
        var unsubscribeTransitionEnd = navigation.addListener('transitionEnd', function (event) {
            var _a;
            // Prevent firing the prop callback when user is exiting the page.
            if ((_a = event === null || event === void 0 ? void 0 : event.data) === null || _a === void 0 ? void 0 : _a.closing) {
                return;
            }
            clearTimeout(timeout);
            setDidScreenTransitionEnd(true);
            onEntryTransitionEnd === null || onEntryTransitionEnd === void 0 ? void 0 : onEntryTransitionEnd();
        });
        // We need to have this prop to remove keyboard before going away from the screen, to avoid previous screen look weird for a brief moment,
        // also we need to have generic control in future - to prevent closing keyboard for some rare cases in which beforeRemove has limitations
        // described here https://reactnavigation.org/docs/preventing-going-back/#limitations
        var beforeRemoveSubscription = shouldDismissKeyboardBeforeClose
            ? navigation.addListener('beforeRemove', function () {
                if (!react_native_1.Keyboard.isVisible()) {
                    return;
                }
                react_native_1.Keyboard.dismiss();
            })
            : undefined;
        return function () {
            clearTimeout(timeout);
            if (unsubscribeTransitionEnd) {
                unsubscribeTransitionEnd();
            }
            if (beforeRemoveSubscription) {
                beforeRemoveSubscription();
            }
        };
        // Rule disabled because this effect is only for component did mount & will component unmount lifecycle event
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    var ChildrenContent = (0, react_1.useMemo)(function () {
        return (
        // If props.children is a function, call it to provide the insets to the children.
        typeof children === 'function' ? children({ insets: insets, safeAreaPaddingBottomStyle: safeAreaPaddingBottomStyle, didScreenTransitionEnd: didScreenTransitionEnd }) : children);
    }, [children, insets, safeAreaPaddingBottomStyle, didScreenTransitionEnd]);
    return (<FocusTrapForScreen_1.default focusTrapSettings={focusTrapSettings}>
            <ScreenWrapperContainer_1.default ref={ref} style={[styles.flex1, style]} bottomContent={bottomContent} didScreenTransitionEnd={didScreenTransitionEnd} shouldKeyboardOffsetBottomSafeAreaPadding={shouldKeyboardOffsetBottomSafeAreaPadding || shouldOffsetMobileOfflineIndicator} enableEdgeToEdgeBottomSafeAreaPadding={enableEdgeToEdgeBottomSafeAreaPaddingProp} includePaddingTop={includePaddingTop} includeSafeAreaPaddingBottom={includeSafeAreaPaddingBottom} isFocused={isFocused} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...restContainerProps}>
                <HeaderGap_1.default styles={headerGapStyles}/>
                {isDevelopment && <CustomDevMenu_1.default />}
                <ScreenWrapperStatusContext_1.default.Provider value={statusContextValue}>
                    <ScreenWrapperOfflineIndicatorContext_1.default.Provider value={offlineIndicatorContextValue}>
                        {ChildrenContent}

                        <ScreenWrapperOfflineIndicators_1.default offlineIndicatorStyle={offlineIndicatorStyle} shouldShowOfflineIndicator={displaySmallScreenOfflineIndicator} shouldShowOfflineIndicatorInWideScreen={displayWideScreenOfflineIndicator} shouldMobileOfflineIndicatorStickToBottom={displayStickySmallScreenOfflineIndicator} isOfflineIndicatorTranslucent={isOfflineIndicatorTranslucent} extraContent={bottomContent} addBottomSafeAreaPadding={addSmallScreenOfflineIndicatorBottomSafeAreaPadding}/>
                    </ScreenWrapperOfflineIndicatorContext_1.default.Provider>
                </ScreenWrapperStatusContext_1.default.Provider>
            </ScreenWrapperContainer_1.default>
        </FocusTrapForScreen_1.default>);
}
ScreenWrapper.displayName = 'ScreenWrapper';
exports.default = (0, withNavigationFallback_1.default)((0, react_1.forwardRef)(ScreenWrapper));
