import React from 'react';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isGroupChat, isTripRoom} from '@libs/ReportUtils';
import type {ReportSettingsNavigatorParamList} from '@navigation/types';
import GroupChatNameEditPage from '@pages/GroupChatNameEditPage';
import withReportOrNotFound from '@pages/inbox/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from '@pages/inbox/report/withReportOrNotFound';
import TripChatNameEditPage from '@pages/TripChatNameEditPage';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import RoomNamePage from './RoomNamePage';

type DynamicNamePageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.DYNAMIC_SETTINGS_NAME>;

function DynamicNamePage({report}: DynamicNamePageProps) {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.REPORT_SETTINGS_NAME.path);

    if (isTripRoom(report)) {
        return <TripChatNameEditPage report={report} />;
    }

    if (isGroupChat(report)) {
        return <GroupChatNameEditPage report={report} />;
    }

    return (
        <RoomNamePage
            report={report}
            navigateBackTo={backPath}
        />
    );
}

export default withReportOrNotFound()(DynamicNamePage);
