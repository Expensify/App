"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var react_native_pager_view_1 = require("react-native-pager-view");
var react_native_reanimated_1 = require("react-native-reanimated");
var CarouselItem_1 = require("@components/Attachments/AttachmentCarousel/CarouselItem");
var useCarouselContextEvents_1 = require("@components/Attachments/AttachmentCarousel/useCarouselContextEvents");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var shouldUseNewPager_1 = require("@libs/shouldUseNewPager");
var AttachmentCarouselPagerContext_1 = require("./AttachmentCarouselPagerContext");
var usePageScrollHandler_1 = require("./usePageScrollHandler");
var AnimatedPagerView = react_native_reanimated_1.default.createAnimatedComponent(react_native_pager_view_1.default);
function AttachmentCarouselPager(_a, ref) {
    var items = _a.items, activeAttachmentID = _a.activeAttachmentID, initialPage = _a.initialPage, setShouldShowArrows = _a.setShouldShowArrows, onPageSelected = _a.onPageSelected, onClose = _a.onClose, reportID = _a.reportID, onAttachmentError = _a.onAttachmentError;
    var _b = (0, useCarouselContextEvents_1.default)(setShouldShowArrows), handleTap = _b.handleTap, handleScaleChange = _b.handleScaleChange, isScrollEnabled = _b.isScrollEnabled;
    var styles = (0, useThemeStyles_1.default)();
    var pagerRef = (0, react_1.useRef)(null);
    var isPagerScrolling = (0, react_native_reanimated_1.useSharedValue)(false);
    var activePage = (0, react_native_reanimated_1.useSharedValue)(initialPage);
    var _c = (0, react_1.useState)(initialPage), activePageIndex = _c[0], setActivePageIndex = _c[1];
    var pageScrollHandler = (0, usePageScrollHandler_1.default)(function (e) {
        'worklet';
        activePage.set(e.position);
        isPagerScrolling.set(e.offset !== 0);
    }, []);
    (0, react_1.useEffect)(function () {
        setActivePageIndex(initialPage);
        activePage.set(initialPage);
    }, [activePage, initialPage]);
    /** The `pagerItems` object that passed down to the context. Later used to detect current page, whether it's a single image gallery etc. */
    var pagerItems = (0, react_1.useMemo)(function () { return items.map(function (item, index) { return ({ source: item.source, previewSource: item.previewSource, index: index, isActive: index === activePageIndex }); }); }, [activePageIndex, items]);
    var extractItemKey = (0, react_1.useCallback)(function (item, index) { return "attachmentID-".concat(item.attachmentID, "-").concat(index); }, []);
    var nativeGestureHandler = react_native_gesture_handler_1.Gesture.Native();
    var contextValue = (0, react_1.useMemo)(function () { return ({
        pagerItems: pagerItems,
        activePage: activePageIndex,
        isPagerScrolling: isPagerScrolling,
        isScrollEnabled: isScrollEnabled,
        pagerRef: pagerRef,
        onTap: handleTap,
        onSwipeDown: onClose,
        onScaleChanged: handleScaleChange,
        onAttachmentError: onAttachmentError,
        externalGestureHandler: nativeGestureHandler,
    }); }, [pagerItems, activePageIndex, isPagerScrolling, isScrollEnabled, handleTap, onClose, handleScaleChange, nativeGestureHandler, onAttachmentError]);
    var animatedProps = (0, react_native_reanimated_1.useAnimatedProps)(function () { return ({
        scrollEnabled: isScrollEnabled.get(),
    }); });
    /**
     * This "useImperativeHandle" call is needed to expose certain imperative methods via the pager's ref.
     * setPage: can be used to programmatically change the page from a parent component
     */
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        setPage: function (selectedPage) {
            var _a;
            (_a = pagerRef.current) === null || _a === void 0 ? void 0 : _a.setPage(selectedPage);
        },
    }); }, []);
    var carouselItems = items.map(function (item, index) {
        var _a;
        return (<react_native_1.View key={extractItemKey(item, index)} style={styles.flex1}>
            <CarouselItem_1.default item={item} isFocused={index === activePageIndex && activeAttachmentID === ((_a = item.attachmentID) !== null && _a !== void 0 ? _a : item.source)} reportID={reportID}/>
        </react_native_1.View>);
    });
    return (<AttachmentCarouselPagerContext_1.default.Provider value={contextValue}>
            <react_native_gesture_handler_1.GestureDetector gesture={nativeGestureHandler}>
                <AnimatedPagerView pageMargin={40} offscreenPageLimit={1} onPageScroll={pageScrollHandler} onPageSelected={onPageSelected} style={styles.flex1} initialPage={initialPage} useNext={(0, shouldUseNewPager_1.default)()} animatedProps={animatedProps} ref={pagerRef}>
                    {carouselItems}
                </AnimatedPagerView>
            </react_native_gesture_handler_1.GestureDetector>
        </AttachmentCarouselPagerContext_1.default.Provider>);
}
AttachmentCarouselPager.displayName = 'AttachmentCarouselPager';
exports.default = react_1.default.forwardRef(AttachmentCarouselPager);
