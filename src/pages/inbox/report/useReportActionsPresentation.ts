/**
 * Collapses system-message runs and remembers revealed members across pagination, including during render.
 * Tracks a separate one-shot focus request only for a user's explicit expansion.
 */
import moveAccessibilityFocus from '@libs/Accessibility/moveAccessibilityFocus';
import {getSystemMessageDisplayState} from '@libs/ReportActionsUtils';

import type {ReportAction} from '@src/types/onyx';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import {useRef, useState} from 'react';

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
    const [focusRequestedReportActionID, setFocusRequestedReportActionID] = useState<string>();
    const pendingFocusReportActionIDRef = useRef<string | undefined>(undefined);
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
        // Run members are chronological even when the list renders newest first.
        pendingFocusReportActionIDRef.current = reportActionIDs.at(0);
        setFocusRequestedReportActionID(reportActionIDs.at(0));
        setExpandedSystemMessageReportActionIDs((previousReportActionIDs) => new Set([...previousReportActionIDs, ...reportActionIDs]));
    };

    const onExpandedSystemMessageReady = (reportActionID: string, target: ComponentRef<typeof View> | null) => {
        if (!target || pendingFocusReportActionIDRef.current !== reportActionID) {
            return;
        }

        // Consume before focusing: another callback or a recycled row must not steal focus later.
        pendingFocusReportActionIDRef.current = undefined;
        setFocusRequestedReportActionID(undefined);
        moveAccessibilityFocus(target);
    };

    return {
        ...displayState,
        expandedSystemMessageReportActionIDs,
        unreadMarkerReportActionIndex,
        expandSystemMessageRun,
        focusRequestedReportActionID,
        onExpandedSystemMessageReady,
    };
}

export default useReportActionsPresentation;
