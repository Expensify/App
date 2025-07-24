import React from 'react';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionList/types';
import useOnyx from '@hooks/useOnyx';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
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
    const {backTo, reportID, shouldTurnOffSelectionMode} = route.params;

    const {selectedTransactionIDs, clearSelectedTransactions} = useSearchContext();

    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: false});

    const selectReport = (item: TransactionGroupListItem) => {
        if (selectedTransactionIDs.length === 0 || item.value === reportID) {
            Navigation.dismissModal();
            return;
        }

        changeTransactionsReport(selectedTransactionIDs, item.value);
        turnOffMobileSelectionMode();
        clearSelectedTransactions(true);
        Navigation.dismissModalWithReport({reportID: item.value});
    };

    const removeFromReport = () => {
        if (!transactionReport || selectedTransactionIDs.length === 0) {
            return;
        }
        changeTransactionsReport(selectedTransactionIDs, CONST.REPORT.UNREPORTED_REPORT_ID);
        if (shouldTurnOffSelectionMode) {
            turnOffMobileSelectionMode();
        }
        clearSelectedTransactions(true);
        Navigation.dismissModal();
    };

    return (
        <IOURequestEditReportCommon
            backTo={backTo}
            transactionsReports={transactionReport ? [transactionReport] : []}
            selectReport={selectReport}
            removeFromReport={removeFromReport}
            isEditing
        />
    );
}

IOURequestEditReport.displayName = 'IOURequestEditReport';

export default withWritableReportOrNotFound(IOURequestEditReport);
