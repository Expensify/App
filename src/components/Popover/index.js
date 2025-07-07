"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_dom_1 = require("react-dom");
var Modal_1 = require("@components/Modal");
var PopoverProvider_1 = require("@components/PopoverProvider");
var PopoverWithoutOverlay_1 = require("@components/PopoverWithoutOverlay");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var TooltipRefManager_1 = require("@libs/TooltipRefManager");
var CONST_1 = require("@src/CONST");
/*
 * This is a convenience wrapper around the Modal component for a responsive Popover.
 * On small screen widths, it uses BottomDocked modal type, and a Popover type on wide screen widths.
 */
function Popover(props) {
    var isVisible = props.isVisible, onClose = props.onClose, fullscreen = props.fullscreen, _a = props.animationInTiming, animationInTiming = _a === void 0 ? CONST_1.default.ANIMATED_TRANSITION : _a, onLayout = props.onLayout, animationOutTiming = props.animationOutTiming, _b = props.disableAnimation, disableAnimation = _b === void 0 ? true : _b, _c = props.withoutOverlay, withoutOverlay = _c === void 0 ? false : _c, _d = props.anchorPosition, anchorPosition = _d === void 0 ? {} : _d, _e = props.anchorRef, anchorRef = _e === void 0 ? function () { } : _e, _f = props.animationIn, animationIn = _f === void 0 ? 'fadeIn' : _f, _g = props.animationOut, animationOut = _g === void 0 ? 'fadeOut' : _g, _h = props.shouldCloseWhenBrowserNavigationChanged, shouldCloseWhenBrowserNavigationChanged = _h === void 0 ? true : _h;
    // We need to use isSmallScreenWidth to apply the correct modal type and popoverAnchorPosition
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _j = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _j.shouldUseNarrowLayout, isSmallScreenWidth = _j.isSmallScreenWidth;
    var withoutOverlayRef = (0, react_1.useRef)(null);
    var _k = react_1.default.useContext(PopoverProvider_1.PopoverContext), close = _k.close, popover = _k.popover;
    // Not adding this inside the PopoverProvider
    // because this is an issue on smaller screens as well.
    react_1.default.useEffect(function () {
        if (!shouldCloseWhenBrowserNavigationChanged) {
            return;
        }
        var listener = function () {
            if (!isVisible) {
                return;
            }
            onClose === null || onClose === void 0 ? void 0 : onClose();
        };
        window.addEventListener('popstate', listener);
        return function () {
            window.removeEventListener('popstate', listener);
        };
    }, [onClose, isVisible, shouldCloseWhenBrowserNavigationChanged]);
    var onCloseWithPopoverContext = function () {
        if (popover && 'current' in anchorRef) {
            close(anchorRef);
        }
        TooltipRefManager_1.default.hideTooltip();
        onClose === null || onClose === void 0 ? void 0 : onClose();
    };
    if (!fullscreen && !shouldUseNarrowLayout) {
        return (0, react_dom_1.createPortal)(<Modal_1.default 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props} onClose={onCloseWithPopoverContext} type={CONST_1.default.MODAL.MODAL_TYPE.POPOVER} popoverAnchorPosition={anchorPosition} animationInTiming={disableAnimation ? 1 : animationInTiming} animationOutTiming={disableAnimation ? 1 : animationOutTiming} shouldCloseOnOutsideClick onLayout={onLayout} animationIn={animationIn} animationOut={animationOut}/>, document.body);
    }
    if (withoutOverlay && !shouldUseNarrowLayout) {
        return (0, react_dom_1.createPortal)(<PopoverWithoutOverlay_1.default 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props} withoutOverlayRef={withoutOverlayRef} animationIn={animationIn} animationOut={animationOut}/>, document.body);
    }
    return (<Modal_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} onClose={onCloseWithPopoverContext} shouldHandleNavigationBack={props.shouldHandleNavigationBack} type={isSmallScreenWidth ? CONST_1.default.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST_1.default.MODAL.MODAL_TYPE.POPOVER} popoverAnchorPosition={isSmallScreenWidth ? undefined : anchorPosition} fullscreen={shouldUseNarrowLayout ? true : fullscreen} animationInTiming={disableAnimation && !shouldUseNarrowLayout ? 1 : animationInTiming} animationOutTiming={disableAnimation && !shouldUseNarrowLayout ? 1 : animationOutTiming} onLayout={onLayout} animationIn={animationIn} animationOut={animationOut}/>);
}
Popover.displayName = 'Popover';
exports.default = Popover;
