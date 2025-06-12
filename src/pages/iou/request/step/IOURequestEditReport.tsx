import React from 'react';
import {useOnyx} from 'react-native-onyx';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionList/types';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import IOURequestEditReportCommon from './IOURequestEditReportCommon';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

type ReportListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

type IOURequestEditReportProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.EDIT_REPORT>;

function IOURequestEditReport({route}: IOURequestEditReportProps) {
    const {backTo, reportID} = route.params;

    const {selectedTransactionIDs, clearSelectedTransactions} = useSearchContext();

    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: false});

    const selectReport = (item: ReportListItem) => {
        if (selectedTransactionIDs.length === 0) {
            return;
        }
        if (item.value !== transactionReport?.reportID) {
            changeTransactionsReport(selectedTransactionIDs, item.value);
            clearSelectedTransactions(true);
        }
        Navigation.dismissModalWithReport({reportID: item.value});
    };

    return (
        <IOURequestEditReportCommon
            backTo={backTo}
            transactionsReports={transactionReport ? [transactionReport] : []}
            selectReport={selectReport}
        />
    );
}

IOURequestEditReport.displayName = 'IOURequestEditReport';

export default withWritableReportOrNotFound(IOURequestEditReport);
