import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import is2dArray from '@libs/is2dArray';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type {GpsDraftDetails} from '@src/types/onyx';
import type {GPSPoint, GPSPointAddress} from '@src/types/onyx/GpsDraftDetails';

type OldGpsDraftDetails = Omit<GpsDraftDetails, 'gpsPoints'> & {
    gpsPoints: GPSPoint[] | GPSPoint[][];
    startAddress?: GPSPointAddress;
    endAddress?: GPSPointAddress;
};

export default function (): Promise<void> {
    return new Promise<void>((resolve) => {
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.GPS_DRAFT_DETAILS,
            callback: (gpsDraftDetails: OnyxEntry<OldGpsDraftDetails>) => {
                Onyx.disconnect(connection);

                // gpsPoints may still be in the old 1D format from before the schema change
                const gpsPoints = gpsDraftDetails?.gpsPoints;

                // If gpsPoints is already in the correct format or is empty, skip the migration
                if (!gpsPoints || is2dArray(gpsPoints)) {
                    Log.info('[Migrate Onyx] Skipped ConvertGpsPointsTo2DArray — already correct format or empty');
                    return resolve();
                }

                let newGpsPoints: GPSPoint[] = [...gpsPoints];

                // gpsDraftDetails is not migrated, we need to check and move startAddress and endAddress values
                // to the first and last points of the gpsPoints array
                if (gpsDraftDetails?.startAddress?.value || gpsDraftDetails?.endAddress?.value) {
                    newGpsPoints = newGpsPoints.map((point, index) => {
                        let address: GPSPointAddress | undefined;
                        if (index === 0) {
                            address = gpsDraftDetails?.startAddress;
                        } else if (index === gpsPoints.length - 1) {
                            address = gpsDraftDetails?.endAddress;
                        }
                        return {
                            ...point,
                            address,
                        };
                    });
                }

                const migratedPoints = [newGpsPoints];

                // No need to add a new action just for this migration
                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {gpsPoints: migratedPoints}).then(() => {
                    Log.info('[Migrate Onyx] Ran ConvertGpsPointsTo2DArray migration');
                    resolve();
                });
            },
        });
    });
}
