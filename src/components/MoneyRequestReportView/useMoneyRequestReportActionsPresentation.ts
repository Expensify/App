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
    const [manuallyCollapsedLinkedReportActionID, setManuallyCollapsedLinkedReportActionID] = useState<string>();

    useEffect(() => {
        if (manuallyCollapsedLinkedReportActionID === undefined || manuallyCollapsedLinkedReportActionID === linkedReportActionID) {
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect -- a manual collapse applies only while the route keeps targeting the same action
        setManuallyCollapsedLinkedReportActionID(undefined);
    }, [linkedReportActionID, manuallyCollapsedLinkedReportActionID]);

    const forceExpandedLinkedReportActionID = linkedReportActionID === manuallyCollapsedLinkedReportActionID ? undefined : linkedReportActionID;

    const displayState = useMemo(
        () => getSystemMessageDisplayState(visibleReportActions, expandedSystemMessageReportActionIDs, forceExpandedLinkedReportActionID ? [forceExpandedLinkedReportActionID] : []),
        [expandedSystemMessageReportActionIDs, forceExpandedLinkedReportActionID, visibleReportActions],
    );
    const unreadMarkerReportActionIndex = unreadMarkerReportActionID ? (displayState.reportActionIDToDisplayIndex.get(unreadMarkerReportActionID) ?? -1) : -1;

    const toggleSystemMessageRun = useCallback(
        (reportActionIDs: string[], isExpanded: boolean) => {
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
        },
        [linkedReportActionID],
    );

    return {
        ...displayState,
        expandedSystemMessageReportActionIDs,
        unreadMarkerReportActionIndex,
        toggleSystemMessageRun,
    };
}

export default useMoneyRequestReportActionsPresentation;
