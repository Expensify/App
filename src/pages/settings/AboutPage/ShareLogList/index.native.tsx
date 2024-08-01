import React from 'react';
import Navigation from '@libs/Navigation/Navigation';
import * as Report from '@userActions/Report';
import ROUTES from '@src/ROUTES';
import BaseShareLogList from './BaseShareLogList';
import type {ShareLogListProps} from './types';

function ShareLogList({logSource}: ShareLogListProps) {
    const onAttachLogToReport = (reportID: string, filename: string) => {
        if (!reportID || !logSource) {
            return;
        }
        const src = `file://${logSource}`;
        Report.addAttachment(reportID, {name: filename, source: src, uri: src, type: 'text/plain'} as File);

        const routeToNavigate = ROUTES.REPORT_WITH_ID.getRoute(reportID);
        Navigation.navigate(routeToNavigate);
    };

    return <BaseShareLogList onAttachLogToReport={onAttachLogToReport} />;
}

export default ShareLogList;
