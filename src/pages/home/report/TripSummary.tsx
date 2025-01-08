import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import TripDetailsView from '@components/ReportActionItem/TripDetailsView';
import useThemeStyles from '@hooks/useThemeStyles';
import type * as OnyxTypes from '@src/types/onyx';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';
import RepliesDivider from './RepliesDivider';

type TripSummaryProps = {
    /** The current report is displayed */
    report: OnyxEntry<OnyxTypes.Report>;
};

function TripSummary({report}: TripSummaryProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.pRelative]}>
            <AnimatedEmptyStateBackground />
            <OfflineWithFeedback pendingAction={report?.pendingAction}>
                <TripDetailsView
                    tripRoomReportID={report?.reportID ?? '-1'}
                    shouldShowHorizontalRule={false}
                />
            </OfflineWithFeedback>
            <RepliesDivider shouldHideThreadDividerLine={false} />
        </View>
    );
}

TripSummary.displayName = 'TripSummary';

export default TripSummary;
