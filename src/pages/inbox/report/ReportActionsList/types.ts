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
    /** The report's actions that render as rows, newest first. */
    visibleActions: OnyxTypes.ReportAction[];
    sessionStartTime: string | null;
    linkedReportActionID: string | undefined;
    unreadMarkerReportActionID: string | null;
};

type UseReportActionsListScrollParams = Pick<
    Parameters<typeof useReportActionsScroll>[0],
    | 'reportID'
    | 'listData'
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
        /** The report's visible actions, including support surveys the list hides. */
        visibleActionsWithHiddenSurveys: OnyxTypes.ReportAction[];
        actionBadgeTargetID: string | undefined;
        onScrolledOverThresholdChange: (isOverThreshold: boolean) => void;
    };

type UseReportActionsListRenderItemParams = Pick<
    ReturnType<typeof useReportActionsListData>,
    | 'visibleActionsWithDraft'
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
    Pick<UseReportActionsListDataParams, 'linkedReportActionID' | 'unreadMarkerReportActionID'> &
    Pick<ReportActionsListProps, 'reportID'> & {
        reportNameValuePairs: OnyxEntry<OnyxTypes.ReportNameValuePairs>;
        isReportArchived: boolean;
        isOffline: boolean;
        listActions: OnyxTypes.ReportAction[];
        onShowPreviousMessages: () => void;
    };

type UseReportActionsListTelemetryParams = Pick<ReportActionsListProps, 'reportID' | 'onLayout'>;

export type {ReportActionsListProps, UseReportActionsListDataParams, UseReportActionsListScrollParams, UseReportActionsListRenderItemParams, UseReportActionsListTelemetryParams};
