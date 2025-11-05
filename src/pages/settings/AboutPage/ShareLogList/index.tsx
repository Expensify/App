import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {readFileAsync} from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import {addAttachmentWithComment} from '@userActions/Report';
import ROUTES from '@src/ROUTES';
import BaseShareLogList from './BaseShareLogList';
import type {ShareLogListProps} from './types';

function ShareLogList({logSource}: ShareLogListProps) {
    const personalDetail = useCurrentUserPersonalDetails();
    const onAttachLogToReport = (reportID: string, filename: string) => {
        readFileAsync(
            logSource,
            filename,
            (file) => {
                addAttachmentWithComment(reportID, reportID, file, undefined, personalDetail?.timezone);
                const routeToNavigate = ROUTES.REPORT_WITH_ID.getRoute(reportID);
                Navigation.navigate(routeToNavigate);
            },
            () => {},
        );
    };
    return <BaseShareLogList onAttachLogToReport={onAttachLogToReport} />;
}

export default ShareLogList;
