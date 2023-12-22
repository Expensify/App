import Onyx from 'react-native-onyx';
import _ from 'underscore';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * This migration removes empty drafts from reportActionsDrafts, which was previously used to mark a draft as being non-existent (e.g. upon cancel).
 *
 * @returns {Promise}
 */
export default function () {
    return new Promise((resolve) => {
        const connectionID = Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS,
            waitForCollectionCallback: true,
            callback: (allReportActionsDrafts) => {
                Onyx.disconnect(connectionID);

                if (!allReportActionsDrafts) {
                    Log.info('[Migrate Onyx] Skipped migration RemoveEmptyReportActionsDrafts because there were no reportActionsDrafts');
                    return resolve();
                }

                const newReportActionsDrafts = {};
                _.each(allReportActionsDrafts, (reportActionDrafts, onyxKey) => {
                    newReportActionsDrafts[onyxKey] = {};

                    // Whether there is at least one draft in this report that has to be migrated
                    let hasUnmigratedDraft = false;

                    _.each(reportActionDrafts, (reportActionDraft, reportActionID) => {
                        // If the draft is a string, it means it hasn't been migrated yet
                        if (_.isString(reportActionDraft)) {
                            hasUnmigratedDraft = true;
                            Log.info(`[Migrate Onyx] Migrating draft for report action ${reportActionID}`);

                            if (_.isEmpty(reportActionDraft)) {
                                Log.info(`[Migrate Onyx] Removing draft for report action ${reportActionID}`);
                                return;
                            }

                            newReportActionsDrafts[onyxKey][reportActionID] = {message: reportActionDraft};
                        } else {
                            // We've already migrated this draft, so keep the existing value
                            newReportActionsDrafts[onyxKey][reportActionID] = reportActionDraft;
                        }
                    });

                    if (_.isEmpty(newReportActionsDrafts[onyxKey])) {
                        // Clear if there are no drafts remaining
                        newReportActionsDrafts[onyxKey] = null;
                    } else if (!hasUnmigratedDraft) {
                        // All drafts for this report have already been migrated, there's no need to overwrite this onyx key with the same data
                        delete newReportActionsDrafts[onyxKey];
                    }
                });

                if (_.isEmpty(newReportActionsDrafts)) {
                    Log.info('[Migrate Onyx] Skipped migration RemoveEmptyReportActionsDrafts because there are no actions drafts to migrate');
                    return resolve();
                }

                Log.info(`[Migrate Onyx] Ran migration RemoveEmptyReportActionsDrafts and updated drafts for ${_.keys(newReportActionsDrafts).length} reports`);
                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                return Onyx.multiSet(newReportActionsDrafts).then(resolve);
            },
        });
    });
}
