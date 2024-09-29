import isEqual from 'lodash/isEqual';
import type {MutableRefObject} from 'react';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {ListRenderItemInfo} from 'react-native';
import {Keyboard, PixelRatio, View} from 'react-native';
import type {GestureType} from 'react-native-gesture-handler';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useOnyx} from 'react-native-onyx';
import Animated, {scrollTo, useAnimatedRef, useSharedValue} from 'react-native-reanimated';
import type {Attachment, AttachmentSource} from '@components/Attachments/types';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import {useFullScreenContext} from '@components/VideoPlayerContexts/FullScreenContext';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import CarouselActions from './CarouselActions';
import CarouselButtons from './CarouselButtons';
import CarouselItem from './CarouselItem';
import extractAttachments from './extractAttachments';
import AttachmentCarouselPagerContext from './Pager/AttachmentCarouselPagerContext';
import type {AttachmentCarouselProps, UpdatePageProps} from './types';
import useCarouselArrows from './useCarouselArrows';
import useCarouselContextEvents from './useCarouselContextEvents';

const viewabilityConfig = {
    // To facilitate paging through the attachments, we want to consider an item "viewable" when it is
    // more than 95% visible. When that happens we update the page index in the state.
    itemVisiblePercentThreshold: 95,
};

const MIN_FLING_VELOCITY = 500;

function AttachmentCarousel({report, source, onNavigate, setDownloadButtonVisibility, type, accountID, onClose}: AttachmentCarouselProps) {
    const theme = useTheme();
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {isFullScreenRef} = useFullScreenContext();
    const scrollRef = useAnimatedRef<Animated.FlatList<ListRenderItemInfo<Attachment>>>();
    const nope = useSharedValue(false);
    const pagerRef = useRef<GestureType>(null);
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`, {canEvict: false});
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {canEvict: false});
    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();

    const modalStyles = styles.centeredModalStyles(shouldUseNarrowLayout, true);
    const cellWidth = useMemo(
        () => PixelRatio.roundToNearestPixel(windowWidth - (modalStyles.marginHorizontal + modalStyles.borderWidth) * 2),
        [modalStyles.borderWidth, modalStyles.marginHorizontal, windowWidth],
    );
    const [page, setPage] = useState(0);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [activeSource, setActiveSource] = useState<AttachmentSource | null>(source);
    const {shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows} = useCarouselArrows();
    const {handleTap, handleScaleChange, scale} = useCarouselContextEvents(setShouldShowArrows);

    useEffect(() => {
        if (!canUseTouchScreen) {
            return;
        }
        setShouldShowArrows(true);
    }, [canUseTouchScreen, page, setShouldShowArrows]);

    const compareImage = useCallback((attachment: Attachment) => attachment.source === source, [source]);

    useEffect(() => {
        const parentReportAction = report.parentReportActionID && parentReportActions ? parentReportActions[report.parentReportActionID] : undefined;
        let targetAttachments: Attachment[] = [];
        if (type === CONST.ATTACHMENT_TYPE.NOTE && accountID) {
            targetAttachments = extractAttachments(CONST.ATTACHMENT_TYPE.NOTE, {privateNotes: report.privateNotes, accountID});
        } else {
            targetAttachments = extractAttachments(CONST.ATTACHMENT_TYPE.REPORT, {parentReportAction, reportActions: reportActions ?? undefined});
        }

        if (isEqual(attachments, targetAttachments)) {
            if (attachments.length === 0) {
                setPage(-1);
                setDownloadButtonVisibility?.(false);
            }
            return;
        }

        let initialPage = targetAttachments.findIndex(compareImage);
        const prevInitialPage = attachments.findIndex(compareImage);

        if (initialPage === -1 && prevInitialPage !== -1 && targetAttachments[prevInitialPage]) {
            initialPage = prevInitialPage;
        }

        // If no matching attachment with the same index, dismiss the modal
        if (initialPage === -1 && prevInitialPage !== -1) {
            Navigation.dismissModal();
        } else {
            setPage(initialPage);
            setAttachments(targetAttachments);

            // Update the download button visibility in the parent modal
            if (setDownloadButtonVisibility) {
                setDownloadButtonVisibility(initialPage !== -1);
            }

            // Update the parent modal's state with the source and name from the mapped attachments
            if (targetAttachments[initialPage] !== undefined && onNavigate) {
                onNavigate(targetAttachments[initialPage]);
            }
        }
    }, [report.privateNotes, reportActions, parentReportActions, compareImage, report.parentReportActionID, attachments, setDownloadButtonVisibility, onNavigate, accountID, type]);

    // Scroll position is affected when window width is resized, so we readjust it on width changes
    useEffect(() => {
        if (attachments.length === 0 || scrollRef.current == null) {
            return;
        }

        scrollRef.current.scrollToIndex({index: page, animated: false});
        // The hook is not supposed to run on page change, so we keep the page out of the dependencies
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [cellWidth]);

    /** Updates the page state when the user navigates between attachments */
    const updatePage = useCallback(
        ({viewableItems}: UpdatePageProps) => {
            if (isFullScreenRef.current) {
                return;
            }

            Keyboard.dismiss();

            // Since we can have only one item in view at a time, we can use the first item in the array
            // to get the index of the current page
            const entry = viewableItems[0];
            if (!entry) {
                setActiveSource(null);
                return;
            }

            const item = entry.item as Attachment;
            if (entry.index !== null) {
                setPage(entry.index);
                setActiveSource(item.source);
            }

            if (onNavigate) {
                onNavigate(item);
            }
        },
        [isFullScreenRef, onNavigate],
    );

    /** Increments or decrements the index to get another selected item */
    const cycleThroughAttachments = useCallback(
        (deltaSlide: number) => {
            if (isFullScreenRef.current) {
                return;
            }

            const nextIndex = page + deltaSlide;
            const nextItem = attachments[nextIndex];

            if (!nextItem || !scrollRef.current) {
                return;
            }

            scrollRef.current.scrollToIndex({index: nextIndex, animated: canUseTouchScreen});
        },
        [attachments, canUseTouchScreen, isFullScreenRef, page, scrollRef],
    );

    const extractItemKey = useCallback(
        (item: Attachment, index: number) =>
            typeof item.source === 'string' || typeof item.source === 'number' ? `source-${item.source}` : `reportActionID-${item.reportActionID}` ?? `index-${index}`,
        [],
    );

    /** Calculate items layout information to optimize scrolling performance */
    const getItemLayout = useCallback(
        (data: ArrayLike<Attachment> | null | undefined, index: number) => ({
            length: cellWidth,
            offset: cellWidth * index,
            index,
        }),
        [cellWidth],
    );

    const context = useMemo(
        () => ({
            pagerItems: [{source, index: 0, isActive: true}],
            activePage: 0,
            pagerRef,
            isPagerScrolling: nope,
            isScrollEnabled: nope,
            onTap: handleTap,
            onScaleChanged: handleScaleChange,
            onSwipeDown: onClose,
        }),
        [source, nope, handleTap, handleScaleChange, onClose],
    );

    /** Defines how a single attachment should be rendered */
    const renderItem = useCallback(
        ({item}: ListRenderItemInfo<Attachment>) => (
            <View style={[styles.h100, {width: cellWidth}]}>
                <CarouselItem
                    item={item}
                    isFocused={activeSource === item.source}
                    onPress={canUseTouchScreen ? handleTap : undefined}
                    isModalHovered={shouldShowArrows}
                />
            </View>
        ),
        [activeSource, canUseTouchScreen, cellWidth, handleTap, shouldShowArrows, styles.h100],
    );
    /** Pan gesture handing swiping through attachments on touch screen devices */
    const pan = useMemo(
        () =>
            Gesture.Pan()
                .enabled(canUseTouchScreen)
                .onUpdate(({translationX}) => {
                    if (scale.current !== 1) {
                        return;
                    }

                    scrollTo(scrollRef, page * cellWidth - translationX, 0, false);
                })
                .onEnd(({translationX, velocityX}) => {
                    if (scale.current !== 1) {
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

                    scrollTo(scrollRef, newIndex * cellWidth, 0, true);
                })
                .withRef(pagerRef as MutableRefObject<GestureType | undefined>),
        [attachments.length, canUseTouchScreen, cellWidth, page, scale, scrollRef],
    );

    return (
        <View
            style={[styles.flex1, styles.attachmentCarouselContainer]}
            onMouseEnter={() => !canUseTouchScreen && setShouldShowArrows(true)}
            onMouseLeave={() => !canUseTouchScreen && setShouldShowArrows(false)}
        >
            {page === -1 ? (
                <BlockingView
                    icon={Illustrations.ToddBehindCloud}
                    iconColor={theme.offline}
                    iconWidth={variables.modalTopIconWidth}
                    iconHeight={variables.modalTopIconHeight}
                    title={translate('notFound.notHere')}
                />
            ) : (
                <>
                    <CarouselButtons
                        shouldShowArrows={shouldShowArrows}
                        page={page}
                        attachments={attachments}
                        onBack={() => cycleThroughAttachments(-1)}
                        onForward={() => cycleThroughAttachments(1)}
                        autoHideArrow={autoHideArrows}
                        cancelAutoHideArrow={cancelAutoHideArrows}
                    />
                    <AttachmentCarouselPagerContext.Provider value={context}>
                        <GestureDetector gesture={pan}>
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
                                onViewableItemsChanged={updatePage}
                            />
                        </GestureDetector>
                    </AttachmentCarouselPagerContext.Provider>

                    <CarouselActions onCycleThroughAttachments={cycleThroughAttachments} />
                </>
            )}
        </View>
    );
}

AttachmentCarousel.displayName = 'AttachmentCarousel';

export default AttachmentCarousel;
