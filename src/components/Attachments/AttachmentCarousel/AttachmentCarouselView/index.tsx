import CarouselActions from '@components/Attachments/AttachmentCarousel/CarouselActions';
import CarouselButtons from '@components/Attachments/AttachmentCarousel/CarouselButtons';
import CarouselItem from '@components/Attachments/AttachmentCarousel/CarouselItem';
import {AttachmentCarouselPagerActionsContext, AttachmentCarouselPagerStateContext} from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import type {AttachmentCarouselPagerActionsContextType, AttachmentCarouselPagerStateContextType} from '@components/Attachments/AttachmentCarousel/Pager/types';
import type {UpdatePageProps} from '@components/Attachments/AttachmentCarousel/types';
import useCarouselContextEvents from '@components/Attachments/AttachmentCarousel/useCarouselContextEvents';
import type {Attachment} from '@components/Attachments/types';
import BlockingView from '@components/BlockingViews/BlockingView';
import {useFullScreenState} from '@components/VideoPlayerContexts/FullScreenContextProvider';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ListRenderItemInfo} from 'react-native';
import type {PanGesture} from 'react-native-gesture-handler';

import React, {useEffect, useInsertionEffect, useLayoutEffect, useRef, useState} from 'react';
import {Keyboard, PixelRatio, View} from 'react-native';
import {GestureDetector, usePanGesture} from 'react-native-gesture-handler';
import Animated, {scrollTo, useAnimatedRef, useSharedValue} from 'react-native-reanimated';

import type AttachmentCarouselViewProps from './types';

const viewabilityConfig = {
    // To facilitate paging through the attachments, we want to consider an item "viewable" when it is
    // more than 95% visible. When that happens we update the page index in the state.
    itemVisiblePercentThreshold: 95,
};

const MIN_FLING_VELOCITY = 500;
const LAYOUT_TOLERANCE = 1;

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
    const {isFullScreen} = useFullScreenState();
    const isPagerScrolling = useSharedValue(false);
    const {handleTap, handleScaleChange, isScrollEnabled} = useCarouselContextEvents(setShouldShowArrows);

    const [activeAttachment, setActiveAttachment] = useState({identity: attachmentID ?? source, source, attachmentID});
    // External route changes can replace the selected attachment without changing its page index.
    if (activeAttachment.source !== source || activeAttachment.attachmentID !== attachmentID) {
        setActiveAttachment({identity: attachmentID ?? source, source, attachmentID});
    }
    const activeAttachmentID = activeAttachment.identity;

    const scrollRef = useAnimatedRef<Animated.FlatList<Attachment>>();

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const modalStyles = styles.centeredModalStyles(shouldUseNarrowLayout, true);
    const {windowWidth} = useWindowDimensions();

    const [listWidth, setListWidth] = useState<number>();
    const cellWidth = listWidth ?? PixelRatio.roundToNearestPixel(windowWidth - (modalStyles.marginHorizontal + modalStyles.borderWidth) * 2);
    const selectionRef = useRef({page, identity: attachmentID ?? source});
    const restoredWidthRef = useRef<number | undefined>(undefined);
    const restoreFrameRef = useRef<number | undefined>(undefined);
    const pagingRef = useRef<{
        restorePage: (shouldCheckNextFrame?: boolean) => void;
        updatePage: (info: UpdatePageProps) => void;
        updatePageFromScroll: () => void;
    } | null>(null);

    const getScrollNode = () => {
        const node: unknown = scrollRef.current?.getScrollableNode();
        return node instanceof HTMLElement ? node : undefined;
    };

    const restorePage = (shouldCheckNextFrame = true): void => {
        const node = getScrollNode();
        const width = node?.getBoundingClientRect().width;
        if (!node || !width) {
            return;
        }

        setListWidth(width);
        if (Math.abs(width - cellWidth) > LAYOUT_TOLERANCE) {
            restoredWidthRef.current = undefined;
            return;
        }
        if (isFullScreen || selectionRef.current.page < 0 || attachments.length === 0 || restoredWidthRef.current === width) {
            return;
        }

        // Restore against the new cell width, not FlatList's potentially stale cached item metrics.
        const offset = Math.min(selectionRef.current.page, attachments.length - 1) * cellWidth;
        scrollRef.current?.scrollToOffset({offset, animated: false});
        if (Math.abs(node.scrollLeft - offset) <= LAYOUT_TOLERANCE && node.scrollWidth >= offset + width - LAYOUT_TOLERANCE) {
            restoredWidthRef.current = width;
            return;
        }

        // Safari may apply the scroll after layout. Read it back even if no viewability/scroll event follows.
        // Content-size and scroll callbacks can retry if the virtualized content is not ready in that frame.
        if (shouldCheckNextFrame && restoreFrameRef.current === undefined) {
            restoreFrameRef.current = requestAnimationFrame(() => {
                restoreFrameRef.current = undefined;
                pagingRef.current?.restorePage(false);
            });
        }
    };

    const getSettledScrollNode = () => {
        const node = getScrollNode();
        const width = node?.getBoundingClientRect().width;
        if (!node || !width || isFullScreen) {
            return;
        }
        // Read live DOM geometry: RNW's cached layout and scroll metrics can still describe portrait.
        if (Math.abs(width - cellWidth) > LAYOUT_TOLERANCE || restoredWidthRef.current !== width) {
            restorePage();
            return;
        }
        return node;
    };

    const selectVisiblePage = (index: number, node: HTMLElement) => {
        const item = attachments.at(index);
        if (index < 0 || !item) {
            return;
        }
        const width = node.getBoundingClientRect().width;
        const visibleWidth = Math.min((index + 1) * cellWidth, node.scrollLeft + width) - Math.max(index * cellWidth, node.scrollLeft);
        if (visibleWidth + LAYOUT_TOLERANCE < (cellWidth * viewabilityConfig.itemVisiblePercentThreshold) / 100) {
            return;
        }
        const identity = item.attachmentID ?? item.source;
        if (selectionRef.current.page === index && selectionRef.current.identity === identity) {
            return;
        }

        // Update before notifying the parent so another event in the same frame cannot navigate twice.
        selectionRef.current = {page: index, identity};
        Keyboard.dismiss();
        setPage(index);
        setActiveAttachment({identity, source, attachmentID});
        onNavigate?.(item);
    };

    const updatePage = ({viewableItems}: UpdatePageProps) => {
        const node = getSettledScrollNode();
        const entry = viewableItems.length === 1 ? viewableItems.at(0) : undefined;
        if (!node || entry?.index == null) {
            return;
        }
        selectVisiblePage(entry.index, node);
    };

    const updatePageFromScroll = () => {
        const node = getSettledScrollNode();
        if (!node) {
            return;
        }
        // FlatList need not emit another visibility callback after a resize sample was rejected.
        selectVisiblePage(Math.round(node.scrollLeft / cellWidth), node);
    };

    useInsertionEffect(() => {
        // Descendant layout callbacks must see the committed width and handlers, not the previous render.
        pagingRef.current = {restorePage, updatePage, updatePageFromScroll};
    });
    useInsertionEffect(() => {
        selectionRef.current.page = page;
    }, [page]);
    useInsertionEffect(() => {
        selectionRef.current.identity = attachmentID ?? source;
    }, [attachmentID, source]);
    useInsertionEffect(() => {
        restoredWidthRef.current = undefined;
    }, [cellWidth]);

    // RNW FlatList requires the same callback for its lifetime; compiler memoization is not that contract.
    const [paging] = useState(() => ({
        restorePage: () => pagingRef.current?.restorePage(),
        updatePage: (info: UpdatePageProps) => pagingRef.current?.updatePage(info),
        updatePageFromScroll: () => pagingRef.current?.updatePageFromScroll(),
    }));

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

    useLayoutEffect(() => {
        paging.restorePage();
    }, [cellWidth, attachments.length, page, isFullScreen, paging]);

    useEffect(
        () => () => {
            if (restoreFrameRef.current === undefined) {
                return;
            }
            cancelAnimationFrame(restoreFrameRef.current);
        },
        [],
    );

    return (
        <View
            style={[styles.flex1, styles.attachmentCarouselContainer]}
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
                                <Animated.FlatList
                                    keyboardShouldPersistTaps="handled"
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    // scrolling is controlled by the pan gesture
                                    scrollEnabled={false}
                                    ref={scrollRef}
                                    initialScrollIndex={page}
                                    initialNumToRender={3}
                                    windowSize={5}
                                    maxToRenderPerBatch={CONST.MAX_TO_RENDER_PER_BATCH.CAROUSEL}
                                    data={attachments}
                                    renderItem={renderItem}
                                    getItemLayout={getItemLayout}
                                    keyExtractor={extractItemKey}
                                    viewabilityConfig={viewabilityConfig}
                                    onViewableItemsChanged={paging.updatePage}
                                    onLayout={paging.restorePage}
                                    onContentSizeChange={paging.restorePage}
                                    onScroll={paging.updatePageFromScroll}
                                />
                            </DeviceAwareGestureDetector>
                        </AttachmentCarouselPagerActionsContext.Provider>
                    </AttachmentCarouselPagerStateContext.Provider>
                    <CarouselActions onCycleThroughAttachments={cycleThroughAttachments} />
                </>
            )}
        </View>
    );
}

export default AttachmentCarouselView;
