import React from 'react';
import {readFileAsync} from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import {addAttachment} from '@userActions/Report';
import ROUTES from '@src/ROUTES';
import BaseShareLogList from './BaseShareLogList';
import type {ShareLogListProps} from './types';

function ShareLogList({logSource}: ShareLogListProps) {
    const onAttachLogToReport = (reportID: string, filename: string) => {
        readFileAsync(
            logSource,
            filename,
            (file) => {
                addAttachment(reportID, reportID, file);

                const routeToNavigate = ROUTES.REPORT_WITH_ID.getRoute(reportID);
                Navigation.navigate(routeToNavigate);
            },
            () => {},
        );
    };
    return <BaseShareLogList onAttachLogToReport={onAttachLogToReport} />;
}

export default ShareLogList;
