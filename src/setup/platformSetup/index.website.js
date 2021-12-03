import {AppRegistry} from 'react-native';
import Str from 'expensify-common/lib/str';
import checkForUpdates from '../../libs/checkForUpdates';
import Config from '../../CONFIG';
import HttpUtils from '../../libs/HttpUtils';
import DateUtils from '../../libs/DateUtils';
import {version as currentVersion} from '../../../package.json';
import Visibility from '../../libs/Visibility';
import CONST from '../../CONST';
import getBrowser from '../../libs/getBrowser';

/**
 * Download the latest app version from the server, and if it is different than the current one,
 * then refresh. If the page is visibile, prompt the user to refresh.
 */
function webUpdate() {
    HttpUtils.download('version.json')
        .then(({version}) => {
            if (version === currentVersion) {
                return;
            }

            if (!Visibility.isVisible()) {
                // Page is hidden, refresh immediately
                window.location.reload(true);
                return;
            }

            // Prompt user to refresh the page
            if (window.confirm('Refresh the page to get the latest updates!')) {
                window.location.reload(true);
            }
        });
}

/**
 * Create an object whose shape reflects the callbacks used in checkForUpdates.
 *
 * @returns {Object}
 */
const webUpdater = () => ({
    init: () => {
        // We want to check for updates and refresh the page if necessary when the app is backgrounded.
        // That way, it will auto-update silently when they minimize the page,
        // and we don't bug the user any more than necessary :)
        window.addEventListener('visibilitychange', () => {
            if (Visibility.isVisible()) {
                return;
            }

            webUpdate();
        });
    },
    update: () => webUpdate(),
});

export default function () {
    AppRegistry.runApplication(Config.APP_NAME, {
        rootTag: document.getElementById('root'),
    });

    // When app loads, get current version (production only)
    if (Config.IS_IN_PRODUCTION) {
        checkForUpdates(webUpdater());
    }

    // Start current date updater
    DateUtils.startCurrentDateUpdater();

    const userAgent = navigator.userAgent.toLowerCase();
    if (getBrowser() === CONST.BROWSER.SAFARI && Str.contains(userAgent, 'iphone os 1')) {
        const applyScrollFix = require('../../libs/iOSSafariAutoScrollback').default;
        applyScrollFix();
    }
}
