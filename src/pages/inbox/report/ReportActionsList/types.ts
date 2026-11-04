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
    reportNameValuePairs: OnyxEntry<OnyxTypes.ReportNameValuePairs>;
    sessionStartTime: string | null;
    linkedReportActionID: string | undefined;
    unreadMarkerReportActionID: string | null;
};

type UseReportActionsListScrollParams = Pick<
    Parameters<typeof useReportActionsScroll>[0],
    | 'reportID'
    | 'sortedVisibleReportActions'
    | 'renderedVisibleReportActions'
    | 'hasScrolledOverThreshold'
    | 'markNewestActionAsRead'
    | 'completeSkippedMarkAsRead'
    | 'unreadMarkerReportActionID'
    | 'unreadMarkerReportActionIndex'
    | 'draftAutoScrollKey'
> &
    Pick<ReturnType<typeof useReportActionsPresentation>, 'reportActionIDToDisplayIndex' | 'focusRequestedReportActionID'> &
    Pick<UseReportActionsListDataParams, 'linkedReportActionID'> &
    Pick<ReportActionsListProps, 'onLayout'> & {
        actionBadgeTargetID: string | undefined;
        onScrolledOverThresholdChange: (isOverThreshold: boolean) => void;
    };

type UseReportActionsListRenderItemParams = Pick<
    ReturnType<typeof useReportActionsListData>,
    | 'renderedVisibleReportActions'
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
    Pick<UseReportActionsListDataParams, 'reportNameValuePairs' | 'linkedReportActionID' | 'unreadMarkerReportActionID'> &
    Pick<ReportActionsListProps, 'reportID'> & {
        isReportArchived: boolean;
        isOffline: boolean;
        sortedReportActions: OnyxTypes.ReportAction[];
        onShowPreviousMessages: () => void;
    };

type UseReportActionsListTelemetryParams = Pick<ReportActionsListProps, 'reportID' | 'onLayout'>;

export type {ReportActionsListProps, UseReportActionsListDataParams, UseReportActionsListScrollParams, UseReportActionsListRenderItemParams, UseReportActionsListTelemetryParams};
