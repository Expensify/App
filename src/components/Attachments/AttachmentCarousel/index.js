import React, {useRef, useCallback, useState, useEffect} from 'react';
import {View, Keyboard} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import styles from '../../../styles/styles';
import AttachmentCarouselCellRenderer from './AttachmentCarouselCellRenderer';
import CarouselActions from './CarouselActions';
import Carousel from './Carousel';
import withWindowDimensions from '../../withWindowDimensions';
import CarouselButtons from './CarouselButtons';
import extractAttachmentsFromReport from './extractAttachmentsFromReport';
import {propTypes, defaultProps} from './attachmentCarouselPropTypes';
import ONYXKEYS from '../../../ONYXKEYS';
import withLocalize from '../../withLocalize';
import compose from '../../../libs/compose';
import useCarouselArrows from './useCarouselArrows';
import CarouselItem from './CarouselItem';
import Navigation from '../../../libs/Navigation/Navigation';
import BlockingView from '../../BlockingViews/BlockingView';
import * as Illustrations from '../../Icon/Illustrations';
import variables from '../../../styles/variables';
import * as DeviceCapabilities from '../../../libs/DeviceCapabilities';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';

function AttachmentCarousel({report, reportActions, source, onNavigate, setDownloadButtonVisibility, translate}) {
    const scrollRef = useRef(null);

    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();

    const [page, setPage] = useState(0);
    const [attachments, setAttachments] = useState([]);
    const [activeSource, setActiveSource] = useState(source);
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
    const updatePage = useRef(
        ({viewableItems}) => {
            Keyboard.dismiss();

            // Since we can have only one item in view at a time, we can use the first item in the array
            // to get the index of the current page
            const entry = _.first(viewableItems);
            if (!entry) {
                setActiveSource(null);
                return;
            }

            setPage(entry.index);
            setActiveSource(entry.item.source);

            onNavigate(entry.item);
        },
        [onNavigate],
    );

    /**
     * Increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
     */
    const cycleThroughAttachments = useCallback(
        (deltaSlide) => {
            const nextIndex = page + deltaSlide;
            const nextItem = attachments[nextIndex];

            if (!nextItem) {
                return;
            }

            if (scrollRef.current) {
                scrollRef.current.scrollToIndex({index: nextIndex, animated: canUseTouchScreen});
            } else {
                updatePage.current({viewableItems: [{item: attachments[nextIndex], index: page}]});
            }
        },
        [attachments, canUseTouchScreen, page],
    );

    /**
     * Defines how a single attachment should be rendered
     * @param {Object} item
     * @param {String} item.reportActionID
     * @param {Boolean} item.isAuthTokenRequired
     * @param {String} item.source
     * @param {Object} item.file
     * @param {String} item.file.name
     * @param {Boolean} item.hasBeenFlagged
     * @returns {JSX.Element}
     */
    const renderItem = useCallback(
        ({item}) => (
            <CarouselItem
                item={item}
                isFocused={activeSource === item.source}
                onPress={canUseTouchScreen ? () => setShouldShowArrows(!shouldShowArrows) : undefined}
            />
        ),
        [activeSource, canUseTouchScreen, setShouldShowArrows, shouldShowArrows],
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

                    <Carousel
                        currentIndex={page}
                        renderItem={renderItem}
                        attachments={attachments}
                        windowSize={5}
                    />

                    <CarouselActions onCycleThroughAttachments={cycleThroughAttachments} />
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
    withWindowDimensions,
)(AttachmentCarousel);
