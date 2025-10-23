import toSortedPolyfill from 'array.prototype.tosorted';
import {I18nManager} from 'react-native';
import Onyx from 'react-native-onyx';
import intlPolyfill from '@libs/IntlPolyfill';
import cachePreloader from '@libs/PreloadCache';
import {setDeviceID} from '@userActions/Device';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import addUtilsToWindow from './addUtilsToWindow';
import platformSetup from './platformSetup';
import telemetry from './telemetry';

export default function () {
    telemetry();

    toSortedPolyfill.shim();

    /*
     * Initialize the Onyx store when the app loads for the first time.
     *
     * Note: This Onyx initialization has been very intentionally placed completely outside of the React lifecycle of the main App component.
     *
     * To understand why we must do this, you must first understand that a typical React Native Android application consists of an Application and an Activity.
     * The project root's index.js runs in the Application, but the main RN `App` component + UI runs in a separate Activity, spawned when you call AppRegistry.registerComponent.
     * When an application launches in a headless JS context (i.e: when woken from a killed state by a push notification), only the Application is available, but not the UI Activity.
     * This means that in a headless context NO REACT CODE IS EXECUTED, and none of your components will mount.
     *
     * However, we still need to use Onyx to update the underlying app data from the headless JS context.
     * Therefore it must be initialized completely outside the React component lifecycle.
     */
    Onyx.init({
        keys: ONYXKEYS,

        // Increase the cached key count so that the app works more consistently for accounts with large numbers of reports
        maxCachedKeysCount: 50000,
        evictableKeys: [
            ONYXKEYS.COLLECTION.REPORT_ACTIONS,
            ONYXKEYS.COLLECTION.SNAPSHOT,
            ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS,
            ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES,
            ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS,
        ],
        initialKeyStates: {
            // Clear any loading and error messages so they do not appear on app startup
            [ONYXKEYS.SESSION]: {loading: false},
            [ONYXKEYS.ACCOUNT]: CONST.DEFAULT_ACCOUNT_DATA,
            [ONYXKEYS.NETWORK]: CONST.DEFAULT_NETWORK_DATA,
            [ONYXKEYS.IS_SIDEBAR_LOADED]: false,
            [ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT]: true,
            [ONYXKEYS.MODAL]: {
                isVisible: false,
                willAlertModalBecomeVisible: false,
            },
            // Ensure the Supportal permission modal doesn't persist across reloads
            [ONYXKEYS.SUPPORTAL_PERMISSION_DENIED]: null,
        },
        skippableCollectionMemberIDs: CONST.SKIPPABLE_COLLECTION_MEMBER_IDS,
    });

    initOnyxDerivedValues();

    setDeviceID();

    // 🚀 AGGRESSIVE CACHE PRELOADING
    // Onyx cache preloading - loads ALL existing data into memory for faster access
    // WARNING: This will load ALL stored data into memory on startup!
    if (CONFIG.ENVIRONMENT === CONST.ENVIRONMENT.DEV || process.env.ENABLE_CACHE_PRELOAD === 'true') {
        // Only run in development or when explicitly enabled
        setTimeout(() => {
            console.log('🚀 Starting Onyx cache preloading...');
            console.warn('⚠️  Loading ALL existing data into memory cache!');

            cachePreloader
                .preloadAllData({
                    maxConcurrency: 2, // Reduced concurrency to prevent overwhelming
                    collections: true, // Load all collections
                    singleKeys: true, // Load all single keys
                    loadExisting: true, // Discover and load any other existing data
                    onProgress: (progress) => {
                        const completed = progress.filter((p) => p.status === 'completed').length;
                        const total = progress.length;
                        const failed = progress.filter((p) => p.status === 'failed').length;

                        console.log(`📊 Cache Preload Progress: ${completed}/${total} completed${failed > 0 ? `, ${failed} failed` : ''}`);
                    },
                })
                .then((results) => {
                    const summary = cachePreloader.getPreloadSummary();
                    console.log('✅ Onyx cache preloading completed!', summary);

                    if (summary.totalSizeMB > 100) {
                        console.warn(`⚠️  High memory usage: ${summary.totalSizeMB}MB loaded into cache`);
                    } else {
                        console.log(`📈 Cache size: ${summary.totalSizeMB}MB loaded into memory`);
                    }

                    console.log(`🚀 Subsequent Onyx access should be much faster now!`);
                })
                .catch((error) => {
                    console.error('❌ Cache preloading failed:', error);
                });
        }, 2000); // Wait 2 seconds after app initialization
    }

    // Preload all icons early in app initialization
    // This runs outside React lifecycle for optimal performance
    // Force app layout to work left to right because our design does not currently support devices using this mode
    I18nManager.allowRTL(false);
    I18nManager.forceRTL(false);

    // Polyfill the Intl API if locale data is not as expected
    intlPolyfill();

    // Perform any other platform-specific setup
    platformSetup();

    addUtilsToWindow();
}
