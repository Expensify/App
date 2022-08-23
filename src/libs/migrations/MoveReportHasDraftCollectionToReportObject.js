import Onyx from 'react-native-onyx';
import _ from 'underscore';
import Log from '../Log';
import ONYXKEYS from '../../ONYXKEYS';

export default function () {
    return new Promise((resolve) => {
        // Connect to the reportsWithDraft_ collection key in Onyx to get all the old data for
        // which reports have drafts.
        // For each report that has a draft, set the hasDraft property
        // in the report collection to true.
        // Finally, remove the data from the old collection
        const connectionID = Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORTS_WITH_DRAFT,
            waitForCollectionCallback: true,
            callback: (reportsWithDraftCollection) => {
                Onyx.disconnect(connectionID);

                // If this migration has already run, then the keys will still exist in Onyx, but the
                // values will be undefined. That's OK, but we need to be sure to remove all falsy values
                // to make sure we're dealing with a clean collection.

                // This method of using pick + identify is a way to remove all keys from the object where the value is falsy
                const cleanReportsWithDraftCollection = _.pick(reportsWithDraftCollection, _.identity);

                if (!_.size(cleanReportsWithDraftCollection)) {
                    Log.info('[Migrate Onyx] No reports in the old draft collection');
                    return resolve();
                }

                const allReportIDs = [];
                const reportIDsWithDrafts = [];
                _.each(reportsWithDraftCollection, (reportHasDraft, onyxKey) => {
                    const reportID = onyxKey.replace(ONYXKEYS.COLLECTION.REPORTS_WITH_DRAFT, '');
                    allReportIDs.push(reportID);
                    if (reportHasDraft) {
                        reportIDsWithDrafts.push(reportID);
                    }
                });

                const mergeObject = _.reduce(reportIDsWithDrafts, (finalMergeObject, reportID) => ({
                    [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]: {hasDraft: true},
                    ...finalMergeObject,
                }), {});

                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, mergeObject)
                    .then(() => {
                        // Resolve our main promise once all the reports have been removed from Onyx
                        const done = _.after(allReportIDs.length, () => {
                            Log.info('[Migrate Onyx] Ran migration MoveReportHasDraftCollectionToReportObject');
                            resolve();
                        });

                        // Remove all the old data from Onyx
                        _.each(allReportIDs, (reportID) => {
                            // eslint-disable-next-line rulesdir/prefer-actions-set-data
                            Onyx.set(`${ONYXKEYS.COLLECTION.REPORTS_WITH_DRAFT}${reportID}`, null)
                                .then(() => {
                                    Log.info(`[Migrate Onyx] Removed report draft data for report ${ONYXKEYS.COLLECTION.REPORTS_WITH_DRAFT}${reportID}`);
                                    done();
                                });
                        });
                    });
            },
        });
    });
}
