import _ from 'underscore';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Sets whether the an attachment is being downloaded.
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
            const downloads = {};
            _.each(_.keys(records), recordKey => downloads[recordKey] = null);
            if (!_.isEmpty(downloads)) {
                Onyx.multiSet(downloads);
            }
        },
    });
}

export {
    setDownload,
    clearDownloads,
};
