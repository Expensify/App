import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Keyboard, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import * as Illustrations from '@components/Icon/Illustrations';
import withLocalize from '@components/withLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {defaultProps, propTypes} from './attachmentCarouselPropTypes';
import CarouselButtons from './CarouselButtons';
import CarouselItem from './CarouselItem';
import extractAttachmentsFromReport from './extractAttachmentsFromReport';
import AttachmentCarouselPager from './Pager';
import useCarouselArrows from './useCarouselArrows';

function AttachmentCarousel({report, reportActions, parentReportActions, reportMetadata, source, onNavigate, setDownloadButtonVisibility, translate, onClose}) {
    const styles = useThemeStyles();
    const pagerRef = useRef(null);
    const sourceID = (source.match(CONST.REGEX.ATTACHMENT_ID) || [])[1];
    const [page, setPage] = useState();
    const [attachments, setAttachments] = useState([]);
    const [isPinchGestureRunning, setIsPinchGestureRunning] = useState(true);
    const [shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows] = useCarouselArrows();
    const [activeSource, setActiveSource] = useState(source);

    const compareImage = useCallback((attachment) => attachment.source.includes(source), [source]);

    useEffect(() => {
        // Wait until attachment is loaded and return early if
        // - Report actions are loading, i.e we called OpenReport
        // - Report has no actions, i.e we just logged in
        // - The current attachment doesn't exist in report actions and we haven't called OpenReport yet
        if (reportMetadata.isLoadingInitialReportActions || _.isEmpty(reportActions) || (_.isEmpty(reportMetadata) && !_.isEmpty(reportActions) && !_.has(reportActions, sourceID))) {
            return;
        }

        const parentReportAction = parentReportActions[report.parentReportActionID];
        const attachmentsFromReport = extractAttachmentsFromReport(parentReportAction, reportActions);

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
    }, [sourceID, reportActions, reportMetadata, compareImage]);

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
        ({item, index, isActive}) => (
            <CarouselItem
                item={item}
                isSingleItem={attachments.length === 1}
                index={index}
                activeIndex={page}
                isFocused={isActive && activeSource === item.source}
                onPress={() => setShouldShowArrows(!shouldShowArrows)}
            />
        ),
        [activeSource, attachments.length, page, setShouldShowArrows, shouldShowArrows],
    );

    // Wait until attachment is loaded and return early if
    // - Report actions are loading, i.e we called OpenReport
    // - Report has no actions, i.e we just logged in
    // - The current attachment doesn't exist in report actions and we haven't called OpenReport yet
    if (reportMetadata.isLoadingInitialReportActions || _.isEmpty(reportActions) || (_.isEmpty(reportMetadata) && !_.isEmpty(reportActions) && !_.has(reportActions, sourceID))) {
        return <FullscreenLoadingIndicator style={[styles.opacity1, styles.bgTransparent]} />;
    }

    return (
        <View
            style={[styles.flex1, styles.attachmentCarouselContainer]}
            onMouseEnter={() => setShouldShowArrows(true)}
            onMouseLeave={() => setShouldShowArrows(false)}
        >
            {page == null ? (
                <FullscreenLoadingIndicator />
            ) : (
                <>
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
                                ref={pagerRef}
                            />
                        </>
                    )}
                </>
            )}
        </View>
    );
}
AttachmentCarousel.propTypes = propTypes;
AttachmentCarousel.defaultProps = defaultProps;
AttachmentCarousel.displayName = 'AttachmentCarousel';

export default compose(
    withOnyx({
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
        reportMetadata: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_METADATA}${report.reportID}`,
        },
    }),
    withLocalize,
)(AttachmentCarousel);
