import type useReportActionsScroll from '@hooks/useReportActionsScroll';

import type {ComponentRef} from 'react';
import type {LayoutChangeEvent, View} from 'react-native';

type ReportActionsListProps = {
    reportID: string;
    onLayout?: (event: LayoutChangeEvent) => void;
};

type UseReportActionsListScrollParams = Pick<Parameters<typeof useReportActionsScroll>[0], 'reportID' | 'markNewestActionAsRead' | 'completeSkippedMarkAsRead'> &
    Pick<ReportActionsListProps, 'onLayout'>;

type UseReportActionsListRenderItemParams = {
    onExpandedSystemMessageReady: (actionID: string, target: ComponentRef<typeof View> | null) => void;
};

type UseReportActionsListTelemetryParams = Pick<ReportActionsListProps, 'reportID' | 'onLayout'>;

export type {ReportActionsListProps, UseReportActionsListScrollParams, UseReportActionsListRenderItemParams, UseReportActionsListTelemetryParams};
