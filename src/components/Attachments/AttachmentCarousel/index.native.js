import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Keyboard, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import * as Illustrations from '@components/Icon/Illustrations';
import withLocalize from '@components/withLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import {defaultProps, propTypes} from './attachmentCarouselPropTypes';
import CarouselButtons from './CarouselButtons';
import extractAttachmentsFromReport from './extractAttachmentsFromReport';
import AttachmentCarouselPager from './Pager';
import useCarouselArrows from './useCarouselArrows';

function AttachmentCarousel({report, reportActions, parentReportActions, source, onNavigate, setDownloadButtonVisibility, translate}) {
    const styles = useThemeStyles();
    const pagerRef = useRef(null);
    const [page, setPage] = useState();
    const [attachments, setAttachments] = useState([]);
    const [shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows] = useCarouselArrows();
    const [activeSource, setActiveSource] = useState(source);

    const compareImage = useCallback((attachment) => attachment.source === source, [source]);

    useEffect(() => {
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
     * Toggles the arrows visibility
     * @param {Boolean} showArrows if showArrows is passed, it will set the visibility to the passed value
     */
    const toggleArrows = useCallback(
        (showArrows) => {
            if (showArrows === undefined) {
                setShouldShowArrows((prevShouldShowArrows) => !prevShouldShowArrows);
                return;
            }

            setShouldShowArrows(showArrows);
        },
        [setShouldShowArrows],
    );

    const goBack = useCallback(() => {
        Navigation.goBack();
    }, []);

    return (
        <View style={[styles.flex1, styles.attachmentCarouselContainer]}>
            {page == null ? (
                <FullScreenLoadingIndicator />
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
                                shouldShowArrows={shouldShowArrows}
                                page={page}
                                attachments={attachments}
                                onBack={() => cycleThroughAttachments(-1)}
                                onForward={() => cycleThroughAttachments(1)}
                                autoHideArrow={autoHideArrows}
                                cancelAutoHideArrow={cancelAutoHideArrows}
                            />

                            <AttachmentCarouselPager
                                items={attachments}
                                initialPage={page}
                                activeSource={activeSource}
                                onRequestToggleArrows={toggleArrows}
                                onPageSelected={({nativeEvent: {position: newPage}}) => updatePage(newPage)}
                                onClose={goBack}
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
    }),
    withLocalize,
)(AttachmentCarousel);
