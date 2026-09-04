import MentionReportContext from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useReportIsArchived from '@hooks/useReportIsArchived';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {canEditReportDescription, getReportDescription, isChatRoom, isTaskReport} from '@libs/ReportUtils';

import {canModifyTask} from '@userActions/Task';

import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type ReportDetailsDescriptionProps = {
    report: Report;
    policy: OnyxEntry<Policy>;
    parentReport: OnyxEntry<Report>;
};

function ReportDetailsDescription({report, policy, parentReport}: ReportDetailsDescriptionProps) {
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const isParentReportArchived = useReportIsArchived(parentReport?.reportID);

    const isTaskModifiable = canModifyTask(report, currentUserPersonalDetails?.accountID, isParentReportArchived);
    const shouldShowReportDescription = isChatRoom(report) && (canEditReportDescription(report, policy) || report.description !== '') && (isTaskReport(report) ? isTaskModifiable : true);

    if (!shouldShowReportDescription) {
        return null;
    }

    const mentionReportContextValue = {currentReportID: report.reportID, exactlyMatch: true};

    return (
        <OfflineWithFeedback pendingAction={report.pendingFields?.description}>
            <MentionReportContext.Provider value={mentionReportContextValue}>
                <MenuItemWithTopDescription
                    shouldShowRightIcon
                    interactive
                    title={getReportDescription(report)}
                    shouldRenderAsHTML
                    shouldTruncateTitle
                    characterLimit={100}
                    shouldCheckActionAllowedOnPress={false}
                    description={translate('reportDescriptionPage.roomDescription')}
                    onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_DESCRIPTION.path))}
                />
            </MentionReportContext.Provider>
        </OfflineWithFeedback>
    );
}

export default ReportDetailsDescription;
