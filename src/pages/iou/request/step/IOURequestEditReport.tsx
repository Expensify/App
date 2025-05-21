import React from 'react';
import {useOnyx} from 'react-native-onyx';
import {useMoneyRequestReportContext} from '@components/MoneyRequestReportView/MoneyRequestReportContext';
import type {ListItem} from '@components/SelectionList/types';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import Navigation from '@libs/Navigation/Navigation';
import {findSelfDMReportID} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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

    const {selectedTransactionsID, setSelectedTransactionsID} = useMoneyRequestReportContext();
    const selfDMReportID = findSelfDMReportID();
    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: false});

    const selectReport = (item: ReportListItem) => {
        if (selectedTransactionsID.length === 0) {
            return;
        }
        if (item.value !== transactionReport?.reportID) {
            changeTransactionsReport(selectedTransactionsID, item.value);
            setSelectedTransactionsID([]);
        }
        Navigation.dismissModalWithReport({reportID: item.value});
    };

    const removeFromReport = () => {
        if (!transactionReport || selectedTransactionsID.length === 0) {
            return;
        }
        changeTransactionsReport(selectedTransactionsID, CONST.REPORT.UNREPORTED_REPORT_ID);
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(selfDMReportID));
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
