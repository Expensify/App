import type {NullishDeep, OnyxInputValue} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Note} from '@src/types/onyx/ReportMetadata';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ReportMetadataKey = `${typeof ONYXKEYS.COLLECTION.REPORT_METADATA}${string}`;
type ReportKey = `${typeof ONYXKEYS.COLLECTION.REPORT}${string}`;

/**
 * This migration moves private notes from the report object to reportMetadata.
 * Before: report.privateNotes
 * After: reportMetadata.privateNotes
 */
export default function (): Promise<void> {
    return new Promise<void>((resolve) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORT,
            waitForCollectionCallback: true,
            callback: (allReports) => {
                Onyx.disconnect(connection);

                if (!allReports) {
                    Log.info('[Migrate Onyx] Skipped migration PrivateNotesMigration because there were no reports');
                    return resolve();
                }

                // @ts-expect-error this migration moves privateNotes from Report to ReportMetadata so it is expected to not exist in Report type anymore
                const reportsWithPrivateNotes = Object.entries(allReports).filter(([, report]) => report?.privateNotes);

                if (reportsWithPrivateNotes.length === 0) {
                    Log.info('[Migrate Onyx] Skipped migration PrivateNotesMigration because there were no reports with private notes');
                    return resolve();
                }

                const newReportMetadata: Record<ReportMetadataKey, OnyxInputValue<OnyxTypes.ReportMetadata>> = {};
                const reportsToUpdate: Record<`${typeof ONYXKEYS.COLLECTION.REPORT}${string}`, NullishDeep<OnyxTypes.Report>> = {};

                reportsWithPrivateNotes.forEach(([reportOnyxKey, report]) => {
                    // @ts-expect-error this migration moves privateNotes from Report to ReportMetadata so it is expected to not exist in Report type anymore
                    if (!report?.reportID || !report.privateNotes) {
                        return;
                    }

                    // Move private notes to reportMetadata
                    const metadataKey: ReportMetadataKey = `${ONYXKEYS.COLLECTION.REPORT_METADATA}${report.reportID}`;
                    newReportMetadata[metadataKey] = {
                        // @ts-expect-error this migration moves privateNotes from Report to ReportMetadata so it is expected to not exist in Report type anymore
                        privateNotes: report?.privateNotes as Note,
                    };
                    // @ts-expect-error this migration moves privateNotes from Report to ReportMetadata so it is expected to not exist in Report type anymore
                    reportsToUpdate[reportOnyxKey as ReportKey] = {privateNotes: undefined};
                });

                if (isEmptyObject(newReportMetadata)) {
                    Log.info('[Migrate Onyx] Skipped migration PrivateNotesMigration because there were no private notes to migrate');
                    return resolve();
                }

                Log.info(`[Migrate Onyx] Moving private notes to reportMetadata for ${Object.keys(newReportMetadata).length} reports`);

                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                const promises = [Onyx.multiSet(newReportMetadata), Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, reportsToUpdate)];

                Promise.all(promises).then(() => {
                    Log.info('[Migrate Onyx] Successfully migrated private notes to reportMetadata');
                    resolve();
                });
            },
        });
    });
}
