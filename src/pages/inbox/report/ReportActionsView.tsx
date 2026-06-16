import React from 'react';
import type {LayoutChangeEvent} from 'react-native';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {getStableReportSelector} from '@src/selectors/Report';
import ReportActionsList from './ReportActionsList';
import UserTypingEventListener from './UserTypingEventListener';

type ReportActionsViewProps = {
    /** The ID of the report to display actions for */
    reportID: string | undefined;

    /** Callback executed on layout */
    onLayout?: (event: LayoutChangeEvent) => void;
};

/**
 * Thin host around the hook-driven ReportActionsList body. It owns the report
 * subscription needed to mount the typing listener; all data orchestration and
 * skeleton handling now live inside the body itself.
 */
function ReportActionsView({reportID, onLayout}: ReportActionsViewProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getStableReportSelector});

    if (!reportID || !report) {
        return null;
    }

    return (
        <>
            <ReportActionsList
                reportID={reportID}
                onLayout={onLayout}
            />
            <UserTypingEventListener report={report} />
        </>
    );
}

export default ReportActionsView;
