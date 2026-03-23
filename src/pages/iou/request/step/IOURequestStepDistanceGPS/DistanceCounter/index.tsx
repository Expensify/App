import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Unit} from '@src/types/onyx/Policy';
import TripStatusIndicator from './TripStatusIndicator';

type DistanceCounterProps = {
    /** Distance unit of the ongoing GPS trip */
    unit: Unit;
};

function DistanceCounter({unit}: DistanceCounterProps) {
    const styles = useThemeStyles();
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);

    const distance = DistanceRequestUtils.convertDistanceUnit(gpsDraftDetails?.distanceInMeters ?? 0, unit).toFixed(1);

    const tripInProgressOrStopped = (gpsDraftDetails?.gpsPoints?.length ?? 0) > 0 || gpsDraftDetails?.isTracking;

    return (
        <View style={[styles.flex1, styles.pb40]}>
            <View style={[styles.justifyContentCenter, styles.h100, styles.w100]}>
                <View style={[styles.pRelative, styles.w100, styles.alignItemsCenter]}>
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
