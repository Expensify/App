import React from 'react';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionList/types';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import Navigation from '@libs/Navigation/Navigation';
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

    const selectReport = (item: ReportListItem) => {
        if (selectedTransactionIDs.length === 0 || item.value === reportID) {
            Navigation.dismissModal();
            return;
        }

        changeTransactionsReport(selectedTransactionIDs, item.value);
        clearSelectedTransactions(true);
        Navigation.dismissModalWithReport({reportID: item.value});
    };

    return (
        <IOURequestEditReportCommon
            backTo={backTo}
            selectedReportID={reportID}
            selectReport={selectReport}
        />
    );
}

IOURequestEditReport.displayName = 'IOURequestEditReport';

export default withWritableReportOrNotFound(IOURequestEditReport);
