import isEqual from 'lodash/isEqual';
import type {MutableRefObject} from 'react';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {ListRenderItemInfo} from 'react-native';
import {Keyboard, PixelRatio, View} from 'react-native';
import type {ComposedGesture, GestureType} from 'react-native-gesture-handler';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useOnyx} from 'react-native-onyx';
import Animated, {scrollTo, useAnimatedRef, useSharedValue} from 'react-native-reanimated';
import type {Attachment, AttachmentSource} from '@components/Attachments/types';
import BlockingView from '@components/BlockingViews/BlockingView';
import {ToddBehindCloud} from '@components/Icon/Illustrations';
import {useFullScreenContext} from '@components/VideoPlayerContexts/FullScreenContext';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';
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

function AttachmentCarousel({report, attachmentID, source, onNavigate, setDownloadButtonVisibility, type, accountID, onClose, attachmentLink}: AttachmentCarouselProps) {
    const theme = useTheme();
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {isFullScreenRef} = useFullScreenContext();
    const scrollRef = useAnimatedRef<Animated.FlatList<ListRenderItemInfo<Attachment>>>();
    const isPagerScrolling = useSharedValue(false);
    const pagerRef = useRef<GestureType>(null);
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`, {canEvict: false});
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {canEvict: false});
    const canUseTouchScreen = canUseTouchScreenUtil();

    const modalStyles = styles.centeredModalStyles(shouldUseNarrowLayout, true);
    const cellWidth = useMemo(
        () => PixelRatio.roundToNearestPixel(windowWidth - (modalStyles.marginHorizontal + modalStyles.borderWidth) * 2),
        [modalStyles.borderWidth, modalStyles.marginHorizontal, windowWidth],
    );
    const [page, setPage] = useState(0);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [activeAttachmentID, setActiveAttachmentID] = useState<AttachmentSource | null>(attachmentID ?? source);
    const {shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows} = useCarouselArrows();
    const {handleTap, handleScaleChange, isScrollEnabled} = useCarouselContextEvents(setShouldShowArrows);

    useEffect(() => {
        if (!canUseTouchScreen) {
            return;
        }
        setShouldShowArrows(true);
    }, [canUseTouchScreen, page, setShouldShowArrows]);

    const compareImage = useCallback(
        (attachment: Attachment) =>
            (attachmentID ? attachment.attachmentID === attachmentID : attachment.source === source) && (!attachmentLink || attachment.attachmentLink === attachmentLink),
        [attachmentLink, attachmentID, source],
    );

    useEffect(() => {
        const parentReportAction = report.parentReportActionID && parentReportActions ? parentReportActions[report.parentReportActionID] : undefined;
        let newAttachments: Attachment[] = [];
        if (type === CONST.ATTACHMENT_TYPE.NOTE && accountID) {
            newAttachments = extractAttachments(CONST.ATTACHMENT_TYPE.NOTE, {privateNotes: report.privateNotes, accountID, report});
        } else if (type === CONST.ATTACHMENT_TYPE.ONBOARDING) {
            newAttachments = extractAttachments(CONST.ATTACHMENT_TYPE.ONBOARDING, {parentReportAction, reportActions: reportActions ?? undefined, report});
        } else {
            newAttachments = extractAttachments(CONST.ATTACHMENT_TYPE.REPORT, {parentReportAction, reportActions: reportActions ?? undefined, report});
        }

        if (isEqual(attachments, newAttachments)) {
            if (attachments.length === 0) {
                setPage(-1);
                setDownloadButtonVisibility?.(false);
            }
            return;
        }

        let newIndex = newAttachments.findIndex(compareImage);
        const index = attachments.findIndex(compareImage);

        // If newAttachments includes an attachment with the same index, update newIndex to that index.
        // Previously, uploading an attachment offline would dismiss the modal when the image was previewed and the connection was restored.
        // Now, instead of dismissing the modal, we replace it with the new attachment that has the same index.
        if (newIndex === -1 && index !== -1 && newAttachments.at(index)) {
            newIndex = index;
        }

        // If no matching attachment with the same index, dismiss the modal
        if (newIndex === -1 && index !== -1 && attachments.at(index)) {
            Navigation.dismissModal();
        } else {
            setPage(newIndex);
            setAttachments(newAttachments);

            // Update the download button visibility in the parent modal
            if (setDownloadButtonVisibility) {
                setDownloadButtonVisibility(newIndex !== -1);
            }

            const attachment = newAttachments.at(newIndex);
            // Update the parent modal's state with the source and name from the mapped attachments
            if (newIndex !== -1 && attachment !== undefined && onNavigate) {
                onNavigate(attachment);
            }
        }
    }, [reportActions, parentReportActions, compareImage, attachments, setDownloadButtonVisibility, onNavigate, accountID, type, report]);

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
        [isFullScreenRef, onNavigate],
    );

    /** Increments or decrements the index to get another selected item */
    const cycleThroughAttachments = useCallback(
        (deltaSlide: number) => {
            if (isFullScreenRef.current) {
                return;
            }

            const nextIndex = page + deltaSlide;
            const nextItem = attachments.at(nextIndex);

            if (!nextItem || nextIndex < 0 || !scrollRef.current) {
                return;
            }

            scrollRef.current.scrollToIndex({index: nextIndex, animated: canUseTouchScreen});
        },
        [attachments, canUseTouchScreen, isFullScreenRef, page, scrollRef],
    );

    const extractItemKey = useCallback(
        (item: Attachment) =>
            !!item.attachmentID || (typeof item.source !== 'string' && typeof item.source !== 'number')
                ? `attachmentID-${item.attachmentID}`
                : `source-${item.source}|${item.attachmentLink}`,
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
            isPagerScrolling,
            isScrollEnabled,
            onTap: handleTap,
            onScaleChanged: handleScaleChange,
            onSwipeDown: onClose,
        }),
        [source, isPagerScrolling, isScrollEnabled, handleTap, handleScaleChange, onClose],
    );

    /** Defines how a single attachment should be rendered */
    const renderItem = useCallback(
        ({item}: ListRenderItemInfo<Attachment>) => (
            <View style={[styles.h100, {width: cellWidth}]}>
                <CarouselItem
                    item={item}
                    isFocused={activeAttachmentID === (item.attachmentID ?? item.source)}
                    onPress={canUseTouchScreen ? handleTap : undefined}
                    isModalHovered={shouldShowArrows}
                    reportID={report.reportID}
                />
            </View>
        ),
        [activeAttachmentID, canUseTouchScreen, cellWidth, handleTap, report.reportID, shouldShowArrows, styles.h100],
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
                })
                // eslint-disable-next-line react-compiler/react-compiler
                .withRef(pagerRef as MutableRefObject<GestureType | undefined>),
        [attachments.length, canUseTouchScreen, cellWidth, page, isScrollEnabled, scrollRef, isPagerScrolling],
    );

    return (
        <View
            style={[styles.flex1, styles.attachmentCarouselContainer]}
            onMouseEnter={() => !canUseTouchScreen && setShouldShowArrows(true)}
            onMouseLeave={() => !canUseTouchScreen && setShouldShowArrows(false)}
        >
            {page === -1 ? (
                <BlockingView
                    icon={ToddBehindCloud}
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
                                onViewableItemsChanged={updatePage}
                            />
                        </DeviceAwareGestureDetector>
                    </AttachmentCarouselPagerContext.Provider>

                    <CarouselActions onCycleThroughAttachments={cycleThroughAttachments} />
                </>
            )}
        </View>
    );
}

AttachmentCarousel.displayName = 'AttachmentCarousel';

export default AttachmentCarousel;
