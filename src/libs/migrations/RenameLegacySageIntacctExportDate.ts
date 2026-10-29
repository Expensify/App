import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection, OnyxMergeCollectionInput} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

/**
 * NewDot used to write the bare `EXPORTED` / `SUBMITTED` for the Sage Intacct export date, while the backend uses the
 * `REPORT_*` names. The backend has already rewritten the stored values, but a client can still hold the old ones in
 * its local Onyx cache, which match no picker row and have no translation key. This is temporary and can be removed
 * once those caches have had time to refresh.
 */
const LEGACY_EXPORT_DATE_MAP: Record<string, ValueOf<typeof CONST.SAGE_INTACCT_EXPORT_DATE>> = {
    EXPORTED: CONST.SAGE_INTACCT_EXPORT_DATE.REPORT_EXPORTED,
    SUBMITTED: CONST.SAGE_INTACCT_EXPORT_DATE.REPORT_SUBMITTED,
};

export default function RenameLegacySageIntacctExportDate(): Promise<void> {
    return new Promise<void>((resolve) => {
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.COLLECTION.POLICY,
            callback: (policies: OnyxCollection<Policy>) => {
                Onyx.disconnect(connection);

                const updates: OnyxMergeCollectionInput<typeof ONYXKEYS.COLLECTION.POLICY> = {};
                for (const policy of Object.values(policies ?? {})) {
                    const exportDate: string | undefined = policy?.connections?.intacct?.config?.export?.exportDate;
                    const newExportDate = exportDate ? LEGACY_EXPORT_DATE_MAP[exportDate] : undefined;
                    if (!policy?.id || !newExportDate) {
                        continue;
                    }
                    updates[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`] = {
                        connections: {intacct: {config: {export: {exportDate: newExportDate}}}},
                    };
                }

                if (Object.keys(updates).length === 0) {
                    Log.info('[Migrate Onyx] Skipped RenameLegacySageIntacctExportDate — no legacy values found');
                    return resolve();
                }

                // No need to add a new action just for this migration
                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY, updates).then(() => {
                    Log.info(`[Migrate Onyx] Ran RenameLegacySageIntacctExportDate migration on ${Object.keys(updates).length} policies`);
                    resolve();
                });
            },
        });
    });
}
