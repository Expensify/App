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
    const [manuallyCollapsedLinkedReportActionID, setManuallyCollapsedLinkedReportActionID] = useState<string>();
    const [previousLinkedReportActionID, setPreviousLinkedReportActionID] = useState(linkedReportActionID);

    if (linkedReportActionID !== previousLinkedReportActionID) {
        setPreviousLinkedReportActionID(linkedReportActionID);
        if (manuallyCollapsedLinkedReportActionID !== undefined && manuallyCollapsedLinkedReportActionID !== linkedReportActionID) {
            setManuallyCollapsedLinkedReportActionID(undefined);
        }
    }

    const forceExpandedLinkedReportActionID = linkedReportActionID === manuallyCollapsedLinkedReportActionID ? undefined : linkedReportActionID;

    const displayState = getSystemMessageDisplayState(
        visibleReportActions,
        expandedSystemMessageReportActionIDs,
        forceExpandedLinkedReportActionID ? [forceExpandedLinkedReportActionID] : [],
    );
    const unreadMarkerReportActionIndex = unreadMarkerReportActionID ? (displayState.reportActionIDToDisplayIndex.get(unreadMarkerReportActionID) ?? -1) : -1;

    const toggleSystemMessageRun = (reportActionIDs: string[], isExpanded: boolean) => {
        if (isExpanded && linkedReportActionID && reportActionIDs.includes(linkedReportActionID)) {
            setManuallyCollapsedLinkedReportActionID(linkedReportActionID);
        }

        setExpandedSystemMessageReportActionIDs((previousReportActionIDs) => {
            const nextReportActionIDs = new Set(previousReportActionIDs);
            for (const reportActionID of reportActionIDs) {
                if (isExpanded) {
                    nextReportActionIDs.delete(reportActionID);
                } else {
                    nextReportActionIDs.add(reportActionID);
                }
            }
            return nextReportActionIDs;
        });
    };

    return {
        ...displayState,
        expandedSystemMessageReportActionIDs,
        unreadMarkerReportActionIndex,
        toggleSystemMessageRun,
    };
}

export default useReportActionsPresentation;
