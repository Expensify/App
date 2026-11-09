import type useReportActionsScroll from '@hooks/useReportActionsScroll';

import type useReportActionsPresentation from '@pages/inbox/report/useReportActionsPresentation';

import type * as OnyxTypes from '@src/types/onyx';

import type {LayoutChangeEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import type useReportActionsListData from './useReportActionsListData';

type ReportActionsListProps = {
    /** The ID of the report to display actions for */
    reportID: string;

    onLayout?: (event: LayoutChangeEvent) => void;
};

type UseReportActionsListDataParams = {
    sortedVisibleReportActions: OnyxTypes.ReportAction[];
    isOffline: boolean;
    sessionStartTime: string | null;
    linkedReportActionID: string | undefined;
    unreadMarkerReportActionID: string | null;
};

type UseReportActionsListScrollParams = Pick<
    Parameters<typeof useReportActionsScroll>[0],
    | 'reportID'
    | 'sortedVisibleReportActions'
    | 'renderedVisibleReportActions'
    | 'markNewestActionAsRead'
    | 'completeSkippedMarkAsRead'
    | 'unreadMarkerReportActionID'
    | 'unreadMarkerReportActionIndex'
> &
    Pick<ReturnType<typeof useReportActionsPresentation>, 'reportActionIDToDisplayIndex' | 'focusRequestedReportActionID'> &
    Pick<UseReportActionsListDataParams, 'isOffline' | 'linkedReportActionID'> &
    Pick<ReportActionsListProps, 'onLayout'> & {
        actionBadgeTargetID: string | undefined;
        onScrolledOverThresholdChange: (isOverThreshold: boolean) => void;
    };

type UseReportActionsListRenderItemParams = Pick<
    ReturnType<typeof useReportActionsListData>,
    | 'renderedVisibleReportActions'
    | 'reportActionsToRender'
    | 'listData'
    | 'canonicalIndexByReportActionID'
    | 'runsByAnchorReportActionID'
    | 'expandedSystemMessageReportActionIDs'
    | 'expandSystemMessageRun'
    | 'focusRequestedReportActionID'
    | 'onExpandedSystemMessageReady'
    | 'draftMessageHTML'
    | 'draftReportActionID'
    | 'isDraftPendingCompletion'
> &
    Pick<UseReportActionsListDataParams, 'isOffline' | 'linkedReportActionID' | 'unreadMarkerReportActionID'> &
    Pick<ReportActionsListProps, 'reportID'> & {
        reportNameValuePairs: OnyxEntry<OnyxTypes.ReportNameValuePairs>;
        isReportArchived: boolean;
        sortedReportActions: OnyxTypes.ReportAction[];
        onShowPreviousMessages: () => void;
    };

type UseReportActionsListTelemetryParams = {
    reportID: string;
    listID: string;
    loadedInitialViewportListID: string | undefined;
    shouldShowInitialViewportSkeleton: boolean;
};

type ReportActionsListScrollMetrics = {
    offset: number;
    contentHeight: number;
    viewportHeight: number;
};

export type {
    ReportActionsListProps,
    UseReportActionsListDataParams,
    UseReportActionsListScrollParams,
    UseReportActionsListRenderItemParams,
    UseReportActionsListTelemetryParams,
    ReportActionsListScrollMetrics,
};
