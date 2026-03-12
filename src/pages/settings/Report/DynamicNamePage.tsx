import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useReportFromDynamicRoute from '@hooks/useReportFromDynamicRoute';
import {isGroupChat, isTripRoom} from '@libs/ReportUtils';
import GroupChatNameEditPage from '@pages/GroupChatNameEditPage';
import TripChatNameEditPage from '@pages/TripChatNameEditPage';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import RoomNamePage from './RoomNamePage';

function DynamicNamePage() {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.REPORT_SETTINGS_NAME.path);
    const {report, isLoading} = useReportFromDynamicRoute();

    if (isLoading) {
        return <FullscreenLoadingIndicator />;
    }

    if (isEmptyObject(report)) {
        return <FullPageNotFoundView shouldShow />;
    }

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

export default DynamicNamePage;
