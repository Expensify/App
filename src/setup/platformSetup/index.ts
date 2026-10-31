import {APP_UPDATE_QUERY_PARAM} from '@libs/AppUpdateURL';
import CacheAPI from '@libs/CacheAPI';
import checkForUpdates from '@libs/checkForUpdates';
import DateUtils from '@libs/DateUtils';
import Visibility from '@libs/Visibility';

import Config from '@src/CONFIG';

import {AppRegistry} from 'react-native';

import type PlatformSpecificUpdater from './types';

import pkg from '../../../package.json';

/**
 * Download the latest app version from the server, and if it is different than the current one,
 * then refresh. If the page is visible, prompt the user to refresh.
 */
function webUpdate() {
    fetch('/version.json', {cache: 'no-cache'})
        .then((response) => response.json())
        .then(({version}) => {
            if (version === pkg.version) {
                return;
            }

            if (!Visibility.isVisible()) {
                // Page is hidden, refresh immediately
                window.location.reload();
                return;
            }

            // Prompt user to refresh the page
            if (window.confirm('Refresh the page to get the latest updates!')) {
                window.location.reload();
            }
        })
        // Soft-fail: webUpdate is a best-effort check, so we only log the error to the console
        // eslint-disable-next-line no-console
        .catch((error) => console.warn('[webUpdate] Failed to check version.json', error));
}

/**
 * Create an object whose shape reflects the callbacks used in checkForUpdates.
 */
const webUpdater = (): PlatformSpecificUpdater => ({
    init: () => {
        // We want to check for updates and refresh the page if necessary when the app is background.
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
    // The worker has already handled this navigation. Later navigations should keep the normal offline timeout.
    const url = new URL(window.location.href);
    if (url.searchParams.has(APP_UPDATE_QUERY_PARAM)) {
        url.searchParams.delete(APP_UPDATE_QUERY_PARAM);
        window.history.replaceState(window.history.state, '', url.href);
    }

    // Initialize Cache API
    CacheAPI.init();

    AppRegistry.runApplication(Config.APP_NAME, {
        rootTag: document.getElementById('root'),
    });

    // When app loads, get current version (production only)
    if (Config.IS_IN_PRODUCTION) {
        checkForUpdates(webUpdater());
    }

    // Start current date updater
    DateUtils.startCurrentDateUpdater();

    // Service worker is only emitted in production builds (InjectManifest is skipped in dev).
    if (Config.IS_IN_PRODUCTION && 'serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js', {updateViaCache: 'none'}).catch((error) => {
                // Soft-fail: app must continue working even if SW registration fails (Safari Private mode, etc.).
                // eslint-disable-next-line no-console
                console.warn('[SW] registration failed', error);
            });
        });
    }
}
