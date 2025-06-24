import React from 'react';
import {useOnyx} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import TripDetailsView from '@components/ReportActionItem/TripDetailsView';
import useTripTransactions from '@hooks/useTripTransactions';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportTransactionsAndViolationsDerivedValue} from '@src/types/onyx';

type TripSummaryProps = {
    /** The report ID */
    reportID: string | undefined;

    /** The transactions for the report */
    transactionsAndViolationsByReport: ReportTransactionsAndViolationsDerivedValue;
};

function TripSummary({reportID, transactionsAndViolationsByReport}: TripSummaryProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const tripTransactions = useTripTransactions(reportID, transactionsAndViolationsByReport);

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
