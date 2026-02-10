import React from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import {getAncestors} from '@libs/ReportUtils';
import {addAttachmentWithComment} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import BaseShareLogList from './BaseShareLogList';
import type {ShareLogListProps} from './types';

function ShareLogList({logSource}: ShareLogListProps) {
    const personalDetail = useCurrentUserPersonalDetails();
    const [reportCollection] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [reportDraftCollection] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT, {canBeMissing: true});
    const [reportActionsCollection] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {canBeMissing: false});
    const onAttachLogToReport = (reportID: string, filename: string) => {
        if (!reportID || !logSource) {
            return;
        }
        const report = reportCollection?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
        const ancestors = getAncestors(report, reportCollection, reportDraftCollection, reportActionsCollection);
        const src = `file://${logSource}`;

        addAttachmentWithComment({
            report,
            notifyReportID: reportID,
            ancestors,
            attachments: {name: filename, source: src, uri: src, type: 'text/plain'} as File,
            currentUserAccountID: personalDetail.accountID,
            timezone: personalDetail.timezone,
        });
        const routeToNavigate = ROUTES.REPORT_WITH_ID.getRoute(reportID);
        Navigation.navigate(routeToNavigate);
    };

    return <BaseShareLogList onAttachLogToReport={onAttachLogToReport} />;
}

export default ShareLogList;
