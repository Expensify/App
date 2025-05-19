import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionList/types';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import Navigation from '@libs/Navigation/Navigation';
import IOURequestEditReportCommon from '@pages/iou/request/step/IOURequestEditReportCommon';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

type ReportListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

function SearchMoveTransactions() {
    const {selectedTransactions, clearSelectedTransactions} = useSearchContext();
    const selectedTransactionsKeys = useMemo(() => Object.keys(selectedTransactions), [selectedTransactions]);

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const transactionsReports = useMemo(() => {
        const reports = Object.values(selectedTransactions).reduce((acc, transaction) => {
            const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`];
            if (report) {
                acc.add(report);
            }
            return acc;
        }, new Set<Report>());
        return [...reports];
    }, [allReports, selectedTransactions]);

    const selectReport = (item: ReportListItem) => {
        if (selectedTransactionsKeys.length === 0) {
            return;
        }

        changeTransactionsReport(selectedTransactionsKeys, item.value);
        clearSelectedTransactions();

        Navigation.dismissModalWithReport({reportID: item.value});
    };

    return (
        <IOURequestEditReportCommon
            backTo={undefined}
            transactionsReports={transactionsReports}
            selectReport={selectReport}
        />
    );
}

SearchMoveTransactions.displayName = 'IOURequestEditReport';

export default SearchMoveTransactions;
