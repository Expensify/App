import React, {useMemo} from 'react';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionList/types';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import Navigation from '@libs/Navigation/Navigation';
import IOURequestEditReportCommon from '@pages/iou/request/step/IOURequestEditReportCommon';

type ReportListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

function SearchTransactionsChangeReport() {
    const {selectedTransactions, clearSelectedTransactions} = useSearchContext();
    const selectedTransactionsKeys = useMemo(() => Object.keys(selectedTransactions), [selectedTransactions]);
    const selectedReportID = undefined;

    const selectReport = (item: ReportListItem) => {
        if (selectedTransactionsKeys.length === 0) {
            return;
        }

        changeTransactionsReport(selectedTransactionsKeys, item.value);
        clearSelectedTransactions();

        Navigation.goBack();
    };

    return (
        <IOURequestEditReportCommon
            backTo={undefined}
            selectedReportID={selectedReportID}
            selectReport={selectReport}
        />
    );
}

SearchTransactionsChangeReport.displayName = 'SearchTransactionsChangeReport';

export default SearchTransactionsChangeReport;
