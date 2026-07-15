import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';

import useCancelSendMessageSpanOnSkeleton from '@hooks/useCancelSendMessageSpanOnSkeleton';
import type {SkeletonName} from '@hooks/useCancelSendMessageSpanOnSkeleton';

import React from 'react';

type ReportActionsLoadingSkeletonProps = {
    /** The report whose actions list is loading */
    reportID: string | undefined;

    /** Which skeleton this is, stamped on any send-message span it cancels */
    skeletonName: SkeletonName;

    /** Whether the skeleton rows animate */
    shouldAnimate?: boolean;
};

/**
 * Report-actions loading skeleton. Mounted only while the skeleton shows, so it hosts the hook that cancels
 * the otherwise never-ending send-message span (tagged with `skeletonName`).
 */
function ReportActionsLoadingSkeleton({reportID, skeletonName, shouldAnimate = true}: ReportActionsLoadingSkeletonProps) {
    useCancelSendMessageSpanOnSkeleton(reportID, skeletonName);
    return <ReportActionsSkeletonView shouldAnimate={shouldAnimate} />;
}

ReportActionsLoadingSkeleton.displayName = 'ReportActionsLoadingSkeleton';

export default ReportActionsLoadingSkeleton;
