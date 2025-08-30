import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import Navigation from '@libs/Navigation/Navigation';
import {addAttachment} from '@userActions/Report';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import BaseShareLogList from './BaseShareLogList';
import type {ShareLogListProps} from './types';

function ShareLogList({logSource}: ShareLogListProps) {
    const personalDetail = useCurrentUserPersonalDetails();
    const onAttachLogToReport = (reportID: string, filename: string) => {
        if (!reportID || !logSource) {
            return;
        }
        const src = `file://${logSource}`;
        addAttachment(reportID, {name: filename, source: src, uri: src, type: 'text/plain'} as File, personalDetail.timezone ?? CONST.DEFAULT_TIME_ZONE);

        const routeToNavigate = ROUTES.REPORT_WITH_ID.getRoute(reportID);
        Navigation.navigate(routeToNavigate);
    };

    return <BaseShareLogList onAttachLogToReport={onAttachLogToReport} />;
}

export default ShareLogList;
