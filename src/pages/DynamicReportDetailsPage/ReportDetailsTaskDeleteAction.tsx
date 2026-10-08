import MenuItemAction from '@components/MenuItem/presets/MenuItemAction';

import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHasOutstandingChildTask from '@hooks/useHasOutstandingChildTask';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportIsArchived from '@hooks/useReportIsArchived';

import Navigation from '@libs/Navigation/Navigation';
import {canWriteInReport, findLastAccessedReport, isCanceledTaskReport as isCanceledTaskReportUtil, isClosedReport, isTaskReport as isTaskReportUtil} from '@libs/ReportUtils';

import {canActionTask, canModifyTask} from '@userActions/Task';
import {deleteTask} from '@userActions/TaskDeletion';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {delegateEmailSelector} from '@selectors/Account';
import React from 'react';

import type {CaseID} from './types';

import useReportDetailsDeleteModal from './hooks/useReportDetailsDeleteModal';

type ReportDetailsTaskDeleteActionProps = {
    reportID: string;
    caseID: CaseID;
};

type ReportDetailsTaskDeleteActionContentProps = {
    report: OnyxTypes.Report;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;
    currentUserAccountID: number;
    caseID: CaseID;
};

function ReportDetailsTaskDeleteActionContent({report, parentReport, parentReportAction, currentUserAccountID, caseID}: ReportDetailsTaskDeleteActionContentProps) {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Trashcan']);
    const taskDeleteBackTo = Navigation.getTopmostSearchReportRouteParams()?.backTo;
    const hasOutstandingChildTask = useHasOutstandingChildTask(report);
    const [guideAccountIDs] = useOnyx(ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [reportActionsForOriginalReportID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const isReportArchived = useReportIsArchived(report.reportID);
    const ancestors = useAncestors(report);
    const showDeleteModal = useReportDetailsDeleteModal(report.reportID, caseID, parentReportAction);

    const deleteTransaction = () => {
        deleteTask(
            report,
            parentReport,
            isReportArchived,
            currentUserAccountID,
            hasOutstandingChildTask,
            parentReportAction,
            conciergeReportID,
            delegateEmail,
            reportActionsForOriginalReportID,
            {
                ancestors,
                shouldNavigateBack: !taskDeleteBackTo,
                lastAccessedReportID: findLastAccessedReport(false, guideAccountIDs, false, report.reportID)?.reportID,
            },
        );
    };

    return (
        <MenuItemAction
            key={CONST.REPORT_DETAILS_MENU_ITEM.DELETE}
            icon={expensifyIcons.Trashcan}
            title={translate('common.delete')}
            onPress={() => showDeleteModal(undefined, deleteTransaction)}
        />
    );
}

/** The Delete row of a task, rendered for the default case where no money request data exists */
function ReportDetailsTaskDeleteAction({reportID, caseID}: ReportDetailsTaskDeleteActionProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const parentReportAction = useParentReportAction(report);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails?.accountID;
    const isParentReportArchived = useReportIsArchived(parentReport?.reportID);

    const shouldShowTaskDeleteButton =
        isTaskReportUtil(report) &&
        !isCanceledTaskReportUtil(report, parentReportAction) &&
        canWriteInReport(report) &&
        report?.stateNum !== CONST.REPORT.STATE_NUM.APPROVED &&
        !isClosedReport(report) &&
        canModifyTask(report, currentUserAccountID, isParentReportArchived) &&
        canActionTask(report, parentReportAction, currentUserAccountID, parentReport, isParentReportArchived);

    if (!report?.reportID || !shouldShowTaskDeleteButton) {
        return null;
    }

    return (
        <ReportDetailsTaskDeleteActionContent
            report={report}
            parentReport={parentReport}
            parentReportAction={parentReportAction}
            currentUserAccountID={currentUserAccountID}
            caseID={caseID}
        />
    );
}

export default ReportDetailsTaskDeleteAction;
