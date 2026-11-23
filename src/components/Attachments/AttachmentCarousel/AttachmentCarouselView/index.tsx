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

import React, {useEffect, useInsertionEffect, useRef, useState} from 'react';
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

    const cellWidth = PixelRatio.roundToNearestPixel(windowWidth - (modalStyles.marginHorizontal + modalStyles.borderWidth) * 2);
    const currentPageRef = useRef(page);
    const updatePageRef = useRef<((info: UpdatePageProps) => void) | null>(null);

    const updatePage = ({viewableItems}: UpdatePageProps) => {
        // Resize can briefly report zero or several cells; neither sample represents navigation.
        if (isFullScreen || viewableItems.length !== 1) {
            return;
        }

        const entry = viewableItems.at(0);
        const item = entry?.item;
        if (!item || entry.index == null || entry.index < 0 || entry.index === currentPageRef.current) {
            return;
        }

        // Update before notifying the parent so another event in the same frame cannot navigate twice.
        currentPageRef.current = entry.index;
        Keyboard.dismiss();
        setPage(entry.index);
        setActiveAttachment({identity: item.attachmentID ?? item.source, source, attachmentID});
        onNavigate?.(item);
    };

    useInsertionEffect(() => {
        // FlatList's retained callback must use the latest committed props, including fullscreen state.
        updatePageRef.current = updatePage;
    });
    useInsertionEffect(() => {
        currentPageRef.current = page;
    }, [page]);

    // RNW FlatList requires the same callback for its lifetime; compiler memoization is not that contract.
    const [onViewableItemsChanged] = useState(() => (info: UpdatePageProps) => updatePageRef.current?.(info));

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
    useEffect(() => {
        if (page < 0 || attachments.length === 0 || scrollRef.current == null) {
            return;
        }

        scrollRef.current.scrollToIndex({index: page, animated: false});
        // The hook is not supposed to run on page change, so we keep the page out of the dependencies
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cellWidth]);

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
                                    // A wider buffer reduces selected-cell unmounts during resize without disabling virtualization.
                                    windowSize={9}
                                    maxToRenderPerBatch={CONST.MAX_TO_RENDER_PER_BATCH.CAROUSEL}
                                    data={attachments}
                                    renderItem={renderItem}
                                    getItemLayout={getItemLayout}
                                    keyExtractor={extractItemKey}
                                    viewabilityConfig={viewabilityConfig}
                                    onViewableItemsChanged={onViewableItemsChanged}
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
