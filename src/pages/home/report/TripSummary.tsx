import React from 'react';
import {useOnyx} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import TripDetailsView from '@components/ReportActionItem/TripDetailsView';
import useTripTransactions from '@hooks/useTripTransactions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportTransactionsDerivedValue} from '@src/types/onyx';

type TripSummaryProps = {
    /** The report ID */
    reportID: string | undefined;

    /** The transactions for the report */
    transactionsByReportID: ReportTransactionsDerivedValue;
};

function TripSummary({reportID, transactionsByReportID}: TripSummaryProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID ?? CONST.DEFAULT_NUMBER_ID}`);
    const tripTransactions = useTripTransactions(reportID, transactionsByReportID);

    if (!reportID || tripTransactions.length === 0) {
        return null;
    }

    return (
        <OfflineWithFeedback pendingAction={report?.pendingAction}>
            <TripDetailsView
                tripRoomReportID={reportID}
                tripTransactions={tripTransactions}
                shouldShowHorizontalRule={false}
            />
        </OfflineWithFeedback>
    );
}

TripSummary.displayName = 'TripSummary';

export default TripSummary;
