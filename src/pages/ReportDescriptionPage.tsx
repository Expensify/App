import type {RouteProp} from '@react-navigation/native';
import React from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import * as ReportUtils from '@libs/ReportUtils';
import type * as OnyxTypes from '@src/types/onyx';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import RoomDescriptionPage from './RoomDescriptionPage';
import TaskDescriptionPage from './tasks/TaskDescriptionPage';

type ReportDescriptionPageProps = {
    /** The report currently being looked at */
    report: OnyxTypes.Report;

    /** Policy for the current report */
    policies: OnyxCollection<OnyxTypes.Policy>;

    /** Route params */
    route: RouteProp<{params: {reportID: string}}>;
};

function ReportDescriptionPage(props: ReportDescriptionPageProps) {
    const isTask = ReportUtils.isTaskReport(props.report);

    if (isTask) {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <TaskDescriptionPage {...props} />;
    }

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <RoomDescriptionPage {...props} />;
}

ReportDescriptionPage.displayName = 'ReportDescriptionPage';

export default withReportOrNotFound()(ReportDescriptionPage);
