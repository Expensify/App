import {deepEqual} from 'fast-equals';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import type {Attachment} from '@components/Attachments/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import AttachmentCarouselView from './AttachmentCarouselView';
import extractAttachments from './extractAttachments';
import type {AttachmentCarouselProps} from './types';
import useCarouselArrows from './useCarouselArrows';

function AttachmentCarousel({
    report,
    attachmentID,
    source,
    onNavigate,
    setDownloadButtonVisibility,
    type,
    accountID,
    onSwipeDown,
    attachmentLink,
    onAttachmentError,
}: AttachmentCarouselProps) {
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`, {canEvict: false, canBeMissing: true});
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {canEvict: false, canBeMissing: true});
    const canUseTouchScreen = canUseTouchScreenUtil();
    const styles = useThemeStyles();
    const isReportArchived = useReportIsArchived(report.reportID);

    const [page, setPage] = useState<number>();
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const {shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows} = useCarouselArrows();

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
            newAttachments = extractAttachments(CONST.ATTACHMENT_TYPE.NOTE, {privateNotes: report.privateNotes, accountID, report, isReportArchived});
        } else if (type === CONST.ATTACHMENT_TYPE.ONBOARDING) {
            newAttachments = extractAttachments(CONST.ATTACHMENT_TYPE.ONBOARDING, {parentReportAction, reportActions: reportActions ?? undefined, report, isReportArchived});
        } else {
            newAttachments = extractAttachments(CONST.ATTACHMENT_TYPE.REPORT, {parentReportAction, reportActions: reportActions ?? undefined, report, isReportArchived});
        }

        if (deepEqual(attachments, newAttachments)) {
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
    }, [reportActions, parentReportActions, compareImage, attachments, setDownloadButtonVisibility, onNavigate, accountID, type, report, isReportArchived]);

    if (page == null) {
        return (
            <View style={[styles.flex1, styles.attachmentCarouselContainer]}>
                <FullScreenLoadingIndicator />
            </View>
        );
    }

    return (
        <AttachmentCarouselView
            page={page}
            setPage={setPage}
            attachments={attachments}
            shouldShowArrows={shouldShowArrows}
            autoHideArrows={autoHideArrows}
            cancelAutoHideArrow={cancelAutoHideArrows}
            setShouldShowArrows={setShouldShowArrows}
            onSwipeDown={onSwipeDown}
            onAttachmentError={onAttachmentError}
            report={report}
            attachmentID={attachmentID}
            source={source}
            onNavigate={onNavigate}
        />
    );
}

export default AttachmentCarousel;
