import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportIsArchived from '@hooks/useReportIsArchived';

import {isArchivedNonExpenseReport, isSelfDM as isSelfDMUtil, isTrackExpenseReportNew as isTrackExpenseReportUtil} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

import type {ReportDetailsRequestData} from './types';

import ReportDetailsMenuDebugItem from './ReportDetailsMenuDebugItem';
import ReportDetailsMenuGoToRoomItem from './ReportDetailsMenuGoToRoomItem';
import ReportDetailsMenuGoToWorkspaceItem from './ReportDetailsMenuGoToWorkspaceItem';
import ReportDetailsMenuLeaveItem from './ReportDetailsMenuLeaveItem';
import ReportDetailsMenuMarkAsIncompleteItem from './ReportDetailsMenuMarkAsIncompleteItem';
import ReportDetailsMenuMembersOrInviteItem from './ReportDetailsMenuMembersOrInviteItem';
import ReportDetailsMenuPrivateNotesItem from './ReportDetailsMenuPrivateNotesItem';
import ReportDetailsMenuSettingsItem from './ReportDetailsMenuSettingsItem';
import ReportDetailsMenuTrackExpenseItems from './ReportDetailsMenuTrackExpenseItems';

type ReportDetailsMenuItemsProps = {
    reportID: string;
    requestData?: ReportDetailsRequestData;
};

function ReportDetailsMenuItems({reportID, requestData}: ReportDetailsMenuItemsProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);

    const parentReportAction = useParentReportAction(report);

    const isSelfDM = isSelfDMUtil(report);
    const isTrackExpenseReport = isTrackExpenseReportUtil(report, parentReport, parentReportAction);
    const isReportArchived = useReportIsArchived(report?.reportID);
    const isArchivedRoom = isArchivedNonExpenseReport(report, isReportArchived);

    if (isSelfDM) {
        return null;
    }

    if (isArchivedRoom) {
        return null;
    }

    return (
        <>
            <ReportDetailsMenuGoToRoomItem reportID={reportID} />
            <ReportDetailsMenuMembersOrInviteItem reportID={reportID} />
            <ReportDetailsMenuSettingsItem reportID={reportID} />
            {isTrackExpenseReport && !!requestData && !requestData.isDeletedParentAction && (
                <ReportDetailsMenuTrackExpenseItems
                    reportID={reportID}
                    requestData={requestData}
                />
            )}
            <ReportDetailsMenuPrivateNotesItem reportID={reportID} />
            <ReportDetailsMenuMarkAsIncompleteItem reportID={reportID} />
            <ReportDetailsMenuGoToWorkspaceItem reportID={reportID} />
            <ReportDetailsMenuLeaveItem reportID={reportID} />
            <ReportDetailsMenuDebugItem reportID={reportID} />
        </>
    );
}

export default ReportDetailsMenuItems;
