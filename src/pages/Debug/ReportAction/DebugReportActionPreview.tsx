import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ScrollView from '@components/ScrollView';
import useOnyx from '@hooks/useOnyx';
import ReportActionItem from '@pages/inbox/report/ReportActionItem';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

type DebugReportActionPreviewProps = {
    /** The report action to be previewed. */
    reportAction: OnyxEntry<ReportAction>;

    /** The report id to be previewed. */
    reportID: string;
};

function DebugReportActionPreview({reportAction, reportID}: DebugReportActionPreviewProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportAction?.childReportID}`);

    return (
        <ScrollView>
            <ReportActionItem
                action={reportAction ?? ({} as ReportAction)}
                transactionThreadReport={transactionThreadReport}
                report={report ?? ({} as Report)}
                parentReportAction={undefined}
                displayAsGroup={false}
                shouldDisplayNewMarker={false}
                isFirstVisibleReportAction={false}
                shouldDisplayContextMenu={false}
            />
        </ScrollView>
    );
}

export default DebugReportActionPreview;
