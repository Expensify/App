import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {ListRenderItemInfo} from 'react-native';
import {FlatList, Keyboard, PixelRatio, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {Attachment, AttachmentSource} from '@components/Attachments/types';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import AttachmentCarouselCellRenderer from './AttachmentCarouselCellRenderer';
import CarouselActions from './CarouselActions';
import CarouselButtons from './CarouselButtons';
import CarouselItem from './CarouselItem';
import extractAttachmentsFromReport from './extractAttachmentsFromReport';
import type {AttachmentCaraouselOnyxProps, AttachmentCarouselProps, UpdatePageProps} from './types';
import useCarouselArrows from './useCarouselArrows';

const viewabilityConfig = {
    // To facilitate paging through the attachments, we want to consider an item "viewable" when it is
    // more than 95% visible. When that happens we update the page index in the state.
    itemVisiblePercentThreshold: 95,
};

function AttachmentCarousel({report, reportActions, parentReportActions, source, onNavigate = () => {}, setDownloadButtonVisibility = () => {}}: AttachmentCarouselProps) {
    const theme = useTheme();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const scrollRef = useRef<FlatList>(null);

    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();

    const [containerWidth, setContainerWidth] = useState(0);
    const [page, setPage] = useState(0);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [activeSource, setActiveSource] = useState<AttachmentSource | undefined | null>(source);
    const {shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows} = useCarouselArrows();

    const compareImage = useCallback((attachment: Attachment) => attachment.source === source, [source]);

    useEffect(() => {
        if (!report.parentReportActionID || !parentReportActions || !reportActions) {
            Navigation.dismissModal();
            return;
        }
        const parentReportAction = parentReportActions[report.parentReportActionID];
        const attachmentsFromReport = extractAttachmentsFromReport(parentReportAction, reportActions);

        const initialPage = attachmentsFromReport.findIndex(compareImage);

        // Dismiss the modal when deleting an attachment during its display in preview.
        if (initialPage === -1 && attachments.find(compareImage)) {
            Navigation.dismissModal();
        } else {
            setPage(initialPage);
            setAttachments(attachmentsFromReport);

            // Update the download button visibility in the parent modal
            setDownloadButtonVisibility(initialPage !== -1);

            // Update the parent modal's state with the source and name from the mapped attachments
            if (attachmentsFromReport[initialPage] !== undefined) {
                onNavigate(attachmentsFromReport[initialPage]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportActions, parentReportActions, compareImage]);

    /** Updates the page state when the user navigates between attachments */
    const updatePage = useCallback(
        ({viewableItems}: UpdatePageProps) => {
            Keyboard.dismiss();

            // Since we can have only one item in view at a time, we can use the first item in the array
            // to get the index of the current page
            const entry = viewableItems?.[0];
            if (!entry) {
                setActiveSource(null);
                return;
            }

            if (entry.index) {
                setPage(entry.index);
                setActiveSource(entry.item.source);
            }

            onNavigate(entry.item);
        },
        [onNavigate],
    );

    /** Increments or decrements the index to get another selected item */
    const cycleThroughAttachments = useCallback(
        (deltaSlide: number) => {
            const nextIndex = page + deltaSlide;
            const nextItem = attachments[nextIndex];

            if (!nextItem || !scrollRef.current) {
                return;
            }

            scrollRef.current.scrollToIndex({index: nextIndex, animated: canUseTouchScreen});
        },
        [attachments, canUseTouchScreen, page],
    );

    /** Calculate items layout information to optimize scrolling performance */
    const getItemLayout = useCallback(
        (data: ArrayLike<Attachment> | null | undefined, index: number) => ({
            length: containerWidth,
            offset: containerWidth * index,
            index,
        }),
        [containerWidth],
    );

    /** Defines how a single attachment should be rendered */
    const renderItem = useCallback(
        ({item}: ListRenderItemInfo<Attachment>) => (
            <CarouselItem
                item={item}
                isFocused={activeSource === item.source}
                onPress={
                    canUseTouchScreen
                        ? () => {
                              setShouldShowArrows((oldState: boolean) => !oldState);
                          }
                        : undefined
                }
                isModalHovered={shouldShowArrows}
            />
        ),
        [activeSource, canUseTouchScreen, setShouldShowArrows, shouldShowArrows],
    );

    return (
        <View
            style={[styles.flex1, styles.attachmentCarouselContainer]}
            onLayout={({nativeEvent}) => setContainerWidth(PixelRatio.roundToNearestPixel(nativeEvent.layout.width))}
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

                    {containerWidth > 0 && (
                        <FlatList
                            keyboardShouldPersistTaps="handled"
                            horizontal
                            decelerationRate="fast"
                            showsHorizontalScrollIndicator={false}
                            bounces={false}
                            // Scroll only one image at a time no matter how fast the user swipes
                            disableIntervalMomentum
                            pagingEnabled
                            snapToAlignment="start"
                            snapToInterval={containerWidth}
                            // Enable scrolling by swiping on mobile (touch) devices only
                            // disable scroll for desktop/browsers because they add their scrollbars
                            // Enable scrolling FlatList only when PDF is not in a zoomed state
                            scrollEnabled={canUseTouchScreen}
                            ref={scrollRef}
                            initialScrollIndex={page}
                            initialNumToRender={3}
                            windowSize={5}
                            maxToRenderPerBatch={CONST.MAX_TO_RENDER_PER_BATCH.CAROUSEL}
                            data={attachments}
                            CellRendererComponent={AttachmentCarouselCellRenderer}
                            renderItem={renderItem}
                            getItemLayout={getItemLayout}
                            keyExtractor={(item) => item.source as string}
                            viewabilityConfig={viewabilityConfig}
                            onViewableItemsChanged={updatePage}
                        />
                    )}

                    <CarouselActions onCycleThroughAttachments={cycleThroughAttachments} />
                </>
            )}
        </View>
    );
}

AttachmentCarousel.displayName = 'AttachmentCarousel';

export default withOnyx<AttachmentCarouselProps, AttachmentCaraouselOnyxProps>({
    parentReportActions: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report ? report.parentReportID : '0'}`,
        canEvict: false,
    },
    reportActions: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
        canEvict: false,
    },
})(AttachmentCarousel);
