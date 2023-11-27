import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Keyboard, PixelRatio, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {NativeEvent} from 'react-native-reanimated/lib/typescript/reanimated2/commonTypes';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import withLocalize from '@components/withLocalize';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import CarouselButtons from './CarouselButtons';
import CarouselItem, {Attachment} from './CarouselItem';
import extractAttachmentsFromReport from './extractAttachmentsFromReport';
import AttachmentCarouselPager from './Pager';
import AttachmentCarouselProps, {AttachmentCarouselOnyxProps} from './types';
import useCarouselArrows from './useCarouselArrows';

function AttachmentCarousel(props: AttachmentCarouselProps) {
    const {report, reportActions = {}, parentReportActions = {}, source = '', onNavigate = () => {}, setDownloadButtonVisibility = () => {}, translate, transaction = {}, onClose} = props;
    const styles = useThemeStyles();
    const pagerRef = useRef(null);

    const [containerDimensions, setContainerDimensions] = useState({width: 0, height: 0});
    const [page, setPage] = useState(0);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [activeSource, setActiveSource] = useState(source);
    const [isPinchGestureRunning, setIsPinchGestureRunning] = useState(true);
    const [shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows] = useCarouselArrows();
    const [isReceipt, setIsReceipt] = useState(false);

    const compareImage = useCallback(
        (attachment: Attachment) => {
            if (attachment.isReceipt && isReceipt) {
                return attachment.transactionID === transaction?.transactionID;
            }
            return attachment.source === source;
        },
        [source, isReceipt, transaction],
    );

    useEffect(() => {
        const parentReportAction = parentReportActions?.[report.parentReportActionID ?? ''] ?? null;
        const attachmentsFromReport = extractAttachmentsFromReport(parentReportAction, reportActions, transaction);

        const initialPage = attachmentsFromReport.findIndex(compareImage);

        // Dismiss the modal when deleting an attachment during its display in preview.
        if (initialPage === -1 && attachments.find(compareImage)) {
            Navigation.dismissModal(undefined);
        } else {
            setPage(initialPage);
            setAttachments(attachmentsFromReport);

            // Update the download button visibility in the parent modal
            setDownloadButtonVisibility(initialPage !== -1);

            // Update the parent modal's state with the source and name from the mapped attachments
            if (attachmentsFromReport[initialPage]) {
                onNavigate(attachmentsFromReport[initialPage]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportActions, compareImage]);

    /**
     * Updates the page state when the user navigates between attachments

     */
    const updatePage = useCallback(
        (newPageIndex: number) => {
            Keyboard.dismiss();
            setShouldShowArrows(true);

            const item = attachments[newPageIndex];

            setPage(newPageIndex);
            setIsReceipt(item.isReceipt);
            setActiveSource(item.source);

            onNavigate(item);
        },
        [setShouldShowArrows, attachments, onNavigate],
    );

    /**
     * Increments or decrements the index to get another selected item
     */
    const cycleThroughAttachments = useCallback(
        (deltaSlide: number) => {
            const nextPageIndex = page + deltaSlide;
            updatePage(nextPageIndex);
            pagerRef?.current?.setPage(nextPageIndex);

            autoHideArrows();
        },
        [autoHideArrows, page, updatePage],
    );

    /**
     * Defines how a single attachment should be rendered
     */
    const renderItem = useCallback(
        (renderItemProps: {item: Attachment; isActive: boolean}) => (
            <CarouselItem
                item={renderItemProps.item}
                isFocused={renderItemProps.isActive && activeSource === renderItemProps.item.source}
                onPress={() => setShouldShowArrows(!shouldShowArrows)}
            />
        ),
        [activeSource, setShouldShowArrows, shouldShowArrows],
    );

    return (
        <View
            style={[styles.flex1, styles.attachmentCarouselContainer]}
            onLayout={({nativeEvent}) =>
                setContainerDimensions({width: PixelRatio.roundToNearestPixel(nativeEvent.layout.width), height: PixelRatio.roundToNearestPixel(nativeEvent.layout.height)})
            }
            onMouseEnter={() => setShouldShowArrows(true)}
            onMouseLeave={() => setShouldShowArrows(false)}
        >
            {page === -1 ? (
                <BlockingView
                    icon={Illustrations.ToddBehindCloud}
                    iconWidth={variables.modalTopIconWidth}
                    iconHeight={variables.modalTopIconHeight}
                    title={translate('notFound.notHere')}
                />
            ) : (
                <>
                    <CarouselButtons
                        shouldShowArrows={shouldShowArrows && !isPinchGestureRunning}
                        page={page}
                        attachments={attachments}
                        onBack={() => cycleThroughAttachments(-1)}
                        onForward={() => cycleThroughAttachments(1)}
                        autoHideArrow={autoHideArrows}
                        cancelAutoHideArrow={cancelAutoHideArrows}
                    />

                    {containerDimensions.width > 0 && containerDimensions.height > 0 && (
                        <AttachmentCarouselPager
                            items={attachments}
                            renderItem={renderItem}
                            initialIndex={page}
                            onPageSelected={({nativeEvent: {position: newPage}}) => updatePage(newPage)}
                            onPinchGestureChange={(newIsPinchGestureRunning) => {
                                setIsPinchGestureRunning(newIsPinchGestureRunning);
                                if (!newIsPinchGestureRunning && !shouldShowArrows) {
                                    setShouldShowArrows(true);
                                }
                            }}
                            onSwipeDown={onClose}
                            containerWidth={containerDimensions.width}
                            containerHeight={containerDimensions.height}
                            ref={pagerRef}
                        />
                    )}
                </>
            )}
        </View>
    );
}

AttachmentCarousel.displayName = 'AttachmentCarousel';

export default compose(
    // eslint-disable-next-line rulesdir/no-multiple-onyx-in-file
    withOnyx<AttachmentCarouselProps, AttachmentCarouselOnyxProps>({
        reportActions: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
            canEvict: false,
        },
        parentReport: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report ? report.parentReportID : '0'}`,
        },
        parentReportActions: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report ? report.parentReportID : '0'}`,
            canEvict: false,
        },
    }),
    // eslint-disable-next-line rulesdir/no-multiple-onyx-in-file
    withOnyx<AttachmentCarouselProps, AttachmentCarouselOnyxProps>({
        transaction: {
            key: ({report, parentReportActions}) => {
                const parentReportAction = lodashGet(parentReportActions, [report.parentReportActionID]);
                return `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(parentReportAction, 'originalMessage.IOUTransactionID', 0)}`;
            },
        },
    }),
    withLocalize,
)(AttachmentCarousel);
