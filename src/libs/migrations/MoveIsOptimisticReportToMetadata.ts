import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type OldReport = Report & {isOptimisticReport?: boolean};

/**
 * This migration moves isOptimisticReport from the report object to reportMetadata
 */
export default function (): Promise<void> {
    return new Promise<void>((resolve) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORT,
            waitForCollectionCallback: true,
            callback: (reports: OnyxCollection<OldReport>) => {
                Onyx.disconnect(connection);
                if (!reports || isEmptyObject(reports)) {
                    Log.info('[Migrate Onyx] Skipping migration MoveIsOptimisticReportToMetadata because there are no reports');
                    return resolve();
                }

                const promises: Array<Promise<void>> = [];
                Object.entries(reports).forEach(([reportID, report]) => {
                    if (report?.isOptimisticReport === undefined) {
                        return;
                    }

                    promises.push(
                        Promise.all([
                            // @ts-expect-error isOptimisticReport is not a valid property of Report anymore
                            // eslint-disable-next-line rulesdir/prefer-actions-set-data
                            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {isOptimisticReport: null}),
                            // eslint-disable-next-line rulesdir/prefer-actions-set-data
                            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {isOptimisticReport: report.isOptimisticReport}),
                        ]).then(() => {
                            Log.info(`[Migrate Onyx] Successfully moved isOptimisticReport to reportMetadata for ${reportID}`);
                        }),
                    );
                });

                if (promises.length === 0) {
                    Log.info('[Migrate Onyx] Skipping migration MoveIsOptimisticReportToMetadata because there are no reports with isOptimisticReport');
                    return resolve();
                }

                Promise.all(promises).then(() => resolve());
            },
        });
    });
}
