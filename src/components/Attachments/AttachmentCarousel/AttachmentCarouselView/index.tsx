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
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

import variables from '@styles/variables';

import type {LegendListRef, LegendListRenderItemProps} from '@legendapp/list/react-native';
import type {RefObject} from 'react';
import type {ComposedGesture, GestureType} from 'react-native-gesture-handler';
import type Animated from 'react-native-reanimated';

import {AnimatedLegendList} from '@legendapp/list/reanimated';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Keyboard, PixelRatio, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {scrollTo, useAnimatedRef, useSharedValue} from 'react-native-reanimated';

import type AttachmentCarouselViewProps from './types';

import getAttachmentCarouselPageIndex from './getAttachmentCarouselPageIndex';

const viewabilityConfig = {
    // To facilitate paging through the attachments, we want to consider an item "viewable" when it is
    // more than 95% visible. When that happens we update the page index in the state.
    itemVisiblePercentThreshold: 95,
};

type DeviceAwareGestureDetectorProps = {
    canUseTouchScreen: boolean;
    gesture: ComposedGesture | GestureType;
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

    const [activeAttachmentID, setActiveAttachmentID] = useState<AttachmentSource | null>(attachmentID ?? source);

    const pagerRef = useRef<GestureType>(null);
    const listRef = useRef<LegendListRef>(null);
    const scrollRef = useAnimatedRef<React.ComponentRef<typeof Animated.ScrollView>>();

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const modalStyles = styles.centeredModalStyles(shouldUseNarrowLayout, true);
    const {windowWidth} = useWindowDimensions();

    const cellWidth = useMemo(
        () => PixelRatio.roundToNearestPixel(windowWidth - (modalStyles.marginHorizontal + modalStyles.borderWidth) * 2),
        [modalStyles.borderWidth, modalStyles.marginHorizontal, windowWidth],
    );

    /** Updates the page state when the user navigates between attachments */
    const updatePage = useCallback(
        ({viewableItems}: UpdatePageProps) => {
            if (isFullScreenRef.current) {
                return;
            }

            Keyboard.dismiss();

            // Since we can have only one item in view at a time, we can use the first item in the array
            // to get the index of the current page
            const entry = viewableItems.at(0);
            if (!entry) {
                setActiveAttachmentID(null);
                return;
            }

            const item = entry.item as Attachment;
            if (entry.index !== null) {
                setPage(entry.index);
                setActiveAttachmentID(item.attachmentID ?? item.source);
            }

            if (onNavigate) {
                onNavigate(item);
            }
        },
        [isFullScreenRef, onNavigate, setPage, setActiveAttachmentID],
    );

    /** Increments or decrements the index to get another selected item */
    const cycleThroughAttachments = useCallback(
        (deltaSlide: number) => {
            if (isFullScreen) {
                return;
            }

            const nextIndex = page + deltaSlide;
            const nextItem = attachments.at(nextIndex);

            if (!nextItem || nextIndex < 0 || !listRef.current) {
                return;
            }

            listRef.current.scrollToIndex({index: nextIndex, animated: canUseTouchScreen});
        },
        [attachments, canUseTouchScreen, isFullScreen, page],
    );

    const extractItemKey = useCallback(
        (item: Attachment) =>
            !!item.attachmentID || (typeof item.source !== 'string' && typeof item.source !== 'number')
                ? `attachmentID-${item.attachmentID}`
                : `source-${item.source}|${item.attachmentLink}`,
        [],
    );

    const stateValue = useMemo<AttachmentCarouselPagerStateContextType>(
        () => ({
            pagerItems: [{source, index: 0, isActive: true}],
            activePage: 0,
            pagerRef,
            isPagerScrolling,
            isScrollEnabled,
        }),
        [source, isPagerScrolling, isScrollEnabled],
    );

    const actionsValue = useMemo<AttachmentCarouselPagerActionsContextType>(
        () => ({
            onTap: handleTap,
            onScaleChanged: handleScaleChange,
            onSwipeDown,
            onAttachmentError,
        }),
        [handleTap, handleScaleChange, onSwipeDown, onAttachmentError],
    );

    /** Defines how a single attachment should be rendered */
    const renderItem = useCallback(
        ({item}: LegendListRenderItemProps<Attachment>) => (
            <View style={[styles.h100, {width: cellWidth}]}>
                <CarouselItem
                    item={item}
                    isFocused={activeAttachmentID === (item.attachmentID ?? item.source)}
                    onPress={canUseTouchScreen ? handleTap : undefined}
                    isModalHovered={shouldShowArrows}
                    reportID={report?.reportID}
                />
            </View>
        ),
        [activeAttachmentID, canUseTouchScreen, cellWidth, handleTap, report?.reportID, shouldShowArrows, styles.h100],
    );
    /** Pan gesture handing swiping through attachments on touch screen devices */
    const pan = useMemo(
        () =>
            Gesture.Pan()
                .enabled(canUseTouchScreen)
                .onUpdate(({translationX}) => {
                    if (!isScrollEnabled.get()) {
                        return;
                    }

                    if (translationX !== 0) {
                        isPagerScrolling.set(true);
                    }

                    scrollTo(scrollRef, page * cellWidth - translationX, 0, false);
                })
                .onEnd(({translationX, velocityX}) => {
                    if (!isScrollEnabled.get()) {
                        return;
                    }

                    const newIndex = getAttachmentCarouselPageIndex({cellWidth, itemCount: attachments.length, page, translationX, velocityX});

                    isPagerScrolling.set(false);
                    scrollTo(scrollRef, newIndex * cellWidth, 0, true);
                })
                .withRef(pagerRef as RefObject<GestureType | undefined>),
        [attachments.length, canUseTouchScreen, cellWidth, page, isScrollEnabled, scrollRef, isPagerScrolling],
    );

    // Scroll position is affected when window width is resized, so we readjust it on width changes
    useEffect(() => {
        if (attachments.length === 0 || listRef.current == null) {
            return;
        }

        listRef.current.scrollToIndex({index: page, animated: false});
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
                                <AnimatedLegendList
                                    keyboardShouldPersistTaps="handled"
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    // scrolling is controlled by the pan gesture
                                    scrollEnabled={false}
                                    ref={listRef}
                                    refScrollView={scrollRef}
                                    initialScrollIndex={page}
                                    data={attachments}
                                    extraData={renderItem}
                                    renderItem={renderItem}
                                    getFixedItemSize={() => cellWidth}
                                    keyExtractor={extractItemKey}
                                    viewabilityConfig={viewabilityConfig}
                                    onViewableItemsChanged={updatePage}
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

// OXC's React Compiler bails on this file (refs accessed during render in gesture handlers), so it
// is not memoized on web. Memoize it explicitly to keep parent-driven re-renders cheap there.
export default React.memo(AttachmentCarouselView);
