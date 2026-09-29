import ONYXKEYS from '@src/ONYXKEYS';
import type {DatabaseSizeMeasurement} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

/** Persists the latest database size measurement, so the next app start can attach it to telemetry spans right away */
function setLastMeasuredDatabaseSize(measurement: DatabaseSizeMeasurement): Promise<unknown> {
    return Onyx.set(ONYXKEYS.LAST_MEASURED_DATABASE_SIZE, measurement);
}

// eslint-disable-next-line import/prefer-default-export
export {setLastMeasuredDatabaseSize};
