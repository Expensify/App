import React from 'react';
import {useOnyx} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import TripDetailsView from '@components/ReportActionItem/TripDetailsView';
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
