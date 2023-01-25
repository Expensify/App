import _ from 'underscore';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Set whether an attachment is being downloaded so that a spinner can be shown.
 *
 * @param {String} sourceID
 * @param {Boolean} isDownloading
 * @returns {Promise}
 */
function setDownload(sourceID, isDownloading) {
    return Onyx.merge(`${ONYXKEYS.COLLECTION.DOWNLOAD}${sourceID}`, {isDownloading});
}

function clearDownloads() {
    const connectionID = Onyx.connect({
        key: ONYXKEYS.COLLECTION.DOWNLOAD,
        waitForCollectionCallback: true,
        callback: (records) => {
            Onyx.disconnect(connectionID);
            const downloadsToDelete = {};
            _.each(_.keys(records), recordKey => downloadsToDelete[recordKey] = null);
            if (!_.isEmpty(downloadsToDelete)) {
                Onyx.multiSet(downloadsToDelete);
            }
        },
    });
}

export {
    setDownload,
    clearDownloads,
};
