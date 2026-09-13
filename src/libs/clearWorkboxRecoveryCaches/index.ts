import Log from '@libs/Log';

import {Platform} from 'react-native';

/**
 * Clears all Cache Storage entries for this origin and unregisters every
 * service worker. Used when the user runs Troubleshoot > Clear cache and
 * restart, and during ChunkLoadError recovery, so stale cached assets do
 * not survive those recovery paths and keep re-serving broken chunks.
 */
async function clearWorkboxRecoveryCaches(): Promise<void> {
    // Normally platform-specific behaviour is achieved with .native.ts / .ts file pairs.
    // A .native.ts stub was tried here but the Jest test environment (jsdom, testEnvironment
    // in jest.config.js) resolves both web and native imports to the same .ts file, so the
    // stub was ignored and the test called real Cache Storage / ServiceWorker APIs that don't
    // exist in jsdom, breaking the clearOnyxAndResetApp test. An explicit Platform.OS guard
    // keeps the code in a single file while being safe in all three environments:
    // web (browser), native (iOS/Android), and the Jest jsdom test runner.
    if (Platform.OS !== 'web') {
        return;
    }

    // TODO: TEMPORARY INSTRUMENTATION - revert before merging.
    const timings: Record<string, unknown> = {};

    if (typeof caches !== 'undefined') {
        try {
            const cacheNames = await caches.keys();
            timings.cacheNames = cacheNames;

            const start = performance.now();
            await Promise.all(cacheNames.map((name) => caches.delete(name)));
            timings.deleteCachesMs = Math.round(performance.now() - start);
        } catch (error) {
            Log.warn('[SW] Failed to clear Cache Storage during app reset', {error});
        }
    }

    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
        return;
    }

    try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        timings.registrationCount = registrations.length;

        const start = performance.now();
        await Promise.all(registrations.map((registration) => registration.unregister()));
        timings.unregisterMs = Math.round(performance.now() - start);
    } catch (error) {
        Log.warn('[SW] Failed to unregister service workers during app reset', {error});
    }

    // console.debug renders at Chrome's Verbose level, which is hidden by default and would hide the numbers we are collecting.
    // eslint-disable-next-line no-console
    console.log('[SW] clear timings', timings);
}

export default clearWorkboxRecoveryCaches;
