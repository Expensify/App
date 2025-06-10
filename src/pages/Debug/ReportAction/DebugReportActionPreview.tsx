import React from 'react';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import ScrollView from '@components/ScrollView';
import ReportActionItem from '@pages/home/report/ReportActionItem';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

type DebugReportActionPreviewProps = {
    /** The report action to be previewed. */
    reportAction: OnyxEntry<ReportAction>;

    /** The report id to be previewed. */
    reportID: string;
};

function DebugReportActionPreview({reportAction, reportID}: DebugReportActionPreviewProps) {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];

    return (
        <ScrollView>
            <ReportActionItem
                allReports={allReports}
                action={reportAction ?? ({} as ReportAction)}
                report={report ?? ({} as Report)}
                reportActions={[]}
                parentReportAction={undefined}
                displayAsGroup={false}
                isMostRecentIOUReportAction={false}
                shouldDisplayNewMarker={false}
                index={0}
                isFirstVisibleReportAction={false}
                shouldDisplayContextMenu={false}
            />
        </ScrollView>
    );
}

DebugReportActionPreview.displayName = 'DebugReportActionPreview';

export default DebugReportActionPreview;
