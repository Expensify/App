import {
    isReportPreviewAction as isReportPreviewActionUtils, 
    isSentMoneyReportAction as isSentMoneyReportActionUtils, 
    isTransactionThread as isTransactionThreadUtils
} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ReportAction from '@src/types/onyx/ReportAction';
import Report from '@src/types/onyx/Report';
import useOnyx from './useOnyx';

type AncestorReportAndReportAction = {
    report: Report,
    reportAction: ReportAction,
}

type AncestorReportAndReportActions = Array<AncestorReportAndReportAction>;

function useAncestorReportAndReportActions(reportID: string, includeTransactionThread = false): AncestorReportAndReportActions {

    const [ancestorReports] = useOnyx(
        ONYXKEYS.COLLECTION.REPORT, 
        {
            canBeMissing: false,
            selector: (allReports) => {
                if (!allReports){
                    return {};
                }
                const report = allReports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
                if (!report || !report.parentReportID) {
                    return {};
                }

                let parentReport = allReports[`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`];

                const reports = {[report.reportID]: report};

                while (parentReport) {
                    reports[parentReport.reportID] = parentReport;
                    if (!parentReport.parentReportID) {
                        break;
                    }
                    parentReport = allReports[`${ONYXKEYS.COLLECTION.REPORT}${parentReport.parentReportID}`];
                }

                return reports;

            }
        });

    const [ancestorReportAndReportActions] = useOnyx(
        ONYXKEYS.COLLECTION.REPORT_ACTIONS, 
        {
            canBeMissing: false,
            selector: (allReportActions) => {
                if (!allReportActions || !ancestorReports){
                    return [];
                }

                const reportAndReportActions: AncestorReportAndReportActions = [];

                for (const report of Object.values(ancestorReports)) {
                    if (!report.parentReportID || !report.parentReportActionID) {
                        continue;
                    }
                    
                    const parentReport = ancestorReports[report.parentReportID];
                    if (!parentReport) {
                        continue;
                    }
                    
                    const parentReportAction = allReportActions?.[report.parentReportID]?.[report.parentReportActionID];
                    if (!parentReportAction) {
                        continue;
                    }

                    const isTransactionThread = isTransactionThreadUtils(parentReportAction);
                    const isReportPreviewAction = isReportPreviewActionUtils(parentReportAction);
                    const isSentMoneyReportAction = isSentMoneyReportActionUtils(parentReportAction);

                    if (!includeTransactionThread && ((isTransactionThread && !isSentMoneyReportAction) || isReportPreviewAction)) {
                        continue;
                    }

                    reportAndReportActions.push({
                        report: parentReport,
                        reportAction: parentReportAction,
                    });
                }

                return reportAndReportActions;

            }
        }
    );

    return ancestorReportAndReportActions ?? [];
}

export default useAncestorReportAndReportActions;
