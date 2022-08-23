import Onyx from 'react-native-onyx';
import _ from 'underscore';
import Log from '../Log';
import ONYXKEYS from '../../ONYXKEYS';

export default function () {
    return new Promise((resolve) => {
        // Connect to the USER key in Onyx to get the value of expensifyNewsStatus
        // then set that value as isSubscribedToNewsletter
        // finally remove expensifyNewsStatus by setting the value to null
        const connectionID = Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORTS_WITH_DRAFT,
            waitForCollectionCallback: true,
            callback: (reportsWithDraftCollection) => {
                Onyx.disconnect(connectionID);

                if (!_.size(reportsWithDraftCollection)) {
                    Log.info('[Migrate Onyx] No reports in the old draft collection');
                    return resolve();
                }

                const reportIDsWithDrafts = [];
                _.each(reportsWithDraftCollection, (reportHasDraft, onyxKey) => {
                    if (reportHasDraft) {
                        reportIDsWithDrafts.push(onyxKey.replace(ONYXKEYS.COLLECTION.REPORTS_WITH_DRAFT, ''));
                    }
                });

                if (!reportIDsWithDrafts.length) {
                    Log.info('[Migrate Onyx] No old reports have drafts');
                    return resolve();
                }

                const mergeObject = _.reduce(reportIDsWithDrafts, (finalMergeObject, reportID) => {
                    return {
                        [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]: {hasDraft: true},
                        ...finalMergeObject,
                    };
                }, {});

                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, mergeObject)
                    .then(() => {
                        Log.info('[Migrate Onyx] Ran migration MoveReportHasDraftCollectionToReportObject');
                        resolve();
                    });
            },
        });
    });
}
