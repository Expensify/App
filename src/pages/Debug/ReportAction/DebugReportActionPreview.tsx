import React from 'react';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import ScrollView from '@components/ScrollView';
import {shouldReportActionBeVisible} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import ReportActionItem from '@pages/home/report/ReportActionItem';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report, ReportAction} from '@src/types/onyx';

type DebugReportActionPreviewProps = {
    /** The report action to be previewed. */
    reportAction: OnyxEntry<ReportAction>;

    /** Current report ID */
    reportID: string;
};

function DebugReportActionPreview({reportAction, reportID}: DebugReportActionPreviewProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const isVisibleAction = reportAction ? shouldReportActionBeVisible(reportAction, reportAction.reportActionID, canUserPerformWriteAction(report)) : false;

    const goToReportAction = () => {
        if (!isVisibleAction) {
            return;
        }
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID, reportAction?.reportActionID));
    };

    return (
        <ScrollView>
            <ReportActionItem
                action={reportAction ?? ({} as ReportAction)}
                report={report ?? ({} as Report)}
                reportActions={[]}
                parentReportAction={undefined}
                displayAsGroup={false}
                isMostRecentIOUReportAction={false}
                shouldDisplayNewMarker={false}
                onPress={goToReportAction}
                index={0}
                isFirstVisibleReportAction={false}
                shouldDisplayContextMenu={false}
            />
        </ScrollView>
    );
}

DebugReportActionPreview.displayName = 'DebugReportActionPreview';

export default DebugReportActionPreview;
