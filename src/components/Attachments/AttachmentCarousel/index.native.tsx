import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Keyboard, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {Attachment, AttachmentSource} from '@components/Attachments/types';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import CarouselButtons from './CarouselButtons';
import extractAttachmentsFromReport from './extractAttachmentsFromReport';
import type {AttachmentCarouselPagerHandle} from './Pager';
import AttachmentCarouselPager from './Pager';
import type {AttachmentCaraouselOnyxProps, AttachmentCarouselProps} from './types';
import useCarouselArrows from './useCarouselArrows';

function AttachmentCarousel({report, reportActions, parentReportActions, source, onNavigate, setDownloadButtonVisibility, onClose}: AttachmentCarouselProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const pagerRef = useRef<AttachmentCarouselPagerHandle>(null);
    const [page, setPage] = useState<number>();
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const {shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows} = useCarouselArrows();
    const [activeSource, setActiveSource] = useState<AttachmentSource>(source);

    const compareImage = useCallback((attachment: Attachment) => attachment.source === source, [source]);

    useEffect(() => {
        const parentReportAction = report.parentReportActionID && parentReportActions ? parentReportActions[report.parentReportActionID] : undefined;
        const attachmentsFromReport = extractAttachmentsFromReport(parentReportAction, reportActions);

        const initialPage = attachmentsFromReport.findIndex(compareImage);

        // Dismiss the modal when deleting an attachment during its display in preview.
        if (initialPage === -1 && attachments.find(compareImage)) {
            Navigation.dismissModal();
        } else {
            setPage(initialPage);
            setAttachments(attachmentsFromReport);

            // Update the download button visibility in the parent modal
            if (setDownloadButtonVisibility) {
                setDownloadButtonVisibility(initialPage !== -1);
            }

            // Update the parent modal's state with the source and name from the mapped attachments
            if (attachmentsFromReport[initialPage] !== undefined && onNavigate) {
                onNavigate(attachmentsFromReport[initialPage]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportActions, compareImage]);

    /** Updates the page state when the user navigates between attachments */
    const updatePage = useCallback(
        (newPageIndex: number) => {
            Keyboard.dismiss();
            setShouldShowArrows(true);

            const item = attachments[newPageIndex];

            setPage(newPageIndex);
            setActiveSource(item.source);

            if (onNavigate) {
                onNavigate(item);
            }
        },
        [setShouldShowArrows, attachments, onNavigate],
    );

    /**
     * Increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
     */
    const cycleThroughAttachments = useCallback(
        (deltaSlide: number) => {
            if (page === undefined) {
                return;
            }
            const nextPageIndex = page + deltaSlide;
            updatePage(nextPageIndex);
            pagerRef.current?.setPage(nextPageIndex);

            autoHideArrows();
        },
        [autoHideArrows, page, updatePage],
    );

    /**
     * Toggles the arrows visibility
     * @param {Boolean} showArrows if showArrows is passed, it will set the visibility to the passed value
     */
    const toggleArrows = useCallback(
        (showArrows?: boolean) => {
            if (showArrows === undefined) {
                setShouldShowArrows((prevShouldShowArrows) => !prevShouldShowArrows);
                return;
            }

            setShouldShowArrows(showArrows);
        },
        [setShouldShowArrows],
    );

    const containerStyles = [styles.flex1, styles.attachmentCarouselContainer];

    if (page == null) {
        return (
            <View style={containerStyles}>
                <FullScreenLoadingIndicator />
            </View>
        );
    }

    return (
        <View style={containerStyles}>
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
                        onClose={onClose}
                        ref={pagerRef}
                    />
                </>
            )}
        </View>
    );
}

AttachmentCarousel.displayName = 'AttachmentCarousel';

export default withOnyx<AttachmentCarouselProps, AttachmentCaraouselOnyxProps>({
    parentReportActions: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`,
        canEvict: false,
    },
    reportActions: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
        canEvict: false,
    },
})(AttachmentCarousel);
