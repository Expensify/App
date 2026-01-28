import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isGroupChat, isTripRoom} from '@libs/ReportUtils';
import type {ReportSettingsNavigatorParamList} from '@navigation/types';
import GroupChatNameEditPage from '@pages/GroupChatNameEditPage';
import withReportOrNotFound from '@pages/inbox/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from '@pages/inbox/report/withReportOrNotFound';
import TripChatNameEditPage from '@pages/TripChatNameEditPage';
import type SCREENS from '@src/SCREENS';
import RoomNamePage from './RoomNamePage';

type NamePageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.NAME>;

function NamePage({report}: NamePageProps) {
    if (isTripRoom(report)) {
        return <TripChatNameEditPage report={report} />;
    }

    if (isGroupChat(report)) {
        return <GroupChatNameEditPage report={report} />;
    }

    return <RoomNamePage report={report} />;
}

export default withReportOrNotFound()(NamePage);
