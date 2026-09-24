import {getSystemMessageDisplayState} from '@libs/ReportActionsUtils';

import type {ReportAction} from '@src/types/onyx';

import {useState} from 'react';

type ReportActionsPresentationProps = {
    /** Canonical filtered report actions in their rendered chronological direction. */
    visibleReportActions: ReportAction[];

    /** The action targeted by the current report route, if any. */
    linkedReportActionID?: string;

    /** The canonical action above which the unread marker belongs, if any. */
    unreadMarkerReportActionID?: string | null;
};

function useReportActionsPresentation({visibleReportActions, linkedReportActionID, unreadMarkerReportActionID}: ReportActionsPresentationProps) {
    const [expandedSystemMessageReportActionIDs, setExpandedSystemMessageReportActionIDs] = useState<Set<string>>(() => new Set());
    const displayState = getSystemMessageDisplayState(visibleReportActions, expandedSystemMessageReportActionIDs, linkedReportActionID ? [linkedReportActionID] : []);
    // Remember every revealed member, including linked targets and members loaded by pagination.
    // Otherwise an older page can repartition the 24-hour runs and hide an already revealed update.
    const newlyExpandedReportActionIDs = [...displayState.runsByAnchorReportActionID.values()]
        .filter((run) => run.isExpanded)
        .flatMap((run) => run.reportActionIDs)
        .filter((reportActionID) => !expandedSystemMessageReportActionIDs.has(reportActionID));
    if (newlyExpandedReportActionIDs.length > 0) {
        setExpandedSystemMessageReportActionIDs(new Set([...expandedSystemMessageReportActionIDs, ...newlyExpandedReportActionIDs]));
    }

    const unreadMarkerReportActionIndex = unreadMarkerReportActionID ? (displayState.reportActionIDToDisplayIndex.get(unreadMarkerReportActionID) ?? -1) : -1;

    const expandSystemMessageRun = (reportActionIDs: string[]) => {
        setExpandedSystemMessageReportActionIDs((previousReportActionIDs) => new Set([...previousReportActionIDs, ...reportActionIDs]));
    };

    return {
        ...displayState,
        expandedSystemMessageReportActionIDs,
        unreadMarkerReportActionIndex,
        expandSystemMessageRun,
    };
}

export default useReportActionsPresentation;
