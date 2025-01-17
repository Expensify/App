import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import TripDetailsView from '@components/ReportActionItem/TripDetailsView';
import useThemeStyles from '@hooks/useThemeStyles';
import {getAllTripsTransactions} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';
import RepliesDivider from './RepliesDivider';

type TripSummaryProps = {
    /** The current report is displayed */
    report: OnyxEntry<OnyxTypes.Report>;
};

function TripSummary({report}: TripSummaryProps) {
    const styles = useThemeStyles();

    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const tripTransactions = useMemo(() => getAllTripsTransactions(report?.reportID, reports, transactions), [report?.reportID, reports, transactions]);

    if (!report?.reportID) {
        return null;
    }

    return (
        <View style={[styles.pRelative]}>
            <AnimatedEmptyStateBackground />
            <OfflineWithFeedback pendingAction={report.pendingAction}>
                <TripDetailsView
                    tripRoomReportID={report.reportID}
                    tripTransactions={tripTransactions}
                    shouldShowHorizontalRule={false}
                />
            </OfflineWithFeedback>
            <RepliesDivider shouldHideThreadDividerLine={false} />
        </View>
    );
}

TripSummary.displayName = 'TripSummary';

export default TripSummary;
