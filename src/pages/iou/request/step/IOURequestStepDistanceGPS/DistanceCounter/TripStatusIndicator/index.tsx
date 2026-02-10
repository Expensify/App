import React from 'react';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';

function TripStatusIndicatorWrapper({children}: React.PropsWithChildren) {
    const styles = useThemeStyles();

    return <Text style={[styles.pAbsolute, styles.l0, styles.r0, styles.bFull, styles.mb1, styles.textAlignCenter, styles.fontSizeLabel, styles.mutedTextLabel]}>{children}</Text>;
}

function TripStatusIndicator() {
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {canBeMissing: true});
    const {translate} = useLocalize();

    const isTrackingInProgress = !!gpsDraftDetails?.isTracking;

    if (isTrackingInProgress) {
        return <TripStatusIndicatorWrapper>{translate('gps.trackingDistance')}</TripStatusIndicatorWrapper>;
    }

    const isTripStopped = (gpsDraftDetails?.gpsPoints?.length ?? 0) > 0;

    if (isTripStopped) {
        return <TripStatusIndicatorWrapper>{translate('gps.stopped')}</TripStatusIndicatorWrapper>;
    }

    return null;
}

export default TripStatusIndicator;
