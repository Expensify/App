import React from 'react';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import TripDetailsView from '@components/ReportActionItem/TripDetailsView';
import useOnyx from '@hooks/useOnyx';
import useTripTransactions from '@hooks/useTripTransactions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type TripSummaryProps = {
    /** The report ID */
    reportID: string | undefined;
};

function TripSummary({reportID}: TripSummaryProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID ?? CONST.DEFAULT_NUMBER_ID}`);
    const tripTransactions = useTripTransactions(reportID);

    if (!reportID) {
        return null;
    }

    return (
        <OfflineWithFeedback pendingAction={report?.pendingAction}>
            <TripDetailsView
                tripRoomReport={report}
                tripTransactions={tripTransactions}
                shouldShowHorizontalRule={false}
            />
        </OfflineWithFeedback>
    );
}

export default TripSummary;
