import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, Keyboard, PixelRatio} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import AttachmentCarouselPager from './Pager';
import styles from '../../../styles/styles';
import CarouselButtons from './CarouselButtons';
import ONYXKEYS from '../../../ONYXKEYS';
import {propTypes, defaultProps} from './attachmentCarouselPropTypes';
import extractAttachmentsFromReport from './extractAttachmentsFromReport';
import useCarouselArrows from './useCarouselArrows';
import CarouselItem from './CarouselItem';
import Navigation from '../../../libs/Navigation/Navigation';
import BlockingView from '../../BlockingViews/BlockingView';
import * as Illustrations from '../../Icon/Illustrations';
import variables from '../../../styles/variables';
import compose from '../../../libs/compose';
import withLocalize from '../../withLocalize';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';

function AttachmentCarousel({report, reportActions, source, onNavigate, onClose, setDownloadButtonVisibility, translate}) {
    const pagerRef = useRef(null);

    const [containerDimensions, setContainerDimensions] = useState({width: 0, height: 0});
    const [page, setPage] = useState(0);
    const [attachments, setAttachments] = useState([]);
    const [activeSource, setActiveSource] = useState(source);
    const [isPinchGestureRunning, setIsPinchGestureRunning] = useState(true);
    const [shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows] = useCarouselArrows();

    const compareImage = useCallback(
        (attachment) => {
            if (attachment.isReceipt) {
                const action = ReportActionsUtils.getParentReportAction(report);
                const transactionID = _.get(action, ['originalMessage', 'IOUTransactionID']);
                return attachment.transactionID === transactionID;
            }
            return attachment.source === source;
        },
        [source, report],
    );

    useEffect(() => {
        const attachmentsFromReport = extractAttachmentsFromReport(report, reportActions);

        const initialPage = _.findIndex(attachmentsFromReport, compareImage);

        // Dismiss the modal when deleting an attachment during its display in preview.
        if (initialPage === -1 && _.find(attachments, compareImage)) {
            Navigation.dismissModal();
        } else {
            setPage(initialPage);
            setAttachments(attachmentsFromReport);

            // Update the download button visibility in the parent modal
            setDownloadButtonVisibility(initialPage !== -1);

            // Update the parent modal's state with the source and name from the mapped attachments
            if (!_.isUndefined(attachmentsFromReport[initialPage])) {
                onNavigate(attachmentsFromReport[initialPage]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportActions, compareImage]);

    /**
     * Updates the page state when the user navigates between attachments
     * @param {Object} item
     * @param {number} index
     */
    const updatePage = useCallback(
        (newPageIndex) => {
            Keyboard.dismiss();
            setShouldShowArrows(true);

            const item = attachments[newPageIndex];

            setPage(newPageIndex);
            setActiveSource(item.source);

            onNavigate(item);
        },
        [setShouldShowArrows, attachments, onNavigate],
    );

    /**
     * Increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
     */
    const cycleThroughAttachments = useCallback(
        (deltaSlide) => {
            const nextPageIndex = page + deltaSlide;
            updatePage(nextPageIndex);
            pagerRef.current.setPage(nextPageIndex);

            autoHideArrows();
        },
        [autoHideArrows, page, updatePage],
    );

    /**
     * Defines how a single attachment should be rendered
     * @param {{ reportActionID: String, isAuthTokenRequired: Boolean, source: String, file: { name: String }, hasBeenFlagged: Boolean }} item
     * @returns {JSX.Element}
     */
    const renderItem = useCallback(
        ({item, isActive}) => (
            <CarouselItem
                item={item}
                isFocused={isActive && activeSource === item.source}
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
AttachmentCarousel.propTypes = propTypes;
AttachmentCarousel.defaultProps = defaultProps;

export default compose(
    withOnyx({
        reportActions: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
            canEvict: false,
        },
    }),
    withLocalize,
)(AttachmentCarousel);
