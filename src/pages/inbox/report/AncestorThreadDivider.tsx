import useOpenAncestorReport from '@hooks/useOpenAncestorReport';

import {isTripPreview} from '@libs/ReportActionsUtils';

import type {Report, ReportAction} from '@src/types/onyx';

import React from 'react';

import ThreadDivider from './ThreadDivider';

type AncestorThreadDividerProps = {
    /** The report the message above the divider belongs to */
    report: Report;

    /** The message above the divider */
    reportAction: ReportAction;

    /** Whether to show the new marker on the divider */
    shouldDisplayNewMarker: boolean;

    /** Whether the report the message belongs to is archived */
    isAncestorReportArchived: boolean;
};

/** The divider between a message shown above a thread and the thread, which opens the message's report when pressed */
function AncestorThreadDivider({report, reportAction, shouldDisplayNewMarker, isAncestorReportArchived}: AncestorThreadDividerProps) {
    const {canOpenAncestorReport, openAncestorReport} = useOpenAncestorReport(report, reportAction, shouldDisplayNewMarker, isAncestorReportArchived);

    if (isTripPreview(reportAction)) {
        return null;
    }

    return (
        <ThreadDivider
            shouldDisplayNewMarker={shouldDisplayNewMarker}
            onPress={canOpenAncestorReport ? () => openAncestorReport(isAncestorReportArchived) : undefined}
        />
    );
}

export default AncestorThreadDivider;
