import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import type {ReportSettingsNavigatorParamList} from '@navigation/types';
import ChatNameEditPage from '@pages/ChatNameEditPage';
import withReportOrNotFound from '@pages/home/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from '@pages/home/report/withReportOrNotFound';
import type SCREENS from '@src/SCREENS';
import RoomNamePage from './RoomNamePage';

type NamePageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.NAME>;

function NamePage({report}: NamePageProps) {
    if (ReportUtils.isGroupChat(report) || ReportUtils.isTripRoom(report)) {
        return <ChatNameEditPage report={report} />;
    }

    return <RoomNamePage report={report} />;
}

NamePage.displayName = 'NamePage';

export default withReportOrNotFound()(NamePage);
