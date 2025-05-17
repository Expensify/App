import React from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ListItem} from '@components/SelectionList/types';
import {changeTransactionsReport, setTransactionReport} from '@libs/actions/Transaction';
import Navigation from '@libs/Navigation/Navigation';
import {findSelfDMReportID} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const reportID = transaction?.reportID || transaction?.participants?.at(0)?.reportID;
    const selfDMReportID = findSelfDMReportID();
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
            }
        }
        Navigation.dismissModalWithReport({reportID: item.value});
    };

    const removeFromReport = () => {
        if (!transaction) {
            return;
        }
        changeTransactionsReport([transaction.transactionID], CONST.REPORT.UNREPORTED_REPORT_ID);
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(selfDMReportID));
    };

    return (
        <IOURequestEditReportCommon
            backTo={backTo}
            transactionReport={transactionReport}
            selectReport={selectReport}
            removeFromReport={removeFromReport}
            isEditing={isEditing}
        />
    );
}

IOURequestStepReport.displayName = 'IOURequestStepReport';

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepReport));
