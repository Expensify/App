import CarouselActions from '@components/Attachments/AttachmentCarousel/CarouselActions';
import CarouselButtons from '@components/Attachments/AttachmentCarousel/CarouselButtons';
import CarouselItem from '@components/Attachments/AttachmentCarousel/CarouselItem';
import {AttachmentCarouselPagerActionsContext, AttachmentCarouselPagerStateContext} from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import type {AttachmentCarouselPagerActionsContextType, AttachmentCarouselPagerStateContextType} from '@components/Attachments/AttachmentCarousel/Pager/types';
import type {UpdatePageProps} from '@components/Attachments/AttachmentCarousel/types';
import useCarouselContextEvents from '@components/Attachments/AttachmentCarousel/useCarouselContextEvents';
import type {Attachment, AttachmentSource} from '@components/Attachments/types';
import BlockingView from '@components/BlockingViews/BlockingView';
import {useFullScreenState} from '@components/VideoPlayerContexts/FullScreenContextProvider';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {CellRendererProps, ListRenderItemInfo} from 'react-native';
import type {PanGesture} from 'react-native-gesture-handler';

import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {FlatList, Keyboard, PixelRatio, View} from 'react-native';
import {GestureDetector, usePanGesture} from 'react-native-gesture-handler';
import Animated, {scrollTo, useAnimatedRef, useSharedValue} from 'react-native-reanimated';

import type AttachmentCarouselViewProps from './types';

const viewabilityConfig = {
    // To facilitate paging through the attachments, we want to consider an item "viewable" when it is
    // more than 95% visible. When that happens we update the page index in the state.
    itemVisiblePercentThreshold: 95,
};

const MIN_FLING_VELOCITY = 500;
// Animate the standard list without replacing its web cell focus handling.
// eslint-disable-next-line @typescript-eslint/no-deprecated -- Animated.FlatList drops the cell focus callback required to retain the password form.
const AnimatedAttachmentList = Animated.createAnimatedComponent(FlatList<Attachment>);

// react-native-web's View drops onFocusCapture. Bridge the callback so VirtualizedList
// keeps the focused PDF cell mounted while the carousel is resized.
function AttachmentCarouselCell({children, style, onLayout, onFocusCapture}: CellRendererProps<Attachment>) {
    return (
        <View
            style={style}
            onLayout={onLayout}
            onFocus={(event) => {
                if (!(event.nativeEvent instanceof FocusEvent)) {
                    return;
                }
                onFocusCapture?.(event.nativeEvent);
            }}
        >
            {children}
        </View>
    );
}

type DeviceAwareGestureDetectorProps = {
    canUseTouchScreen: boolean;
    gesture: PanGesture;
    children: React.ReactNode;
};

function DeviceAwareGestureDetector({canUseTouchScreen, gesture, children}: DeviceAwareGestureDetectorProps) {
    // Don't render GestureDetector on non-touchable devices to prevent unexpected pointer event capture.
    // This issue is left out on touchable devices since finger touch works fine.
    // See: https://github.com/Expensify/App/issues/51246
    return canUseTouchScreen ? <GestureDetector gesture={gesture}>{children}</GestureDetector> : children;
}

function AttachmentCarouselView({
    page,
    attachments,
    shouldShowArrows,
    source,
    report,
    autoHideArrows,
    cancelAutoHideArrow,
    setShouldShowArrows,
    onAttachmentError,
    onNavigate,
    onSwipeDown,
    setPage,
    attachmentID,
}: AttachmentCarouselViewProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['ToddBehindCloud']);
    const canUseTouchScreen = canUseTouchScreenUtil();
    const {isFullScreen, isFullScreenRef} = useFullScreenState();
    const isPagerScrolling = useSharedValue(false);
    const {handleTap, handleScaleChange, isScrollEnabled} = useCarouselContextEvents(setShouldShowArrows);

    const [activeAttachmentID, setActiveAttachmentID] = useState<AttachmentSource>(attachmentID ?? source);
    // Keep the current selection available to viewability callbacks without waiting for a render.
    const activeAttachmentIDRef = useRef(activeAttachmentID);

    const scrollRef = useAnimatedRef<FlatList<Attachment>>();

    // The modal's safe-area padding can make the carousel narrower than the window.
    // Wait for its actual width before mounting the list so visibility and paging use the same geometry.
    const [cellWidth, setCellWidth] = useState(0);
    const onNavigateRef = useRef(onNavigate);
    useEffect(() => {
        onNavigateRef.current = onNavigate;
    }, [onNavigate]);

    // FlatList requires this callback to keep the same identity for the lifetime of the list.
    // A lazy state initializer creates it once without useCallback, which is handled by the React Compiler.
    const [updatePage] = useState<(props: UpdatePageProps) => void>(() => ({viewableItems}: UpdatePageProps) => {
        if (isFullScreenRef.current) {
            return;
        }

        // During a resize Safari can expose several old-width cells at once.
        // A still-visible selected attachment is not a navigation request.
        if (viewableItems.some((entry) => (entry.item.attachmentID ?? entry.item.source) === activeAttachmentIDRef.current)) {
            return;
        }
        const entry = viewableItems.at(0);
        // Resizing or scrolling between pages can temporarily leave no item above the visibility threshold.
        // Keep the current attachment mounted until another attachment becomes viewable.
        if (!entry || entry.index == null) {
            return;
        }

        const item = entry.item;
        const nextAttachmentID = item.attachmentID ?? item.source;
        if (activeAttachmentIDRef.current === nextAttachmentID) {
            return;
        }

        Keyboard.dismiss();
        activeAttachmentIDRef.current = nextAttachmentID;
        setPage(entry.index);
        setActiveAttachmentID(nextAttachmentID);

        onNavigateRef.current?.(item);
    });

    /** Increments or decrements the index to get another selected item, returning whether the carousel moved */
    const cycleThroughAttachments = (deltaSlide: number) => {
        if (isFullScreen) {
            return false;
        }

        const nextIndex = page + deltaSlide;
        const nextItem = attachments.at(nextIndex);

        if (!nextItem || nextIndex < 0 || !scrollRef.current) {
            return false;
        }

        scrollRef.current.scrollToIndex({index: nextIndex, animated: canUseTouchScreen});
        return true;
    };

    const extractItemKey = (item: Attachment) =>
        !!item.attachmentID || (typeof item.source !== 'string' && typeof item.source !== 'number') ? `attachmentID-${item.attachmentID}` : `source-${item.source}|${item.attachmentLink}`;

    /** Calculate items layout information to optimize scrolling performance */
    const getItemLayout = (data: ArrayLike<Attachment> | null | undefined, index: number) => ({
        length: cellWidth,
        offset: cellWidth * index,
        index,
    });

    /** Pan gesture handling swiping through attachments on touch screen devices */
    const pan = usePanGesture({
        enabled: canUseTouchScreen,
        onUpdate: ({translationX}) => {
            if (!isScrollEnabled.get()) {
                return;
            }

            if (translationX !== 0) {
                isPagerScrolling.set(true);
            }

            scrollTo(scrollRef, page * cellWidth - translationX, 0, false);
        },
        onDeactivate: ({translationX, velocityX}) => {
            if (!isScrollEnabled.get()) {
                return;
            }

            let newIndex;
            if (velocityX > MIN_FLING_VELOCITY) {
                // User flung to the right
                newIndex = Math.max(0, page - 1);
            } else if (velocityX < -MIN_FLING_VELOCITY) {
                // User flung to the left
                newIndex = Math.min(attachments.length - 1, page + 1);
            } else {
                // snap scroll position to the nearest cell (making sure it's within the bounds of the list)
                const delta = Math.round(-translationX / cellWidth);
                newIndex = Math.min(attachments.length - 1, Math.max(0, page + delta));
            }

            isPagerScrolling.set(false);
            scrollTo(scrollRef, newIndex * cellWidth, 0, true);
        },
    });

    const stateValue: AttachmentCarouselPagerStateContextType = {
        pagerItems: [{source, index: 0, isActive: true}],
        activePage: 0,
        pagerRef: scrollRef,
        pagerGesture: pan,
        isPagerScrolling,
        isScrollEnabled,
    };

    const actionsValue: AttachmentCarouselPagerActionsContextType = {
        onTap: handleTap,
        onScaleChanged: handleScaleChange,
        onSwipeDown,
        onAttachmentError,
    };

    /** Defines how a single attachment should be rendered */
    const renderItem = ({item}: ListRenderItemInfo<Attachment>) => (
        <View style={[styles.h100, {width: cellWidth}]}>
            <CarouselItem
                item={item}
                isFocused={activeAttachmentID === (item.attachmentID ?? item.source)}
                onPress={canUseTouchScreen ? handleTap : undefined}
                isModalHovered={shouldShowArrows}
                reportID={report?.reportID}
            />
        </View>
    );

    // Scroll position is affected when window width is resized, so we readjust it on width changes
    useLayoutEffect(() => {
        if (!cellWidth || attachments.length === 0 || scrollRef.current == null) {
            return;
        }

        scrollRef.current.scrollToIndex({index: page, animated: false});
        // The hook is not supposed to run on page change, so we keep the page out of the dependencies
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cellWidth]);

    return (
        <View
            testID="attachment-carousel"
            style={[styles.flex1, styles.attachmentCarouselContainer]}
            onLayout={({nativeEvent: {layout}}) => {
                const width = PixelRatio.roundToNearestPixel(layout.width);
                if (width <= 0) {
                    return;
                }
                setCellWidth((previousWidth) => (previousWidth === width ? previousWidth : width));
            }}
            onMouseEnter={() => !canUseTouchScreen && setShouldShowArrows(true)}
            onMouseLeave={() => !canUseTouchScreen && setShouldShowArrows(false)}
        >
            {page === -1 ? (
                <BlockingView
                    icon={illustrations.ToddBehindCloud}
                    iconWidth={variables.modalTopIconWidth}
                    iconHeight={variables.modalTopIconHeight}
                    title={translate('notFound.notHere')}
                />
            ) : (
                cellWidth > 0 && (
                    <>
                        <CarouselButtons
                            page={page}
                            attachments={attachments}
                            shouldShowArrows={shouldShowArrows}
                            onBack={() => cycleThroughAttachments(-1)}
                            onForward={() => cycleThroughAttachments(1)}
                            autoHideArrow={autoHideArrows}
                            cancelAutoHideArrow={cancelAutoHideArrow}
                        />
                        <AttachmentCarouselPagerStateContext.Provider value={stateValue}>
                            <AttachmentCarouselPagerActionsContext.Provider value={actionsValue}>
                                <DeviceAwareGestureDetector
                                    canUseTouchScreen={canUseTouchScreen}
                                    gesture={pan}
                                >
                                    <AnimatedAttachmentList
                                        keyboardShouldPersistTaps="handled"
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        scrollEventThrottle={1}
                                        // scrolling is controlled by the pan gesture
                                        scrollEnabled={false}
                                        ref={scrollRef}
                                        initialScrollIndex={page}
                                        initialNumToRender={3}
                                        windowSize={5}
                                        maxToRenderPerBatch={CONST.MAX_TO_RENDER_PER_BATCH.CAROUSEL}
                                        CellRendererComponent={AttachmentCarouselCell}
                                        data={attachments}
                                        renderItem={renderItem}
                                        getItemLayout={getItemLayout}
                                        keyExtractor={extractItemKey}
                                        viewabilityConfig={viewabilityConfig}
                                        onViewableItemsChanged={updatePage}
                                    />
                                </DeviceAwareGestureDetector>
                            </AttachmentCarouselPagerActionsContext.Provider>
                        </AttachmentCarouselPagerStateContext.Provider>
                        <CarouselActions onCycleThroughAttachments={cycleThroughAttachments} />
                    </>
                )
            )}
        </View>
    );
}

export default AttachmentCarouselView;
