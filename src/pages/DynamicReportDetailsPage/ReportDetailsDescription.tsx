import MentionReportContext from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {canEditReportDescription as canEditReportDescriptionUtil, getReportDescription, isChatRoom as isChatRoomUtil, isTaskReport as isTaskReportUtil} from '@libs/ReportUtils';

import {canModifyTask} from '@userActions/Task';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

type ReportDetailsDescriptionProps = {
    reportID: string;
};

function ReportDetailsDescription({reportID}: ReportDetailsDescriptionProps) {
    const {translate} = useLocalize();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails?.accountID;
    const isParentReportArchived = useReportIsArchived(parentReport?.reportID);

    if (!report?.reportID) {
        return null;
    }

    const isChatRoom = isChatRoomUtil(report);
    const isTaskReport = isTaskReportUtil(report);
    const isTaskModifiable = canModifyTask(report, currentUserAccountID, isParentReportArchived);
    const canEditReportDescription = canEditReportDescriptionUtil(report, policy);
    const shouldShowReportDescription = isChatRoom && (canEditReportDescription || report.description !== '') && (isTaskReport ? isTaskModifiable : true);

    if (!shouldShowReportDescription) {
        return null;
    }

    const mentionReportContextValue = {currentReportID: report.reportID, exactlyMatch: true};

    return (
        <OfflineWithFeedback pendingAction={report.pendingFields?.description}>
            <MentionReportContext.Provider value={mentionReportContextValue}>
                <MenuItem.Root onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_DESCRIPTION.path))}>
                    <MenuItem.Row>
                        <MenuItemField.Content name={translate('reportDescriptionPage.roomDescription')}>
                            {!!getReportDescription(report) && <MenuItem.FieldValueHTML characterLimit={100}>{getReportDescription(report)}</MenuItem.FieldValueHTML>}
                        </MenuItemField.Content>
                        <MenuItem.Trailing>{canEditReportDescription && <MenuItem.Chevron />}</MenuItem.Trailing>
                    </MenuItem.Row>
                </MenuItem.Root>
            </MentionReportContext.Provider>
        </OfflineWithFeedback>
    );
}

export default ReportDetailsDescription;
