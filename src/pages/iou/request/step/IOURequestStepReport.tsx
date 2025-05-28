import React from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ListItem} from '@components/SelectionList/types';
import {changeTransactionsReport, setTransactionReport} from '@libs/actions/Transaction';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import IOURequestEditReportCommon from './IOURequestEditReportCommon';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

type ReportListItemType = ListItem & {
    /** reportID of the report */
    value: string;
};

type IOURequestStepReportProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_REPORT> & WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_REPORT>;

function IOURequestStepReport({route, transaction}: IOURequestStepReportProps) {
    const {backTo, action} = route.params;
    const reportID = transaction?.reportID === '0' ? transaction?.participants?.at(0)?.reportID : transaction?.reportID;
    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});

    const isEditing = action === CONST.IOU.ACTION.EDIT;

    const selectReport = (item: ReportListItemType) => {
        if (!transaction) {
            return;
        }
        if (item.value !== transaction.reportID) {
            setTransactionReport(transaction.transactionID, item.value, !isEditing);
            if (isEditing) {
                changeTransactionsReport([transaction.transactionID], item.value);
                Navigation.dismissModalWithReport({reportID: item.value});
                return;
            }
        }
        Navigation.goBack(backTo);
    };

    const removeFromReport = () => {
        if (!transaction) {
            return;
        }
        changeTransactionsReport([transaction.transactionID], CONST.REPORT.UNREPORTED_REPORT_ID);
        Navigation.navigate(backTo);
    };

    return (
        <IOURequestEditReportCommon
            backTo={backTo}
            transactionsReports={transactionReport ? [transactionReport] : []}
            selectReport={selectReport}
            removeFromReport={removeFromReport}
            isEditing={isEditing}
        />
    );
}

IOURequestStepReport.displayName = 'IOURequestStepReport';

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepReport));
