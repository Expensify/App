import Onyx from 'react-native-onyx';
import _ from 'lodash';
import ONYXKEYS from '../../ONYXKEYS';
import Log from '../Log';

// This migration changes personalDetailsList to a collection so that we can subscribe to changes on a single personalDetails
export default function PersonalDetailsToCollection() {
    return new Promise((resolve) => {
        // Check if migration has already been run
        const outerConnectionID = Onyx.connect({
            key: ONYXKEYS.COLLECTION.PERSONAL_DETAILS,
            waitForCollectionCallback: true,
            callback: (personalDetailsCollection) => {
                Onyx.disconnect(outerConnectionID);
                if (personalDetailsCollection) {
                    Log.info('[Migrate Onyx] Skipping migration PersonalDetailsToCollection because it is already migrated');
                    return resolve();
                }

                const connectionID = Onyx.connect({
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    waitForCollectionCallback: true,
                    callback: (personalDetailsList) => {
                        Onyx.disconnect(connectionID);
                        const personalDetailsListLength = _.keys(personalDetailsList).length;
                        if (!personalDetailsList || personalDetailsListLength === 0) {
                            Log.info('[Migrate Onyx] Skipped migration PersonalDetailsToCollection because there are no personalDetailsList');
                            return resolve();
                        }

                        Log.info('[Migrate Onyx] Running PersonalDetailsToCollection migration');
                        const dataToSave = _.reduce(
                            personalDetailsList,
                            (result, personalDetails, key) => {
                                const personalDetailsKey = `${ONYXKEYS.COLLECTION.PERSONAL_DETAILS}${key}`;
                                // Param reassign justified to avoid creating a new object on each iteration
                                // eslint-disable-next-line no-param-reassign
                                result[personalDetailsKey] = personalDetails;
                                return result;
                            },
                            {},
                        );

                        // eslint-disable-next-line rulesdir/prefer-actions-set-data
                        Onyx.mergeCollection(ONYXKEYS.COLLECTION.PERSONAL_DETAILS, dataToSave).then(() => {
                            Log.info(`[Migrate Onyx] Ran migration PersonalDetailsToCollection - moved object with ${personalDetailsListLength} keys to a collection`);
                            resolve();
                        });
                    },
                });
            },
        });
    });
}
