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
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_modal_1 = require("react-native-modal");
var ColorSchemeWrapper_1 = require("@components/ColorSchemeWrapper");
var FocusTrapForModal_1 = require("@components/FocusTrap/FocusTrapForModal");
var NavigationBar_1 = require("@components/NavigationBar");
var ScreenWrapperOfflineIndicatorContext_1 = require("@components/ScreenWrapper/ScreenWrapperOfflineIndicatorContext");
var useKeyboardState_1 = require("@hooks/useKeyboardState");
var usePrevious_1 = require("@hooks/usePrevious");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSafeAreaInsets_1 = require("@hooks/useSafeAreaInsets");
var useSidePanel_1 = require("@hooks/useSidePanel");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var ComposerFocusManager_1 = require("@libs/ComposerFocusManager");
var NarrowPaneContext_1 = require("@libs/Navigation/AppNavigator/Navigators/NarrowPaneContext");
var Overlay_1 = require("@libs/Navigation/AppNavigator/Navigators/Overlay");
var Navigation_1 = require("@libs/Navigation/Navigation");
var variables_1 = require("@styles/variables");
var Modal_1 = require("@userActions/Modal");
var CONST_1 = require("@src/CONST");
var ModalContent_1 = require("./ModalContent");
var ModalContext_1 = require("./ModalContext");
var ReanimatedModal_1 = require("./ReanimatedModal");
var REANIMATED_MODAL_TYPES = [CONST_1.default.MODAL.MODAL_TYPE.BOTTOM_DOCKED, CONST_1.default.MODAL.MODAL_TYPE.FULLSCREEN];
function ModalComponent(_a) {
    var type = _a.type, shouldUseReanimatedModal = _a.shouldUseReanimatedModal, props = __rest(_a, ["type", "shouldUseReanimatedModal"]);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if ((type && REANIMATED_MODAL_TYPES.includes(type)) || shouldUseReanimatedModal) {
        return (<ReanimatedModal_1.default 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props} type={type}/>);
    }
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <react_native_modal_1.default {...props}/>;
}
function BaseModal(_a, ref) {
    var isVisible = _a.isVisible, onClose = _a.onClose, _b = _a.shouldSetModalVisibility, shouldSetModalVisibility = _b === void 0 ? true : _b, _c = _a.onModalHide, onModalHide = _c === void 0 ? function () { } : _c, type = _a.type, _d = _a.popoverAnchorPosition, popoverAnchorPosition = _d === void 0 ? {} : _d, _e = _a.innerContainerStyle, innerContainerStyle = _e === void 0 ? {} : _e, outerStyle = _a.outerStyle, _f = _a.onModalShow, onModalShow = _f === void 0 ? function () { } : _f, onModalWillShow = _a.onModalWillShow, onModalWillHide = _a.onModalWillHide, propagateSwipe = _a.propagateSwipe, _g = _a.fullscreen, fullscreen = _g === void 0 ? true : _g, animationIn = _a.animationIn, animationOut = _a.animationOut, useNativeDriver = _a.useNativeDriver, useNativeDriverForBackdrop = _a.useNativeDriverForBackdrop, _h = _a.hideModalContentWhileAnimating, hideModalContentWhileAnimating = _h === void 0 ? false : _h, animationInTiming = _a.animationInTiming, animationOutTiming = _a.animationOutTiming, animationInDelay = _a.animationInDelay, _j = _a.statusBarTranslucent, statusBarTranslucent = _j === void 0 ? true : _j, _k = _a.navigationBarTranslucent, navigationBarTranslucent = _k === void 0 ? true : _k, onLayout = _a.onLayout, _l = _a.avoidKeyboard, avoidKeyboard = _l === void 0 ? false : _l, children = _a.children, _m = _a.shouldUseCustomBackdrop, shouldUseCustomBackdrop = _m === void 0 ? false : _m, onBackdropPress = _a.onBackdropPress, modalId = _a.modalId, _o = _a.shouldEnableNewFocusManagement, shouldEnableNewFocusManagement = _o === void 0 ? false : _o, restoreFocusType = _a.restoreFocusType, _p = _a.shouldUseModalPaddingStyle, shouldUseModalPaddingStyle = _p === void 0 ? true : _p, _q = _a.initialFocus, initialFocus = _q === void 0 ? false : _q, _r = _a.swipeThreshold, swipeThreshold = _r === void 0 ? 150 : _r, swipeDirection = _a.swipeDirection, _s = _a.shouldPreventScrollOnFocus, shouldPreventScrollOnFocus = _s === void 0 ? false : _s, _t = _a.disableAnimationIn, disableAnimationIn = _t === void 0 ? false : _t, enableEdgeToEdgeBottomSafeAreaPadding = _a.enableEdgeToEdgeBottomSafeAreaPadding, _u = _a.shouldApplySidePanelOffset, shouldApplySidePanelOffset = _u === void 0 ? type === CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED : _u, _v = _a.shouldUseReanimatedModal, shouldUseReanimatedModal = _v === void 0 ? false : _v;
    // When the `enableEdgeToEdgeBottomSafeAreaPadding` prop is explicitly set, we enable edge-to-edge mode.
    var isUsingEdgeToEdgeMode = enableEdgeToEdgeBottomSafeAreaPadding !== undefined;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _w = (0, useWindowDimensions_1.default)(), windowWidth = _w.windowWidth, windowHeight = _w.windowHeight;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply correct modal width
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var sidePanelOffset = (0, useSidePanel_1.default)().sidePanelOffset;
    var sidePanelStyle = shouldApplySidePanelOffset && !isSmallScreenWidth ? { paddingRight: sidePanelOffset.current } : undefined;
    var keyboardStateContextValue = (0, useKeyboardState_1.default)();
    var insets = (0, useSafeAreaInsets_1.default)();
    var isVisibleRef = (0, react_1.useRef)(isVisible);
    var hideModalCallbackRef = (0, react_1.useRef)(undefined);
    var wasVisible = (0, usePrevious_1.default)(isVisible);
    var uniqueModalId = (0, react_1.useMemo)(function () { return modalId !== null && modalId !== void 0 ? modalId : ComposerFocusManager_1.default.getId(); }, [modalId]);
    var saveFocusState = (0, react_1.useCallback)(function () {
        if (shouldEnableNewFocusManagement) {
            ComposerFocusManager_1.default.saveFocusState(uniqueModalId);
        }
        ComposerFocusManager_1.default.resetReadyToFocus(uniqueModalId);
    }, [shouldEnableNewFocusManagement, uniqueModalId]);
    /**
     * Hides modal
     * @param callHideCallback - Should we call the onModalHide callback
     */
    var hideModal = (0, react_1.useCallback)(function (callHideCallback) {
        if (callHideCallback === void 0) { callHideCallback = true; }
        if ((0, Modal_1.areAllModalsHidden)()) {
            (0, Modal_1.willAlertModalBecomeVisible)(false);
            if (shouldSetModalVisibility && !Navigation_1.default.isTopmostRouteModalScreen()) {
                (0, Modal_1.setModalVisibility)(false);
            }
        }
        if (callHideCallback) {
            onModalHide();
        }
        (0, Modal_1.onModalDidClose)();
        ComposerFocusManager_1.default.refocusAfterModalFullyClosed(uniqueModalId, restoreFocusType);
    }, [shouldSetModalVisibility, onModalHide, restoreFocusType, uniqueModalId]);
    (0, react_1.useEffect)(function () {
        isVisibleRef.current = isVisible;
        var removeOnCloseListener;
        if (isVisible) {
            (0, Modal_1.willAlertModalBecomeVisible)(true, type === CONST_1.default.MODAL.MODAL_TYPE.POPOVER || type === CONST_1.default.MODAL.MODAL_TYPE.BOTTOM_DOCKED);
            // To handle closing any modal already visible when this modal is mounted, i.e. PopoverReportActionContextMenu
            if (onClose) {
                removeOnCloseListener = (0, Modal_1.setCloseModal)(onClose);
            }
        }
        return function () {
            if (!removeOnCloseListener) {
                return;
            }
            removeOnCloseListener();
        };
    }, [isVisible, wasVisible, onClose, type]);
    (0, react_1.useEffect)(function () {
        hideModalCallbackRef.current = hideModal;
    }, [hideModal]);
    (0, react_1.useEffect)(function () { return function () {
        var _a;
        // Only trigger onClose and setModalVisibility if the modal is unmounting while visible.
        if (!isVisibleRef.current) {
            return;
        }
        (_a = hideModalCallbackRef.current) === null || _a === void 0 ? void 0 : _a.call(hideModalCallbackRef, true);
    }; }, 
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    []);
    var handleShowModal = (0, react_1.useCallback)(function () {
        if (shouldSetModalVisibility) {
            (0, Modal_1.setModalVisibility)(true, type);
        }
        onModalShow();
    }, [onModalShow, shouldSetModalVisibility, type]);
    var handleBackdropPress = function (e) {
        if ((e === null || e === void 0 ? void 0 : e.key) === CONST_1.default.KEYBOARD_SHORTCUTS.ENTER.shortcutKey) {
            return;
        }
        if (onBackdropPress) {
            onBackdropPress();
        }
        else {
            onClose === null || onClose === void 0 ? void 0 : onClose();
        }
    };
    var handleDismissModal = function () {
        ComposerFocusManager_1.default.setReadyToFocus(uniqueModalId);
    };
    var _x = (0, react_1.useMemo)(function () {
        return StyleUtils.getModalStyles(type, {
            windowWidth: windowWidth,
            windowHeight: windowHeight,
            isSmallScreenWidth: isSmallScreenWidth,
        }, popoverAnchorPosition, innerContainerStyle, outerStyle, shouldUseModalPaddingStyle);
    }, [StyleUtils, type, windowWidth, windowHeight, isSmallScreenWidth, popoverAnchorPosition, innerContainerStyle, outerStyle, shouldUseModalPaddingStyle]), modalStyle = _x.modalStyle, modalContainerStyle = _x.modalContainerStyle, modalStyleAnimationIn = _x.animationIn, modalStyleAnimationOut = _x.animationOut, shouldAddTopSafeAreaMargin = _x.shouldAddTopSafeAreaMargin, shouldAddBottomSafeAreaMargin = _x.shouldAddBottomSafeAreaMargin, shouldAddTopSafeAreaPadding = _x.shouldAddTopSafeAreaPadding, shouldAddBottomSafeAreaPadding = _x.shouldAddBottomSafeAreaPadding, hideBackdrop = _x.hideBackdrop;
    var modalPaddingStyles = (0, react_1.useMemo)(function () {
        var paddings = StyleUtils.getModalPaddingStyles({
            shouldAddBottomSafeAreaMargin: shouldAddBottomSafeAreaMargin,
            shouldAddTopSafeAreaMargin: shouldAddTopSafeAreaMargin,
            // enableEdgeToEdgeBottomSafeAreaPadding is used as a temporary solution to disable safe area bottom spacing on modals, to allow edge-to-edge content
            shouldAddBottomSafeAreaPadding: !isUsingEdgeToEdgeMode && (!avoidKeyboard || !keyboardStateContextValue.isKeyboardActive) && shouldAddBottomSafeAreaPadding,
            shouldAddTopSafeAreaPadding: shouldAddTopSafeAreaPadding,
            modalContainerStyle: modalContainerStyle,
            insets: insets,
        });
        return shouldUseModalPaddingStyle ? paddings : { paddingLeft: paddings.paddingLeft, paddingRight: paddings.paddingRight };
    }, [
        StyleUtils,
        avoidKeyboard,
        insets,
        isUsingEdgeToEdgeMode,
        keyboardStateContextValue.isKeyboardActive,
        modalContainerStyle,
        shouldAddBottomSafeAreaMargin,
        shouldAddBottomSafeAreaPadding,
        shouldAddTopSafeAreaMargin,
        shouldAddTopSafeAreaPadding,
        shouldUseModalPaddingStyle,
    ]);
    var modalContextValue = (0, react_1.useMemo)(function () { return ({
        activeModalType: isVisible ? type : undefined,
        default: false,
    }); }, [isVisible, type]);
    var animationInProps = (0, react_1.useMemo)(function () {
        if (disableAnimationIn) {
            // We need to apply these animation props to completely disable the "animation in". Simply setting it to 0 and undefined will not work.
            // Based on: https://github.com/react-native-modal/react-native-modal/issues/191
            return {
                animationIn: { from: { opacity: 1 }, to: { opacity: 1 } },
                animationInTiming: 0,
            };
        }
        return {
            animationIn: animationIn !== null && animationIn !== void 0 ? animationIn : modalStyleAnimationIn,
            animationInDelay: animationInDelay,
            animationInTiming: animationInTiming,
        };
    }, [animationIn, animationInDelay, animationInTiming, disableAnimationIn, modalStyleAnimationIn]);
    // In Modals we need to reset the ScreenWrapperOfflineIndicatorContext to allow nested ScreenWrapper components to render offline indicators,
    // except if we are in a narrow pane navigator. In this case, we use the narrow pane's original values.
    var isInNarrowPane = (0, react_1.useContext)(NarrowPaneContext_1.default).isInNarrowPane;
    var originalValues = (0, react_1.useContext)(ScreenWrapperOfflineIndicatorContext_1.default).originalValues;
    var offlineIndicatorContextValue = (0, react_1.useMemo)(function () { return (isInNarrowPane ? (originalValues !== null && originalValues !== void 0 ? originalValues : {}) : {}); }, [isInNarrowPane, originalValues]);
    return (<ModalContext_1.default.Provider value={modalContextValue}>
            <ScreenWrapperOfflineIndicatorContext_1.default.Provider value={offlineIndicatorContextValue}>
                <react_native_1.View 
    // this is a workaround for modal not being visible on the new arch in some cases
    // it's necessary to have a non-collapsible view as a parent of the modal to prevent
    // a conflict between RN core and Reanimated shadow tree operations
    // position absolute is needed to prevent the view from interfering with flex layout
    collapsable={false} style={[styles.pAbsolute, { zIndex: 1 }]}>
                    <ModalComponent 
    // Prevent the parent element to capture a click. This is useful when the modal component is put inside a pressable.
    onClick={function (e) { return e.stopPropagation(); }} onBackdropPress={handleBackdropPress} 
    // Note: Escape key on web/desktop will trigger onBackButtonPress callback
    // eslint-disable-next-line react/jsx-props-no-multi-spaces
    onBackButtonPress={Modal_1.closeTop} onModalShow={handleShowModal} propagateSwipe={propagateSwipe} onModalHide={hideModal} onModalWillShow={function () {
            saveFocusState();
            onModalWillShow === null || onModalWillShow === void 0 ? void 0 : onModalWillShow();
        }} onModalWillHide={onModalWillHide} onDismiss={handleDismissModal} onSwipeComplete={onClose} swipeDirection={swipeDirection} swipeThreshold={swipeThreshold} isVisible={isVisible} backdropColor={theme.overlay} backdropOpacity={!shouldUseCustomBackdrop && hideBackdrop ? 0 : variables_1.default.overlayOpacity} backdropTransitionOutTiming={0} hasBackdrop={fullscreen} coverScreen={fullscreen} style={[modalStyle, sidePanelStyle]} deviceHeight={windowHeight} deviceWidth={windowWidth} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...animationInProps} animationOut={animationOut !== null && animationOut !== void 0 ? animationOut : modalStyleAnimationOut} animationOutTiming={animationOutTiming} useNativeDriver={useNativeDriver} useNativeDriverForBackdrop={useNativeDriverForBackdrop} hideModalContentWhileAnimating={hideModalContentWhileAnimating} statusBarTranslucent={statusBarTranslucent} navigationBarTranslucent={navigationBarTranslucent} onLayout={onLayout} avoidKeyboard={avoidKeyboard} customBackdrop={shouldUseCustomBackdrop ? <Overlay_1.default onPress={handleBackdropPress}/> : undefined} type={type} shouldUseReanimatedModal={shouldUseReanimatedModal}>
                        <ModalContent_1.default onModalWillShow={saveFocusState} onDismiss={handleDismissModal}>
                            <FocusTrapForModal_1.default active={isVisible} initialFocus={initialFocus} shouldPreventScroll={shouldPreventScrollOnFocus}>
                                <react_native_1.View style={[styles.defaultModalContainer, modalContainerStyle, modalPaddingStyles, !isVisible && styles.pointerEventsNone]} ref={ref}>
                                    <ColorSchemeWrapper_1.default>{children}</ColorSchemeWrapper_1.default>
                                </react_native_1.View>
                            </FocusTrapForModal_1.default>
                        </ModalContent_1.default>
                        {!(keyboardStateContextValue === null || keyboardStateContextValue === void 0 ? void 0 : keyboardStateContextValue.isKeyboardActive) && <NavigationBar_1.default />}
                    </ModalComponent>
                </react_native_1.View>
            </ScreenWrapperOfflineIndicatorContext_1.default.Provider>
        </ModalContext_1.default.Provider>);
}
BaseModal.displayName = 'BaseModalWithRef';
exports.default = (0, react_1.forwardRef)(BaseModal);
