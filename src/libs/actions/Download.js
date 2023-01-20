import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Immediate indication whether the an attachment is being downloaded.
 *
 * @param {String} sourceID
 * @param {Boolean} isDownloading
 * @returns {Promise}
 */
function setDownload(sourceID, isDownloading) {
    return Onyx.merge(`${ONYXKEYS.COLLECTION.DOWNLOAD}${sourceID}`, {isDownloading});
}

export {
    // eslint-disable-next-line import/prefer-default-export
    setDownload,
};
