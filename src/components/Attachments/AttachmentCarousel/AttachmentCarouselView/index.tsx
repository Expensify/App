import CarouselActions from '@components/Attachments/AttachmentCarousel/CarouselActions';
import CarouselButtons from '@components/Attachments/AttachmentCarousel/CarouselButtons';
import CarouselItem from '@components/Attachments/AttachmentCarousel/CarouselItem';
import {AttachmentCarouselPagerActionsContext, AttachmentCarouselPagerStateContext} from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import type {AttachmentCarouselPagerActionsContextType, AttachmentCarouselPagerStateContextType} from '@components/Attachments/AttachmentCarousel/Pager/types';
import useCarouselContextEvents from '@components/Attachments/AttachmentCarousel/useCarouselContextEvents';
import type {Attachment} from '@components/Attachments/types';
import BlockingView from '@components/BlockingViews/BlockingView';
import {useFullScreenState} from '@components/VideoPlayerContexts/FullScreenContextProvider';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {CellRendererProps} from '@src/types/utils/ReactNativeCompat';

import type {ListRenderItemInfo} from 'react-native';
import type {PanGesture} from 'react-native-gesture-handler';

import React, {useLayoutEffect, useRef, useState} from 'react';
import {FlatList, Keyboard, PixelRatio, View} from 'react-native';
import {GestureDetector, usePanGesture} from 'react-native-gesture-handler';
import {scrollTo, useAnimatedRef, useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

import type AttachmentCarouselViewProps from './types';

const MIN_FLING_VELOCITY = 500;

// Forward bubbling focus so the web list keeps the password input mounted while its render window moves during rotation.
function CarouselCell({children, style, onLayout, onFocusCapture}: CellRendererProps<Attachment>) {
    return (
        <View
            style={style}
            onLayout={onLayout}
            onFocus={({nativeEvent}) => {
                if (!(nativeEvent instanceof FocusEvent)) {
                    return;
                }
                onFocusCapture?.(nativeEvent);
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
}: AttachmentCarouselViewProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['ToddBehindCloud']);
    const canUseTouchScreen = canUseTouchScreenUtil();
    const {isFullScreen} = useFullScreenState();
    const isPagerScrolling = useSharedValue(false);
    const {handleTap, handleScaleChange, isScrollEnabled} = useCarouselContextEvents(setShouldShowArrows);

    const scrollRef = useAnimatedRef<FlatList<Attachment>>();

    // The modal's safe-area padding can make the carousel narrower than the window.
    // Wait for its actual width before mounting the list so visibility and paging use the same geometry.
    const [cellWidth, setCellWidth] = useState(0);
    const previousLayout = useRef<{page: number; width: number; attachments: Attachment[]} | null>(null);
    const gestureStartWidth = useSharedValue(0);
    const gestureStartPage = useSharedValue(page);

    // The parent owns selection. Layout and visibility changes must not navigate or unmount its PDF.
    const navigateToPage = (nextIndex: number) => {
        const item = attachments.at(nextIndex);
        if (isFullScreen || nextIndex < 0 || !item || nextIndex === page || !scrollRef.current) {
            return false;
        }

        Keyboard.dismiss();
        setPage(nextIndex);
        onNavigate?.(item);
        return true;
    };

    /** Increments or decrements the index to get another selected item, returning whether the carousel moved */
    const cycleThroughAttachments = (deltaSlide: number) => navigateToPage(page + deltaSlide);

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
        enabled: canUseTouchScreen && !isFullScreen && cellWidth > 0 && page >= 0,
        onActivate: () => {
            gestureStartWidth.set(cellWidth);
            gestureStartPage.set(page);
        },
        onUpdate: ({translationX}) => {
            if (!isScrollEnabled.get() || gestureStartWidth.get() !== cellWidth || gestureStartPage.get() !== page) {
                return;
            }

            if (translationX !== 0) {
                isPagerScrolling.set(true);
            }

            scrollTo(scrollRef, page * cellWidth - translationX, 0, false);
        },
        onDeactivate: ({translationX, velocityX, canceled}) => {
            isPagerScrolling.set(false);
            // A canceled or resized gesture has no navigation destination in the current geometry.
            if (canceled || !isScrollEnabled.get() || gestureStartWidth.get() !== cellWidth || gestureStartPage.get() !== page) {
                scrollTo(scrollRef, page * cellWidth, 0, false);
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

            if (newIndex === page) {
                scrollTo(scrollRef, page * cellWidth, 0, true);
                return;
            }

            scheduleOnRN(navigateToPage, newIndex);
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
    const renderItem = ({item, index}: ListRenderItemInfo<Attachment>) => (
        <View style={[styles.h100, {width: cellWidth}]}>
            <CarouselItem
                item={item}
                isFocused={page === index}
                onPress={canUseTouchScreen ? handleTap : undefined}
                isModalHovered={shouldShowArrows}
                reportID={report?.reportID}
            />
        </View>
    );

    // Animate page navigation, but realign immediately after resize or attachment replacement/reordering.
    useLayoutEffect(() => {
        if (!cellWidth || page < 0 || page >= attachments.length || scrollRef.current == null) {
            previousLayout.current = null;
            return;
        }

        const previous = previousLayout.current;
        const animated = canUseTouchScreen && previous?.width === cellWidth && previous.attachments === attachments && previous.page !== page;
        previousLayout.current = {page, width: cellWidth, attachments};
        scrollRef.current.scrollToIndex({index: page, animated});
    }, [attachments, canUseTouchScreen, cellWidth, page, scrollRef]);

    return (
        <View
            testID="attachment-carousel"
            style={[styles.flex1, styles.attachmentCarouselContainer]}
            onLayout={({nativeEvent: {layout}}) => {
                const width = PixelRatio.roundToNearestPixel(layout.width);
                if (width <= 0) {
                    return;
                }
                setCellWidth(width);
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
                                    <FlatList
                                        CellRendererComponent={CarouselCell}
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
                                        extraData={page}
                                        renderItem={renderItem}
                                        getItemLayout={getItemLayout}
                                        keyExtractor={extractItemKey}
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
