import Onyx from 'react-native-onyx';
import Log from '../Log';
import ONYXKEYS from '../../ONYXKEYS';
import {Report} from '../../types/onyx';

/**
 * This migration adds lastVisibleActionCreated to all reports in Onyx, using the value of lastMessageTimestamp
 */
export default function (): Promise<void> {
    return new Promise((resolve) => {
        const connectionID = Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORT,
            callback: (allReports) => {
                Onyx.disconnect(connectionID);
                const reportsToUpdate: Record<string, Report> = {};
                (allReports as Report[]).forEach((report, key) => {
                    if (report.lastVisibleActionCreated) {
                        return resolve();
                    }

                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    if (!report.lastActionCreated) {
                        return resolve();
                    }

                    reportsToUpdate[key] = report;
                    // `lastActionCreated` isn't included in types because it was deleted and migration moves data from that field to `lastVisibleActionCreated`
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    reportsToUpdate[key].lastVisibleActionCreated = report.lastActionCreated;
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    reportsToUpdate[key].lastActionCreated = null;
                });

                if (Object.keys(reportsToUpdate).length) {
                    Log.info('[Migrate Onyx] Skipped migration AddLastVisibleActionCreated');
                    return resolve();
                }

                Log.info(`[Migrate Onyx] Adding lastVisibleActionCreated field to ${Object.keys(reportsToUpdate).length} reports`);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, reportsToUpdate).then(resolve);
            },
        });
    });
}
