"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FocusTrapForModal_1 = require("@components/FocusTrap/FocusTrapForModal");
var Modal_1 = require("@components/Modal");
var ScreenWrapperContainer_1 = require("@components/ScreenWrapper/ScreenWrapperContainer");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useViewportOffsetTop_1 = require("@hooks/useViewportOffsetTop");
var Browser_1 = require("@libs/Browser");
var CONST_1 = require("@src/CONST");
var SearchRouter_1 = require("./SearchRouter");
var SearchRouterContext_1 = require("./SearchRouterContext");
var isMobileWebIOS = (0, Browser_1.isMobileIOS)();
function SearchRouterModal() {
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var _a = (0, SearchRouterContext_1.useSearchRouterContext)(), isSearchRouterDisplayed = _a.isSearchRouterDisplayed, closeSearchRouter = _a.closeSearchRouter;
    var viewportOffsetTop = (0, useViewportOffsetTop_1.default)();
    // On mWeb Safari, the input caret stuck for a moment while the modal is animating. So, we hide the caret until the animation is done.
    var _b = (0, react_1.useState)(isMobileWebIOS), shouldHideInputCaret = _b[0], setShouldHideInputCaret = _b[1];
    var modalType = shouldUseNarrowLayout ? CONST_1.default.MODAL.MODAL_TYPE.CENTERED_SWIPEABLE_TO_RIGHT : CONST_1.default.MODAL.MODAL_TYPE.POPOVER;
    return (<Modal_1.default type={modalType} isVisible={isSearchRouterDisplayed} innerContainerStyle={{ paddingTop: viewportOffsetTop }} popoverAnchorPosition={{ right: 6, top: 6 }} fullscreen propagateSwipe swipeDirection={shouldUseNarrowLayout ? CONST_1.default.SWIPE_DIRECTION.RIGHT : undefined} onClose={closeSearchRouter} onModalHide={function () { return setShouldHideInputCaret(isMobileWebIOS); }} onModalShow={function () { return setShouldHideInputCaret(false); }} shouldApplySidePanelOffset={!shouldUseNarrowLayout} enableEdgeToEdgeBottomSafeAreaPadding>
            <ScreenWrapperContainer_1.default testID={SearchRouterModal.displayName} shouldEnableMaxHeight enableEdgeToEdgeBottomSafeAreaPadding includePaddingTop={false}>
                <FocusTrapForModal_1.default active={isSearchRouterDisplayed}>
                    <SearchRouter_1.default onRouterClose={closeSearchRouter} shouldHideInputCaret={shouldHideInputCaret} isSearchRouterDisplayed={isSearchRouterDisplayed}/>
                </FocusTrapForModal_1.default>
            </ScreenWrapperContainer_1.default>
        </Modal_1.default>);
}
SearchRouterModal.displayName = 'SearchRouterModal';
exports.default = SearchRouterModal;
