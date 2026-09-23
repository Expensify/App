import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';

import useCancelSendMessageSpanOnSkeleton from '@hooks/useCancelSendMessageSpanOnSkeleton';
import type {SkeletonName} from '@hooks/useCancelSendMessageSpanOnSkeleton';
import useMarkOpenReportEndOnSkeleton from '@hooks/useMarkOpenReportEndOnSkeleton';

import React from 'react';

type ReportActionsLoadingSkeletonProps = {
    /** The report whose actions list is loading */
    reportID: string | undefined;

    /** Which skeleton this is, stamped on any send-message span it cancels */
    skeletonName: SkeletonName;

    /** Whether the skeleton rows animate */
    shouldAnimate?: boolean;

    /** Whether this skeleton closes the open-report span as a cold open. Off when it isn't waiting on report data */
    shouldMarkOpenReportEnd?: boolean;
};

/**
 * Report-actions loading skeleton. Hosts the skeleton-phase span marks: cancelling the never-ending
 * send-message span, and closing the open-report span as cold. Mounted here means visible, while a parent's
 * copy of the skeleton condition can drift from what actually renders.
 */
function ReportActionsLoadingSkeleton({reportID, skeletonName, shouldAnimate = true, shouldMarkOpenReportEnd = true}: ReportActionsLoadingSkeletonProps) {
    useCancelSendMessageSpanOnSkeleton(reportID, skeletonName);
    useMarkOpenReportEndOnSkeleton(reportID, shouldMarkOpenReportEnd);
    return <ReportActionsSkeletonView shouldAnimate={shouldAnimate} />;
}

ReportActionsLoadingSkeleton.displayName = 'ReportActionsLoadingSkeleton';

export default ReportActionsLoadingSkeleton;
