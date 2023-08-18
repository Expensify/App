import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * @param {Boolean} shouldShowBanner
 */
function setShowDownloadAppBanner(shouldShowBanner) {
    Onyx.set(ONYXKEYS.SHOW_DOWNLOAD_APP_BANNER, shouldShowBanner);
}

export default setShowDownloadAppBanner;
