import type {OnyxInputValue} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActionsDrafts} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ReportActionsDraftsKey = `${typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${string}`;

/**
 * This migration updates reportActionsDrafts data to be keyed by reportActionID.
 *
 * Before: reportActionsDrafts_reportID_reportActionID: value
 * After: reportActionsDrafts_reportID: {[reportActionID]: value}
 */
export default function () {
    return new Promise<void | void[]>((resolve) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS,
            waitForCollectionCallback: true,
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            callback: (allReportActionsDrafts) => {
                Onyx.disconnect(connection);

                if (!allReportActionsDrafts) {
                    Log.info('[Migrate Onyx] Skipped migration KeyReportActionsDraftByReportActionID because there were no reportActionsDrafts');
                    return resolve();
                }

                const newReportActionsDrafts: Record<ReportActionsDraftsKey, OnyxInputValue<ReportActionsDrafts>> = {};
                Object.entries(allReportActionsDrafts).forEach(([onyxKey, reportActionDraft]) => {
                    if (typeof reportActionDraft !== 'string') {
                        return;
                    }
                    newReportActionsDrafts[onyxKey as ReportActionsDraftsKey] = null;

                    if (isEmptyObject(reportActionDraft)) {
                        return;
                    }

                    const reportActionID = onyxKey.split('_').pop();
                    const newOnyxKey = onyxKey.replace(`_${reportActionID}`, '') as ReportActionsDraftsKey;

                    if (!reportActionID) {
                        return;
                    }

                    // If newReportActionsDrafts[newOnyxKey] isn't set, fall back on the migrated draft if there is one
                    const currentActionsDrafts = newReportActionsDrafts[newOnyxKey] ?? allReportActionsDrafts[newOnyxKey];

                    newReportActionsDrafts[newOnyxKey] = {
                        ...currentActionsDrafts,
                        [reportActionID]: reportActionDraft,
                    };
                });

                if (isEmptyObject(newReportActionsDrafts)) {
                    Log.info('[Migrate Onyx] Skipped migration KeyReportActionsDraftByReportActionID because there are no actions drafts to migrate');
                    return resolve();
                }

                Log.info(`[Migrate Onyx] Re-keying reportActionsDrafts by reportActionID for ${Object.keys(newReportActionsDrafts).length} actions drafts`);
                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                return Onyx.multiSet(newReportActionsDrafts).then(resolve);
            },
        });
    });
}
