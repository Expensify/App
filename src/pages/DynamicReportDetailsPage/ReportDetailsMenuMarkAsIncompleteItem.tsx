import MenuItem from '@components/MenuItem';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportIsArchived from '@hooks/useReportIsArchived';

import Navigation from '@libs/Navigation/Navigation';
import {isCanceledTaskReport as isCanceledTaskReportUtil, isCompletedTaskReport, isTaskReport as isTaskReportUtil} from '@libs/ReportUtils';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import {canActionTask, reopenTask} from '@userActions/Task';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import {delegateEmailSelector} from '@selectors/Account';
import React from 'react';

type ReportDetailsMenuMarkAsIncompleteItemProps = {
    reportID: string;
};

function ReportDetailsMenuMarkAsIncompleteItem({reportID}: ReportDetailsMenuMarkAsIncompleteItemProps) {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Checkmark']);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const parentReportAction = useParentReportAction(report);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails?.accountID;
    const isTaskReport = isTaskReportUtil(report);
    const isCanceledTaskReport = isCanceledTaskReportUtil(report, parentReportAction);
    const isParentReportArchived = useReportIsArchived(parentReport?.reportID);
    const isTaskActionable = canActionTask(report, parentReportAction, currentUserAccountID, parentReport, isParentReportArchived);

    // Show actions related to Task Reports
    const shouldShowMarkAsIncomplete = isTaskReport && !isCanceledTaskReport && isCompletedTaskReport(report) && isTaskActionable;
    const navigateBackFromReportDetailsPath = useDynamicBackPath(DYNAMIC_ROUTES.REPORT_DETAILS.path, shouldShowMarkAsIncomplete);

    if (!shouldShowMarkAsIncomplete) {
        return null;
    }

    return (
        <MenuItem
            title={translate('task.markAsIncomplete')}
            icon={expensifyIcons.Checkmark}
            onPress={callFunctionIfActionIsAllowed(() => {
                Navigation.goBack(navigateBackFromReportDetailsPath);
                reopenTask(report, parentReport, currentUserAccountID, delegateEmail);
            })}
            isAnonymousAction={false}
        />
    );
}

export default ReportDetailsMenuMarkAsIncompleteItem;
