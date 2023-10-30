import Onyx from 'react-native-onyx';
import _ from 'underscore';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * This migration updates reportActionsDrafts data to be keyed by reportActionID.
 *
 * Before: reportActionsDrafts_reportID_reportActionID: value
 * After: reportActionsDrafts_reportID: {[reportActionID]: value}
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
                    Log.info('[Migrate Onyx] Skipped migration KeyReportActionsDraftByReportActionID because there were no reportActionsDrafts');
                    return resolve();
                }

                const newReportActionsDrafts = {};
                _.each(allReportActionsDrafts, (reportActionDraft, onyxKey) => {
                    if (!_.isString(reportActionDraft)) {
                        return;
                    }
                    newReportActionsDrafts[onyxKey] = null;

                    if (_.isEmpty(reportActionDraft)) {
                        return;
                    }

                    const reportActionID = onyxKey.split('_').pop();
                    const newOnyxKey = onyxKey.replace(`_${reportActionID}`, '');

                    // If newReportActionsDrafts[newOnyxKey] isn't set, fall back on the migrated draft if there is one
                    const currentActionsDrafts = newReportActionsDrafts[newOnyxKey] || allReportActionsDrafts[newOnyxKey];
                    newReportActionsDrafts[newOnyxKey] = {
                        ...currentActionsDrafts,
                        [reportActionID]: reportActionDraft,
                    };
                });

                if (_.isEmpty(newReportActionsDrafts)) {
                    Log.info('[Migrate Onyx] Skipped migration KeyReportActionsDraftByReportActionID because there are no actions drafts to migrate');
                    return resolve();
                }

                Log.info(`[Migrate Onyx] Re-keying reportActionsDrafts by reportActionID for ${_.keys(newReportActionsDrafts).length} actions drafts`);
                // eslint-disable-next-line rulesdir/prefer-actions-set-data
                return Onyx.multiSet(newReportActionsDrafts).then(resolve);
            },
        });
    });
}
