"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var react_native_reanimated_1 = require("react-native-reanimated");
var CarouselActions_1 = require("@components/Attachments/AttachmentCarousel/CarouselActions");
var CarouselButtons_1 = require("@components/Attachments/AttachmentCarousel/CarouselButtons");
var CarouselItem_1 = require("@components/Attachments/AttachmentCarousel/CarouselItem");
var AttachmentCarouselPagerContext_1 = require("@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext");
var useCarouselContextEvents_1 = require("@components/Attachments/AttachmentCarousel/useCarouselContextEvents");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Illustrations = require("@components/Icon/Illustrations");
var FullScreenContext_1 = require("@components/VideoPlayerContexts/FullScreenContext");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var viewabilityConfig = {
    // To facilitate paging through the attachments, we want to consider an item "viewable" when it is
    // more than 95% visible. When that happens we update the page index in the state.
    itemVisiblePercentThreshold: 95,
};
var MIN_FLING_VELOCITY = 500;
function DeviceAwareGestureDetector(_a) {
    var canUseTouchScreen = _a.canUseTouchScreen, gesture = _a.gesture, children = _a.children;
    // Don't render GestureDetector on non-touchable devices to prevent unexpected pointer event capture.
    // This issue is left out on touchable devices since finger touch works fine.
    // See: https://github.com/Expensify/App/issues/51246
    return canUseTouchScreen ? <react_native_gesture_handler_1.GestureDetector gesture={gesture}>{children}</react_native_gesture_handler_1.GestureDetector> : children;
}
function AttachmentCarouselView(_a) {
    var page = _a.page, attachments = _a.attachments, shouldShowArrows = _a.shouldShowArrows, source = _a.source, report = _a.report, autoHideArrows = _a.autoHideArrows, cancelAutoHideArrow = _a.cancelAutoHideArrow, setShouldShowArrows = _a.setShouldShowArrows, onAttachmentError = _a.onAttachmentError, onNavigate = _a.onNavigate, onClose = _a.onClose, setPage = _a.setPage, attachmentID = _a.attachmentID;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var canUseTouchScreen = (0, DeviceCapabilities_1.canUseTouchScreen)();
    var isFullScreenRef = (0, FullScreenContext_1.useFullScreenContext)().isFullScreenRef;
    var isPagerScrolling = (0, react_native_reanimated_1.useSharedValue)(false);
    var _b = (0, useCarouselContextEvents_1.default)(setShouldShowArrows), handleTap = _b.handleTap, handleScaleChange = _b.handleScaleChange, isScrollEnabled = _b.isScrollEnabled;
    var _c = (0, react_1.useState)(attachmentID !== null && attachmentID !== void 0 ? attachmentID : source), activeAttachmentID = _c[0], setActiveAttachmentID = _c[1];
    var pagerRef = (0, react_1.useRef)(null);
    var scrollRef = (0, react_native_reanimated_1.useAnimatedRef)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var modalStyles = styles.centeredModalStyles(shouldUseNarrowLayout, true);
    var windowWidth = (0, useWindowDimensions_1.default)().windowWidth;
    var cellWidth = (0, react_1.useMemo)(function () { return react_native_1.PixelRatio.roundToNearestPixel(windowWidth - (modalStyles.marginHorizontal + modalStyles.borderWidth) * 2); }, [modalStyles.borderWidth, modalStyles.marginHorizontal, windowWidth]);
    /** Updates the page state when the user navigates between attachments */
    var updatePage = (0, react_1.useCallback)(function (_a) {
        var _b;
        var viewableItems = _a.viewableItems;
        if (isFullScreenRef.current) {
            return;
        }
        react_native_1.Keyboard.dismiss();
        // Since we can have only one item in view at a time, we can use the first item in the array
        // to get the index of the current page
        var entry = viewableItems.at(0);
        if (!entry) {
            setActiveAttachmentID(null);
            return;
        }
        var item = entry.item;
        if (entry.index !== null) {
            setPage(entry.index);
            setActiveAttachmentID((_b = item.attachmentID) !== null && _b !== void 0 ? _b : item.source);
        }
        if (onNavigate) {
            onNavigate(item);
        }
    }, [isFullScreenRef, onNavigate, setPage, setActiveAttachmentID]);
    /** Increments or decrements the index to get another selected item */
    var cycleThroughAttachments = (0, react_1.useCallback)(function (deltaSlide) {
        if (isFullScreenRef.current) {
            return;
        }
        var nextIndex = page + deltaSlide;
        var nextItem = attachments.at(nextIndex);
        if (!nextItem || nextIndex < 0 || !scrollRef.current) {
            return;
        }
        scrollRef.current.scrollToIndex({ index: nextIndex, animated: canUseTouchScreen });
    }, [attachments, canUseTouchScreen, isFullScreenRef, page, scrollRef]);
    var extractItemKey = (0, react_1.useCallback)(function (item) {
        return !!item.attachmentID || (typeof item.source !== 'string' && typeof item.source !== 'number')
            ? "attachmentID-".concat(item.attachmentID)
            : "source-".concat(item.source, "|").concat(item.attachmentLink);
    }, []);
    /** Calculate items layout information to optimize scrolling performance */
    var getItemLayout = (0, react_1.useCallback)(function (data, index) { return ({
        length: cellWidth,
        offset: cellWidth * index,
        index: index,
    }); }, [cellWidth]);
    var context = (0, react_1.useMemo)(function () { return ({
        pagerItems: [{ source: source, index: 0, isActive: true }],
        activePage: 0,
        pagerRef: pagerRef,
        isPagerScrolling: isPagerScrolling,
        isScrollEnabled: isScrollEnabled,
        onTap: handleTap,
        onScaleChanged: handleScaleChange,
        onSwipeDown: onClose,
        onAttachmentError: onAttachmentError,
    }); }, [onAttachmentError, source, isPagerScrolling, isScrollEnabled, handleTap, handleScaleChange, onClose]);
    /** Defines how a single attachment should be rendered */
    var renderItem = (0, react_1.useCallback)(function (_a) {
        var _b;
        var item = _a.item;
        return (<react_native_1.View style={[styles.h100, { width: cellWidth }]}>
                <CarouselItem_1.default item={item} isFocused={activeAttachmentID === ((_b = item.attachmentID) !== null && _b !== void 0 ? _b : item.source)} onPress={canUseTouchScreen ? handleTap : undefined} isModalHovered={shouldShowArrows} reportID={report === null || report === void 0 ? void 0 : report.reportID}/>
            </react_native_1.View>);
    }, [activeAttachmentID, canUseTouchScreen, cellWidth, handleTap, report === null || report === void 0 ? void 0 : report.reportID, shouldShowArrows, styles.h100]);
    /** Pan gesture handing swiping through attachments on touch screen devices */
    var pan = (0, react_1.useMemo)(function () {
        return react_native_gesture_handler_1.Gesture.Pan()
            .enabled(canUseTouchScreen)
            .onUpdate(function (_a) {
            var translationX = _a.translationX;
            if (!isScrollEnabled.get()) {
                return;
            }
            if (translationX !== 0) {
                isPagerScrolling.set(true);
            }
            (0, react_native_reanimated_1.scrollTo)(scrollRef, page * cellWidth - translationX, 0, false);
        })
            .onEnd(function (_a) {
            var translationX = _a.translationX, velocityX = _a.velocityX;
            if (!isScrollEnabled.get()) {
                return;
            }
            var newIndex;
            if (velocityX > MIN_FLING_VELOCITY) {
                // User flung to the right
                newIndex = Math.max(0, page - 1);
            }
            else if (velocityX < -MIN_FLING_VELOCITY) {
                // User flung to the left
                newIndex = Math.min(attachments.length - 1, page + 1);
            }
            else {
                // snap scroll position to the nearest cell (making sure it's within the bounds of the list)
                var delta = Math.round(-translationX / cellWidth);
                newIndex = Math.min(attachments.length - 1, Math.max(0, page + delta));
            }
            isPagerScrolling.set(false);
            (0, react_native_reanimated_1.scrollTo)(scrollRef, newIndex * cellWidth, 0, true);
        })
            // eslint-disable-next-line react-compiler/react-compiler
            .withRef(pagerRef);
    }, [attachments.length, canUseTouchScreen, cellWidth, page, isScrollEnabled, scrollRef, isPagerScrolling]);
    // Scroll position is affected when window width is resized, so we readjust it on width changes
    (0, react_1.useEffect)(function () {
        if (attachments.length === 0 || scrollRef.current == null) {
            return;
        }
        scrollRef.current.scrollToIndex({ index: page, animated: false });
        // The hook is not supposed to run on page change, so we keep the page out of the dependencies
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [cellWidth]);
    return (<react_native_1.View style={[styles.flex1, styles.attachmentCarouselContainer]} onMouseEnter={function () { return !canUseTouchScreen && setShouldShowArrows(true); }} onMouseLeave={function () { return !canUseTouchScreen && setShouldShowArrows(false); }}>
            {page === -1 ? (<BlockingView_1.default icon={Illustrations.ToddBehindCloud} iconWidth={variables_1.default.modalTopIconWidth} iconHeight={variables_1.default.modalTopIconHeight} title={translate('notFound.notHere')}/>) : (<>
                    <CarouselButtons_1.default page={page} attachments={attachments} shouldShowArrows={shouldShowArrows} onBack={function () { return cycleThroughAttachments(-1); }} onForward={function () { return cycleThroughAttachments(1); }} autoHideArrow={autoHideArrows} cancelAutoHideArrow={cancelAutoHideArrow}/>
                    <AttachmentCarouselPagerContext_1.default.Provider value={context}>
                        <DeviceAwareGestureDetector canUseTouchScreen={canUseTouchScreen} gesture={pan}>
                            <react_native_reanimated_1.default.FlatList keyboardShouldPersistTaps="handled" horizontal showsHorizontalScrollIndicator={false} 
        // scrolling is controlled by the pan gesture
        scrollEnabled={false} ref={scrollRef} initialScrollIndex={page} initialNumToRender={3} windowSize={5} maxToRenderPerBatch={CONST_1.default.MAX_TO_RENDER_PER_BATCH.CAROUSEL} data={attachments} renderItem={renderItem} getItemLayout={getItemLayout} keyExtractor={extractItemKey} viewabilityConfig={viewabilityConfig} onViewableItemsChanged={updatePage}/>
                        </DeviceAwareGestureDetector>
                    </AttachmentCarouselPagerContext_1.default.Provider>
                    <CarouselActions_1.default onCycleThroughAttachments={cycleThroughAttachments}/>
                </>)}
        </react_native_1.View>);
}
AttachmentCarouselView.displayName = 'AttachmentCarouselView';
exports.default = AttachmentCarouselView;
