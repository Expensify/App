import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Text from '@components/Text';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import TripStatusIndicator from './TripStatusIndicator';

type DistanceCounterProps = {
    /** The transaction object being modified in Onyx */
    transaction: OnyxEntry<Transaction>;
    /** The report corresponding to the reportID in the route params */
    report: OnyxEntry<Report>;
};

function DistanceCounter({report, transaction}: DistanceCounterProps) {
    const styles = useThemeStyles();
    const policy = usePolicy(report?.policyID);
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {canBeMissing: true});

    const unit = DistanceRequestUtils.getRate({transaction, policy}).unit;

    const distance = DistanceRequestUtils.convertDistanceUnit(gpsDraftDetails?.distanceInMeters ?? 0, unit).toFixed(1);
    const tripInProgressOrStopped = (gpsDraftDetails?.gpsPoints?.length ?? 0) > 0 || gpsDraftDetails?.isTracking;

    return (
        <View style={[styles.flex1, styles.pb40]}>
            <View style={[styles.justifyContentCenter, styles.h100, styles.alignSelfCenter]}>
                <View style={(styles.pRelative, styles.w100)}>
                    <TripStatusIndicator />

                    <Text style={[styles.iouAmountTextInput, styles.colorMuted]}>
                        <Text style={[styles.iouAmountTextInput, !tripInProgressOrStopped && styles.colorMuted]}>{distance}</Text>
                        {` ${unit}`}
                    </Text>
                </View>
            </View>
        </View>
    );
}

export default DistanceCounter;
