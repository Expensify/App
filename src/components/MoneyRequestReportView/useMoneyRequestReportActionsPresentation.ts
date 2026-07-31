import {getSystemMessageDisplayState} from '@libs/ReportActionsUtils';

import type {ReportAction} from '@src/types/onyx';

import {useCallback, useEffect, useMemo, useState} from 'react';

type MoneyRequestReportActionsPresentationProps = {
    /** Canonical filtered report actions in chronological order. */
    visibleReportActions: ReportAction[];

    /** The action targeted by the current report route, if any. */
    linkedReportActionID?: string;

    /** The canonical action above which the unread marker belongs, if any. */
    unreadMarkerReportActionID?: string;
};

function useMoneyRequestReportActionsPresentation({visibleReportActions, linkedReportActionID, unreadMarkerReportActionID}: MoneyRequestReportActionsPresentationProps) {
    const [expandedSystemMessageReportActionIDs, setExpandedSystemMessageReportActionIDs] = useState<Set<string>>(() => new Set());
    const [forceExpandedLinkedReportActionID, setForceExpandedLinkedReportActionID] = useState(linkedReportActionID);

    useEffect(() => {
        setForceExpandedLinkedReportActionID(linkedReportActionID);
    }, [linkedReportActionID]);

    const displayState = useMemo(
        () => getSystemMessageDisplayState(visibleReportActions, expandedSystemMessageReportActionIDs, [forceExpandedLinkedReportActionID ?? '']),
        [expandedSystemMessageReportActionIDs, forceExpandedLinkedReportActionID, visibleReportActions],
    );
    const unreadMarkerReportActionIndex = unreadMarkerReportActionID ? (displayState.reportActionIDToDisplayIndex.get(unreadMarkerReportActionID) ?? -1) : -1;

    const toggleSystemMessageRun = useCallback(
        (reportActionIDs: string[], isExpanded: boolean) => {
            if (isExpanded && forceExpandedLinkedReportActionID && reportActionIDs.includes(forceExpandedLinkedReportActionID)) {
                setForceExpandedLinkedReportActionID(undefined);
            }

            setExpandedSystemMessageReportActionIDs((previousReportActionIDs) => {
                const nextReportActionIDs = new Set(previousReportActionIDs);
                reportActionIDs.forEach((reportActionID) => {
                    if (isExpanded) {
                        nextReportActionIDs.delete(reportActionID);
                    } else {
                        nextReportActionIDs.add(reportActionID);
                    }
                });
                return nextReportActionIDs;
            });
        },
        [forceExpandedLinkedReportActionID],
    );

    return {
        ...displayState,
        expandedSystemMessageReportActionIDs,
        unreadMarkerReportActionIndex,
        toggleSystemMessageRun,
    };
}

export default useMoneyRequestReportActionsPresentation;
