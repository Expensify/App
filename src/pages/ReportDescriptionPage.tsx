import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import * as ReportUtils from '@libs/ReportUtils';

import type {ReportDescriptionNavigatorParamList} from '@navigation/types';

import type SCREENS from '@src/SCREENS';

import React from 'react';

import type {WithReportOrNotFoundProps} from './inbox/report/withReportOrNotFound';

import withReportOrNotFound from './inbox/report/withReportOrNotFound';
import RoomDescriptionPage from './RoomDescriptionPage';
import TaskDescriptionPage from './tasks/TaskDescriptionPage';

type ReportDescriptionPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportDescriptionNavigatorParamList, typeof SCREENS.DYNAMIC_REPORT_DESCRIPTION>;

function ReportDescriptionPage(props: ReportDescriptionPageProps) {
    const isTask = ReportUtils.isTaskReport(props.report);

    if (isTask) {
        return <TaskDescriptionPage {...props} />;
    }

    return <RoomDescriptionPage {...props} />;
}

export default withReportOrNotFound()(ReportDescriptionPage);
