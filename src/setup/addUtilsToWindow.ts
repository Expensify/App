import Onyx from 'react-native-onyx';
import cacheDebugUtils from '@libs/CacheDebugUtils';
import {isProduction as isProductionLib} from '@libs/Environment/Environment';
import cachePreloader from '@libs/PreloadCache';
import {setSupportAuthToken} from '@userActions/Session';
import type {OnyxKey} from '@src/ONYXKEYS';

/**
 * This is used to inject development/debugging utilities into the window object on web and desktop.
 * We do this only on non-production builds - these should not be used in any application code.
 */
export default function addUtilsToWindow() {
    if (!window) {
        return;
    }

    isProductionLib().then((isProduction) => {
        if (isProduction) {
            return;
        }

        window.Onyx = Onyx as typeof Onyx & {get: (key: OnyxKey) => Promise<unknown>; log: (key: OnyxKey) => void};

        // We intentionally do not offer an Onyx.get API because we believe it will lead to code patterns we don't want to use in this repo, but we can offer a workaround for the sake of debugging
        window.Onyx.get = function (key) {
            return new Promise((resolve) => {
                // We have opted for `connectWithoutView` here as this is a debugging utility and does not relate to any view.
                const connection = Onyx.connectWithoutView({
                    key,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                    waitForCollectionCallback: true,
                });
            });
        };

        window.Onyx.log = function (key) {
            window.Onyx.get(key).then((value) => {
                /* eslint-disable-next-line no-console */
                console.log(value);
            });
        };

        window.setSupportToken = setSupportAuthToken;

        // 🧠 CACHE DEBUGGING UTILITIES
        window.cacheDebug = cacheDebugUtils;
        window.cachePreloader = cachePreloader;

        // Add convenient shortcuts
        window.preloadAll = () => {
            console.log('🚀 Starting Onyx data preloading into memory cache...');
            return cachePreloader.preloadAllData({
                collections: true,
                singleKeys: true,
                loadExisting: true, // Also discover and load any other existing data
                onProgress: (progress) => {
                    const completed = progress.filter((p) => p.status === 'completed').length;
                    const total = progress.length;
                    console.log(`📊 Cache Preload Progress: ${completed}/${total} in windows`);
                },
            });
        };

        window.memoryReport = () => {
            const report = cacheDebugUtils.generatePerformanceReport();
            console.log(report);
            return report;
        };

        window.stressTest = (duration = 30000) => {
            console.log(`🔥 Starting ${duration / 1000}s stress test...`);
            return cacheDebugUtils.performanceStressTest(duration);
        };

        // Log available utilities
        console.log(`
🛠️  CACHE DEBUG UTILITIES LOADED
=================================

Available commands:
• window.preloadAll() - Load ALL existing Onyx data into memory cache
• window.memoryReport() - Generate performance report  
• window.stressTest(30000) - Run 30s stress test
• window.cacheDebug.startMemoryTracking() - Start memory monitoring
• window.cacheDebug.runPreloadTest() - Comprehensive preload test
• window.cachePreloader.getPreloadSummary() - Get current preload stats
• window.cachePreloader.loadAllExistingData() - Discover and load all existing data

Real Onyx Cache Preloading:
• Loads actual existing data from Onyx storage
• Caches everything in memory for instant access
• Uses Onyx.multiSet for efficient batch operations
• Discovers all stored keys automatically
• Measures real memory usage and performance impact

Memory monitoring:
• window.cacheDebug.getCurrentMemoryStats() - Current memory usage
• window.cacheDebug.analyzeCacheContents() - Analyze cache contents

Onyx utilities:  
• window.Onyx.get('key') - Get Onyx key value
• window.Onyx.log('key') - Log Onyx key to console
        `);
    });
}
