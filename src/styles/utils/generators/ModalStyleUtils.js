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
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
function getCenteredModalStyles(styles, windowWidth, isSmallScreenWidth, isFullScreenWhenSmall) {
    if (isFullScreenWhenSmall === void 0) { isFullScreenWhenSmall = false; }
    var modalStyles = styles.centeredModalStyles(isSmallScreenWidth, isFullScreenWhenSmall);
    return {
        borderWidth: modalStyles.borderWidth,
        width: isSmallScreenWidth ? '100%' : windowWidth - modalStyles.marginHorizontal * 2,
    };
}
var createModalStyleUtils = function (_a) {
    var theme = _a.theme, styles = _a.styles;
    return ({
        getModalStyles: function (type, windowDimensions, popoverAnchorPosition, innerContainerStyle, outerStyle, shouldUseModalPaddingStyle) {
            if (popoverAnchorPosition === void 0) { popoverAnchorPosition = {}; }
            if (innerContainerStyle === void 0) { innerContainerStyle = {}; }
            if (outerStyle === void 0) { outerStyle = {}; }
            if (shouldUseModalPaddingStyle === void 0) { shouldUseModalPaddingStyle = true; }
            var windowWidth = windowDimensions.windowWidth, isSmallScreenWidth = windowDimensions.isSmallScreenWidth;
            var modalStyle = __assign({ margin: 0 }, outerStyle);
            var modalContainerStyle;
            var swipeDirection;
            var animationIn;
            var animationOut;
            var hideBackdrop = false;
            var shouldAddBottomSafeAreaMargin = false;
            var shouldAddTopSafeAreaMargin = false;
            var shouldAddBottomSafeAreaPadding = false;
            var shouldAddTopSafeAreaPadding = false;
            switch (type) {
                case CONST_1.default.MODAL.MODAL_TYPE.FULLSCREEN:
                    modalStyle = __assign(__assign({}, modalStyle), { height: '100%' });
                    modalContainerStyle = {};
                    swipeDirection = 'down';
                    animationIn = 'slideInUp';
                    animationOut = 'slideOutDown';
                    break;
                case CONST_1.default.MODAL.MODAL_TYPE.CONFIRM:
                    // A confirm modal is one that has a visible backdrop
                    // and can be dismissed by clicking outside of the modal.
                    modalStyle = __assign(__assign({}, modalStyle), {
                        alignItems: 'center',
                    });
                    modalContainerStyle = {
                        boxShadow: theme.shadow,
                        borderRadius: variables_1.default.componentBorderRadiusLarge,
                        overflow: 'hidden',
                        width: variables_1.default.sideBarWidth,
                    };
                    // setting this to undefined we effectively disable the
                    // ability to swipe our modal
                    swipeDirection = undefined;
                    animationIn = 'fadeIn';
                    animationOut = 'fadeOut';
                    break;
                case CONST_1.default.MODAL.MODAL_TYPE.CENTERED:
                    // A centered modal is one that has a visible backdrop
                    // and can be dismissed by clicking outside of the modal.
                    // This modal should take up the entire visible area when
                    // viewed on a smaller device (e.g. mobile or mobile web).
                    modalStyle = __assign(__assign({}, modalStyle), {
                        alignItems: 'center',
                    });
                    modalContainerStyle = __assign({ boxShadow: theme.shadow, flex: 1, marginTop: isSmallScreenWidth ? 0 : 20, marginBottom: isSmallScreenWidth ? 0 : 20, borderRadius: isSmallScreenWidth ? 0 : variables_1.default.componentBorderRadiusLarge, overflow: 'hidden' }, getCenteredModalStyles(styles, windowWidth, isSmallScreenWidth));
                    // Allow this modal to be dismissed with a swipe down or swipe right
                    swipeDirection = ['down', 'right'];
                    animationIn = isSmallScreenWidth ? 'slideInRight' : 'fadeIn';
                    animationOut = isSmallScreenWidth ? 'slideOutRight' : 'fadeOut';
                    shouldAddTopSafeAreaMargin = !isSmallScreenWidth;
                    shouldAddBottomSafeAreaMargin = !isSmallScreenWidth;
                    shouldAddTopSafeAreaPadding = isSmallScreenWidth;
                    shouldAddBottomSafeAreaPadding = false;
                    break;
                case CONST_1.default.MODAL.MODAL_TYPE.CENTERED_SWIPEABLE_TO_RIGHT:
                    // A centered modal is one that has a visible backdrop
                    // and can be dismissed by clicking outside of the modal.
                    // This modal should take up the entire visible area when
                    // viewed on a smaller device (e.g. mobile or mobile web).
                    modalStyle = __assign(__assign({}, modalStyle), {
                        alignItems: 'center',
                    });
                    modalContainerStyle = __assign({ boxShadow: theme.shadow, flex: 1, marginTop: isSmallScreenWidth ? 0 : 20, marginBottom: isSmallScreenWidth ? 0 : 20, borderRadius: isSmallScreenWidth ? 0 : variables_1.default.componentBorderRadiusLarge, overflow: 'hidden' }, getCenteredModalStyles(styles, windowWidth, isSmallScreenWidth));
                    // Allow this modal to be dismissed with a swipe to the right, required when we want to have a list in centered modal
                    swipeDirection = ['right'];
                    animationIn = isSmallScreenWidth ? 'slideInRight' : 'fadeIn';
                    animationOut = isSmallScreenWidth ? 'slideOutRight' : 'fadeOut';
                    shouldAddTopSafeAreaMargin = !isSmallScreenWidth;
                    shouldAddBottomSafeAreaMargin = !isSmallScreenWidth;
                    shouldAddTopSafeAreaPadding = isSmallScreenWidth;
                    shouldAddBottomSafeAreaPadding = false;
                    break;
                case CONST_1.default.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE:
                    // A centered modal that cannot be dismissed with a swipe.
                    modalStyle = __assign(__assign({}, modalStyle), {
                        alignItems: 'center',
                        justifyContent: 'center',
                    });
                    modalContainerStyle = __assign({ boxShadow: theme.shadow, flex: 1, marginTop: isSmallScreenWidth ? 0 : 20, marginBottom: isSmallScreenWidth ? 0 : 20, borderRadius: isSmallScreenWidth ? 0 : variables_1.default.componentBorderRadiusLarge, overflow: 'hidden' }, getCenteredModalStyles(styles, windowWidth, isSmallScreenWidth, true));
                    swipeDirection = undefined;
                    animationIn = isSmallScreenWidth ? 'slideInRight' : 'fadeIn';
                    animationOut = isSmallScreenWidth ? 'slideOutRight' : 'fadeOut';
                    shouldAddTopSafeAreaMargin = !isSmallScreenWidth;
                    shouldAddBottomSafeAreaMargin = !isSmallScreenWidth;
                    shouldAddTopSafeAreaPadding = isSmallScreenWidth;
                    shouldAddBottomSafeAreaPadding = false;
                    break;
                case CONST_1.default.MODAL.MODAL_TYPE.CENTERED_SMALL:
                    // A centered modal that takes up the minimum possible screen space on all devices
                    modalStyle = __assign(__assign({}, modalStyle), {
                        alignItems: 'center',
                    });
                    modalContainerStyle = {
                        boxShadow: theme.shadow,
                        borderRadius: variables_1.default.componentBorderRadiusLarge,
                        borderWidth: 0,
                    };
                    // Allow this modal to be dismissed with a swipe down or swipe right
                    swipeDirection = ['down', 'right'];
                    animationIn = 'fadeIn';
                    animationOut = 'fadeOut';
                    shouldAddTopSafeAreaMargin = false;
                    shouldAddBottomSafeAreaMargin = false;
                    shouldAddTopSafeAreaPadding = false;
                    shouldAddBottomSafeAreaPadding = false;
                    break;
                case CONST_1.default.MODAL.MODAL_TYPE.BOTTOM_DOCKED:
                    modalStyle = __assign(__assign({}, modalStyle), {
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                    });
                    modalContainerStyle = {
                        width: '100%',
                        borderTopLeftRadius: variables_1.default.componentBorderRadiusLarge,
                        borderTopRightRadius: variables_1.default.componentBorderRadiusLarge,
                        justifyContent: 'center',
                        overflow: 'hidden',
                        boxShadow: theme.shadow,
                    };
                    if (shouldUseModalPaddingStyle) {
                        modalContainerStyle.paddingTop = variables_1.default.componentBorderRadiusLarge;
                        modalContainerStyle.paddingBottom = variables_1.default.componentBorderRadiusLarge;
                    }
                    shouldAddBottomSafeAreaPadding = true;
                    swipeDirection = undefined;
                    animationIn = 'slideInUp';
                    animationOut = 'slideOutDown';
                    break;
                case CONST_1.default.MODAL.MODAL_TYPE.POPOVER:
                    modalStyle = __assign(__assign(__assign({}, modalStyle), popoverAnchorPosition), {
                        position: 'absolute',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                    });
                    modalContainerStyle = {
                        borderRadius: variables_1.default.componentBorderRadiusLarge,
                        borderWidth: 1,
                        borderColor: theme.border,
                        justifyContent: 'center',
                        overflow: 'hidden',
                        boxShadow: theme.shadow,
                    };
                    hideBackdrop = true;
                    swipeDirection = undefined;
                    animationIn = 'fadeIn';
                    animationOut = 'fadeOut';
                    break;
                case CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED:
                    modalStyle = __assign(__assign({}, modalStyle), {
                        marginLeft: isSmallScreenWidth ? 0 : windowWidth - variables_1.default.sideBarWidth,
                        width: isSmallScreenWidth ? '100%' : variables_1.default.sideBarWidth,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                    });
                    modalContainerStyle = {
                        width: isSmallScreenWidth ? '100%' : variables_1.default.sideBarWidth,
                        height: '100%',
                        overflow: 'hidden',
                    };
                    animationIn = {
                        from: {
                            translateX: isSmallScreenWidth ? windowWidth : variables_1.default.sideBarWidth,
                        },
                        to: {
                            translateX: 0,
                        },
                    };
                    animationOut = {
                        from: {
                            translateX: 0,
                        },
                        to: {
                            translateX: isSmallScreenWidth ? windowWidth : variables_1.default.sideBarWidth,
                        },
                    };
                    hideBackdrop = true;
                    swipeDirection = undefined;
                    shouldAddBottomSafeAreaPadding = true;
                    shouldAddTopSafeAreaPadding = true;
                    break;
                default:
                    modalStyle = {};
                    modalContainerStyle = {};
                    swipeDirection = 'down';
                    animationIn = 'slideInUp';
                    animationOut = 'slideOutDown';
            }
            modalContainerStyle = __assign(__assign({}, modalContainerStyle), innerContainerStyle);
            return {
                modalStyle: modalStyle,
                modalContainerStyle: modalContainerStyle,
                swipeDirection: swipeDirection,
                animationIn: animationIn,
                animationOut: animationOut,
                hideBackdrop: hideBackdrop,
                shouldAddTopSafeAreaMargin: shouldAddTopSafeAreaMargin,
                shouldAddBottomSafeAreaMargin: shouldAddBottomSafeAreaMargin,
                shouldAddBottomSafeAreaPadding: shouldAddBottomSafeAreaPadding,
                shouldAddTopSafeAreaPadding: shouldAddTopSafeAreaPadding,
            };
        },
    });
};
exports.default = createModalStyleUtils;
