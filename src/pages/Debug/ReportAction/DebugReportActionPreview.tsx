import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
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
    const personalDetails = usePersonalDetails();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

    return (
        <ScrollView>
            <ReportActionItem
                action={reportAction ?? ({} as ReportAction)}
                report={report ?? ({} as Report)}
                parentReportAction={undefined}
                displayAsGroup={false}
                shouldDisplayNewMarker={false}
                index={0}
                isFirstVisibleReportAction={false}
                shouldDisplayContextMenu={false}
                personalDetails={personalDetails}
            />
        </ScrollView>
    );
}

export default DebugReportActionPreview;
