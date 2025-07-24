import React from 'react';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionList/types';
import useOnyx from '@hooks/useOnyx';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getReportTransactions} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import IOURequestEditReportCommon from './IOURequestEditReportCommon';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

type TransactionGroupListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

type IOURequestEditReportProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.EDIT_REPORT>;

function IOURequestEditReport({route}: IOURequestEditReportProps) {
    const {backTo, reportID} = route.params;

    const {selectedTransactionIDs, clearSelectedTransactions} = useSearchContext();

    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: false});

    const selectReport = (item: TransactionGroupListItem) => {
        if (selectedTransactionIDs.length === 0 || item.value === reportID) {
            Navigation.dismissModal();
            return;
        }

        const allReportTransactions = getReportTransactions(reportID);
        const isMovingAllExpenses = selectedTransactionIDs.length === allReportTransactions.length;

        changeTransactionsReport(selectedTransactionIDs, item.value);
        clearSelectedTransactions(true);

        if (isMovingAllExpenses && !isSearchTopmostFullScreenRoute()) {
            // If moving all expenses, navigate to destination report since original becomes empty (except for Reports page, to maintain the behavior to show the empty report state)
            Navigation.dismissModalWithReport({reportID: item.value});
        } else {
            // If only moving some expenses, stay on original report
            Navigation.dismissModal();
        }
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
